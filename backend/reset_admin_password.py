
import getpass
import os

from dotenv import load_dotenv
from pwdlib import PasswordHash
from sqlalchemy import create_engine, text

load_dotenv()

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise SystemExit("DATABASE_URL is missing from .env")

username = input("Existing admin username [Prajaseva]: ").strip()
if not username:
    username = "Prajaseva"

password = getpass.getpass("Enter new admin password (minimum 12 characters): ")
confirmation = getpass.getpass("Confirm new password: ")

if len(password) < 12:
    raise SystemExit("Password must contain at least 12 characters.")

if password != confirmation:
    raise SystemExit("Passwords do not match.")

engine = create_engine(database_url, pool_pre_ping=True)
hasher = PasswordHash.recommended()

try:
    with engine.begin() as connection:
        admin = connection.execute(
            text("""
                SELECT id
                FROM admin_users
                WHERE username = :username
                FOR UPDATE
            """),
            {"username": username},
        ).mappings().one_or_none()

        if admin is None:
            raise SystemExit(
                f"Admin '{username}' was not found. No changes made."
            )

        connection.execute(
            text("""
                UPDATE admin_users
                SET password_hash = :password_hash,
                    is_active = TRUE,
                    role = 'admin'
                WHERE id = :admin_id
            """),
            {
                "password_hash": hasher.hash(password),
                "admin_id": admin["id"],
            },
        )

    print(f"Password reset successfully for admin '{username}'.")

finally:
    engine.dispose()
