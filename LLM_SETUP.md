LLM Setup
=========

Le projet expose `POST /api/assistant` via FastAPI et utilise `backend/app/llm_wrapper.py`.

Ordre de resolution :
1. OpenAI-compatible API via `OPENAI_API_KEY`
2. commande locale via `LLM_CMD`
3. fallback local par regles

Mode OpenAI-compatible
----------------------

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
.\.venv\Scripts\Activate.ps1
cd backend
$env:OPENAI_API_KEY="votre_cle"
$env:OPENAI_MODEL="gpt-4o-mini"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Vous pouvez aussi utiliser un endpoint compatible :

```powershell
$env:OPENAI_BASE_URL="https://votre-endpoint-compatible/v1"
```

Mode LLM local
--------------

`LLM_CMD` peut contenir directement `{prompt}` :

```powershell
$env:LLM_CMD="python backend\\app\\llm_wrapper.py {prompt}"
```

ou pointer vers un runtime local :

```powershell
$env:LLM_CMD="C:\\path\\to\\local-llm.exe {prompt}"
```

Notes
-----

- Le backend ne passe plus par Express.
- Le frontend appelle toujours l'assistant sur `/api/assistant`.
- Le `system prompt` peut etre personnalise avec `LLM_SYSTEM_PROMPT`.
