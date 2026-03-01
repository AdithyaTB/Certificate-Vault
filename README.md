<div align="center">

# 🏆 CertifyVault
### *The Intelligent SaaS Platform to Map, Manage, and Master Your Professional Credentials.*

<img src="https://via.placeholder.com/1200x300.png?text=CertifyVault+-+AI-Powered+Certificate+Manager" alt="CertifyVault Hero Banner">

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)

*Your entire professional journey, centralized in one stunning, secure digital vault.*

</div>

---

## 📸 Overview
**CertifyVault** is a next-generation MERN stack SaaS application built to solve a universal pain point: the scattered chaos of digital qualifications. It empowers students, developers, and seasoned professionals to seamlessly organize, secure, and visually track their certificates in a beautifully designed, monochrome-themed dashboard. 

With advanced folder categorization, real-time analytics, and a top-tier administrative moderation panel, CertifyVault isn’t just a simple tracking app—it’s a premium portfolio backbone.

---

## 🌟 Key Highlights
*   **🧠 Intelligent Organization**: Intuitive folder structures and infinite tagging logic keep everything categorized.
*   **📊 Dynamic Analytics Dashboard**: Visualizes your learning momentum, category distribution, and storage utilization via `Recharts`.
*   **🛡️ Dedicated SaaS Admin Panel**: Complete platform surveillance featuring static secured logins, feature flags, global broadcasting, and immutable audit logs.
*   **🔗 Secure Share Links**: Generate instantly expiring or persistent public URLs to prove credentials to recruiters natively.
*   **⚡ Blazing Fast Architecture**: Zero-lag filtering and instant UI feedback wrapped in Framer Motion animations.

---

## 🧠 The Problem
In the era of micro-credentials, online bootcamps, and continuous upskilling, your most valuable assets—your certificates—are often buried deep in email archives, fragmented Google Drives, or physical folders. When a recruiter or HR manager asks for verification, the process is manual, chaotic, and stressful. Furthermore, there is zero visibility into how your skills are distributed over time.

## 💡 The Solution
**CertifyVault** acts as a single pane of glass for your professional trajectory. It centralizes all credentials into one strictly structured, visually exceptional workflow. It doesn’t just store PDFs and images; it wraps them in analytics, categories, and powerful search capabilities, transforming static files into a measurable, shareable asset.

---

## 🛠️ Tech Stack & Architecture
This project is engineered for production readiness, leveraging the definitive MERN stack augmented with highly visual, modern UI libraries.

### Frontend
*   **React (Vite):** Blazing fast component rendering.
*   **Tailwind CSS:** Fully responsive, utility-first styling utilizing a premium monochrome aesthetic.
*   **Framer Motion:** Fluid, un-intrusive micro-interactions and route transitions.
*   **Recharts:** Interactive, data-dense SVG charting for analytics.
*   **Redux Toolkit / RTK Query:** Advanced global state management and persistent caching.

### Backend
*   **Node.js / Express:** Lightweight, high-throughput asynchronous API.
*   **MongoDB (Mongoose):** Flexible NoSQL document design mapping complex hierarchical data (Folders/Tags).
*   **JWT / Bcrypt:** Stateless, heavily encrypted user sessions.

---

## 🔐 Authentication Ecosystem
CertifyVault employs a strict dual-authentication strategy to isolate platform governance from end-user access.

*   **User Layer (JWT):** Standardized Registration/Login flow converting passwords via `bcryptjs` and dispensing 30-day JWT payloads.
*   **Admin Layer (Static Env Auth):** To prevent malicious account takeovers or database breaches from generating unauthorized administrative states, the Master Admin credentials (`ADMIN_EMAIL` & `ADMIN_PASSWORD`) are heavily locked into the `.env` process natively. They bypass the standard user collection mechanism entirely.

---

