import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import init_database
from .routes import audit_logs, auth, availability, categories, teams, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield


app = FastAPI(title="Team Calendar", lifespan=lifespan)
cors_origins = os.getenv("CORS_ORIGINS")
allowed_origins = (
    [origin.strip().rstrip("/") for origin in cors_origins.split(",") if origin.strip()]
    if cors_origins
    else ["http://localhost:5173", "http://127.0.0.1:5173"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(availability.router)
app.include_router(audit_logs.router)
