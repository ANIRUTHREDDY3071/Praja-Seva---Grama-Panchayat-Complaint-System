import getpass

from dotenv import load_dotenv
from pwdlib import PasswordHash
from sqlalchemy import create_engine, text
import os

load_dotenv()

engine = create_engine(os.environ["DATABASE_URL"])
hasher = PasswordHash.recommended()

username = input("New administrator username: ").strip()
password = getpass.getpass("New administrator password: ")
confirmation = getpass.getpass("Confirm password: ")

if not username:
    raise SystemExit("Username cannot be empty.")

if len(password) < 12:
    raise SystemExit("Use a password with at least 12 characters.")

if password != confirmation:
    raise SystemExit("Passwords do not match.")

password_hash = hasher.hash(password)

try:
    with engine.begin() as connection:
        connection.execute(
            text("""
                INSERT INTO admin_users (
                    full_name,
                    username,
                    password_hash,
                    role,
                    is_active
                )
                VALUES (
                    :full_name,
                    :username,
                    :password_hash,
                    'admin',
                    TRUE
                )
            """),
            {
                "full_name": username,
                "username": username,
                "password_hash": password_hash,
            },
        )

    print("Administrator account created successfully.")

except Exception:
    print(
        "Unable to create administrator. "
        "Check whether the username already exists and verify the database."
    )
    raise
finally:
    engine.dispose()