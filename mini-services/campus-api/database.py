import sqlite3
from typing import Optional, List, Any
from datetime import datetime

DB_PATH = "/home/z/my-project/db/custom.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
    return conn


def query(sql: str, params: tuple = ()) -> List[dict]:
    conn = get_connection()
    try:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Query error: {e}")
        return []
    finally:
        conn.close()


def query_one(sql: str, params: tuple = ()) -> Optional[dict]:
    conn = get_connection()
    try:
        cursor = conn.execute(sql, params)
        row = cursor.fetchone()
        return dict(row) if row else None
    except Exception as e:
        print(f"Query_one error: {e}")
        return None
    finally:
        conn.close()


def execute(sql: str, params: tuple = ()) -> None:
    conn = get_connection()
    try:
        conn.execute(sql, params)
        conn.commit()
    except Exception as e:
        print(f"Execute error: {e}")
    finally:
        conn.close()
