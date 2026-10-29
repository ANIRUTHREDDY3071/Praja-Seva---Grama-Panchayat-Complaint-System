
import { useEffect, useState } from "react";

import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, House, FilePlus2, ClipboardList,
  Search, Languages, Menu, X, LogOut, ArrowRight, MapPin,
  Clock3, CheckCircle2, CircleAlert, ChevronRight, Droplets,
  Lightbulb, Construction, Trash2, Waves, Building2, UserRound,
  LockKeyhole, Phone, Eye, FileText, Activity,
} from "lucide-react";
import "./index.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const categories = [
  { name: "Roads & potholes", icon: Construction },
  { name: "Streetlights", icon: Lightbulb },
  { name: "Water supply", icon: Droplets },
  { name: "Drainage", icon: Waves },
  { name: "Waste & sanitation", icon: Trash2 },
  { name: "Public facilities", icon: Building2 },
  { name: "Other", icon: FileText },
];

const copy = {
  en: {
    overview: "Overview",
    dashboard: "My dashboard",
    submit: "New complaint",
    track: "Track complaint",
    complaints: "My complaints",
    citizen: "Citizen services",
    admin: "Administration",
    signIn: "Sign in",
    register: "Create account",
    welcome: "Welcome to Prajaseva",
    tagline: "Your village. Your voice. Your public services.",
    intro: "Report local civic issues, follow complaint progress, and stay informed from one simple place.",
    getStarted: "Get started",
    explore: "Explore services",
    services: "Public services",
    servicesIntro: "What would you like to do today?",
    quickActions: "Quick actions",
    recent: "Recent complaints",
    viewAll: "View all",
    total: "Total complaints",
    pending: "Awaiting action",
    progress: "In progress",
    resolved: "Resolved",
    location: "Puttapaka village, Telangana",
    logout: "Sign out",
    login: "Citizen login",
    adminLogin: "Admin login",
    status: "Status",
    category: "Category",
    reference: "Reference number",
    noRecords: "No complaints to display yet.",
    createFirst: "Submit your first complaint to get started.",
    language: "తెలుగు",
  },
  te: {
    overview: "ముఖ్య పేజీ",
    dashboard: "నా డ్యాష్‌బోర్డ్",
    submit: "కొత్త ఫిర్యాదు",
    track: "ఫిర్యాదు స్థితి",
    complaints: "నా ఫిర్యాదులు",
    citizen: "పౌర సేవలు",
    admin: "పరిపాలన",
    signIn: "లాగిన్",
    register: "ఖాతా సృష్టించండి",
    welcome: "ప్రజాసేవకు స్వాగతం",
    tagline: "మీ గ్రామం. మీ గొంతు. మీ పౌర సేవలు.",
    intro: "స్థానిక సమస్యలను తెలియజేయండి, ఫిర్యాదుల పురోగతిని తెలుసుకోండి.",
    getStarted: "ప్రారంభించండి",
    explore: "సేవలను చూడండి",
    services: "పౌర సేవలు",
    servicesIntro: "ఈ రోజు మీరు ఏమి చేయాలనుకుంటున్నారు?",
    quickActions: "త్వరిత సేవలు",
    recent: "ఇటీవలి ఫిర్యాదులు",
    viewAll: "అన్నీ చూడండి",
    total: "మొత్తం ఫిర్యాదులు",
    pending: "చర్య కోసం వేచి ఉన్నాయి",
    progress: "పురోగతిలో ఉన్నాయి",
    resolved: "పరిష్కరించబడ్డాయి",
    location: "పుట్టపాక గ్రామం, తెలంగాణ",
    logout: "లాగ్ అవుట్",
    login: "పౌరుల లాగిన్",
    adminLogin: "అడ్మిన్ లాగిన్",
    status: "స్థితి",
    category: "వర్గం",
    reference: "రిఫరెన్స్ నంబర్",
    noRecords: "ప్రదర్శించడానికి ఫిర్యాదులు లేవు.",
    createFirst: "మీ మొదటి ఫిర్యాదును నమోదు చేయండి.",
    language: "English",
  },
};

