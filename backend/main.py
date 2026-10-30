import os
from secrets import token_hex
from datetime import datetime, timedelta, timezone
from typing import Literal

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from .env")

if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
    raise RuntimeError("Set a strong JWT_SECRET_KEY in .env")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

app = FastAPI(
    title="Prajaseva API",
    description="Digital civic complaint portal for Puttapaka",
    version="1.0.0",
)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_ORIGIN:
    allowed_origins.append(FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

password_hasher = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)


# ==================================================
# REQUEST MODELS
# ==================================================

class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=256)


class CitizenRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    mobile: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=8, max_length=128)


class CitizenLogin(BaseModel):
    mobile: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=1, max_length=128)


class ComplaintCreate(BaseModel):
    category: str = Field(min_length=2, max_length=100)
    subject: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    village: str = Field(default="Puttapaka", max_length=150)
    location_details: str | None = Field(default=None, max_length=500)


class ComplaintStatusUpdate(BaseModel):
    status: Literal[
        "under_review",
        "in_progress",
        "resolved",
        "rejected",
    ]
    remarks: str = Field(min_length=3, max_length=1000)


# ==================================================
# HELPERS
# ==================================================

def normalize_mobile(value: str) -> str:
    digits = "".join(ch for ch in value if ch.isdigit())

    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    if len(digits) != 10 or digits[0] not in "6789":
        raise HTTPException(
            status_code=400,
            detail="Enter a valid 10-digit Indian mobile number.",
        )

    return digits


def create_citizen_access_token(citizen_id: int) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": str(citizen_id),
            "role": "citizen",
            "iat": now,
            "exp": now + timedelta(minutes=60),
        },
        JWT_SECRET_KEY,
        algorithm="HS256",
    )


def create_access_token(admin_id: int, role: str) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": str(admin_id),
            "role": role,
            "iat": now,
            "exp": now + timedelta(minutes=30),
        },
        JWT_SECRET_KEY,
        algorithm="HS256",
    )


# ==================================================
# AUTHENTICATED CITIZEN
# ==================================================

def get_current_citizen(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Citizen login required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=["HS256"],
        )

        if payload.get("role") != "citizen":
            raise HTTPException(
                status_code=403,
                detail="Citizen access required.",
            )

        citizen_id = int(payload["sub"])

    except HTTPException:
        raise
    except (
        jwt.InvalidTokenError,
        KeyError,
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired citizen session.",
        )

    try:
        with engine.connect() as connection:
            citizen = connection.execute(
                text("""
                    SELECT id, full_name, mobile
                    FROM citizens
                    WHERE id = :citizen_id
                      AND is_active = TRUE
                """),
                {"citizen_id": citizen_id},
            ).mappings().one_or_none()

        if citizen is None:
            raise HTTPException(
                status_code=401,
                detail="Citizen account is inactive or unavailable.",
            )

        return dict(citizen)

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to verify citizen account.",
        )


# ==================================================
# AUTHENTICATED ADMIN
# ==================================================

def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
):
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Administrator authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET_KEY,
            algorithms=["HS256"],
        )

        admin_id = int(payload["sub"])

        if payload.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail="Administrator access required.",
            )

    except HTTPException:
        raise
    except (
        jwt.InvalidTokenError,
        KeyError,
        ValueError,
        TypeError,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired admin token.",
        )

    try:
        with engine.connect() as connection:
            admin = connection.execute(
                text("""
                    SELECT id, username, role, is_active
                    FROM admin_users
                    WHERE id = :admin_id
                """),
                {"admin_id": admin_id},
            ).mappings().one_or_none()

        if (
            admin is None
            or not admin["is_active"]
            or admin["role"] != "admin"
        ):
            raise HTTPException(
                status_code=403,
                detail="Admin account is inactive or unauthorized.",
            )

        return dict(admin)

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to verify administrator account.",
        )


# ==================================================
# DATABASE SETUP AND MIGRATION
# ==================================================

