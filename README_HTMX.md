# Chakki360 Django + HTMX

This branch replaces the React/Vite UI with Django templates, Bootstrap and HTMX.

## Setup

```bash
pip install -r requirements.txt
python manage.py makemigrations mill
python manage.py migrate
python manage.py setup_roles
python manage.py createsuperuser
python manage.py runserver
```

Roles: Chakki Owner, Chakki Manager, Chakki Operator, Accountant, Customer.

The existing DRF API remains under `/api/` for compatibility, but authentication is now required. The web application is server rendered and enhanced with HTMX.