function StatusBadge({ status }) {
  const cls = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

function AppLayout({ children, language, setLanguage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = copy[language];
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith("/admin");
  
  const navGroups = [
    {
      label: t.citizen,
      items: [
        { to: "/", label: t.overview, icon: House },
        { to: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
        { to: "/complaints/new", label: t.submit, icon: FilePlus2 },
        { to: "/complaints/track", label: t.track, icon: Search },
        { to: "/complaints", label: t.complaints, icon: ClipboardList },
      ],
    },
  ];


  if (isAdmin) {
    navGroups[0].items = [
      { to: "/admin/dashboard", label: "Admin dashboard", icon: LayoutDashboard },
      { to: "/admin/complaints", label: "Manage complaints", icon: ClipboardList },
    ];
  }

  return (
    <div className="app-layout">
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <NavLink to="/" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-mark"><ShieldCheck size={25} /></span>
          <span>
            <strong>ప్రజాసేవ</strong>
            <small>PRAJASEVA PORTAL</small>
          </span>
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close menu"
            onClick={(event) => {
              event.preventDefault();
              setMobileOpen(false);
            }}
          >
            <X size={19} />
          </button>
        </NavLink>

        <div className="sidebar-location">
          <MapPin size={16} />
          <span>
            <strong>Puttapaka</strong>
            <small>Telangana, India</small>
          </span>
        </div>

        {navGroups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group-label">{group.label}</p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
                <ChevronRight className="side-chevron" size={15} />
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sidebar-spacer" />

        <div className="sidebar-help">
          <span className="help-icon"><CircleAlert size={19} /></span>
          <strong>Need help?</strong>
          <p>Use the complaint tracking page to look up a reference number.</p>
          <NavLink to="/complaints/track" onClick={() => setMobileOpen(false)}>
            Track a complaint <ArrowRight size={14} />
          </NavLink>
        </div>

        
        <div className="sidebar-bottom">
          <button
            className="language-button"
            onClick={() => setLanguage(language === "en" ? "te" : "en")}
          >
            <Languages size={18} />
            <span>{t.language}</span>
          </button>
        </div>
     </aside>

      <div className="main-column">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="breadcrumb">
            <span>Prajaseva</span>
            <ChevronRight size={15} />
            <strong>{getPageTitle(location.pathname, t)}</strong>
          </div>
          <div className="topbar-right">
            <span className="portal-status"><span /> Village services</span>
            
          
          <button
            className="profile-button"
            onClick={() => navigate("/profile")}
            aria-label="Open my profile">
            <span className="profile-avatar">
              <UserRound size={18} />
            </span>
            <span className="profile-label">My Profile</span>
          </button>


          </div>
        </header>

        <main className="page-content">{children}</main>

        <footer className="page-footer">
          <span>© {new Date().getFullYear()} Prajaseva</span>
          <span>Digital civic services for Puttapaka</span>
        </footer>
      </div>
    </div>
  );
}

function getPageTitle(path, t) {
  if (path === "/") return t.overview;
  if (path === "/dashboard") return t.dashboard;
  if (path === "/complaints/new") return t.submit;
  if (path === "/complaints/track") return t.track;
  if (path === "/complaints") return t.complaints;
  if (path === "/login") return t.login;
  if (path === "/register") return t.register;
  if (path === "/admin/login") return t.adminLogin;
  if (path.startsWith("/admin")) return "Admin dashboard";
  return "Prajaseva";
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow-text">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
    </div>
  );
}

function HomePage({ t }) {
  const navigate = useNavigate();

  return (
    <>
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="welcome-label"><MapPin size={14} /> PUTTAPAKA VILLAGE</span>
          <h1>{t.welcome}</h1>
          <h2>{t.tagline}</h2>
          <p>{t.intro}</p>
          <div className="welcome-actions">
            <button className="btn btn-light" onClick={() => navigate("/complaints/new")}>
              <FilePlus2 size={18} /> {t.submit} <ArrowRight size={16} />
            </button>
            <button className="btn btn-outline-light" onClick={() => navigate("/complaints/track")}>
              {t.track}
            </button>
          </div>
        </div>
        <div className="welcome-illustration" aria-hidden="true">
          <div className="illustration-sun" />
          <div className="illustration-hill hill-one" />
          <div className="illustration-hill hill-two" />
          <div className="illustration-house house-a">
            <div className="illustration-roof" />
            <div className="illustration-house-body"><i /><b /></div>
          </div>
          <div className="illustration-house house-b">
            <div className="illustration-roof" />
            <div className="illustration-house-body"><i /><b /></div>
          </div>
          <div className="illustration-tree"><i /><b /></div>
          <div className="illustration-path" />
          <div className="illustration-caption">A better village, together</div>
        </div>
      </section>

      <div className="section-title-row">
        <div>
          <p className="eyebrow-text">SERVICES AT A GLANCE</p>
          <h2>{t.services}</h2>
          <p className="muted-text">{t.servicesIntro}</p>
        </div>
      </div>

      <div className="service-grid">
        {[
          { title: t.submit, desc: "Tell us about a local civic issue that needs attention.", icon: FilePlus2, color: "green", to: "/complaints/new", cta: "Start a complaint" },
          { title: t.track, desc: "Find the latest status using your complaint reference.", icon: Search, color: "blue", to: "/complaints/track", cta: "Track progress" },
          { title: t.complaints, desc: "Review complaint records associated with your account.", icon: ClipboardList, color: "amber", to: "/complaints", cta: "View complaints" },
        ].map(({ title, desc, icon: Icon, color, to, cta }) => (
          <button className="service-card" key={to} onClick={() => navigate(to)}>
            <span className={`service-icon ${color}`}><Icon size={23} /></span>
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="service-card-link">{cta} <ArrowRight size={16} /></span>
          </button>
        ))}
      </div>

      <section className="info-banner">
        <span className="info-banner-icon"><ShieldCheck size={24} /></span>
        <div>
          <h3>Clear information. Simpler services.</h3>
          <p>This portal is being developed for Puttapaka. Complaint submission and tracking will be connected to the secure backend in a later phase.</p>
        </div>
      </section>
    </>
  );
}


function DashboardPage({ t }) {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("prajaseva_citizen_token");
        if (!token) {
          if (!cancelled) {
            setComplaints([]);
            setError("Please sign in to view your complaints.");
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/citizen/complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to load your complaints."
          );
        }

        if (!cancelled) {
          setComplaints(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your complaint analytics. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const total = complaints.length;

  const pending = complaints.filter((complaint) =>
    ["submitted", "under_review"].includes(
      String(complaint.status).toLowerCase()
    )
  ).length;

  const inProgress = complaints.filter(
    (complaint) =>
      String(complaint.status).toLowerCase() === "in_progress"
  ).length;

  const resolved = complaints.filter(
    (complaint) =>
      String(complaint.status).toLowerCase() === "resolved"
  ).length;

  const stats = [
    { title: t.total, value: total, icon: ClipboardList, color: "green" },
    { title: t.pending, value: pending, icon: Clock3, color: "amber" },
    { title: t.progress, value: inProgress, icon: Activity, color: "blue" },
    { title: t.resolved, value: resolved, icon: CheckCircle2, color: "purple" },
  ];

  const recentComplaints = [...complaints]
    .sort(
      (a, b) =>
        new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0)
    )
    .slice(0, 5)
    .map((complaint) => ({
      id: complaint.tracking_code,
      category: complaint.subject || complaint.category,
      location:
        complaint.location_details || complaint.village || "Puttapaka",
      date: complaint.submitted_at
        ? new Date(complaint.submitted_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
      status: String(complaint.status || "submitted")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    }));

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN WORKSPACE"
        title={t.dashboard}
        description="A quick overview of your complaint activity."
        action={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/complaints/new")}
          >
            <FilePlus2 size={17} />
            {t.submit}
          </button>
        }
      />

      {error && (
        <div className="inline-error" role="alert">
          <CircleAlert size={17} />
          {error}
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div className="stat-card" key={title}>
            <span className={`stat-icon ${color}`}>
              <Icon size={20} />
            </span>
            <span className="stat-label">{title}</span>
            <strong>{loading ? "—" : String(value).padStart(2, "0")}</strong>
            <small>
              {loading
                ? "Loading..."
                : `${value} ${value === 1 ? "complaint" : "complaints"}`}
            </small>
          </div>
        ))}
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>{t.recent}</h2>
            <p>Your submitted complaints and their latest status.</p>
          </div>

          <button
            className="btn btn-quiet"
            onClick={() => navigate("/complaints")}
          >
            {t.viewAll} <ArrowRight size={15} />
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <p>Loading your complaints...</p>
          </div>
        ) : (
          <ComplaintTable complaints={recentComplaints} />
        )}
      </section>

      <div className="section-title-row compact">
        <div>
          <h2>{t.quickActions}</h2>
          <p className="muted-text">Go directly to a service.</p>
        </div>
      </div>

      <div className="quick-action-grid">
        <button onClick={() => navigate("/complaints/new")}>
          <FilePlus2 />
          <span>
            <strong>Submit a complaint</strong>
            <small>Report a local issue</small>
          </span>
          <ChevronRight />
        </button>

        <button onClick={() => navigate("/complaints/track")}>
          <Search />
          <span>
            <strong>Track progress</strong>
            <small>Check a reference number</small>
          </span>
          <ChevronRight />
        </button>
      </div>
    </>
  );
}


function ComplaintTable({ complaints }) {
  if (!complaints.length) {
    return <div className="empty-state"><ClipboardList size={30} /><strong>No complaints found</strong><p>There are no records to display.</p></div>;
  }

  return (
    <div className="table-scroll">
      <table className="complaint-table">
        <thead><tr><th>Reference</th><th>Complaint</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td><strong className="reference-text">{complaint.id}</strong></td>
              <td><strong>{complaint.category}</strong><small className="table-subtitle">{complaint.location}</small></td>
              <td>{complaint.date}</td>
              <td><StatusBadge status={complaint.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function NewComplaintPage() {
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    category: "",
    location: "",
    description: "",
  });

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function submit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/complaints",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("prajaseva_citizen_token") || ""}`,
          },
          body: JSON.stringify({
            category: form.category.trim(),
            subject: form.category.trim(),
            description: form.description.trim(),
            village: "Puttapaka",
            location_details: form.location.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Unable to submit your complaint. Please check the details and try again."
        );
      }

      setTrackingCode(data.tracking_code);

      const savedCodes = JSON.parse(
        localStorage.getItem("prajaseva_my_complaint_codes") || "[]"
      );

      if (Array.isArray(savedCodes)) {
        const updatedCodes = [
          data.tracking_code,
          ...savedCodes.filter((code) => code !== data.tracking_code),
        ];

        localStorage.setItem(
          "prajaseva_my_complaint_codes",
          JSON.stringify(updatedCodes)
        );
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to Prajaseva. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="form-card success-state">
        <span className="success-icon">
          <CheckCircle2 size={34} />
        </span>

        <h1>Complaint submitted successfully!</h1>

        <p>
          Your complaint has been saved. Keep the tracking code below
          to check its status later.
        </p>

        <div className="tracking-code-display">
          <strong>Complaint reference number</strong>
          <h2>{trackingCode}</h2>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              navigator.clipboard
                .writeText(trackingCode)
                .catch(() => {
                  setError("Unable to copy the tracking code. Please copy it manually.");
                });
            }}
          >
            Copy tracking code
          </button>
        </div>

        {error && (
          <p role="alert" className="inline-error">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate("/complaints/track")}
          >
            Track complaint <ArrowRight size={17} />
          </button>

          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setSubmitted(false);
              setTrackingCode("");
              setError("");
              setForm({
                category: "",
                location: "",
                description: "",
              });
            }}
          >
            Submit another complaint
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN SERVICES"
        title="Submit a complaint"
        description="Describe the issue clearly so it can be reviewed."
      />

      <div className="form-layout">
        <form className="form-card" onSubmit={submit}>
          <div className="form-section-title">
            <span>01</span>
            <div>
              <h2>Issue details</h2>
              <p>Tell us what needs attention.</p>
            </div>
          </div>

          <label htmlFor="category">
            Complaint category <span>*</span>
          </label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={update}
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <label htmlFor="location">
            Location of the issue <span>*</span>
          </label>

          <input
            id="location"
            name="location"
            value={form.location}
            onChange={update}
            placeholder="Street, landmark, or locality in Puttapaka"
            maxLength={500}
            required
          />

          <label htmlFor="description">
            Describe the problem <span>*</span>
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={update}
            rows={5}
            minLength={10}
            maxLength={1500}
            placeholder="Explain what happened, where it happened, and any relevant details."
            required
          />

          <div className="character-count">
            {form.description.length}/1500 characters
          </div>

          <div className="form-notice">
            <LockKeyhole size={16} />
            <span>
              Do not include passwords, bank details, or other sensitive
              personal information.
            </span>
          </div>

          {error && (
            <div className="inline-error" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit complaint"}
              {!loading && <ArrowRight size={17} />}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="form-side-note">
          <span className="side-note-icon">
            <ClipboardList size={22} />
          </span>

          <h3>What happens next?</h3>

          <ol>
            <li>Describe the issue and its location.</li>
            <li>Your complaint is saved to the Prajaseva database.</li>
            <li>Keep your tracking code to check the complaint status.</li>
          </ol>

          <p className="muted-text">
            Your complaint is submitted to the Prajaseva system; this does
            not yet mean it has been forwarded to a government office.
          </p>
        </aside>
      </div>
    </>
  );
}



