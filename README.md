# CV Application - React + FastAPI + LLM

Application de creation de CV et de lettres de motivation avec :
- un frontend React dans `frontend/`
- un backend FastAPI dans `backend/`
- une couche LLM configurable via OpenAI-compatible API ou commande locale

## Fonctionnalites

- consultation de CV de demonstration
- creation et edition de CV dans le navigateur
- assistant CV connecte a `/api/assistant`
- export PDF via `/api/generate-pdf`
- stockage local des CV et lettres

## Architecture

- Frontend : `frontend/`
- Backend API : `backend/app/main.py`
- Wrapper LLM : `backend/app/llm_wrapper.py`
- Assistant serverless Vercel : `api/assistant.js`

## Prerequis

- Python 3.10+
- Node.js 18+ recommande
- npm

## Demarrage local

### Option rapide

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
.\start-dev.ps1
```

ou

```powershell
start-dev.cmd
```

Le script lit `.env`, lance le backend FastAPI et le frontend React.

### 1. Backend

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main\frontend
$env:REACT_APP_API_URL="http://localhost:8000"
cmd /c npm install
cmd /c npm start
```

Application : `http://localhost:3000`

API :
- `http://localhost:8000/api/health`
- `http://localhost:8000/api/resumes`
- `http://localhost:8000/api/assistant`

## Mode LLM

### OpenAI-compatible

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main\backend
$env:OPENAI_API_KEY="votre_cle"
$env:OPENAI_MODEL="gpt-4o-mini"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### LLM local

```powershell
$env:LLM_CMD="python backend\\app\\llm_wrapper.py {prompt}"
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Le wrapper essaie :
1. `OPENAI_API_KEY`
2. `LLM_CMD`
3. fallback local par regles

## Build frontend

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main\frontend
cmd /c npm run build
```

## Deploiement GitHub -> Render + Vercel

### Backend Render

- Importez le repository GitHub dans Render
- Render detectera [render.yaml](c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/render.yaml)
- Verifiez ensuite les variables :
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`
  - `API_KEY` si vous voulez proteger `/api/generate-pdf`

Le backend publiera :
- `/api/health`
- `/api/assistant`
- `/api/generate-pdf`

### Frontend Vercel

- Importez le meme repository GitHub dans Vercel
- Vous pouvez deployer directement depuis la racine du repo grace a [vercel.json](c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/vercel.json)
- Ajoutez la variable :
  - `REACT_APP_API_URL=https://votre-backend.onrender.com`

### GitHub Actions optionnel

Les workflows suivants sont deja prets :
- [deploy-render.yml](c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/.github/workflows/deploy-render.yml)
- [deploy-vercel.yml](c:/Users/GilbertCS26/Documents/BIT/Projects/LLM_APP-main/.github/workflows/deploy-vercel.yml)

Secrets GitHub a definir si vous voulez le deploiement automatique :
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Notes

- Le frontend normalise `REACT_APP_API_URL` pour appeler automatiquement `/api/...`
- Le backend sert les endpoints FastAPI; ce projet n'utilise plus Express pour le mode principal
- `frontend/build/` peut etre deployee separement, et `api/assistant.js` reste utile pour un mode Vercel simple
- `start-dev.ps1` et `start-dev.cmd` servent a lancer rapidement les deux services en local