def ensure_database_schema():
    """
    Create the application's database tables in foreign-key dependency order.
    Safe to run repeatedly: existing tables are not recreated.
    """
    with engine.begin() as connection:
        # 1. Administrators are referenced by complaint status history.
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id BIGSERIAL PRIMARY KEY,
                full_name VARCHAR(150) NOT NULL,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role VARCHAR(30) NOT NULL DEFAULT 'admin',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))

        # 2. Citizens are referenced by complaints.
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS citizens (
                id BIGSERIAL PRIMARY KEY,
                full_name VARCHAR(150) NOT NULL,
                mobile VARCHAR(10) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))
        connection.execute(text("""
            ALTER TABLE citizens
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE
        """))
        connection.execute(text("""
            ALTER TABLE citizens
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        """))

        # 3. Complaints are referenced by complaint_status_history.
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS complaints (
                id BIGSERIAL PRIMARY KEY,
                tracking_code VARCHAR(30) NOT NULL UNIQUE,
                citizen_id BIGINT REFERENCES citizens(id) ON DELETE SET NULL,
                category VARCHAR(100) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                village VARCHAR(150) NOT NULL DEFAULT 'Puttapaka',
                location_details VARCHAR(500),
                status VARCHAR(30) NOT NULL DEFAULT 'submitted',
                submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))

        # Migration for an existing complaints table created before citizen ownership.
        connection.execute(text("""
            ALTER TABLE complaints
            ADD COLUMN IF NOT EXISTS citizen_id BIGINT
            REFERENCES citizens(id) ON DELETE SET NULL
        """))

        # 4. History rows reference both complaints and (optionally) admins.
        connection.execute(text("""
            CREATE TABLE IF NOT EXISTS complaint_status_history (
                id BIGSERIAL PRIMARY KEY,
                complaint_id BIGINT NOT NULL
                    REFERENCES complaints(id) ON DELETE CASCADE,
                old_status VARCHAR(30),
                new_status VARCHAR(30) NOT NULL,
                changed_by_admin BIGINT
                    REFERENCES admin_users(id) ON DELETE SET NULL,
                remarks TEXT NOT NULL,
                changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """))


@app.on_event("startup")
def startup_database_setup():
    ensure_database_schema()


# ==================================================
# CITIZEN REGISTRATION
# ==================================================

@app.post("/citizen/register", status_code=201)
def citizen_register(citizen: CitizenRegister):
    full_name = " ".join(citizen.full_name.split())

    if len(full_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter your full name.",
        )

    mobile = normalize_mobile(citizen.mobile)

    try:
        password_hash = password_hasher.hash(citizen.password)

        with engine.begin() as connection:
            existing = connection.execute(
                text("""
                    SELECT id
                    FROM citizens
                    WHERE mobile = :mobile
                """),
                {"mobile": mobile},
            ).first()

            if existing:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        "An account with this mobile number already "
                        "exists. Please sign in."
                    ),
                )

            row = connection.execute(
                text("""
                    INSERT INTO citizens (
                        full_name, mobile, password_hash
                    )
                    VALUES (
                        :full_name, :mobile, :password_hash
                    )
                    RETURNING id, full_name, mobile
                """),
                {
                    "full_name": full_name,
                    "mobile": mobile,
                    "password_hash": password_hash,
                },
            ).mappings().one()

        return {
            "message": "Citizen account created successfully.",
            "access_token": create_citizen_access_token(row["id"]),
            "token_type": "bearer",
            "expires_in": 3600,
            "citizen": {
                "id": row["id"],
                "name": row["full_name"],
                "mobile": row["mobile"],
            },
        }

    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        if "unique" in str(exc).lower():
            raise HTTPException(
                status_code=409,
                detail="This mobile number is already registered.",
            )

        raise HTTPException(
            status_code=500,
            detail="Unable to create your account.",
        )


# ==================================================
# CITIZEN LOGIN AND PROFILE
# ==================================================

@app.post("/citizen/login")
def citizen_login(credentials: CitizenLogin):
    mobile = normalize_mobile(credentials.mobile)

    try:
        with engine.connect() as connection:
            citizen = connection.execute(
                text("""
                    SELECT
                        id, full_name, mobile,
                        password_hash, is_active
                    FROM citizens
                    WHERE mobile = :mobile
                """),
                {"mobile": mobile},
            ).mappings().one_or_none()

        if (
            citizen is None
            or not citizen["is_active"]
            or not password_hasher.verify(
                credentials.password,
                citizen["password_hash"],
            )
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid mobile number or password.",
            )

        return {
            "message": "Login successful.",
            "access_token": create_citizen_access_token(citizen["id"]),
            "token_type": "bearer",
            "expires_in": 3600,
            "citizen": {
                "id": citizen["id"],
                "name": citizen["full_name"],
                "mobile": citizen["mobile"],
            },
        }

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to sign in.",
        )


@app.get("/citizen/me")
def citizen_me(citizen=Depends(get_current_citizen)):
    return {
        "id": citizen["id"],
        "name": citizen["full_name"],
        "mobile": citizen["mobile"],
    }


# ==================================================
# CITIZEN COMPLAINT SUBMISSION
# ==================================================

