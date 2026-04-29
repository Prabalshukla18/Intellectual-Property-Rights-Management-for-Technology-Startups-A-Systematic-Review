from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from modules.patent_analyzer import PatentAnalyzer
from modules.trademark_checker import TrademarkChecker
from modules.prior_art import PriorArtAnalyzer
from modules.risk_scorer import RiskScorer
from modules.doc_processor import DocumentProcessor

app = FastAPI(
    title="IP Rights Management API",
    description="AI-powered Intellectual Property management for startups",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

patent_analyzer = PatentAnalyzer()
tm_checker = TrademarkChecker()
prior_art = PriorArtAnalyzer()
risk_scorer = RiskScorer()
doc_processor = DocumentProcessor()


class PatentQuery(BaseModel):
    text: str
    top_k: Optional[int] = 5


class TrademarkTextQuery(BaseModel):
    brand_name: str
    nice_class: Optional[int] = 42


class PriorArtQuery(BaseModel):
    text: str
    top_k: Optional[int] = 5


@app.get("/")
def root():
    return {"status": "running", "message": "IP Rights Management API v1.0"}


@app.get("/api/health")
def health():
    return {"status": "ok", "models_loaded": True}


# ── Patent Routes ──────────────────────────────────────────────
@app.post("/api/patent/search")
def search_patents(query: PatentQuery):
    results = patent_analyzer.find_similar(query.text, query.top_k)
    return {
        "query": query.text,
        "results": results,
        "total": len(results)
    }


@app.post("/api/patent/upload")
async def upload_patent_pdf(file: UploadFile = File(...)):
    content = await file.read()
    text = doc_processor.extract_text(content, file.filename)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    results = patent_analyzer.find_similar(text[:2000], top_k=5)
    return {
        "filename": file.filename,
        "extracted_text_preview": text[:500],
        "similar_patents": results
    }


# ── Trademark Routes ───────────────────────────────────────────
@app.post("/api/trademark/check-text")
def check_trademark_text(query: TrademarkTextQuery):
    results = tm_checker.check_text(query.brand_name, query.nice_class)
    return {
        "brand_name": query.brand_name,
        "nice_class": query.nice_class,
        "conflicts": results,
        "risk_level": results[0]["risk"] if results else "LOW"
    }


@app.post("/api/trademark/check-image")
async def check_trademark_image(file: UploadFile = File(...)):
    content = await file.read()
    results = tm_checker.check_image(content)
    return {
        "filename": file.filename,
        "conflicts": results,
        "risk_level": results[0]["risk"] if results else "LOW"
    }


# ── Prior Art Routes ───────────────────────────────────────────
@app.post("/api/prior-art/analyze")
def analyze_prior_art(query: PriorArtQuery):
    results = prior_art.analyze(query.text, query.top_k)
    return {
        "query": query.text,
        "prior_art_found": results,
        "total": len(results)
    }


# ── Dashboard Routes ───────────────────────────────────────────
@app.get("/api/dashboard/summary")
def dashboard_summary():
    return risk_scorer.get_dashboard_summary()


@app.get("/api/dashboard/trends")
def dashboard_trends():
    return risk_scorer.get_trends()


@app.get("/api/dashboard/alerts")
def dashboard_alerts():
    return risk_scorer.get_alerts()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
