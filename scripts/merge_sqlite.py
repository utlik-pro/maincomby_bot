#!/usr/bin/env python3
"""
Инструмент для объединения двух SQLite-баз данных бота.

Основная идея:
1. Копируем файл БД с VPS (как только он снова доступен)
2. Запускаем merge_sqlite.py, указывая локальную БД как источник новых данных,
   а VPS-файл как целевой (в него добавятся недостающие строки)
3. Проверяем отчёт и переносим обновлённую БД обратно на VPS
"""

from __future__ import annotations

import argparse
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


TABLE_ORDER: list[str] = [
    "users",
    "user_profiles",
    "roles",
    "user_roles",
    "events",
    "event_registrations",
    "source_channels",
    "pending_posts",
    "posts",
    "questions",
    "matches",
    "swipes",
    "security_logs",
]


@dataclass
class TableReport:
    name: str
    pending: int
    inserted: int


def get_columns(conn: sqlite3.Connection, table: str) -> list[str]:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    if not rows:
        raise RuntimeError(f"Таблица {table} отсутствует в базе.")
    return [row[1] for row in rows]


def copy_missing_rows(conn: sqlite3.Connection, table: str, dry_run: bool) -> TableReport:
    columns = get_columns(conn, table)
    column_list = ", ".join(columns)
    template = f"""
        SELECT COUNT(*) FROM source.{table} s
        WHERE NOT EXISTS (
            SELECT 1 FROM target.{table} t
            WHERE t.id = s.id
        )
    """
    pending = conn.execute(template).fetchone()[0]

    inserted = 0
    if not dry_run and pending:
        insert_sql = f"""
            INSERT INTO target.{table} ({column_list})
            SELECT {column_list}
            FROM source.{table} s
            WHERE NOT EXISTS (
                SELECT 1 FROM target.{table} t
                WHERE t.id = s.id
            )
        """
        conn.execute(insert_sql)
        inserted = pending

    return TableReport(name=table, pending=pending, inserted=inserted)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Слияние локальной SQLite-БД с основной (VPS)."
    )
    parser.add_argument(
        "--source",
        required=True,
        help="Путь к источнику (например, локальная bot.db с новыми данными).",
    )
    parser.add_argument(
        "--target",
        required=True,
        help="Путь к целевой БД (с VPS), в которую добавим недостающие строки.",
    )
    parser.add_argument(
        "--tables",
        nargs="*",
        default=None,
        help="Необязательно: список таблиц для обработки. По умолчанию используется TABLE_ORDER.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Только показать отчёт, без изменений в целевой БД.",
    )
    return parser.parse_args()


def ensure_files(source: str, target: str) -> tuple[Path, Path]:
    src_path = Path(source).expanduser().resolve()
    dst_path = Path(target).expanduser().resolve()
    if not src_path.exists():
        raise FileNotFoundError(f"Источник {src_path} не найден.")
    if not dst_path.exists():
        raise FileNotFoundError(f"Цель {dst_path} не найдена.")
    return src_path, dst_path


def merge_databases(source: Path, target: Path, tables: Iterable[str], dry_run: bool) -> list[TableReport]:
    conn = sqlite3.connect(":memory:")
    conn.execute(f"ATTACH DATABASE '{source}' AS source")
    conn.execute(f"ATTACH DATABASE '{target}' AS target")

    reports: list[TableReport] = []
    with conn:
        for table in tables:
            reports.append(copy_missing_rows(conn, table, dry_run=dry_run))
    conn.close()
    return reports


def print_summary(reports: list[TableReport], dry_run: bool) -> None:
    print("┌─────────────┬────────────┬─────────────┐")
    print("│ Таблица     │ Новых строк│ Импортировано│")
    print("├─────────────┼────────────┼─────────────┤")
    for rep in reports:
        print(f"│ {rep.name:<11} │ {rep.pending:>10} │ {rep.inserted:>11} │")
    print("└─────────────┴────────────┴─────────────┘")
    action = "Никакие изменения не внесены (dry-run)." if dry_run else "Слияние завершено."
    total = sum(r.inserted for r in reports)
    print(f"\n{action} Добавлено строк: {total}.")


def main() -> None:
    args = parse_args()
    source, target = ensure_files(args.source, args.target)
    tables = args.tables if args.tables else TABLE_ORDER
    reports = merge_databases(source, target, tables, args.dry_run)
    print_summary(reports, args.dry_run)
    if not args.dry_run:
        print(f"📝 Обновлённая БД: {target}")


if __name__ == "__main__":
    main()

