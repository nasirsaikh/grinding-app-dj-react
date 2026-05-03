# Chakki Git — Django + React single deployment

This project uses Django as the only production server. React is built into `frontend/dist`, and Django serves the SPA plus `/api/` endpoints.

## Local setup

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations mill
python manage.py migrate
python manage.py createsuperuser
cd frontend
npm install
npm run build
cd ..
python manage.py collectstatic --noinput
python manage.py runserver
```

Open `http://127.0.0.1:8000/` for React, `http://127.0.0.1:8000/api/` for API, and `/admin/` for Django admin.

## Production command

```bash
DEBUG=0 SECRET_KEY='change-me' ALLOWED_HOSTS='yourdomain.com' gunicorn backend.chakki.wsgi:application
```

## Development option

For frontend hot reload, run Django on `:8000` and Vite on `:5173`. In production, only Django is required after `npm run build`.
