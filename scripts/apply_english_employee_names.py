#!/usr/bin/env python3
"""Apply the curated English employee names and native-sounding role titles."""

from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


EMPLOYEE_NAMES = {
    "人事": ("People Operations", "People Operations Partner"),
    "法务": ("Legal & Compliance", "Legal & Compliance Counsel"),
    "行政": ("Workplace Operations", "Workplace Operations Coordinator"),
    "财务": ("Finance Operations", "Finance Operations Specialist"),
    "IT": ("IT Support", "IT Support Engineer"),
    "Solo Unicorn 总管": ("Solo Unicorn Chief of Staff", "AI Chief of Staff"),
    "社群接待": ("Member Experience", "Member Experience Lead"),
    "成员匹配": ("Member Connections", "Member Intelligence & Connections Lead"),
    "活动制作": ("Community Programs", "Community Programs Producer"),
    "内容知识": ("Editorial & Knowledge", "Editorial & Knowledge Lead"),
    "项目工厂": ("Project Factory", "Project Factory Program Lead"),
    "实验研究": ("Experiment Zero", "Research & Measurement Lead"),
    "合作与日本": ("Global Partnerships", "Global Partnerships & Japan Lead"),
    "信任治理": ("Trust & Governance", "Trust, Safety & Data Governance Lead"),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=Path("backend/skill_agent_loop.db"))
    parser.add_argument("--backup", type=Path, help="Create a consistent SQLite backup before updating")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    database = args.database.resolve()
    connection = sqlite3.connect(database)
    try:
        candidates = tuple(EMPLOYEE_NAMES) + tuple(value[0] for value in EMPLOYEE_NAMES.values())
        rows = connection.execute(
            f"SELECT id, name, metadata_json FROM agent_profiles WHERE name IN ({','.join('?' for _ in candidates)})",
            candidates,
        ).fetchall()
        rows_by_name = {row[1]: row for row in rows}

        resolved = []
        missing = []
        for old_name, (new_name, role_name) in EMPLOYEE_NAMES.items():
            row = rows_by_name.get(old_name) or rows_by_name.get(new_name)
            if row is None:
                missing.append(old_name)
            else:
                resolved.append((row, new_name, role_name))
        if missing:
            raise RuntimeError("Missing employees: " + ", ".join(missing))

        if args.dry_run:
            print(f"Validated {len(resolved)} employee rename targets")
            return

        if args.backup:
            backup_path = args.backup.resolve()
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            with sqlite3.connect(backup_path) as backup_connection:
                connection.backup(backup_connection)
            print(f"Backup created: {backup_path}")

        updated_at = datetime.now(timezone.utc).replace(tzinfo=None).isoformat(sep=" ")
        with connection:
            for (agent_id, _current_name, metadata_json), new_name, role_name in resolved:
                metadata = json.loads(metadata_json or "{}")
                metadata["role_name"] = role_name
                connection.execute(
                    "UPDATE agent_profiles SET name = ?, metadata_json = ?, updated_at = ? WHERE id = ?",
                    (
                        new_name,
                        json.dumps(metadata, ensure_ascii=False, separators=(",", ":")),
                        updated_at,
                        agent_id,
                    ),
                )

        expected = {new_name: role for new_name, role in EMPLOYEE_NAMES.values()}
        placeholders = ",".join("?" for _ in expected)
        verified_rows = connection.execute(
            f"SELECT name, metadata_json FROM agent_profiles WHERE name IN ({placeholders})",
            tuple(expected),
        ).fetchall()
        verified = {
            name
            for name, metadata_json in verified_rows
            if json.loads(metadata_json or "{}").get("role_name") == expected[name]
        }
        if verified != set(expected):
            raise RuntimeError(f"Rename verification failed: expected {len(expected)}, found {len(verified)}")
        print(f"Updated and verified {len(verified)} English employee names and role titles")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
