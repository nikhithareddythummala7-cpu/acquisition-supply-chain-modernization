# AI-Powered Acquisition & Supply Chain Modernization System

Production-ready full-stack enterprise web application designed to modernize procurement requisitions, supplier performance evaluation, bid submission & side-by-side comparison matrix, legal supply contract intelligence, cargo shipment logistics tracking, quality inspection reporting, risk assessment matrix, compliance monitoring, and Retrieval-Augmented Generation (RAG) conversational AI assistance.

---

## 🔒 Administrator Authentication & Seeding

The **`ADMIN`** role is strictly protected and **cannot be registered through the public registration form** (`/register`). Public API registration requests attempting to specify `role: 'ADMIN'` are explicitly rejected by backend security validation with a `400 Bad Request`.

### Configuring Administrator Credentials
Administrator credentials are managed via environment variables in `server/.env`:

```env
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@acquisition.com
ADMIN_PASSWORD=Admin@12345
```

### Seeding Default Administrator (`npm run seed`)
The seed script is **idempotent**. Running `npm run seed` checks if the administrator account (`ADMIN_EMAIL`) already exists. If not, it creates the default Administrator with a bcrypt-hashed password and initializes the demo operational dataset. Executing the seed script multiple times will **never create duplicate administrator accounts**.

```bash
# Seed Default Administrator & Operational Data
npm run seed
```

### Initial Administrator Login
Navigate to **`http://localhost:5173/login`** and sign in using the configured default credentials:

- **Email:** `admin@acquisition.com` *(or your custom `ADMIN_EMAIL`)*
- **Password:** `Admin@12345` *(or your custom `ADMIN_PASSWORD`)*

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, React Router v6, Axios
- **Backend:** Node.js, Express.js (MVC Architecture), JWT Authentication, bcryptjs, Helmet, CORS, Morgan
- **Database:** MongoDB, Mongoose ODM
- **AI & RAG:** Modular `@google/generative-ai` / OpenAI Service Abstraction with in-memory & vector embedding cosine similarity retrieval engine

---

## ⚙️ Quick Start Guide

### 1. Environment Configuration
Create `.env` in `server/` based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/acquisition_system
JWT_SECRET=super_secret_jwt_key_acquisition_system_2026_dev
JWT_EXPIRES_IN=7d
AI_PROVIDER=gemini
AI_API_KEY=
CLIENT_URL=http://localhost:5173
NODE_ENV=development

ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@acquisition.com
ADMIN_PASSWORD=Admin@12345
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Run Development Servers
```bash
# Terminal 1: Start Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Start Frontend App (Port 5173)
npm run dev:client
```

### 4. Run Integration Tests
```bash
npm run test
```

---

## 🔑 Pre-Seeded Accounts Overview

| Role | Email | Password | Creation Method |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@acquisition.com` | `Admin@12345` | **Seed Script / Admin Panel Only** |
| **PROCUREMENT_OFFICER** | `procurement@defense.gov` | `password123` | Seed / Public Register |
| **SUPPLY_CHAIN_ANALYST** | `analyst@logistics.org` | `password123` | Seed / Public Register |
| **COMPLIANCE_AUDITOR** | `auditor@compliance.gov` | `password123` | Seed / Public Register |
| **VENDOR** | `vendor@apexdef.com` | `password123` | Seed / Public Register |
| **CONTRACT_MANAGER** | `contracts@defense.gov` | `password123` | Seed / Public Register |
| **OPERATIONS_COMMANDER** | `commander@ops.gov` | `password123` | Seed / Public Register |
| **RISK_SPECIALIST** | `risk@defense.gov` | `password123` | Seed / Public Register |
| **EXTERNAL_AUDITOR** | `external@oversight.org` | `password123` | Seed / Public Register |

---

## 📊 Role-Specific Dashboards (`/dashboard`)

The `/dashboard` route dynamically renders a specialized, role-tailored dashboard component based on the authenticated user's JWT role:

| Authenticated Role | Rendered Dashboard Component | Primary Responsibilities & Telemetry |
| :--- | :--- | :--- |
| **`ADMIN`** | [`AdminDashboard`](file:///client/src/pages/AdminDashboard.jsx) | Global system overview, user provisioning, security audit logs, enterprise telemetry |
| **`PROCUREMENT_OFFICER`** | [`ProcurementDashboard`](file:///client/src/pages/ProcurementDashboard.jsx) | Requisition authoring, approval queues, RFP bid evaluations, budget vs spend |
| **`SUPPLY_CHAIN_ANALYST`** | [`SupplyChainDashboard`](file:///client/src/pages/SupplyChainDashboard.jsx) | Consignments in-transit, delivery delays, quality inspections, route risk vectors |
| **`VENDOR`** | [`VendorDashboard`](file:///client/src/pages/VendorDashboard.jsx) | Bid proposals, active contracts, carrier tracking, supplier ratings |
| **`CONTRACT_MANAGER`** | [`ContractManagerDashboard`](file:///client/src/pages/ContractManagerDashboard.jsx) | Contract repository, 30-day expirations, portfolio value, renewal milestones |
| **`RISK_SPECIALIST`** | [`RiskDashboard`](file:///client/src/pages/RiskDashboard.jsx) | Threat severity breakdown, supplier vulnerability matrix, mitigation registers |
| **`COMPLIANCE_AUDITOR`** | [`ComplianceDashboard`](file:///client/src/pages/ComplianceDashboard.jsx) | Regulatory certs, inspection pass/fail rates, immutable audit events |
| **`OPERATIONS_COMMANDER`** | [`OperationsDashboard`](file:///client/src/pages/OperationsDashboard.jsx) | Fleet logistics tracking, tactical requirements, operations readiness index |
| **`EXTERNAL_AUDITOR`** | [`ExternalAuditorDashboard`](file:///client/src/pages/ExternalAuditorDashboard.jsx) | Read-only attestation portal, cryptographic audit trail, compliance verification |

### Backend Role-Based Authorization Guards (HTTP 403)
All endpoints enforce strict role checks via [`authorizeRoles`](file:///server/src/middleware/authMiddleware.js). Unauthorized access attempts (e.g., non-admin calling `/api/users` or unprivileged roles requesting sensitive operational telemetry) are rejected with `403 Forbidden`.

