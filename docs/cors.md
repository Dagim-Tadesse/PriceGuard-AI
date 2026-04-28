CORS and Local Run Notes

Purpose

This document explains how to run the Streamlit frontend and Django backend on separate ports/machines during local development and what minimal settings are required (CORS, `ALLOWED_HOSTS`) to allow the demo to run smoothly.

Quick summary

- Backend (Django) typically runs at `http://127.0.0.1:8000`.
- Frontend (Streamlit) typically runs at `http://localhost:8501`.
- To allow the frontend to call the backend when they run on different origins, enable CORS on the Django app.

Steps

1. Install `django-cors-headers` in your environment (already in `requirements.txt` for demo if present):

```powershell
pip install django-cors-headers
```

2. Update Django settings (in `backend/priceguard/settings.py`):

- Add to `INSTALLED_APPS`:

```py
INSTALLED_APPS += [
    'corsheaders',
]
```

- Add to the top of `MIDDLEWARE` (before CommonMiddleware):

```py
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... existing middleware
]
```

- For demo/local usage, allow the frontend origin explicitly (recommended) or allow all origins temporarily (less secure):

```py
# Recommended for local dev: explicit allowed origins
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8501',
    'http://127.0.0.1:8501',
]

# OR (demo convenience): allow all origins
# CORS_ALLOW_ALL_ORIGINS = True
```

3. `ALLOWED_HOSTS` and Streamlit

- If you run Streamlit and Django on the same machine, the backend should accept the hostnames used by Streamlit and the browser. In `backend/priceguard/settings.py` set:

```py
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
```

- When running the app in a container or on a demo machine with a different host/IP, add the host/IP to `ALLOWED_HOSTS` or set via environment variable before starting Django:

```powershell
$env:DJANGO_ALLOWED_HOSTS = 'localhost,127.0.0.1,my.demo.host'
# or set ALLOWED_HOSTS in settings to read from env
```

4. Running backend and frontend separately (example commands)

Start the backend (from repo root):

```powershell
# activate venv first
python backend/priceguard/manage.py runserver 0.0.0.0:8000
```

Start the frontend (from `Frontend` folder):

```powershell
cd Frontend
streamlit run app.py
```

5. Troubleshooting

- CORS errors in browser console: ensure the exact origin `http://localhost:8501` is listed in `CORS_ALLOWED_ORIGINS` or set `CORS_ALLOW_ALL_ORIGINS = True` for quick demos.
- `DisallowedHost` errors when accessing backend: add the requested hostname to `ALLOWED_HOSTS` or run with `python manage.py runserver 0.0.0.0:8000` and include `0.0.0.0` variant in allowed hosts via env config.
- If using Streamlit cloud or another remote host, add the deployed origin to `CORS_ALLOWED_ORIGINS`.

Notes on security

- For demos it is tempting to set `CORS_ALLOW_ALL_ORIGINS = True`. That is acceptable for local testing but not for production. Prefer explicit `CORS_ALLOWED_ORIGINS` entries.
- For production deployments add authentication and rate-limiting and restrict CORS origins to your frontend domain.

This file should be linked from the README to help judges or teammates run the frontend and backend separately without CORS/host issues.