@app.post("/complaints", status_code=201)
def create_complaint(
    complaint: ComplaintCreate,
    citizen=Depends(get_current_citizen),
):
    tracking_code = f"PS-{token_hex(6).upper()}"

    try:
        with engine.begin() as connection:
            result = connection.execute(
                text("""
                    INSERT INTO complaints (
                        tracking_code,
                        citizen_id,
                        category,
                        subject,
                        description,
                        village,
                        location_details
                    )
                    VALUES (
                        :tracking_code,
                        :citizen_id,
                        :category,
                        :subject,
                        :description,
                        :village,
                        :location_details
                    )
                    RETURNING
                        id, tracking_code, category, subject,
                        description, village, location_details,
                        status, submitted_at
                """),
                {
                    "tracking_code": tracking_code,
                    "citizen_id": citizen["id"],
                    "category": complaint.category.strip(),
                    "subject": complaint.subject.strip(),
                    "description": complaint.description.strip(),
                    "village": complaint.village.strip(),
                    "location_details": (
                        complaint.location_details.strip()
                        if complaint.location_details
                        else None
                    ),
                },
            ).mappings().one()

            connection.execute(
                text("""
                    INSERT INTO complaint_status_history (
                        complaint_id,
                        old_status,
                        new_status,
                        remarks
                    )
                    VALUES (
                        :complaint_id,
                        NULL,
                        'submitted',
                        'Complaint submitted through Prajaseva'
                    )
                """),
                {"complaint_id": result["id"]},
            )

        return dict(result)

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to save complaint.",
        )


# ==================================================
# CITIZEN: ONLY THEIR OWN COMPLAINTS
# ==================================================

@app.get("/citizen/complaints")
def list_citizen_complaints(
    citizen=Depends(get_current_citizen),
):
    try:
        with engine.connect() as connection:
            rows = connection.execute(
                text("""
                    SELECT
                        id,
                        tracking_code,
                        category,
                        subject,
                        description,
                        village,
                        location_details,
                        status,
                        submitted_at,
                        updated_at
                    FROM complaints
                    WHERE citizen_id = :citizen_id
                    ORDER BY submitted_at DESC, id DESC
                """),
                {"citizen_id": citizen["id"]},
            ).mappings().all()

        return [dict(row) for row in rows]

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve your complaints.",
        )


# ==================================================
# PUBLIC COMPLAINT TRACKING BY REFERENCE
# ==================================================

