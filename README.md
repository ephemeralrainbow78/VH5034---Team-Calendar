# VH5034---Team-Calendar

Python and React + Vite project for a team calendar.

## Backend

From the repository root, install the backend dependencies and start the API:

```powershell
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.app.main:app --reload
```

The API documentation is available at `http://127.0.0.1:8000/docs`.

### Default bank holidays

On startup, the backend books the standard England and Wales bank holidays for the current calendar year for every existing user. Newly created accounts receive the same bookings. These entries use the `Bank Holiday` absence category and are not duplicated on subsequent startups.

## Frontend

From the repository root, install the frontend dependencies and start Vite:

```powershell
cd team-calendar
npm install
npm run dev
```
