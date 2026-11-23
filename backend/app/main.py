from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .database import init_database
from .routes import audit_logs, auth, availability, categories, teams, users

<<<<<<< HEAD

=======
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield

<<<<<<< HEAD

app = FastAPI(title="Team Calendar", lifespan=lifespan)
=======
app = FastAPI(title="Team Calendar", lifespan=lifespan)

>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
<<<<<<< HEAD
    allow_headers=["*"],
=======
    allow_headers=["*"]
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
)

app.include_router(auth.router)
app.include_router(teams.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(availability.router)
<<<<<<< HEAD
app.include_router(audit_logs.router)
=======
app.include_router(audit_logs.router)
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
