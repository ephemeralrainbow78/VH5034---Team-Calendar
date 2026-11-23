import sqlite3
import uuid
from datetime import date, timedelta


def _easter_sunday(year: int) -> date:
    century = year // 100
    year_of_century = year % 100
    leap_year_correction = century // 4
    century_remainder = century % 4
    epact_correction = (century + 8) // 25
    lunar_correction = (century - epact_correction + 1) // 3
    epact = (19 * (year % 19) + century - leap_year_correction - lunar_correction + 15) % 30
    weekday_correction = year_of_century // 4
    year_remainder = year_of_century % 4
    weekday = (32 + 2 * century_remainder + 2 * weekday_correction - epact - year_remainder) % 7
    leap_month_correction = (year % 19 + 11 * epact + 22 * weekday) // 451
    month_value = epact + weekday - 7 * leap_month_correction + 114
    month = month_value // 31
    day = month_value % 31 + 1
    return date(year, month, day)


def _first_monday(year: int, month: int) -> date:
    first_day = date(year, month, 1)
    return first_day + timedelta(days=(-first_day.weekday()) % 7)


def _last_monday(year: int, month: int) -> date:
    if month == 12:
        first_day_of_next_month = date(year + 1, 1, 1)
    else:
        first_day_of_next_month = date(year, month + 1, 1)
    last_day = first_day_of_next_month - timedelta(days=1)
    return last_day - timedelta(days=last_day.weekday())


def _observed_weekday(day: date, occupied: set[date]) -> date:
    observed = day
    while observed.weekday() >= 5 or observed in occupied:
        observed += timedelta(days=1)
    occupied.add(observed)
    return observed


def england_wales_bank_holidays(year: int) -> list[date]:
    easter_sunday = _easter_sunday(year)
    holidays = {
        easter_sunday - timedelta(days=2),
        easter_sunday + timedelta(days=1),
        _first_monday(year, 5),
        _last_monday(year, 5),
        _last_monday(year, 8),
    }
    holidays.add(_observed_weekday(date(year, 1, 1), set()))

    occupied = set(holidays)
    for christmas_holiday in (date(year, 12, 25), date(year, 12, 26)):
        holidays.add(_observed_weekday(christmas_holiday, occupied))

    return sorted(holidays)


def ensure_bank_holidays_for_user(
    connection: sqlite3.Connection,
    user_id: str,
    team_id: str | None,
    year: int | None = None,
) -> int:
    holiday_year = year or date.today().year
    category = connection.execute(
        "SELECT id FROM categories WHERE code = ? COLLATE NOCASE",
        ("BH",),
    ).fetchone()
    if category is None:
        raise RuntimeError("The Bank Holiday category must exist before bookings are created.")

    inserted = 0
    for holiday in england_wales_bank_holidays(holiday_year):
        holiday_key = holiday.isoformat()
        exists = connection.execute(
            """
            SELECT 1 FROM availability
            WHERE user_id = ? AND category_id = ?
              AND start_date <= ? AND end_date >= ?
            """,
            (user_id, category["id"], holiday_key, holiday_key),
        ).fetchone()
        if exists:
            continue

        connection.execute(
            """
            INSERT INTO availability
                (id, user_id, category_id, start_date, end_date, noted, team_id,
                 created_by, last_updated, last_updated_by)
            VALUES (?, ?, ?, ?, ?, NULL, ?, 'System', datetime('now'), 'System')
            """,
            (
                str(uuid.uuid4()),
                user_id,
                category["id"],
                holiday_key,
                holiday_key,
                team_id,
            ),
        )
        inserted += 1

    return inserted


def ensure_bank_holidays_for_all_users(
    connection: sqlite3.Connection, year: int | None = None
) -> int:
    users = connection.execute("SELECT id, team_id FROM users").fetchall()
    return sum(
        ensure_bank_holidays_for_user(connection, user["id"], user["team_id"], year)
        for user in users
    )