## 📂 Core Features (User Experience)
*   **Upload & Parsing:** Drag-and-drop ingestion of PDFs, PNGs, and JPEGs handled natively via `Multer` on the backend.
*   **Taxonomy Engine:** Create infinite folders. Attach unlimited tags and predefined categories (e.g., *Frontend*, *Cloud*, *Cybersecurity*).
*   **Advanced Filtering:** Millisecond search querying spanning titles, issuers, dates, and strict tag matching.
*   **Action Hub:** 1-Click download and public shareable link generation.
*   **Profile Analytics:** Visually map which categories dominate your portfolio and chart your upload momentum month-by-month.
*   **Aesthetic Toggle:** Native Light/Dark mode respecting system preferences.

## 🛡️ Admin Surveillance Panel
*   **Global Telemetry:** High-level metrics tracking total users, total certificates, and massive SSD storage limits.
*   **User Governance:** Granular control to promote admins, suspend accounts, or permanently ban malicious actors.
*   **Certificate Moderation Queue:** Strict manual review processes allowing admins to flag, reject (with reasoning), or approve community-uploaded certificates.
*   **Verified Issuer Registry:** Centralized, immutable list of recognized institutions (e.g., *AWS, Google, Coursera*).
*   **Live Feature Flags:** Turn massive platform features (like *AI Auto-Tagging* or *Maintenance Mode*) ON/OFF globally without redeploying the backend.
*   **Broadcast Manager:** Render live UI announcement banners pushing critical platform updates to all active sessions instantly.
*   **Immutable Audit Logs:** Non-destructive logging tracking exact Admin IPs, targets, and timestamps.

---

## 🎨 UI/UX Design Philosophy
The entire application was handcrafted adopting a **Monochrome Black & White Professional Design**. 
By removing harsh, distracting branding colors, the focus remains entirely on the certificates and the data. Features rely on deep shadows, subtle **Glassmorphism cards**, thin borders, and highly legible typography to deliver a premium, SaaS-ready "Dashboard" feel on both Desktop and Mobile.

---

## 📁 Clean MERN Architecture

```text
CertifyVault/
├── client/                     # React Frontend
│   ├── public/                 # Static assets (Favicons, etc.)
│   ├── src/
│   │   ├── app/                # RTK Query API Slices & Redux Store
│   │   │   ├── adminApiSlice.js
│   │   │   ├── apiSlice.js
│   │   │   └── store.js
│   │   ├── assets/             # Local images and icons
│   │   ├── components/         # Modular presentation layer (UI, Layouts)
│   │   │   ├── admin/          # Admin layout constructs
│   │   │   ├── certificates/   # Certificate grid and item cards
│   │   │   ├── dashboard/      # Profile statistics blocks
│   │   │   ├── layout/         # Header, Sidebar, Wrapper layouts
│   │   │   ├── ui/             # Reusable elements (Button, Inputs, Tooltips)
│   │   │   └── upload/         # DragDropUploader component
│   │   ├── hooks/              # Reusable React logical bindings
│   │   │   └── useTheme.js
│   │   ├── pages/              # Primary Route Views
│   │   │   ├── Admin/          # AdminPanel, AdminLogin
│   │   │   ├── Auth/           # Login, Register flows
│   │   │   ├── Certificates.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── SharedView.jsx
│   │   ├── routes/             # Authentication & Protected wrappers
│   │   │   ├── AdminRoute.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── App.jsx             # Main Router & Global Toast Provider
│   │   ├── index.css           # Tailwind Entry & Base Typography
│   │   └── main.jsx            # React root injection point
│   ├── package.json            # Client dependencies
│   └── vite.config.js          
│
├── server/                     # Node.js RESTful API
│   ├── config/                 # DB connections & Environment initializers
│   │   └── db.js
│   ├── controllers/            # Core business logic separated by domain
│   │   ├── admin.controller.js
│   │   ├── analytics.controller.js
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   ├── certificate.controller.js
│   │   ├── folder.controller.js
│   │   └── share.controller.js
│   ├── middleware/             # Route gatekeepers
│   │   ├── adminAuth.middleware.js # Validates admin-level boundaries
│   │   ├── auth.middleware.js      # Validates standard user JWTs
│   │   ├── error.middleware.js     # Master error catching formatting
│   │   └── upload.middleware.js    # Multer file parsing engine
│   ├── models/                 # Mongoose schema definitions
│   │   ├── AuditLog.js
│   │   ├── Category.js
│   │   ├── Certificate.js
│   │   ├── Config.js           # Singleton pattern for Platform settings
│   │   ├── Folder.js
│   │   ├── ShareLink.js
│   │   └── User.js
│   ├── routes/                 # Express endpoint mapping rules
│   │   ├── admin.routes.js
│   │   ├── analytics.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── certificate.routes.js
│   │   ├── folder.routes.js
│   │   └── share.routes.js
│   ├── utils/                  # Reusable backend constructs
│   │   └── apiFeatures.js      # Universal pagination/sorting wrapper
│   └── server.js               # Primary bootstrapping entrypoint
```