function TrackComplaintPage() {
  const [reference, setReference] = useState(
  new URLSearchParams(window.location.search).get("reference") || ""
  );
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event) {
    event.preventDefault();

    const trackingCode = reference.trim();

    setSearched(false);
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/complaints/${encodeURIComponent(
          trackingCode
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError(
            "No complaint found with this reference number. Please check the tracking code and try again."
          );
        } else {
          setError(
            data.detail || "Unable to retrieve the complaint. Please try again."
          );
        }
        setSearched(true);
        return;
      }

      setResult(data);
      setSearched(true);
    } catch (err) {
      setError(
        "Unable to connect to the Prajaseva server. Please check that the backend is running."
      );
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return (
    <>
      <PageHeading
        eyebrow="COMPLAINT SERVICES"
        title="Track a complaint"
        description="Enter your complaint reference number to check its current status."
      />

      <section className="track-card">
        <span className="track-icon">
          <Search size={25} />
        </span>

        <h2>Find your complaint</h2>

        <p>
          Enter the reference number you received after submitting your
          complaint.
        </p>

        <form className="track-form" onSubmit={search}>
          <label htmlFor="reference">Complaint reference number</label>

          <input
            id="reference"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              setSearched(false);
              setResult(null);
              setError("");
            }}
            placeholder="e.g. PS-1198A067D59E"
            required
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            <Search size={17} />
            {loading ? "Searching..." : "Find complaint"}
          </button>
        </form>

        <p className="field-hint">
          Enter the tracking code provided when your complaint was submitted.
        </p>
      </section>

      {searched && result && (
        <section className="content-card track-result">
          <div className="card-heading">
            <div>
              <p className="eyebrow-text">COMPLAINT RECORD</p>
              <h2>{result.tracking_code}</h2>
            </div>

            <StatusBadge status={result.status} />
          </div>

          <dl className="detail-list">
            <div>
              <dt>Subject</dt>
              <dd>{result.subject}</dd>
            </div>

            <div>
              <dt>Category</dt>
              <dd>{result.category}</dd>
            </div>

            <div>
              <dt>Description</dt>
              <dd>{result.description}</dd>
            </div>

            <div>
              <dt>Village</dt>
              <dd>{result.village}</dd>
            </div>

            <div>
              <dt>Location</dt>
              <dd>{result.location_details || "Not provided"}</dd>
            </div>

            <div>
              <dt>Submitted</dt>
              <dd>{formatDate(result.submitted_at)}</dd>
            </div>

            <div>
              <dt>Last updated</dt>
              <dd>{formatDate(result.updated_at)}</dd>
            </div>

            <div>
              <dt>Current status</dt>
              <dd>{formatStatus(result.status)}</dd>
            </div>
          </dl>

          <p className="demo-notice">
            <CircleAlert size={16} />
            This complaint was retrieved from the Prajaseva database.
          </p>
        </section>
      )}

      {searched && error && (
        <div className="inline-error">
          <CircleAlert size={18} />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}



function MyComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadComplaints() {
      setLoading(true);
      setError("");

      try {
        const token = sessionStorage.getItem("prajaseva_citizen_token");
        if (!token) {
          if (!cancelled) {
            setComplaints([]);
            setError("Please sign in to view your complaints.");
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/citizen/complaints`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to load your complaints."
          );
        }

        if (!cancelled) {
          setComplaints(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your complaints. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComplaints();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatStatus(status) {
    return String(status || "submitted")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <>
      <PageHeading
        eyebrow="CITIZEN SERVICES"
        title="My complaints"
        description="View your submitted complaints and check their latest status."
        action={
          <button
            className="btn btn-primary"
            onClick={() => navigate("/complaints/new")}
          >
            <FilePlus2 size={16} />
            New complaint
          </button>
        }
      />

      {loading && (
        <div className="content-card card-heading">
          Loading your complaints...
        </div>
      )}

      {error && (
        <div className="inline-error" role="alert">
          <CircleAlert size={17} />
          {error}
        </div>
      )}

      {!loading && !error && complaints.length === 0 && (
        <section className="content-card">
          <div className="empty-page">
            <span><ClipboardList size={28} /></span>
            <h2>No complaints saved yet</h2>
            <p>
              Submit a complaint to see it here, or track an existing
              complaint using its reference number.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/complaints/new")}
            >
              Submit a complaint
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/complaints/track")}
            >
              Track a complaint
            </button>
          </div>
        </section>
      )}

      {!loading && complaints.length > 0 && (
        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2>Your complaint records</h2>
              <p>{complaints.length} complaint(s) saved in this browser</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="complaint-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Complaint</th>
                  <th>Location</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.tracking_code}>
                    <td><strong>{complaint.tracking_code}</strong></td>
                    <td>
                      <strong>
                        {complaint.subject || complaint.category}
                      </strong>
                    </td>
                    <td>
                      {complaint.location_details || complaint.village || "—"}
                    </td>
                    <td>
                      {complaint.submitted_at
                        ? new Date(complaint.submitted_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`admin-status-badge ${
                          String(complaint.status || "submitted")
                            .toLowerCase()
                            .replace(/_/g, "-")
                        }`}
                      >
                        {formatStatus(complaint.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() =>
                          navigate(
                            `/complaints/track?reference=${encodeURIComponent(
                              complaint.tracking_code
                            )}`
                          )
                        }
                      >
                        View status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}



function AuthPage({ mode = "login", admin = false }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";
  const title = admin
    ? "Administrator sign in"
    : isRegister
      ? "Create your citizen account"
      : "Welcome back";

  const description = admin
    ? "Sign in to securely manage village complaints."
    : isRegister
      ? "Register to manage your complaint activity."
      : "Sign in to access your citizen services.";

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const isCitizenRegister = !admin && isRegister;
    const mobile = String(formData.get(admin ? "username" : "mobile") || "").trim();
    const payload = admin
      ? { username: mobile, password }
      : isCitizenRegister
        ? { full_name: String(formData.get("fullName") || "").trim(), mobile, password }
        : { mobile, password };
    setLoading(true);
    try {
      const endpoint = admin ? "/admin/login" : isCitizenRegister ? "/citizen/register" : "/citizen/login";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || (isCitizenRegister ? "Registration failed." : "Sign in failed."));
      if (!data.access_token) throw new Error("The server did not return an access token.");
      if (admin) {
        sessionStorage.setItem("prajaseva_admin_token", data.access_token);
        setMessage("Login successful. Opening dashboard...");
        navigate("/admin/dashboard", { replace: true });
      } else {
        sessionStorage.setItem("prajaseva_citizen_token", data.access_token);
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <span className="brand-mark">
          <ShieldCheck size={24} />
        </span>
        <span>Prajaseva</span>
      </div>

      <section className="auth-card">
        <span className="auth-icon">
          {admin ? <ShieldCheck size={24} /> : <UserRound size={24} />}
        </span>

        <p className="eyebrow-text">
          {admin ? "ADMINISTRATION" : "CITIZEN PORTAL"}
        </p>

        <h1>{title}</h1>
        <p className="auth-description">{description}</p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </>
          )}

          <label htmlFor={admin ? "username" : "mobile"}>
            {admin ? "Admin username" : "Mobile number"}
          </label>

          <input
            id={admin ? "username" : "mobile"}
            name={admin ? "username" : "mobile"}
            type={admin ? "text" : "tel"}
            inputMode={admin ? undefined : "numeric"}
            placeholder={admin ? "Enter admin username" : "Enter your 10-digit mobile number"}
            autoComplete={admin ? "username" : "tel"}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={admin ? "current-password" : "current-password"}
            minLength={admin ? 1 : 8}
            placeholder="Enter your password"
            required
          />

          <button
            className="btn btn-primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : admin
                ? "Sign in to admin portal"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            <ArrowRight size={17} />
          </button>
        </form>

        {message && (
          <p className="auth-message" role="alert">
            <CircleAlert size={16} />
            {message}
          </p>
        )}

        {!admin && (
          <p className="auth-switch">
            {isRegister
              ? "Already have an account?"
              : "New to Prajaseva?"}{" "}
            <button
              type="button"
              onClick={() =>
                navigate(isRegister ? "/login" : "/register")
              }
            >
              {isRegister ? "Sign in" : "Create account"}
            </button>
          </p>
        )}

        {admin && (
          <p className="auth-switch">
            <button type="button" onClick={() => navigate("/")}>
              Return to citizen portal
            </button>
          </p>
        )}

        <p className="auth-disclaimer">
          {admin
            ? "Authorized administrators only."
            : "Your account details are stored securely in the Prajaseva database."}
        </p>
      </section>
    </div>
  );
}



function AdminDashboardPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("prajaseva_admin_token");

  function handleAdminLogout() {
    sessionStorage.removeItem("prajaseva_admin_token");
    navigate("/admin/login", { replace: true });
  }

  async function loadDashboard() {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/complaints?limit=100&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("prajaseva_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Unable to load dashboard complaints.");
      }

      const items = Array.isArray(data.items) ? data.items : [];
      setComplaints(items);
      setTotal(Number(data.total ?? items.length));
    } catch (err) {
      setError(err.message || "Could not connect to the Prajaseva server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    // The dashboard loads when opened. Manual refresh is available after errors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedStatus = (complaint) =>
    String(complaint.status || "submitted").toLowerCase().replace(/\s+/g, "_");

  const pending = complaints.filter((complaint) =>
    ["submitted", "under_review"].includes(normalizedStatus(complaint))
  ).length;
  const inProgress = complaints.filter(
    (complaint) => normalizedStatus(complaint) === "in_progress"
  ).length;
  const resolved = complaints.filter(
    (complaint) => normalizedStatus(complaint) === "resolved"
  ).length;

  const stats = [
    {
      title: "Total complaints",
      value: total,
      note: "All recorded complaints",
      icon: ClipboardList,
      tone: "green",
    },
    {
      title: "Awaiting action",
      value: pending,
      note: "Submitted or under review",
      icon: Clock3,
      tone: "amber",
    },
    {
      title: "In progress",
      value: inProgress,
      note: "Currently being addressed",
      icon: Activity,
      tone: "blue",
    },
    {
      title: "Resolved",
      value: resolved,
      note: "Successfully completed",
      icon: CheckCircle2,
      tone: "purple",
    },
  ];

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0))
    .slice(0, 5);

  function formatAdminDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAdminStatus(value) {
    return String(value || "submitted")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-topline">
        <div>
          <p className="eyebrow-text">PRAJASEVA / ADMINISTRATION</p>
          <h1>Complaint management</h1>
          <p className="admin-dashboard-subtitle">
            Review citizen concerns and track the progress of village services.
          </p>
        </div>

        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate("/admin/complaints")}
        >
          <ClipboardList size={17} />
          Manage complaints
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleAdminLogout}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

      <div className="admin-dashboard-notice">
        <ShieldCheck size={18} />
        <div>
          <strong>Administrator workspace</strong>
          <p>Dashboard statistics and recent activity are loaded from the complaint database.</p>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button className="btn btn-secondary" type="button" onClick={loadDashboard}>
            Retry
          </button>
        </div>
      )}

      <section className="admin-stats-grid" aria-label="Complaint statistics">
        {stats.map(({ title, value, note, icon: Icon, tone }) => (
          <article className="admin-stat-card" key={title}>
            <div className="admin-stat-top">
              <span className={`admin-stat-icon ${tone}`}>
                <Icon size={20} />
              </span>
              <span className="admin-stat-indicator">Live data</span>
            </div>
            <p>{title}</p>
            <strong>{loading ? "—" : String(value).padStart(2, "0")}</strong>
            <small>{loading ? "Loading..." : note}</small>
          </article>
        ))}
      </section>

      <section className="admin-complaints-panel">
        <div className="admin-panel-header">
          <div>
            <p className="eyebrow-text">RECENT ACTIVITY</p>
            <h2>Latest complaints</h2>
            <p>Recent records retrieved from the complaint register.</p>
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => navigate("/admin/complaints")}
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading complaints...</p></div>
        ) : recentComplaints.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={30} />
            <strong>No complaints yet</strong>
            <p>New complaints will appear here after citizens submit them.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="complaint-table admin-complaint-table">
              <thead>
                <tr>
                  <th>REFERENCE</th>
                  <th>COMPLAINT DETAILS</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map((complaint) => {
                  const status = formatAdminStatus(complaint.status);
                  return (
                    <tr key={complaint.tracking_code}>
                      <td>
                        <strong className="admin-reference">{complaint.tracking_code}</strong>
                      </td>
                      <td>
                        <div className="admin-complaint-title">
                          {complaint.subject || complaint.category || "Civic complaint"}
                        </div>
                        <span className="admin-complaint-location">
                          <MapPin size={13} />
                          {complaint.location_details || complaint.village || "Puttapaka"}
                        </span>
                      </td>
                      <td>{formatAdminDate(complaint.submitted_at)}</td>
                      <td>
                        <span className={`admin-status-badge ${String(complaint.status || "submitted").toLowerCase().replace(/_/g, "-")}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-panel-footer">
          <span>{loading ? "Loading records" : `Showing ${recentComplaints.length} of ${total} complaint(s)`}</span>
          <button type="button" onClick={() => navigate("/admin/complaints")}>
            Open complaint register
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}

function AdminComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingCode, setSavingCode] = useState("");
  const [success, setSuccess] = useState("");
  const [editingCode, setEditingCode] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintHistory, setComplaintHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [newStatus, setNewStatus] = useState("under_review");
  const [remarks, setRemarks] = useState("");

  const token = sessionStorage.getItem("prajaseva_admin_token");

  const statusOptions = [
    { value: "submitted", label: "Submitted" },
    { value: "under_review", label: "Under review" },
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
  ];

  async function loadComplaints() {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: "100",
        offset: "0",
      });

      if (filter !== "All") {
        params.set("status", filter);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/complaints?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("prajaseva_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load complaints."
        );
      }

      setComplaints(data.items || []);
      setTotal(data.total ?? (data.items || []).length);
    } catch (err) {
      setError(
        err.message || "Could not connect to the Prajaseva server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
  }, [filter, search]);

  async function saveStatus(trackingCode) {
    if (!remarks.trim() || remarks.trim().length < 3) {
      setError("Please enter a remark of at least 3 characters.");
      return;
    }

    setSavingCode(trackingCode);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/complaints/${encodeURIComponent(
          trackingCode
        )}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            remarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("prajaseva_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.detail || "Status update failed.");
      }

      setSuccess(
        `Complaint ${trackingCode} updated to ${
          statusOptions.find((item) => item.value === newStatus)?.label ||
          newStatus
        }.`
      );

      setEditingCode("");
      setRemarks("");

      await loadComplaints();

      // Update the selected complaint in the open details panel.
      setSelectedComplaint((previous) =>
        previous &&
        previous.tracking_code === trackingCode
          ? { ...previous, status: newStatus }
          : previous
      );

      // Refresh history to show the new status and remarks.
      if (selectedComplaint?.tracking_code === trackingCode) {
        await openComplaintDetails({
          ...selectedComplaint,
          status: newStatus,
        });
      }
    } catch (err) {
      setError(err.message || "Could not update complaint status.");
    } finally {
      setSavingCode("");
    }
  }

  
