
import getpass
import os

from dotenv import load_dotenv
from pwdlib import PasswordHash
from sqlalchemy import create_engine, text

load_dotenv()

engine = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
hasher = PasswordHash.recommended()

username = input("Admin username [Prajaseva]: ").strip() or "Prajaseva"
password = getpass.getpass("Enter the new password you set: ")

try:
    with engine.connect() as connection:
        admin = connection.execute(
            text("""
                SELECT id, username, role, is_active, password_hash
                FROM admin_users
                WHERE username = :username
            """),
            {"username": username},
        ).mappings().one_or_none()

    if admin is None:
        print("RESULT: Admin account not found in this database.")
    else:
        print("Admin account found: YES")
        print("Role is admin:", admin["role"] == "admin")
        print("Account is active:", admin["is_active"])
        print(
            "Password matches stored hash:",
            hasher.verify(password, admin["password_hash"]),
        )
finally:
    engine.dispose()