---

## 📡 API Endpoints Map
*(All private routes inject `Authorization: Bearer <Token>`)*

### Authentication & Users
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | Public |
| `POST` | `/api/auth/login` | Authenticate and retrieve JWT | Public |
| `GET` | `/api/auth/me` | Fetch active user session metadata | Private |
| `PUT` | `/api/auth/updatedetails` | Overwrite personal profile data | Private |
| `PUT` | `/api/auth/updatepassword` | Overwrite account password securely | Private |

### Certificates & Folders
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/certificates` | Fetch all certs (Supports pagination/filters) | Private |
| `POST` | `/api/certificates` | Upload a new document buffer to storage | Private |
| `GET` | `/api/certificates/:id` | Fetch isolated certificate details | Private |
| `PUT` | `/api/certificates/:id` | Modify metadata (Title, Issuer, Tags) | Private |
| `DELETE` | `/api/certificates/:id` | Soft/Hard delete certificate record | Private |
| `POST` | `/api/folders` | Bootstrap a new directory node | Private |

### Admin Governance
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate Master Admin credentials | Public |
| `GET` | `/api/admin/analytics` | Fetch aggregated platform KPIs | Admin |
| `GET` | `/api/admin/users/:id` | Deep inspection of specific user behavior | Admin |
| `PUT` | `/api/admin/certificates/:id/moderate`| Approve/Reject/Flag content | Admin |
| `PUT` | `/api/admin/config/flags` | Overwrite dynamic platform toggle state | Admin |
| `GET` | `/api/admin/audit-logs` | Fetch immutable administrative history | Admin |

---

## ⚙️ Environment Variables
Create a root `.env` inside the `/server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_hyper_secure_long_random_string
JWT_EXPIRE=30d
NODE_ENV=development

# Dedicated Admin Authentication
ADMIN_EMAIL=admin@certifyvault.com
ADMIN_PASSWORD=strong_admin_password
ADMIN_JWT_SECRET=isolated_admin_jwt_secret
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CertifyVault.git
```

### 2. Bootstrapping the Backend
```bash
cd CertifyVault/server
npm install
npm run dev
# The REST API mounts on http://localhost:5000
```

### 3. Bootstrapping the Frontend
Open a new terminal session.
```bash
cd CertifyVault/client
npm install
npm run dev
# Vite runs instantly on http://localhost:5173 
```

---

## 📦 Future Roadmap (V2.0 Core)
1. **AI Object Character Recognition (OCR):** Automatically scrape titles, issuing dates, and acquired skills from uploaded PDFs using Python Lambda endpoints.
2. **AWS S3 / Cloudflare R2 Migration:** Rip out localized disk storage and pipe document buffers straight to scalable, cost-effective edge buckets.
3. **Multi-Tenant Organizations:** Allow HR managers to deploy entire company sub-domains inside CertifyVault for internal compliance tracking.
4. **React Native Mobile App:** Dedicated iOS/Android wrappers for on-the-go scanning capabilities.

---

## 📜 License
Fully open-source and released under the [MIT License](LICENSE). Feel free to fork, mutate, and deploy.

---

<div align="center">

### *CertifyVault isn't just an application—it's the operational standard for digital professional identity.* 💎

</div>
