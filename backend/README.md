# Backend

Ce dossier contient le backend du projet.

## Contenu

- `app/` : application FastAPI
- `requirements.txt` : dependances Python

## Lancement

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main\backend
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Si vous utilisez le script racine, vous pouvez simplement lancer :

```powershell
cd c:\Users\GilbertCS26\Documents\BIT\Projects\LLM_APP-main
.\start-dev.ps1
```
