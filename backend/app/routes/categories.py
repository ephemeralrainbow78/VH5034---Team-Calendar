import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
from ..schema import CategoryCreate, CategoryOut
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(connection: sqlite3.Connection = Depends(get_database)):
    rows = connection.execute(
        "SELECT * FROM categories ORDER BY name COLLATE NOCASE"
    ).fetchall()
    return [CategoryOut(**dict(row)) for row in rows]


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
    connection: sqlite3.Connection = Depends(get_database),
):
    if current_user["role"].casefold() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create absence categories.",
        )

    name = payload.name.strip()
    code = payload.code.strip().upper()
    if not name or not code:
        raise HTTPException(status_code=422, detail="Category name and code are required.")

    existing = connection.execute(
        """
        SELECT id FROM categories
        WHERE name = ? COLLATE NOCASE OR code = ? COLLATE NOCASE
        """,
        (name, code),
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="An absence category with this name or code already exists.",
        )

    category_id = str(uuid.uuid4())
    connection.execute(
        "INSERT INTO categories (id, name, code, colour) VALUES (?, ?, ?, ?)",
        (category_id, name, code, payload.colour.upper()),
    )
    record_audit(connection, current_user["id"], "create category", "Category")
    connection.commit()
    row = connection.execute(
        "SELECT * FROM categories WHERE id = ?", (category_id,)
    ).fetchone()
    return CategoryOut(**dict(row))