@app.get("/complaints/{tracking_code}")
def track_complaint(tracking_code: str):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        tracking_code,
                        category,
                        subject,
                        description,
                        village,
                        location_details,
                        status,
                        submitted_at,
                        updated_at
                    FROM complaints
                    WHERE tracking_code = :tracking_code
                """),
                {
                    "tracking_code": tracking_code.strip().upper()
                },
            ).mappings().one_or_none()

        if result is None:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found. Check the reference number.",
            )

        return dict(result)

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve complaint.",
        )


# ==================================================
# ADMIN LOGIN
# ==================================================

@app.post("/admin/login")
def admin_login(credentials: AdminLogin):
    try:
        with engine.connect() as connection:
            admin = connection.execute(
                text("""
                    SELECT
                        id, username, password_hash, role, is_active
                    FROM admin_users
                    WHERE username = :username
                """),
                {"username": credentials.username.strip()},
            ).mappings().one_or_none()

        print("LOGIN DEBUG - username:", repr(credentials.username.strip()))
        print("LOGIN DEBUG - admin found:", admin is not None)

        if admin is not None:
            print("LOGIN DEBUG - role:", repr(admin["role"]))
            print("LOGIN DEBUG - active:", repr(admin["is_active"]))
            print(
                "LOGIN DEBUG - password matches:",
                password_hasher.verify(
                credentials.password,
                admin["password_hash"],
               ),
        )

        if (
            admin is None
            or not password_hasher.verify(
                credentials.password,
                admin["password_hash"],
            )
            or not admin["is_active"]
            or admin["role"] != "admin"
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password.",
            )

        return {
            "access_token": create_access_token(
                admin["id"], admin["role"]
            ),
            "token_type": "bearer",
            "expires_in": 1800,
            "username": admin["username"],
        }

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to authenticate administrator.",
        )


@app.get("/admin/me")
def admin_me(admin=Depends(get_current_admin)):
    return {
        "id": admin["id"],
        "username": admin["username"],
        "role": admin["role"],
    }


# ==================================================
# GENERAL / HEALTH
# ==================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to Prajaseva API",
        "status": "running",
    }


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "api": "healthy",
            "database": "connected",
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed.",
        )


# ==================================================
# ADMIN: LIST ALL COMPLAINTS
# ==================================================

@app.get("/admin/complaints")
def list_admin_complaints(
    status_filter: str | None = Query(default=None, alias="status"),
    search: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    admin=Depends(get_current_admin),
):
    allowed_statuses = {
        "submitted",
        "under_review",
        "in_progress",
        "resolved",
        "rejected",
    }

    if status_filter and status_filter not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status filter.",
        )

    conditions = []
    params = {"limit": limit, "offset": offset}

    if status_filter:
        conditions.append("status = :status")
        params["status"] = status_filter

    if search and search.strip():
        conditions.append("""
            (
                tracking_code ILIKE :search
                OR subject ILIKE :search
                OR category ILIKE :search
            )
        """)
        params["search"] = f"%{search.strip()}%"

    where_clause = (
        "WHERE " + " AND ".join(conditions)
        if conditions
        else ""
    )

    try:
        with engine.connect() as connection:
            total = connection.execute(
                text(f"""
                    SELECT COUNT(*)
                    FROM complaints
                    {where_clause}
                """),
                params,
            ).scalar_one()

            rows = connection.execute(
                text(f"""
                    SELECT
                        id,
                        tracking_code,
                        category,
                        subject,
                        description,
                        village,
                        location_details,
                        status,
                        submitted_at,
                        updated_at
                    FROM complaints
                    {where_clause}
                    ORDER BY submitted_at DESC, id DESC
                    LIMIT :limit OFFSET :offset
                """),
                params,
            ).mappings().all()

        return {
            "items": [dict(row) for row in rows],
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve complaints.",
        )


# ==================================================
# ADMIN: UPDATE COMPLAINT STATUS
# ==================================================

@app.patch("/admin/complaints/{tracking_code}/status")
def update_complaint_status(
    tracking_code: str,
    update: ComplaintStatusUpdate,
    admin=Depends(get_current_admin),
):
    try:
        with engine.begin() as connection:
            complaint = connection.execute(
                text("""
                    SELECT id, status
                    FROM complaints
                    WHERE tracking_code = :tracking_code
                    FOR UPDATE
                """),
                {
                    "tracking_code": tracking_code.strip().upper()
                },
            ).mappings().one_or_none()

            if complaint is None:
                raise HTTPException(
                    status_code=404,
                    detail="Complaint not found.",
                )

            old_status = complaint["status"]
            new_status = update.status

            if old_status == new_status:
                raise HTTPException(
                    status_code=400,
                    detail="Complaint already has this status.",
                )

            connection.execute(
                text("""
                    UPDATE complaints
                    SET status = :status,
                        updated_at = NOW()
                    WHERE id = :complaint_id
                """),
                {
                    "status": new_status,
                    "complaint_id": complaint["id"],
                },
            )

            connection.execute(
                text("""
                    INSERT INTO complaint_status_history (
                        complaint_id,
                        old_status,
                        new_status,
                        changed_by_admin,
                        remarks
                    )
                    VALUES (
                        :complaint_id,
                        :old_status,
                        :new_status,
                        :admin_id,
                        :remarks
                    )
                """),
                {
                    "complaint_id": complaint["id"],
                    "old_status": old_status,
                    "new_status": new_status,
                    "admin_id": admin["id"],
                    "remarks": update.remarks.strip(),
                },
            )

        return {
            "message": "Complaint status updated successfully.",
            "tracking_code": tracking_code.strip().upper(),
            "old_status": old_status,
            "new_status": new_status,
            "updated_by": admin["username"],
            "remarks": update.remarks.strip(),
        }

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to update complaint status.",
        )


# ==================================================
# ADMIN: COMPLAINT STATUS HISTORY
# ==================================================

@app.get("/admin/complaints/{tracking_code}/history")
def get_admin_complaint_history(
    tracking_code: str,
    admin=Depends(get_current_admin),
):
    try:
        with engine.connect() as connection:
            complaint = connection.execute(
                text("""
                    SELECT id, tracking_code
                    FROM complaints
                    WHERE tracking_code = :tracking_code
                """),
                {
                    "tracking_code": tracking_code.strip().upper()
                },
            ).mappings().one_or_none()

            if complaint is None:
                raise HTTPException(
                    status_code=404,
                    detail="Complaint not found.",
                )

            history = connection.execute(
                text("""
                    SELECT
                        h.old_status,
                        h.new_status,
                        h.remarks,
                        h.changed_at,
                        a.username AS changed_by
                    FROM complaint_status_history h
                    LEFT JOIN admin_users a
                        ON a.id = h.changed_by_admin
                    WHERE h.complaint_id = :complaint_id
                    ORDER BY h.changed_at ASC, h.id ASC
                """),
                {"complaint_id": complaint["id"]},
            ).mappings().all()

        return {
            "tracking_code": complaint["tracking_code"],
            "history": [dict(row) for row in history],
        }

    except HTTPException:
        raise
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve complaint history.",
        )