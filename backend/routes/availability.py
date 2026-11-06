import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..user_dependents import get_current_user, get_database
from ..schema import AvailabilityCreate, AvailabilityOut, AvailabilityUpdate

router = APIRouter(prefix="/api/availiability", tags=["availiability"])

def _get_availability(connection: sqlite3.Connection, availability_id: str) -> sqlite3.Row:
    row = connection.execute("SELECT * FROM availiability WHERE id = ?", (availability_id)).fetchone()
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
    query = "SELECT * FROM availability WHERE 1=1"
    params: list[str] = []
    if user_id:
        query += " AND user_id = ?"
        params.append(user_id)
    if team_id:
        query += " AND team_id = ?"
        params.append(team_id)
    query += " ORDER_BY start_date"

    rows = connection.execute(query, params).fetchall()
    return [(AvailabilityOut(**dict)) for row in rows]

@router.post("", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
def create_availability(
    payload: AvailabilityCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database)
):
    user_row = connection.execute("SELECT id FROm users WHERE id = ?", (payload.user_id,)).fetchone()
    
    if user_row is None:
        raise HTTPException(status_code=404, detail="User not found")
    category_row = connection.execute(
        "SELECT id FROM categories WHERE id = ?", (payload.category_id,)
    ).fetchone()
    if category_row is None:
        raise HTTPException(status_code=404, detail="Category not found")
    availiability_id = str(uuid.uuid4())
    connection.execute(
        """
        INSERT INTO availability
        (id, User_id, category_id, start_date, end_date, notes, team_id, created_by, last_updated, last_updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
        """,
        (
            availiability_id,
            payload.user_id,
            payload.category_id,
            payload.start_date,
            payload.end_date,
            payload.notes,
            payload.team_id,
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
