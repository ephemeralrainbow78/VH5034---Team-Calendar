import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..user_dependents import get_current_user, get_database
from ..schema import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate

router = APIRouter(prefix="/api/availiability", tags=["availiability"])

AVAILABILITY_SELECT = """
    SELECT id, user_id, category_id, start_date, end_date, noted AS notes,
           team_id, created_by, last_updated, last_updated_by
    FROM availability
"""


def _get_availability(connection: sqlite3.Connection, availability_id: str) -> sqlite3.Row:
    row = connection.execute(
        AVAILABILITY_SELECT + " WHERE id = ?", (availability_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Availability record not found.")
    return row

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

    rows = connection.execute(query, params).fetchall()
    return [AvailabilityOut(**dict(row)) for row in rows]

@router.post("", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
def create_availability(
    payload: AvailabilityCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    user_row = connection.execute(
        "SELECT id, team_id FROM users WHERE id = ? AND is_active = 1",
        (payload.user_id,),
    ).fetchone()
    if user_row is None:
        raise HTTPException(status_code=404, detail="User not found")
    role = current_user["role"].casefold()
    if role == "manager":
        if current_user["team_id"] is None or user_row["team_id"] != current_user["team_id"]:
            raise HTTPException(status_code=403, detail="Managers can only add absences for their own team.")
    elif role != "admin" and payload.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only add an absence for yourself.")

    category_row = connection.execute(
        "SELECT id FROM categories WHERE id = ?", (payload.category_id,)
    ).fetchone()
    if category_row is None:
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
            payload.notes,
            user_row["team_id"],
            current_user["username"],
            current_user["username"],
        )
    )
    record_audit(connection, current_user["id"], "create availability", "Availability")
    connection.commit()

    row = _get_availability(connection, availiability_id)
    return AvailabilityOut(**dict(row))

@router.put("/{availability_id}", response_model=AvailabilityOut)
def update_availability(
    availability_id: str,
    payload: AvailabilityUpdate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    _get_availability(connection, availability_id)

    updates = payload.model_dump(exclude_unset=True)
    if "start_date" in updates:
        updates["start_date"] = updates["start_date"].isoformat()
    if "end_date" in updates:
        updates["end_date"] = updates["end_date"].isoformat()
    if "notes" in updates:
        updates["noted"] = updates.pop("notes")
    if "category_id" in updates:
        category_row = connection.execute(
            "SELECT id FROM categories WHERE id = ?", (updates["category_id"],)
        ).fetchone()
        if category_row is None:
            raise HTTPException(status_code=404, detail="Category not found")

    if updates:
        set_clause = ", ".join(f"{key} = ?" for key in updates.keys())
        params = list(updates.values())
        params.append(current_user["username"])
        params.append(availability_id)
        connection.execute(
            f"""
            UPDATE availability
            SET {set_clause}, last_updated = datetime('now'), last_updated_by = ?
            WHERE id = ?
            """,
            params
        )
        record_audit(connection, current_user["id"], "update availability", "Availability")
        connection.commit()

    updated_row = _get_availability(connection, availability_id)
    return AvailabilityOut(**dict(updated_row))

@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: str,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    _get_availability(connection, availability_id)

    connection.execute("DELETE FROM availability WHERE id = ?", (availability_id,))
    record_audit(connection, current_user["id"], "delete availability", "Availability")
    connection.commit()