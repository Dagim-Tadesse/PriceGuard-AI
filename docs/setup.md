# Setup

This repo includes a working Django backend, Streamlit frontend, and a Python AI module.

## Shared requirement

- The backend must implement the endpoints and JSON shapes defined in `docs/api.md`.
- The AI/prediction module must produce the output described in `docs/api.md`.

## Local dev (Windows / PowerShell)

### 1) Activate the virtual environment

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
& .\.venv\Scripts\Activate.ps1
```

### 2) Install Python dependencies

```powershell
python -m pip install -U pip
python -m pip install "Django>=4.2" djangorestframework streamlit requests
```

### 3) Migrate + (optional) seed demo data

```powershell
python backend\priceguard\manage.py migrate
python backend\priceguard\load_seed.py
```

Note: `load_seed.py` is idempotent and will skip if data already exists.

### 4) Run backend API

```powershell
python backend\priceguard\manage.py runserver 8000
```

Backend base URL: `http://127.0.0.1:8000/api`

### 5) Run Streamlit frontend

In a new terminal:

```powershell
streamlit run Frontend\app.py
```
