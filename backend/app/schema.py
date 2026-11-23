from datetime import date

from pydantic import BaseModel, Field


class SignUpRequest(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    username: str = Field(min_length=1)
    password: str = Field(min_length=12)
    team: str = Field(min_length=1)
    role: str = Field(min_length=1)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=12)


class MessageOut(BaseModel):
    message: str


class UserOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: str
    team_id: str | None = None
    team: str | None = None
    role: str
    is_active: bool


class UserTeamUpdate(BaseModel):
    team_id: str = Field(min_length=1)


class tokenResponse(BaseModel):
    token: str
    user: UserOut


class TeamCreate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


class TeamUpdate(BaseModel):
    name: str = Field(min_length=1)
    description: str | None = None


class TeamOut(BaseModel):
    id: str
    name: str
    description: str | None = None
    created_at: str
    created_by: str | None = None
    updated_at: str | None = None
    updated_by: str | None = None


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    code: str = Field(min_length=1, max_length=5)
    colour: str = Field(pattern=r"^#[0-9A-Fa-f]{6}$")


class CategoryOut(BaseModel):
    id: str
    name: str
    code: str
    colour: str


class AvailabilityCreate(BaseModel):
    user_id: str
    category_id: str
    start_date: date
    end_date: date
    notes: str | None = None
    team_id: str | None = None


class AvailabilityUpdate(BaseModel):
    category_id: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    notes: str | None = None


class AvailabilityOut(BaseModel):
    id: str
    user_id: str
    category_id: str
    start_date: date
    end_date: date
    notes: str | None = None
    team_id: str | None = None
    created_by: str | None = None
    last_updated: str | None = None
    last_updated_by: str | None = None


class AuditLogOut(BaseModel):
    id: str
    user_id: str | None = None
    action: str
    created_at: str
    entity_type: str