async function openComplaintDetails(complaint) {
  setSelectedComplaint(complaint);
  setComplaintHistory([]);
  setDetailsError("");
  setHistoryLoading(true);

  // Set the default status for the selected complaint.
  setNewStatus(
    complaint.status === "submitted"
      ? "under_review"
      : complaint.status
  );
  setRemarks("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/complaints/${encodeURIComponent(
        complaint.tracking_code
      )}/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("prajaseva_admin_token");
      navigate("/admin/login", { replace: true });
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Unable to load complaint history."
      );
    }

    setComplaintHistory(data.history || data.items || []);
  } catch (err) {
    setDetailsError(
      err.message || "Unable to load complaint history."
    );
  } finally {
    setHistoryLoading(false);
  }
}


  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function statusLabel(value) {
    return statusOptions.find((item) => item.value === value)?.label ||
      String(value || "Unknown").replace(/_/g, " ");
  }

  return (
    <div className="admin-register">
      <div className="admin-register-heading">
        <div>
          <p className="eyebrow-text">ADMINISTRATION / COMPLAINTS</p>
          <h1>Manage complaints</h1>
          <p>
            Review citizen submissions and update complaint progress.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate("/admin/dashboard")}
        >
          <LayoutDashboard size={17} />
          Back to dashboard
        </button>
      </div>

      <section className="admin-register-stats">
        <article className="admin-register-stat">
          <span className="admin-register-dot green" />
          <div>
            <p>Total matching complaints</p>
            <strong>{total}</strong>
          </div>
        </article>

        <article className="admin-register-stat">
          <span className="admin-register-dot amber" />
          <div>
            <p>Awaiting review</p>
            <strong>
              {complaints.filter((c) =>
                ["submitted", "under_review"].includes(c.status)
              ).length}
            </strong>
          </div>
        </article>

        <article className="admin-register-stat">
          <span className="admin-register-dot blue" />
          <div>
            <p>In progress</p>
            <strong>
              {complaints.filter((c) => c.status === "in_progress").length}
            </strong>
          </div>
        </article>

        <article className="admin-register-stat">
          <span className="admin-register-dot purple" />
          <div>
            <p>Resolved</p>
            <strong>
              {complaints.filter((c) => c.status === "resolved").length}
            </strong>
          </div>
        </article>
      </section>

      {error && (
        <div className="inline-error" role="alert">
          <CircleAlert size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-dashboard-notice" role="status">
          <CheckCircle2 size={18} />
          <div>
            <strong>Status updated successfully</strong>
            <p>{success}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="admin-register-panel">
        <div className="admin-register-panel-heading">
          <div>
            <h2>Complaint register</h2>
            <p>Records retrieved from the Prajaseva database</p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={loadComplaints}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="admin-register-toolbar">
          <div className="admin-register-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reference, category or subject..."
              aria-label="Search complaints"
            />
          </div>

          <label className="admin-register-filter">
            <span>Status</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="admin-register-empty">
            <p>Loading complaints from the database…</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="admin-register-empty">
            <ClipboardList size={28} />
            <strong>No complaints found</strong>
            <p>Try another search or status filter.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="complaint-table admin-register-table">
              <thead>
                <tr>
                  <th>REFERENCE</th>
                  <th>COMPLAINT</th>
                  <th>LOCATION</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.tracking_code}>
                    <td>
                      <strong className="admin-register-reference">
                        {complaint.tracking_code}
                      </strong>
                    </td>

                    <td>
                      <span className="admin-register-category">
                        {complaint.subject || complaint.category}
                      </span>
                    </td>

                    <td>
                      <span className="admin-register-location">
                        <MapPin size={14} />
                        {complaint.location_details ||
                          complaint.village ||
                          "Puttapaka"}
                      </span>
                    </td>

                    <td>{formatDate(complaint.submitted_at)}</td>

                    <td>
                      <span
                        className={`admin-status-badge ${
                          String(complaint.status)
                            .toLowerCase()
                            .replace(/_/g, "-")
                        }`}
                      >
                        {statusLabel(complaint.status)}
                      </span>
                    </td>

                    
                                          
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary admin-view-details-btn"
                        onClick={() => openComplaintDetails(complaint)}
                      >
                        <Eye size={16} />
                        View details
                      </button>
                    </td>

                    
                  </tr>
                ))}

                {complaints.map((complaint) =>
                  editingCode === complaint.tracking_code ? (
                    <tr key={`${complaint.tracking_code}-editor`}>
                      <td colSpan={6}>
                        
                      <div className="admin-status-editor">
                        <div className="admin-status-editor-heading">
                          <div>
                            <span className="eyebrow-text">COMPLAINT UPDATE</span>
                            <h3>Update complaint status</h3>
                            <p>Reference: {complaint.tracking_code}</p>
                          </div>

                          <span className="admin-status-editor-current">
                            Current: {statusLabel(complaint.status)}
                          </span>
                        </div>

                        <div className="admin-status-editor-fields">
                          <label className="admin-status-field">
                            <span>New status <span className="required-mark">*</span></span>
                            <select
                              value={newStatus}
                              onChange={(event) => setNewStatus(event.target.value)}
                            >
                              {statusOptions
                                .filter((item) => item.value !== "submitted")
                                .map((item) => (
                                  <option key={item.value} value={item.value}>
                                    {item.label}
                                  </option>
                                ))}
                            </select>
                          </label>

                          <label className="admin-status-field admin-status-remarks">
                            <span>Update or resolution remarks <span className="required-mark">*</span></span>
                            <textarea
                              value={remarks}
                              onChange={(event) => setRemarks(event.target.value)}
                              minLength={3}
                              maxLength={1000}
                              rows={3}
                              placeholder="Describe the action taken or the next steps for this complaint..."
                            />
                            <small>Enter at least 3 characters, up to 1,000 characters.</small>
                          </label>
                        </div>

                        <div className="admin-status-editor-actions">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingCode("");
                              setRemarks("");
                              setError("");
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={
                              savingCode === complaint.tracking_code ||
                              remarks.trim().length < 3
                            }
                            onClick={() => saveStatus(complaint.tracking_code)}
                          >
                            {savingCode === complaint.tracking_code
                              ? "Saving update..."
                              : "Save status update"}
                            {savingCode !== complaint.tracking_code && (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-register-footer">
          <span>{total} complaint(s) in the current result set</span>
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowRight size={15} />
            Return to overview
          </button>
        </div>
      </section>

      
{selectedComplaint && (
  <div
    className="admin-details-overlay"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        setSelectedComplaint(null);
        setDetailsError("");
      }
    }}
  >
    <section
      className="admin-details-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-details-title"
    >
      <header className="admin-details-header">
        <div>
          <span className="eyebrow-text">COMPLAINT DETAILS</span>
          <h2 id="admin-details-title">
            {selectedComplaint.subject ||
              selectedComplaint.category}
          </h2>
          <p>{selectedComplaint.tracking_code}</p>
        </div>

        <button
          type="button"
          className="admin-details-close"
          aria-label="Close complaint details"
          onClick={() => {
            setSelectedComplaint(null);
            setDetailsError("");
          }}
        >
          <X size={20} />
        </button>
      </header>

      <div className="admin-details-body">
        <div className="admin-details-status-row">
          <span>Current status</span>
          <span
            className={`admin-status-badge ${
              String(selectedComplaint.status)
                .toLowerCase()
                .replace(/_/g, "-")
            }`}
          >
            {statusLabel(selectedComplaint.status)}
          </span>
        </div>

        <div className="admin-details-grid">
          <div>
            <span>Category</span>
            <strong>{selectedComplaint.category || "—"}</strong>
          </div>

          <div>
            <span>Village</span>
            <strong>{selectedComplaint.village || "Puttapaka"}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>
              {selectedComplaint.location_details || "Not provided"}
            </strong>
          </div>

          <div>
            <span>Submitted</span>
            <strong>
              {formatDate(selectedComplaint.submitted_at)}
            </strong>
          </div>
        </div>

        <section className="admin-details-description">
          <h3>Problem description</h3>
          <p>
            {selectedComplaint.description ||
              "The complaint description is not available in the list response."}
          </p>
        </section>

        {detailsError && (
          <div className="inline-error" role="alert">
            <CircleAlert size={17} />
            <span>{detailsError}</span>
          </div>
        )}

        <section className="admin-details-update">
          <h3>Update complaint status</h3>
          <p>Record the latest action taken by the administration.</p>

          <label className="admin-status-field">
            <span>New status *</span>
            <select
              value={newStatus}
              onChange={(event) => setNewStatus(event.target.value)}
            >
              {statusOptions
                .filter((item) => item.value !== "submitted")
                .map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
            </select>
          </label>

          <label className="admin-status-field">
            <span>Remarks / action taken *</span>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              minLength={3}
              maxLength={1000}
              rows={4}
              placeholder="Explain what has been done or what action is planned..."
            />
            <small>Minimum 3 characters; maximum 1,000.</small>
          </label>

          <button
            type="button"
            className="btn btn-primary admin-details-save"
            disabled={
              savingCode === selectedComplaint.tracking_code ||
              remarks.trim().length < 3 ||
              newStatus === selectedComplaint.status
            }
            onClick={() => saveStatus(selectedComplaint.tracking_code)}
          >
            {savingCode === selectedComplaint.tracking_code
              ? "Saving update..."
              : "Save status update"}
            <CheckCircle2 size={16} />
          </button>
        </section>

        <section className="admin-details-history">
          <h3>Status history</h3>

          {historyLoading ? (
            <p>Loading status history...</p>
          ) : complaintHistory.length === 0 ? (
            <p>No status history is available.</p>
          ) : (
            <div className="admin-history-list">
              {complaintHistory.map((entry, index) => (
                <article
                  className="admin-history-item"
                  key={`${entry.changed_at || index}-${index}`}
                >
                  <strong>
                    {statusLabel(entry.new_status)}
                  </strong>
                  <p>{entry.remarks || "No remarks provided."}</p>
                  <small>
                    {entry.changed_at
                      ? new Date(entry.changed_at).toLocaleString("en-IN")
                      : "Date unavailable"}
                  </small>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  </div>
)}

    </div>
  );
}




function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      const token = sessionStorage.getItem("prajaseva_citizen_token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/citizen/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("prajaseva_citizen_token");
          navigate("/login", { replace: true });
          return;
        }
        if (!response.ok) throw new Error(data.detail || "Unable to load your profile.");
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to connect to Prajaseva.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfile();
    return () => { cancelled = true; };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("prajaseva_citizen_token");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <PageHeading
        eyebrow="ACCOUNT SETTINGS"
        title="My Profile"
        description="Your registered citizen account details."
        action={<button className="btn btn-secondary" type="button" onClick={handleLogout}><LogOut size={17} /> Sign out</button>}
      />
      {loading && <section className="content-card"><p>Loading your profile...</p></section>}
      {error && <div className="inline-error" role="alert"><CircleAlert size={18} />{error}</div>}
      {!loading && !error && profile && (
        <section className="profile-card">
          <div className="profile-summary">
            <div className="profile-large-avatar"><UserRound size={32} /></div>
            <div>
              <h2>{profile.name}</h2>
              <p>Puttapaka, Telangana</p>
              <span className="profile-demo-badge">Registered citizen</span>
            </div>
          </div>
          <div className="profile-section-heading"><h3>Personal information</h3></div>
          <dl className="detail-list">
            <div><dt>Full name</dt><dd>{profile.name}</dd></div>
            <div><dt>Mobile number</dt><dd>{profile.mobile}</dd></div>
          </dl>
          <div className="form-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate("/dashboard")}>Go to dashboard <ArrowRight size={17} /></button>
            <button className="btn btn-secondary" type="button" onClick={handleLogout}><LogOut size={17} /> Sign out</button>
          </div>
        </section>
      )}
    </>
  );
}


function NotFoundPage() {
  const navigate = useNavigate();
  return <section className="empty-page"><span><Search size={30} /></span><h1>Page not found</h1><p>The page you're looking for doesn't exist.</p><button className="btn btn-primary" onClick={() => navigate("/")}>Return home</button></section>;
}


function ProtectedAdminRoute({ children }) {
  const token = sessionStorage.getItem("prajaseva_admin_token");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}


function ProtectedCitizenRoute({ children }) {
  const token = sessionStorage.getItem("prajaseva_citizen_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}


function RoutedApp() {
  const [language, setLanguage] = useState("en");
  const t = copy[language];

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
  path="/admin/login"
  element={<AuthPage admin />}
/>

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path="/admin/complaints"
        element={
          <ProtectedAdminRoute>
            <AdminComplaintsPage />
          </ProtectedAdminRoute>
        }
      />

      
      <Route path="*" element={
        <AppLayout language={language} setLanguage={setLanguage}>
          <Routes>
            <Route path="/" element={<HomePage t={t} />} />
            <Route path="/dashboard" element={<DashboardPage t={t} />} />
            <Route path="/complaints/new" element={<NewComplaintPage />} />
            <Route path="/complaints/track" element={<TrackComplaintPage />} />
            <Route path="/complaints" element={<MyComplaintsPage />} />
            <Route path="*" element={<NotFoundPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedCitizenRoute>
                  <ProfilePage />
                </ProtectedCitizenRoute>
              }
            />
          </Routes>
        </AppLayout>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
