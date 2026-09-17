# Attendance Tracker

A weighted attendance tracker for students. Define subjects with individual
attendance targets, build a weekly timetable, mark daily attendance, and watch
per-subject and overall percentages — with public holidays automatically
skipped. Clean, minimal, mobile-friendly UI.

**Live demo:** https://attendance-tracker-tl.vercel.app
**API:** https://attendance-tracker-tl.onrender.com (`/docs` for interactive docs)

## Features

- **Dashboard** — overall attendance with progress bars, per-subject cards with
  On track / At risk badges against each subject's target.
- **Attendance** — pick any date, mark classes Present / Absent / Cancelled.
  Optimistic updates, holiday-aware (no classes generated on holidays).
- **Setup** — add/delete subjects with targets, add/remove weekly timetable
  slots, view the week at a glance (today highlighted), sync public holidays
  per country via the Nager.Date API.
- **Stats math** — percentage = present ÷ marked; cancelled and unmarked
  classes never lower your score.

## Tech stack

| Layer    | Choice                                              |
| -------- | --------------------------------------------------- |
| Backend  | FastAPI, SQLAlchemy, SQLite, Pydantic               |
| Frontend | React 19, Vite (`frontend/src-fixed` is the app)    |
| Hosting  | Render (API, free tier) + Vercel (frontend)         |

> `frontend/src/` is the original scaffold; the maintained app lives in
> `frontend/src-fixed/` (wired up in `frontend/index.html`).

## Run locally

No environment variables needed — everything defaults to localhost.

```bash
# Terminal 1 — backend → http://localhost:8000 (/docs for API docs)
./venv/bin/python -m uvicorn main:app --reload --app-dir backend

# Terminal 2 — frontend → http://localhost:5173
npm run dev --prefix frontend
```

Requires Python 3.9+ (`pip install -r requirements.txt` into a venv) and
Node 18+ (`npm install` in `frontend/`).

## Environment variables

| Variable           | Where          | Default                  | Purpose                                  |
| ------------------ | -------------- | ------------------------ | ---------------------------------------- |
| `ALLOWED_ORIGINS`  | Backend/Render | `http://localhost:5173`  | Comma-separated CORS origins             |
| `VITE_API_BASE_URL`| Frontend/Vercel| `http://localhost:8000`  | Backend URL, baked in at build time      |

## Deploy

- **Backend (Render):** New → Blueprint on this repo (`render.yaml` declares
  the Python web service, root dir `backend`, health check `/health`).
  Then set `ALLOWED_ORIGINS` to the Vercel URL.
- **Frontend (Vercel):** import repo, Root Directory `frontend`, set
  `VITE_API_BASE_URL` to the Render URL for Production + Preview, deploy.

## API overview

| Method | Path                              | Description                          |
| ------ | --------------------------------- | ------------------------------------ |
| GET/POST | `/subjects/`                    | List / create subjects               |
| PUT/DELETE | `/subjects/{id}`              | Update / delete (cascades to slots + records) |
| GET/POST | `/timetable/`, `/timetable/slots` | Weekly slots                       |
| DELETE | `/timetable/slots/{id}`           | Remove a slot                        |
| GET    | `/classes/?date=YYYY-MM-DD`       | Classes for a date (auto-generated)  |
| PATCH  | `/classes/{id}`                   | Mark `present` / `absent` / `cancelled` / `unmarked` |
| GET    | `/stats/overall`, `/stats/subjects`| Attendance statistics               |
| POST/GET | `/holidays/sync`, `/holidays/`  | Sync/list public holidays            |

## Notes & limitations

- SQLite on Render's free tier is **ephemeral** — data resets on redeploys or
  restarts. Fine for demos; use Postgres (or a Render Disk on a paid plan)
  for persistence.
- Free Render services **sleep after 15 min idle**; first request takes
  ~1 minute to wake.
- Test suites live outside the repo temp space by design; the backend was
  verified with 37 live-API tests and the frontend with 20 static checks
  before deployment.
