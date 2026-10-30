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
    is_Active: bool

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
class CagegoryCreate(BaseModel):
    name: str = Field(min_length = 1)
    code: str = Field(min_length = 1)
    color: Optional[str] = None
 
class CategoryOut(BaseModel):
    id: str
    name: str
    code: str
    color: str

# Availability
class AvailiabilityCreate(BaseModel):
    user_id: str
    category_id: str
    start_date: date
    end_date: date
    notes: Optional[str] = None
    team_id: Optional[str] = None

class AvailiabilityUpdate(BaseModel):
    category_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None

class AvailiabilityOut(BaseModel):
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
