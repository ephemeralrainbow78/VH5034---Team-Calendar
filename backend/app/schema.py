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
