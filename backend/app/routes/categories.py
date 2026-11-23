import sqlite3
import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ..audit import record_audit
<<<<<<< HEAD
from ..schema import CategoryCreate, CategoryOut
from ..user_dependents import get_current_user, get_database

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def list_categories(connection: sqlite3.Connection = Depends(get_database)):
    rows = connection.execute(
        "SELECT * FROM categories ORDER BY name COLLATE NOCASE"
    ).fetchall()
    return [CategoryOut(**dict(row)) for row in rows]


=======
from ..user_dependents import get_current_user, get_database
from ..schema import CategoryCreate, CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("", response_model=list[CategoryOut])
def list_Categories(connection: sqlite3.Connection = Depends(get_database)):
    rows = connection.execute("SELECT * FROM categories ORDER BY name COLLATE NOCASE").fetchall()
    return [CategoryOut(**dict(row)) for row in rows]

>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    current_user: sqlite3.Row = Depends(get_current_user),
<<<<<<< HEAD
    connection: sqlite3.Connection = Depends(get_database),
):
    name = payload.name.strip()
    code = payload.code.strip()
    existing = connection.execute(
        "SELECT id FROM categories WHERE code = ? COLLATE NOCASE", (code,)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="Category code already exists.")

    category_id = str(uuid.uuid4())
    connection.execute(
        "INSERT INTO categories (id, name, code, colour) VALUES (?, ?, ?, ?)",
        (category_id, name, code, payload.colour),
    )
    record_audit(connection, current_user["id"], "create category", "Category")
    connection.commit()
    row = connection.execute(
        "SELECT * FROM categories WHERE id = ?", (category_id,)
    ).fetchone()
    return CategoryOut(**dict(row))
=======
    connection: sqlite3.Connection = Depends(get_database)
):
    existing = connection.execute(
        "SELECT id FROM categories WHERE code = ? COLLATE NOCASE", (payload.code.strip(),)
    ).fetchone()
    if existing:
        raise HTTPException(status_code=409, detail="A category with this name already exists.")

    category_id = str(uuid.uuid4())
    connection.execute(
        "INSERT INTO categories (id, name, code, colour) VALUES (?,?,?,?)",
        (category_id, payload.name.strip(), payload.code.strip(), payload.colour),
    )
    record_audit(connection, current_user["id"], "create_category", "Category")
    connection.commit()

    row = connection.execute("SELECT * FROM categories WHERE id = ?", (category_id)).fetchone()
    return CategoryOut(**dict(row))
>>>>>>> 8dff5669d4d7a4eed025a4ad06ef4a421cea3633
