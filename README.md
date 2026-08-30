# Chakki360 — Django + HTMX Plant Management System

Chakki360 is a complete Django-based management system for a flour mill / grinding plant (chakki). The application is being refactored from a React/Vite SPA into a server-rendered Django application using **Django Templates, HTMX and Bootstrap**.

The goal is to keep the system simple to deploy, easy to maintain, mobile-friendly for plant operators, and powerful enough for the Chakki Owner, Manager, Operator, Accountant and Customers.

## Technology Stack

- Python / Django
- Django Templates
- HTMX
- Bootstrap 5
- Bootstrap Icons
- Django authentication and Groups
- Django internationalization (English / Hindi)
- SQLite for local installations
- PostgreSQL supported through `DATABASE_URL`
- Django REST Framework retained for authenticated API compatibility
- WhiteNoise for static files
- Gunicorn for production

There is **no React, Vite or Node.js frontend build requirement** on the HTMX branch.

## Main Modules

### Dashboard

The operational dashboard provides quick visibility into:

- Today's grinding jobs
- Total weight received today
- Pending grinding jobs
- Grinding completion status
- Cash / payments received
- Customer outstanding udhaar
- Today's income
- Today's expenses
- Work queue
- Inventory status

### Customers

Customer management includes:

- Customer profile
- Mobile number
- Village / location
- Opening udhaar balance
- Customer notes
- Customer ledger
- Grinding history
- Outstanding balance
- Udhaar payment collection
- Customer self-service account access

### Grinding Operations

The grinding workflow covers the main chakki lifecycle:

1. Select or create customer
2. Select grain / service rate
3. Record incoming weight
4. Calculate grinding charge
5. Record advance payment
6. Track remaining udhaar
7. Keep job in grinding queue
8. Mark grinding completed
9. Capture final weight
10. Deliver material
11. Record payment / adjustment
12. Maintain customer ledger automatically

### Udhaar / Customer Ledger

The application treats customer receivables as a proper ledger rather than simply replacing the customer's opening balance.

Typical calculation:

```text
Opening Udhaar      ₹2,000
New Grinding Due    ₹  300
Payment Received   -₹  500
----------------------------
Outstanding         ₹1,800
```

Ledger transactions are designed around clear business meaning such as charges and payments so that payments reduce the customer's receivable balance correctly.

### Income

Income can be recorded separately from grinding transactions for items such as:

- Grinding income
- Atta sales
- Oil sales
- Bran / chokar sales
- Grain sales
- Packaging charges
- Delivery charges
- Other income

### Expenses

Expense management supports categories such as:

- Electricity
- Diesel
- Labour
- Payroll
- Machine parts
- Maintenance
- Packaging
- Other operating expenses

### Inventory

The inventory module supports stock monitoring for items such as:

- Wheat
- Maize
- Jowar
- Bajra
- Gram
- Mustard
- Atta
- Oil
- Bran / chokar
- Packaging bags
- Diesel
- Spare parts

Stock is designed around movements so that inventory can eventually represent:

```text
Opening Stock
+ Purchases
+ Production
+ Buyback / Inward
- Sales
- Consumption
- Wastage
= Current Stock
```

### Reports

The reporting area is being structured to support:

- Daily Business Summary
- Grinding Register
- Customer Statement
- Udhaar Outstanding Report
- Udhaar Aging
- Collection Report
- Income Register
- Expense Register
- Cash Book
- Profit & Loss
- Stock Ledger
- Stock Valuation
- Production / Yield Report
- Wastage Report
- Attendance and Payroll Reports
- Maintenance Cost Report

## Role-Based Access Control

Chakki360 uses Django authentication, permissions and Groups.

Default roles are created with:

```bash
python manage.py setup_roles
```

### Chakki Owner

Full access to the plant including:

- Dashboard
- Customers
- Grinding
- Udhaar
- Income
- Expenses
- Inventory
- Reports
- Administration

### Chakki Manager

Operational management access including customer, grinding, stock and business activities with restricted administrative control.

### Chakki Operator

Designed for day-to-day counter / plant operations:

- Create customers
- Create grinding jobs
- View grinding queue
- Update job status
- Record weights
- View customer information required for operations

Financial and administrative access can remain restricted.

### Accountant

Finance-oriented access including:

- Customer receivables
- Udhaar collection
- Customer ledger
- Income
- Expenses
- Inventory visibility
- Reports

### Customer

