import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
<<<<<<< HEAD
from ..schema import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/availiability", tags=["availability"])
=======
from ..user_dependents import get_current_user, get_database
from ..schema import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate

router = APIRouter(prefix="/api/availiability", tags=["availiability"])
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

AVAILABILITY_SELECT = """
    SELECT id, user_id, category_id, start_date, end_date, noted AS notes,
           team_id, created_by, last_updated, last_updated_by
    FROM availability
"""


<<<<<<< HEAD
def _get_availability(
    connection: sqlite3.Connection, availability_id: str
) -> sqlite3.Row:
=======
def _get_availability(connection: sqlite3.Connection, availability_id: str) -> sqlite3.Row:
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    row = connection.execute(
        AVAILABILITY_SELECT + " WHERE id = ?", (availability_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Availability record not found.")
    return row

<<<<<<< HEAD

def _ensure_can_manage(
    current_user: sqlite3.Row, target_user_id: str, target_team_id: str | None
) -> None:
    role = current_user["role"].casefold()
    if role == "admin":
        return
    if role == "manager":
        if current_user["team_id"] is not None and target_team_id == current_user["team_id"]:
            return
        raise HTTPException(
            status_code=403,
            detail="Managers can only manage absences for their own team.",
        )
    if target_user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only manage your own absences.",
        )


=======
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
@router.get("", response_model=list[AvailabilityOut])
def list_availability(
    user_id: str | None = None,
    team_id: str | None = None,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    query = AVAILABILITY_SELECT + " WHERE 1=1"
    params: list[str] = []
    if user_id:
        query += " AND user_id = ?"
        params.append(user_id)
    if team_id:
        query += " AND team_id = ?"
        params.append(team_id)
    query += " ORDER BY start_date"
<<<<<<< HEAD
    rows = connection.execute(query, params).fetchall()
    return [AvailabilityOut(**dict(row)) for row in rows]


=======

    rows = connection.execute(query, params).fetchall()
    return [AvailabilityOut(**dict(row)) for row in rows]

>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
@router.post("", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
def create_availability(
    payload: AvailabilityCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
<<<<<<< HEAD
    connection: sqlite3.Connection = Depends(get_database),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=422, detail="End date must be on or after start date.")

=======
    connection: sqlite3.Connection = Depends(get_database)
):
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    user_row = connection.execute(
        "SELECT id, team_id FROM users WHERE id = ? AND is_active = 1",
        (payload.user_id,),
    ).fetchone()
    if user_row is None:
<<<<<<< HEAD
        raise HTTPException(status_code=404, detail="User not found.")
    _ensure_can_manage(current_user, user_row["id"], user_row["team_id"])
=======
        raise HTTPException(status_code=404, detail="User not found")
    role = current_user["role"].casefold()
    if role == "manager":
        if current_user["team_id"] is None or user_row["team_id"] != current_user["team_id"]:
            raise HTTPException(status_code=403, detail="Managers can only add absences for their own team.")
    elif role != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only add an absence for yourself.")
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

    category_row = connection.execute(
        "SELECT id FROM categories WHERE id = ?", (payload.category_id,)
    ).fetchone()
    if category_row is None:
<<<<<<< HEAD
        raise HTTPException(status_code=404, detail="Category not found.")

    availability_id = str(uuid.uuid4())
    connection.execute(
        """
        INSERT INTO availability
            (id, user_id, category_id, start_date, end_date, noted, team_id,
             created_by, last_updated, last_updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
        """,
        (
            availability_id,
            user_row["id"],
            payload.category_id,
            payload.start_date.isoformat(),
            payload.end_date.isoformat(),
=======
        raise HTTPException(status_code=404, detail="Category not found")
    availiability_id = str(uuid.uuid4())
    connection.execute(
        """
        INSERT INTO availability
        (id, user_id, category_id, start_date, end_date, noted, team_id, created_by, last_updated, last_updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
        """,
        (
            availiability_id,
            payload.user_id,
            payload.category_id,
            payload.start_date,
            payload.end_date,
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
            payload.notes,
            user_row["team_id"],
            current_user["username"],
            current_user["username"],
<<<<<<< HEAD
        ),
    )
    record_audit(connection, current_user["id"], "create availability", "Availability")
    connection.commit()
    return AvailabilityOut(**dict(_get_availability(connection, availability_id)))

=======
        )
    )
    record_audit(connection, current_user["id"], "create availability", "Availability")
    connection.commit()

    row = _get_availability(connection, availiability_id)
    return AvailabilityOut(**dict(row))
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

@router.put("/{availability_id}", response_model=AvailabilityOut)
def update_availability(
    availability_id: str,
    payload: AvailabilityUpdate,
    current_user: sqlite3.Row = Depends(get_current_user),
<<<<<<< HEAD
    connection: sqlite3.Connection = Depends(get_database),
):
    row = _get_availability(connection, availability_id)
    _ensure_can_manage(current_user, row["user_id"], row["team_id"])
    updates = payload.model_dump(exclude_unset=True)

=======
    connection: sqlite3.Connection = Depends(get_database)
):
    _get_availability(connection, availability_id)

    updates = payload.model_dump(exclude_unset=True)
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    if "start_date" in updates:
        updates["start_date"] = updates["start_date"].isoformat()
    if "end_date" in updates:
        updates["end_date"] = updates["end_date"].isoformat()
    if "notes" in updates:
        updates["noted"] = updates.pop("notes")
<<<<<<< HEAD

    start_date = updates.get("start_date", row["start_date"])
    end_date = updates.get("end_date", row["end_date"])
    if start_date > end_date:
        raise HTTPException(status_code=422, detail="End date must be on or after start date.")

=======
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
    if "category_id" in updates:
        category_row = connection.execute(
            "SELECT id FROM categories WHERE id = ?", (updates["category_id"],)
        ).fetchone()
        if category_row is None:
<<<<<<< HEAD
            raise HTTPException(status_code=404, detail="Category not found.")

    if updates:
        set_clause = ", ".join(f"{key} = ?" for key in updates)
        params = list(updates.values())
        params.extend((current_user["username"], availability_id))
=======
            raise HTTPException(status_code=404, detail="Category not found")

    if updates:
        set_clause = ", ".join(f"{key} = ?" for key in updates.keys())
        params = list(updates.values())
        params.append(current_user["username"])
        params.append(availability_id)
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
        connection.execute(
            f"""
            UPDATE availability
            SET {set_clause}, last_updated = datetime('now'), last_updated_by = ?
            WHERE id = ?
            """,
<<<<<<< HEAD
            params,
=======
            params
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
        )
        record_audit(connection, current_user["id"], "update availability", "Availability")
        connection.commit()

<<<<<<< HEAD
    return AvailabilityOut(**dict(_get_availability(connection, availability_id)))

=======
    updated_row = _get_availability(connection, availability_id)
    return AvailabilityOut(**dict(updated_row))
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633

@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: str,
    current_user: sqlite3.Row = Depends(get_current_user),
<<<<<<< HEAD
    connection: sqlite3.Connection = Depends(get_database),
) -> None:
    row = _get_availability(connection, availability_id)
    _ensure_can_manage(current_user, row["user_id"], row["team_id"])
    connection.execute("DELETE FROM availability WHERE id = ?", (availability_id,))
    record_audit(connection, current_user["id"], "delete availability", "Availability")
    connection.commit()
=======
    connection: sqlite3.Connection = Depends(get_database)
):
    _get_availability(connection, availability_id)

    connection.execute("DELETE FROM availability WHERE id = ?", (availability_id,))
    record_audit(connection, current_user["id"], "delete availability", "Availability")
    connection.commit()
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
