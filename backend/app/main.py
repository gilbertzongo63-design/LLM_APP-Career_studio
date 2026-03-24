import asyncio
import os
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles

from .llm_wrapper import call_llm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample resumes (keeps API working without the CSV)
SAMPLE_RESUMES = [
    {
        "id": "sample-1",
        "title": "Developpeur Frontend",
        "summary": "Developpeur React specialise en interfaces performantes.",
        "skills": ["React", "TypeScript", "CSS"],
        "experience": "3 years",
        "category": "IT",
        "fullText": "Sample resume 1 full text",
        "html": "",
    },
    {
        "id": "sample-2",
        "title": "Data Analyst Junior",
        "summary": "Analyste de donnees avec Excel et SQL.",
        "skills": ["SQL", "Python", "Tableau"],
        "experience": "2 years",
        "category": "Data",
        "fullText": "Sample resume 2 full text",
        "html": "",
    },
]


async def _validate_api_key(request: Request):
    """Allow an optional API key to protect endpoints. Set env `API_KEY` to enable."""
    expected = os.environ.get("API_KEY")
    if not expected:
        return
    key = request.headers.get("x-api-key") or request.query_params.get("api_key")
    if not key or key != expected:
        raise HTTPException(status_code=401, detail="Invalid API Key")


@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": asyncio.get_event_loop().time()}


@app.get("/api/resumes")
async def get_resumes():
    return {"success": True, "count": len(SAMPLE_RESUMES), "data": SAMPLE_RESUMES}


@app.get("/api/resumes/{resume_id}")
async def get_resume(resume_id: str):
    for resume in SAMPLE_RESUMES:
        if resume.get("id") == resume_id:
            return {"success": True, "data": resume}
    raise HTTPException(status_code=404, detail="Resume not found")


@app.post("/api/assistant")
async def assistant(request: Request):
    try:
        body = await request.json()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid JSON body: {exc}") from exc

    prompt = body.get("prompt", "") if isinstance(body, dict) else ""
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt required")

    try:
        response_text = await run_in_threadpool(call_llm, prompt)
        return {"success": True, "response": response_text}
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": "LLM execution failed", "details": str(exc)},
        )


@app.post("/api/generate-pdf")
async def generate_pdf(request: Request, _=Depends(_validate_api_key)):
    """Generate a PDF from provided HTML payload and return it as an attachment."""
    body = await request.json()
    html = body.get("html") or body.get("content")
    filename = body.get("filename") or "export.pdf"
    if not html:
        raise HTTPException(status_code=400, detail="HTML content required")
    try:
        from weasyprint import HTML

        pdf_bytes = HTML(string=html).write_pdf()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# Serve frontend build if present
BUILD_DIR = Path(__file__).resolve().parents[2] / "frontend" / "build"
if BUILD_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=str(BUILD_DIR)), name="static")
