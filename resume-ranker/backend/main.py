from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pdfplumber
import os, re, io, json
from supabase import create_client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


def extract_text(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    return text.strip()


def score_resume(text: str, keywords: list[dict]):
    """
    keywords: list of { "keyword": str, "weight": int (1-3) }

    Scoring logic:
    - For each keyword, count how many times it appears in the resume (frequency)
    - Multiply frequency by the keyword's weight
    - Cap frequency bonus at 3 occurrences to avoid keyword stuffing inflation
    - Final score = (sum of weighted frequency scores / max possible score) * 100
    """
    lower = text.lower()
    results = []
    total_max = 0

    for kw in keywords:
        word    = kw["keyword"].strip()
        weight  = int(kw.get("weight", 1))
        pattern = r'\b' + re.escape(word.lower()) + r'\b'

        # count occurrences, capped at 3
        frequency = min(len(re.findall(pattern, lower)), 3)
        weighted_score = frequency * weight
        max_possible   = 3 * weight  # max if keyword appears 3+ times

        total_max += max_possible
        results.append({
            "keyword":        word,
            "weight":         weight,
            "frequency":      frequency,
            "weighted_score": weighted_score,
            "found":          frequency > 0,
        })

    final_score = round((sum(r["weighted_score"] for r in results) / total_max) * 100, 1) if total_max else 0
    matched  = [r for r in results if r["found"]]
    missed   = [r for r in results if not r["found"]]

    return final_score, matched, missed, results


@app.post("/upload")
async def upload(files: list[UploadFile] = File(...), keywords: str = Form(...)):
    # keywords arrives as JSON string: [{"keyword":"Python","weight":3}, ...]
    kw_list = json.loads(keywords)
    results = []

    for file in files:
        content = await file.read()

        try:
            supabase.storage.from_("resumes").upload(file.filename, content, {"content-type": "application/pdf"})
        except Exception:
            pass

        text = extract_text(content)
        score, matched, missed, breakdown = score_resume(text, kw_list)

        row = supabase.table("resumes").insert({
            "filename":         file.filename,
            "extracted_text":   text,
            "score":            score,
            "matched_keywords": [r["keyword"] for r in matched],
        }).execute()

        results.append({
            "id":            row.data[0]["id"],
            "filename":      file.filename,
            "score":         score,
            "matched":       matched,
            "missed":        missed,
            "breakdown":     breakdown,
            "total_keywords": len(kw_list),
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return {"results": results}


@app.get("/history")
async def history():
    data = supabase.table("resumes") \
        .select("id, filename, score, matched_keywords, uploaded_at") \
        .order("score", desc=True).execute()
    return {"results": data.data}
