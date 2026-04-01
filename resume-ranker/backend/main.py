from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pdfplumber
import os, re, io
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


def score_resume(text: str, keywords: list[str]):
    lower = text.lower()
    matched = [kw for kw in keywords if re.search(r'\b' + re.escape(kw.lower()) + r'\b', lower)]
    score = round(len(matched) / len(keywords) * 100, 1) if keywords else 0
    return score, matched


@app.post("/upload")
async def upload(files: list[UploadFile] = File(...), keywords: str = Form(...)):
    kw_list = [k.strip() for k in keywords.split(",") if k.strip()]
    results = []

    for file in files:
        content = await file.read()

        # Upload PDF to Supabase Storage
        try:
            supabase.storage.from_("resumes").upload(file.filename, content, {"content-type": "application/pdf"})
        except Exception:
            pass  # ignore duplicate uploads

        text = extract_text(content)
        score, matched = score_resume(text, kw_list)

        row = supabase.table("resumes").insert({
            "filename": file.filename,
            "extracted_text": text,
            "score": score,
            "matched_keywords": matched,
        }).execute()

        results.append({
            "id": row.data[0]["id"],
            "filename": file.filename,
            "score": score,
            "matched_keywords": matched,
            "missed_keywords": [k for k in kw_list if k not in matched],
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
