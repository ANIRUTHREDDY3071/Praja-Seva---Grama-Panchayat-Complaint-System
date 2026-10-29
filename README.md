# Prajaseva — Citizen Complaint Portal

Prajaseva is a web-based civic complaint management platform designed to help citizens submit complaints about local issues, track complaint progress, and access updates online. It also provides an administrative portal for managing complaints and updating their status.

The platform is being developed for community-level civic services, with an initial focus on Puttapaka village, Telangana, India.

## Features

### Citizen Portal
- Citizen registration and login.
- Secure authentication using JSON Web Tokens (JWT).
- Citizen profile access.
- Submit civic complaints online.
- Track complaint status using a tracking code.
- View complaints associated with the logged-in citizen.
- View complaint progress and status history.
- Logout and session management.

### Admin Portal
- Administrator login and authentication.
- View and manage submitted complaints.
- Search, filter, and paginate complaint records.
- Update complaint statuses.
- View complaint status history.
- Access complaints submitted by different citizens.

### Security
- Role-based authentication and authorization.
- Password hashing.
- Protected citizen and administrator endpoints.
- Complaint ownership enforced by the backend.
- Environment variables for sensitive configuration.
- PostgreSQL relational database.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend build tool | Vite |
| Styling | CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Authentication | JWT |
| Password hashing | pwdlib |
| API communication | REST API |
| Frontend deployment | Vercel (planned) |
| Backend deployment | Render (planned) |

## Project Structure

```text
prajaseva/
├── backend/
│   ├── .env                 # Local secrets; do not commit
│   ├── .venv/               # Python virtual environment
│   ├── create_admin.py      # Administrator setup
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── public/
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Prerequisites

Install the following before running the application locally:

- Node.js and npm.
- Python 3.10 or a compatible version supported by the backend dependencies.
- PostgreSQL.
- Git.

## Local Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/prajaseva.git
cd prajaseva
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Configure the database

Create a PostgreSQL database named:

```sql
CREATE DATABASE prajaseva;
```

Configure the backend environment variables in `backend/.env` using your own database credentials and a strong JWT secret.

Example structure:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_long_random_secret
```

Do not commit the actual `.env` file or publish its contents.

The database connection format must match the PostgreSQL driver configured in the backend.

### 3. Set up the backend

Open a terminal in the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
python -m pip install -r requirements.txt
```

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

- API base URL: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep the backend terminal running.

### 4. Set up the frontend

Open another terminal in the project root:

```bash
npm install
```

Configure the frontend to use the local backend URL. If the application uses an environment variable named `VITE_API_URL`, create a root-level `.env.local` file:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Make sure the frontend reads this variable. If your current code uses a different API configuration, retain or update it consistently.

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

## API Overview

The following routes describe the main application capabilities. Confirm the exact paths and HTTP methods against the running FastAPI application at `/docs`.

| Functionality | Description |
|---|---|
| Citizen registration | Create a citizen account |
| Citizen login | Authenticate a citizen |
| Citizen profile | Retrieve the authenticated citizen's profile |
| Submit complaint | Create a complaint linked to the citizen |
| My complaints | Retrieve complaints belonging to the authenticated citizen |
| Track complaint | Look up complaint progress using a tracking code |
| Admin login | Authenticate an administrator |
| Admin complaint management | View and manage complaint records |
| Update complaint status | Change complaint status |
| Complaint status history | Retrieve complaint progress history |

## Running the Application

For local development, run the backend and frontend in separate terminals.

1. Start PostgreSQL.
2. Start the FastAPI backend.
3. Start the React frontend.
4. Open the Vite development URL.
5. Register or log in as a citizen to submit and track complaints.
6. Log in through the administrator interface to manage complaints.

Administrator account creation should be restricted to authorized personnel. Follow the project's existing administrator setup process.

## Deployment

The planned deployment architecture is:

- **Frontend:** Vercel.
- **Backend:** Render.
- **Database:** Managed PostgreSQL hosting.

Before deployment:

1. Provision the cloud PostgreSQL database.
2. Configure the backend's production environment variables.
3. Deploy the FastAPI application.
4. Configure the frontend API URL to point to the deployed backend.
5. Configure FastAPI CORS to allow the deployed frontend origin.
6. Deploy the frontend.
7. Test citizen registration, login, complaint submission, complaint ownership, tracking, and administrator operations.
8. Verify HTTPS, database persistence, and access controls.

The production database must not depend on PostgreSQL running on a personal computer.

## Security Considerations

- Never commit `.env`, database passwords, JWT secrets, or other credentials.
- Use strong secrets and rotate any credentials accidentally exposed.
- Use HTTPS for production traffic.
- Enforce authorization on the backend for every protected endpoint.
- Ensure citizens can access only their own complaints through authenticated endpoints.
- Protect administrator credentials and restrict administrator account creation.
- Review the information exposed by public complaint-tracking endpoints.
- Back up the production database regularly.

## Future Enhancements

Potential improvements include:

- Telugu and English language support.
- SMS or email complaint notifications.
- Complaint categories and priority levels.
- Image attachments for civic issues.
- Administrative analytics and reports.
- Mobile-friendly interface improvements.
- Complaint resolution feedback.
- Deployment monitoring and automated database backups.

## Contributing

Contributions and suggestions are welcome. For significant changes, create a branch and submit a pull request.

## License

A license has not yet been specified for this project. Add an appropriate license before permitting reuse or redistribution.

---

**Prajaseva — Making civic complaints easier to submit, track, and manage.**