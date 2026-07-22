#!/usr/bin/env python3
"""Apply the curated Solo Unicorn avatar set to a StaffDeck SQLite database."""

from __future__ import annotations

import argparse
import base64
import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


AVATAR_FILES = {
    "Solo Unicorn Chief of Staff": "chief.png",
    "Member Experience": "onboarding.png",
    "Member Connections": "matching.png",
    "Community Programs": "events.png",
    "Editorial & Knowledge": "content.png",
    "Project Factory": "project.png",
    "Experiment Zero": "research.png",
    "Global Partnerships": "partnership-japan.png",
    "Trust & Governance": "governance.png",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=Path("backend/skill_agent_loop.db"))
    parser.add_argument(
        "--avatar-dir",
        type=Path,
        default=Path("assets/avatars/solo-unicorn"),
    )
    parser.add_argument("--backup", type=Path, help="Create a consistent SQLite backup before updating")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def avatar_data_url(path: Path) -> str:
    data = path.read_bytes()
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError(f"Expected a PNG avatar: {path}")
    if len(data) > 5 * 1024 * 1024:
        raise ValueError(f"Avatar exceeds the 5 MB product limit: {path}")
    return "data:image/png;base64," + base64.b64encode(data).decode("ascii")


def main() -> None:
    args = parse_args()
    database = args.database.resolve()
    avatar_dir = args.avatar_dir.resolve()
    missing_files = [avatar_dir / filename for filename in AVATAR_FILES.values() if not (avatar_dir / filename).is_file()]
    if missing_files:
        raise FileNotFoundError("Missing avatar files: " + ", ".join(map(str, missing_files)))

    connection = sqlite3.connect(database)
    try:
        rows = connection.execute(
            f"SELECT id, name, metadata_json FROM agent_profiles WHERE name IN ({','.join('?' for _ in AVATAR_FILES)})",
            tuple(AVATAR_FILES),
        ).fetchall()
        found_names = {row[1] for row in rows}
        missing_agents = set(AVATAR_FILES) - found_names
        if missing_agents:
            raise RuntimeError("Missing Solo Unicorn employees: " + ", ".join(sorted(missing_agents)))

        if args.dry_run:
            print(f"Validated {len(rows)} employees and {len(AVATAR_FILES)} avatar files")
            return

        if args.backup:
            backup_path = args.backup.resolve()
            backup_path.parent.mkdir(parents=True, exist_ok=True)
            with sqlite3.connect(backup_path) as backup_connection:
                connection.backup(backup_connection)
            print(f"Backup created: {backup_path}")

        updated_at = datetime.now(timezone.utc).replace(tzinfo=None).isoformat(sep=" ")
        with connection:
            for agent_id, name, metadata_json in rows:
                metadata = json.loads(metadata_json or "{}")
                metadata["avatar_kind"] = "upload"
                metadata["avatar_image"] = avatar_data_url(avatar_dir / AVATAR_FILES[name])
                connection.execute(
                    "UPDATE agent_profiles SET metadata_json = ?, updated_at = ? WHERE id = ?",
                    (json.dumps(metadata, ensure_ascii=False, separators=(",", ":")), updated_at, agent_id),
                )

        updated_count = connection.execute(
            f"SELECT COUNT(*) FROM agent_profiles WHERE name IN ({','.join('?' for _ in AVATAR_FILES)}) AND json_extract(metadata_json, '$.avatar_kind') = 'upload'",
            tuple(AVATAR_FILES),
        ).fetchone()[0]
        if updated_count != len(AVATAR_FILES):
            raise RuntimeError(f"Avatar verification failed: expected {len(AVATAR_FILES)}, found {updated_count}")
        print(f"Updated and verified {updated_count} Solo Unicorn employee avatars")
    finally:
        connection.close()


if __name__ == "__main__":
    main()
