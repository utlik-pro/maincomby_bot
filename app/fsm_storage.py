"""
SQLite Storage для aiogram FSM.
Хранит состояния в базе данных, чтобы они не терялись при перезапуске бота.
"""
from __future__ import annotations

import json
import sqlite3
from typing import Any

from aiogram.fsm.state import State
from aiogram.fsm.storage.base import BaseStorage, StorageKey


class SQLiteStorage(BaseStorage):
    """
    SQLite-based FSM storage.
    Persists FSM states and data to SQLite database.
    """

    def __init__(self, db_path: str = "data/bot.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Get a new connection for the current thread."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initialize the FSM states table."""
        conn = self._get_connection()
        try:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS fsm_states (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bot_id INTEGER NOT NULL,
                    chat_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    state TEXT,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(bot_id, chat_id, user_id)
                )
            """)
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_fsm_states_lookup
                ON fsm_states(bot_id, chat_id, user_id)
            """)
            conn.commit()
        finally:
            conn.close()

    def _make_key(self, key: StorageKey) -> tuple[int, int, int]:
        """Convert StorageKey to database key tuple."""
        return (key.bot_id, key.chat_id, key.user_id)

    async def set_state(self, key: StorageKey, state: State | str | None = None) -> None:
        """Set state for the key."""
        bot_id, chat_id, user_id = self._make_key(key)
        state_str = state.state if isinstance(state, State) else state

        conn = self._get_connection()
        try:
            conn.execute("""
                INSERT INTO fsm_states (bot_id, chat_id, user_id, state, data, updated_at)
                VALUES (?, ?, ?, ?, '{}', CURRENT_TIMESTAMP)
                ON CONFLICT(bot_id, chat_id, user_id)
                DO UPDATE SET state = ?, updated_at = CURRENT_TIMESTAMP
            """, (bot_id, chat_id, user_id, state_str, state_str))
            conn.commit()
        finally:
            conn.close()

    async def get_state(self, key: StorageKey) -> str | None:
        """Get state for the key."""
        bot_id, chat_id, user_id = self._make_key(key)

        conn = self._get_connection()
        try:
            cursor = conn.execute("""
                SELECT state FROM fsm_states
                WHERE bot_id = ? AND chat_id = ? AND user_id = ?
            """, (bot_id, chat_id, user_id))
            row = cursor.fetchone()
            return row["state"] if row else None
        finally:
            conn.close()

    async def set_data(self, key: StorageKey, data: dict[str, Any]) -> None:
        """Set data for the key."""
        bot_id, chat_id, user_id = self._make_key(key)
        data_json = json.dumps(data, ensure_ascii=False, default=str)

        conn = self._get_connection()
        try:
            conn.execute("""
                INSERT INTO fsm_states (bot_id, chat_id, user_id, state, data, updated_at)
                VALUES (?, ?, ?, NULL, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(bot_id, chat_id, user_id)
                DO UPDATE SET data = ?, updated_at = CURRENT_TIMESTAMP
            """, (bot_id, chat_id, user_id, data_json, data_json))
            conn.commit()
        finally:
            conn.close()

    async def get_data(self, key: StorageKey) -> dict[str, Any]:
        """Get data for the key."""
        bot_id, chat_id, user_id = self._make_key(key)

        conn = self._get_connection()
        try:
            cursor = conn.execute("""
                SELECT data FROM fsm_states
                WHERE bot_id = ? AND chat_id = ? AND user_id = ?
            """, (bot_id, chat_id, user_id))
            row = cursor.fetchone()
            if row and row["data"]:
                return json.loads(row["data"])
            return {}
        finally:
            conn.close()

    async def update_data(self, key: StorageKey, data: dict[str, Any]) -> dict[str, Any]:
        """Update data for the key (merge with existing)."""
        current_data = await self.get_data(key)
        current_data.update(data)
        await self.set_data(key, current_data)
        return current_data

    async def close(self) -> None:
        """Close storage (no-op for SQLite as we use connection per operation)."""
        pass


def get_pending_registrations(db_path: str = "data/bot.db") -> list[dict]:
    """
    Получает список пользователей с незавершённой регистрацией.
    Это те, кто нажал "Иду" но не ввёл все данные.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        cursor = conn.execute("""
            SELECT
                fs.user_id as tg_user_id,
                fs.state,
                fs.data,
                fs.created_at,
                fs.updated_at,
                u.username,
                u.first_name,
                u.last_name
            FROM fsm_states fs
            LEFT JOIN users u ON fs.user_id = u.tg_user_id
            WHERE fs.state LIKE '%Registration%'
            ORDER BY fs.updated_at DESC
        """)
        rows = cursor.fetchall()
        result = []
        for row in rows:
            data = json.loads(row["data"]) if row["data"] else {}
            result.append({
                "tg_user_id": row["tg_user_id"],
                "username": row["username"],
                "first_name": row["first_name"],
                "last_name": row["last_name"],
                "state": row["state"],
                "data": data,
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
            })
        return result
    finally:
        conn.close()