Customer logins can be linked to their Customer record and restricted to their own information, including:

- Outstanding udhaar
- Ledger
- Transaction history
- Account information

Customers cannot view other customer records or plant financial information.

## English / Hindi Support

The application uses Django's native internationalization framework.

Supported languages:

- English
- हिन्दी (Hindi)

Language switching is available from the application header. Translation files are stored under the Django locale structure and can be expanded as the application grows.

## HTMX Architecture

HTMX is used instead of a JavaScript SPA framework for interactive operations such as:

- Modal forms
- Create / edit screens
- Customer search
- Filtering
- Grinding status changes
- Udhaar collection
- Partial table refreshes
- Dashboard actions

This keeps Django responsible for both business logic and HTML rendering while avoiding duplicate frontend application logic.

## Repository Branch

The Django + HTMX refactor is currently maintained on:

```text
feature/django-htmx-chakki
```

The original `main` branch remains available as a rollback/reference point until the new implementation and database migrations are fully tested.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/nasirsaikh/grinding-app-dj-react.git
cd grinding-app-dj-react
git checkout feature/django-htmx-chakki
```

### 2. Create virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

Linux / macOS:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create / update database schema

```bash
python manage.py makemigrations mill
python manage.py migrate
```

### 5. Create role groups and permissions

```bash
python manage.py setup_roles
```

### 6. Create administrator

```bash
python manage.py createsuperuser
```

### 7. Collect static files

```bash
python manage.py collectstatic --noinput
```

### 8. Start Django

```bash
python manage.py runserver
```

Open:

```text
http://127.0.0.1:8000/
```

Django Admin:

```text
http://127.0.0.1:8000/admin/
```

Authenticated API:

```text
http://127.0.0.1:8000/api/
```

No `npm install`, `npm run build` or Vite development server is required.

## Existing SQLite Database

If an existing `db.sqlite3` contains production or historical records, take a backup before applying new migrations.

Recommended:

```bash
copy db.sqlite3 db_before_htmx_migration.sqlite3
python manage.py makemigrations mill
python manage.py migrate
```

Do not delete the existing database simply to resolve migration issues. Existing customer balances and ledger data should be migrated deliberately.

## PostgreSQL

When `DATABASE_URL` is present, Chakki360 can use PostgreSQL.

Example:

```text
DATABASE_URL=postgresql://user:password@host:5432/chakki
```

Without `DATABASE_URL`, Django uses SQLite.

## Production Example

Environment variables:

```text
DEBUG=0
SECRET_KEY=replace-with-a-secure-secret
ALLOWED_HOSTS=chakki.example.com
DATABASE_URL=postgresql://...
```

Run migrations and collect static files:

```bash
python manage.py migrate
python manage.py setup_roles
python manage.py collectstatic --noinput
```

Start Gunicorn:

```bash
gunicorn backend.chakki.wsgi:application
```

## Security and Data Integrity

Financial and udhaar records should not be casually deleted. The production roadmap includes controlled cancellation, reversal and audit history so financial corrections remain traceable.

Recommended operational principles:

- Require authentication for all business screens
- Apply role permissions server-side
- Never rely only on hiding frontend menu items
- Restrict customers to their own account
- Back up the database before migrations
- Use HTTPS in production
- Use a strong `SECRET_KEY`
- Set `DEBUG=0` in production
- Use proper role assignment for every employee login

## Development Roadmap

The Django + HTMX foundation currently covers the central plant workflow and is being expanded toward a complete chakki ERP-style application.

Planned / continuing modules include:

- Supplier management
- Purchase register
- Supplier payable ledger
- Sales register
- Detailed cash book
- Production batches
- Yield calculation
- Buyback management
- Wastage tracking
- Machine maintenance scheduling
- Electricity / utility analysis
- Employee management
- Attendance
- Payroll
- Advanced P&L
- Udhaar aging buckets
- Excel / PDF / printable reports
- Audit and cancellation controls
- Expanded Hindi translations
- Mobile-first operator screens

## Current Refactor Pull Request

The Django + HTMX migration is tracked in Pull Request #1:

https://github.com/nasirsaikh/grinding-app-dj-react/pull/1

The PR should remain unmerged until migrations and the financial workflows have been tested against a copy of the existing database.

---

**Chakki360** aims to provide one simple system for running the complete day-to-day operation of a chakki: customers, grinding, udhaar, money, stock, employees, maintenance and reporting.