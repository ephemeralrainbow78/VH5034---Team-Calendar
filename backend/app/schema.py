<<<<<<< HEAD
try:
    from backend.schema import (
        AvailabilityCreate,
        AvailabilityOut,
        AvailabilityUpdate,
        AuditLogOut,
        CategoryCreate,
        CategoryOut,
        LoginRequest,
        SignUpRequest,
        TeamCreate,
        TeamOut,
        tokenResponse,
        UserOut,
    )
except ModuleNotFoundError:
    from schema import (
        AvailabilityCreate,
        AvailabilityOut,
        AvailabilityUpdate,
        AuditLogOut,
        CategoryCreate,
        CategoryOut,
        LoginRequest,
        SignUpRequest,
        TeamCreate,
        TeamOut,
        tokenResponse,
        UserOut,
    )

__all__ = [
    "AvailabilityCreate",
    "AvailabilityOut",
    "AvailabilityUpdate",
    "AuditLogOut",
    "CategoryCreate",
    "CategoryOut",
    "LoginRequest",
    "SignUpRequest",
    "TeamCreate",
    "TeamOut",
    "tokenResponse",
    "UserOut",
]
=======
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

# Auth
class SignUpRequest(BaseModel):
    first_name: str = Field(min_length = 1)
    last_name: str = Field(min_length = 1)
    username: str = Field(min_length = 1)
    password:str = Field(min_length = 12)
    team: str = Field(min_length = 1)
<<<<<<<< HEAD:backend/schema.py
    role: str = Field(min_length = 1)
========
    role: str
>>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633:backend/app/schema.py

class LoginRequest(BaseModel):
    username: str = Field(min_length = 1)
    password: str = Field(min_length = 1)

class UserOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: str 
    team_id: Optional[str] = None
    team: Optional [str] = None
    role: str
    is_active: bool

class tokenResponse(BaseModel):
    token: str
    user: UserOut

# Team
class TeamCreate(BaseModel):
    name: str = Field(min_length = 1)
    description: Optional[str] = None
 
class TeamOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str
    created_by: Optional[str] = None
    updated_at: Optional[str] = None
    updated_by: Optional[str] = None

# Categories
class CategoryCreate(BaseModel):
    name: str = Field(min_length = 1)
    code: str = Field(min_length = 1)
    colour: Optional[str] = None
 
class CategoryOut(BaseModel):
    id: str
    name: str
    code: str
    colour: str

# Availability
class AvailabilityCreate(BaseModel):
    user_id: str
    category_id: str
    start_date: date
    end_date: date
    notes: Optional[str] = None
    team_id: Optional[str] = None

class AvailabilityUpdate(BaseModel):
    category_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

class AvailabilityOut(BaseModel):
    id: str
    user_id: str
    category_id: str
    start_date: date
    end_date: date
    notes: Optional[str] = None
    team_id: Optional[str] = None
    created_by: Optional[str] = None
    last_updated: Optional[str] = None
    last_updated_by: Optional[str] = None

# Audit 
class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    created_at: str
    entity_type: str
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
