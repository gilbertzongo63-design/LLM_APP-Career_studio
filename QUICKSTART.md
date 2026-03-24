# Quickstart

## One-command start

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
.\start-dev.ps1
```

## Backend

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main\frontend
$env:REACT_APP_API_URL="http://localhost:8000"
cmd /c npm install
cmd /c npm start
```

## Verification

- Frontend : `http://localhost:3000`
- Health : `http://localhost:8000/api/health`
- Resumes : `http://localhost:8000/api/resumes`

## LLM

OpenAI-compatible :

```powershell
$env:OPENAI_API_KEY="votre_cle"
$env:OPENAI_MODEL="gpt-4o-mini"
```

Local :

```powershell
$env:LLM_CMD="python backend\\app\\llm_wrapper.py {prompt}"
```
