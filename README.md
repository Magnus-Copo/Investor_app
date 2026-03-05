# INVESTFLOW — Private Investment Portfolio Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.75.5-blue?style=for-the-badge&logo=react" alt="React Native">
  <img src="https://img.shields.io/badge/NestJS-11-red?style=for-the-badge&logo=nestjs" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Platform-Android-brightgreen?style=for-the-badge&logo=android" alt="Android">
</p>

<p align="center">
        A production-grade, mobile-first platform for managing private investment funds, project spendings, democratic approvals, and portfolio analytics — all in one place.
</p>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Objectives](#2-objectives)
3. [Who It Is For](#3-who-it-is-for)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Feature Overview](#5-feature-overview)
6. [Application Architecture](#6-application-architecture)
7. [Frontend Deep Dive](#7-frontend-deep-dive)
8. [Backend Deep Dive](#8-backend-deep-dive)
9. [Database Schema](#9-database-schema)
10. [Authentication & Security](#10-authentication--security)
11. [Core Business Flows](#11-core-business-flows)
12. [Data Export & Reporting](#12-data-export--reporting)
13. [Notifications System](#13-notifications-system)
14. [Technology Stack](#14-technology-stack)
15. [Project Structure](#15-project-structure)
16. [Environment & Configuration](#16-environment--configuration)
17. [Build & Deployment](#17-build--deployment)
18. [Testing](#18-testing)
19. [Known Limitations & Roadmap](#19-known-limitations--roadmap)
20. [Demo Credentials](#20-demo-credentials)

---

## 1. Overview

**INVESTFLOW** is a full-stack mobile investment management platform designed specifically for private investment funds where multiple individuals pool capital into real-world projects — such as real estate, venture capital, private equity, or fixed-income instruments.

Before INVESTFLOW, groups of investors managing shared projects relied on a fragmented combination of emails, WhatsApp conversations, spreadsheets, and phone calls. There was no single source of truth for expenses, no transparent audit trail, and no structured approval workflow for spending decisions.

INVESTFLOW replaces all of that. It provides a **mobile-first, role-based platform** where every rupee spent is tracked, every decision is voted on, every project update is visible in real time, and every report is downloadable on demand.

The platform consists of two primary components:
- A **React Native mobile application** (Android-first, extensible to iOS) that serves as the end-user interface for investors and administrators.
- A **NestJS REST API backend** powered by MongoDB that handles all business logic, authentication, data persistence, and notifications.

The application is branded as **INVESTFLOW** with an internal codebase alias of **InvestFlow**. The Android package identifier is `com.lohithms.INVESTFLOW`, version `1.0.3`.

---

## 2. Objectives

INVESTFLOW was built to solve a specific set of problems facing private investment groups:

| Problem | INVESTFLOW Solution |
|---|---|
| No centralised view of investment portfolio | Portfolio Dashboard with per-project valuations, returns and performance metrics |
| Spending decisions made informally with no audit trail | Democratic Voting System — every spending requires member approval, every vote is permanently recorded |
| No structured project lifecycle management | Project Module with status progression: `pending → funding → active → completed` |
| Reports scattered across emails | Quarterly Reports downloadable per Q1–Q4 fiscal year, per investment |
| Expense data locked in admins' spreadsheets | DailyExpenses screen — every member sees all approved project expenses |
| No way for investors to flag modification requests | Modifications Module with typed change requests (timeline, budget, scope) and democratic voting |
| Announcements and updates through WhatsApp groups | Announcements Module — admin broadcasts with per-user read tracking |
| No analytics on personal or project-level spending | Expense Analytics with category pie charts, monthly trends, project breakdown |
| Onboarding new investors manually | AddInvestor screen + per-project invitation system |

The platform's **primary objective** is to bring institutional-level transparency and governance to informal private investment groups — making them operate with the discipline of a fund, without the overhead.

---

## 3. Who It Is For

INVESTFLOW is built for two distinct audience segments operating within the same application:

### Investors

Individual members of a private investment fund who want:
- A real-time view of what their money is invested in and how it is performing
- Visibility into every expense made from the shared fund
- A voice in approving or rejecting spending proposals
- Access to quarterly reports documenting fund performance
- Analytics tools to understand where their investment stands

Investors do not need to be financially sophisticated — the interface is designed to be accessible through a consumer-grade mobile app experience.

### Fund Administrators / Project Managers

The people responsible for operating the fund who need:
- Tools to create and manage investment projects
- The ability to onboard and manage investors per project
- A dashboard showing fund-level KPIs (AUM, active projects, pending approvals, investor count)
- The ability to submit and track spending proposals
- System-wide announcement capabilities for investor communications
- Export tools for generating reports and compliance documentation

### The Super Admin

A single platform-level administrator (typically the technical owner or fund principal) who additionally manages:
- Market price metadata displayed to all users
- Market news feed updates
- User role escalation beyond `investor` (must be done at the database level for security)

---

## 4. User Roles & Permissions

INVESTFLOW implements a **5-level role hierarchy**, enforced on the backend (via `JwtAuthGuard` + `RolesGuard`) and on the frontend via `AuthContext`, `permissions.js`, and route-level role checks in `App.js`.

| Level | Role | Description |
|---|---|---|
| 0 | `guest` | Default on signup. Minimal access, effectively a placeholder until role is elevated. |
| 1 | `investor` | Full portfolio visibility, voting rights, expense submission |
| 2 | `project_admin` | All investor capabilities + project creation and member management |
| 3 | `admin` | All project_admin capabilities + system stats, user management, announcements |
| 4 | `super_admin` | Full platform access + market data management |

### Permission Matrix

| Permission | investor | project_admin | admin | super_admin |
|---|---|---|---|---|
| `view_portfolio` | ✅ | ✅ | ✅ | ✅ |
| `view_investments` | ✅ | ✅ | ✅ | ✅ |
| `view_reports` | ✅ | ✅ | ✅ | ✅ |
| `view_analytics` | ✅ | ✅ | ✅ | ✅ |
| `create_project` | ✅ | ✅ | ✅ | ✅ |
| `view_project_details` | ✅ | ✅ | ✅ | ✅ |
| `vote_on_modifications` | ✅ | ✅ | ✅ | ✅ |
| `view_approval_chain` | ✅ | ✅ | ✅ | ✅ |
| `view_profile` / `edit_profile` | ✅ | ✅ | ✅ | ✅ |
| `add_investor` | ❌ | ✅ | ✅ | ✅ |
| `remove_investor` | ❌ | ✅ | ✅ | ✅ |
| `view_investor_list` | ❌ | ✅ | ✅ | ✅ |
| `edit_project` | ❌ | ✅ | ✅ | ✅ |
| `create_modification` | ❌ | ✅ | ✅ | ✅ |
| `view_admin_stats` | ❌ | ❌ | ✅ | ✅ |
| `manage_users` | ❌ | ❌ | ✅ | ✅ |
| `send_announcements` | ❌ | ❌ | ✅ | ✅ |
| `update_market_data` | ❌ | ❌ | ❌ | ✅ |

> **Security Note:** Role escalation beyond `investor` cannot be self-requested or performed through the API. It requires direct database-level access. This intentionally prevents privilege escalation attacks.

---

## 5. Feature Overview

INVESTFLOW is composed of **14 major feature domains**:

### 5.1 Authentication & Identity

Users can register with email/password or authenticate via Google OAuth or Apple Sign In. All sessions are JWT-based with a 60-minute access token and 7-day refresh token. Tokens are automatically rotated on refresh with bcrypt hash comparison. First-time users go through a 3-step onboarding walkthrough. Registration is rate-limited (3 attempts per 60 seconds) and blocks known disposable email domains.

### 5.2 Portfolio Dashboard

The core investor view aggregates all projects the user is a member of into a single portfolio overview — showing total invested capital, current valuation, returns, and a project-by-project breakdown. Performance metrics including Sharpe ratio, CAGR, and volatility are computed server-side and available by time period (1M, 3M, 6M, 1Y, ALL).

### 5.3 Project Management

Investment projects are the primary unit of organisation. Each project has a lifecycle (`pending → funding → active → completed`), a type (real estate, venture capital, private equity, fixed income), a risk level (low, medium, high), target/raised amounts, return rate, and a valuation history time-series. Projects support an investor membership system with role differentiation (active/passive) and optional anonymous participation. Full XLSX and CSV export of project data is available.

### 5.4 Democratic Spending Approval

This is the most distinctive feature of INVESTFLOW. When a fund member submits a spending proposal, every active project member receives a push notification and must cast a vote (approve or reject). A `Map<userId, Approval>` is stored per spending, creating a complete, immutable audit trail. Status transitions only when voting thresholds are reached. Sole-investor projects auto-approve. The frontend displays a real-time voting progress bar with approve/reject counts.

### 5.5 Ledger Management

Projects can define named ledgers (e.g., "Construction Fund", "Marketing Budget") and sub-ledger categories within them. Every spending can be tagged to a specific ledger and sub-ledger. This creates a structured accounting layer within each project, enabling precise financial categorisation and reporting.

### 5.6 Modification / Change Request Voting

When project parameters need to change (timeline, budget, scope, or other), a formal modification request is created. Project members vote on it the same way they vote on spendings. Rejected modifications store the rejecting user, timestamp, and a mandatory rejection reason. This creates a governance record for every project decision.

### 5.7 Quarterly Reports

Investors have access to quarterly performance reports (Q1–Q4) for each fiscal year, linked to their investments. Each report covers portfolio growth, returns, dividends, and performance highlights. Reports are downloadable as HTML documents. The `ReportsScreen` provides a card list of all available reports with tap-to-view and native share functionality.

### 5.8 Expense Analytics

A PhonePe-inspired `DailyExpensesScreen` groups all approved project expenses by date, filterable by All / Personal / Project. A dedicated `ExpenseAnalyticsScreen` provides category-level pie charts, monthly spending trends, and project-level breakdowns. All analytics data is computed server-side in a single API call, eliminating N+1 query problems.

### 5.9 Admin Dashboard

Admin-role users see a dedicated dashboard showing system-wide KPIs: total AUM, active project count, total investor count, pending approval count, and monthly growth figures. This is powered by `GET /api/admin/stats`, restricted to admin-level roles.

### 5.10 Announcements

Admins can broadcast messages to all platform users. Each announcement supports per-user read tracking. The frontend displays unread badges. Announcements can be deleted by admin-level users. This replaces informal communication through group messaging apps.

### 5.11 Notifications

Every significant event (spending submitted, vote requested, spending approved/rejected, modification created) triggers both an in-app notification and, where push tokens are registered, an Expo push notification. The notification centre supports bulk-read and individual deletion.

### 5.12 User Profile & Settings

Each user controls their profile (name, phone, bio), bank details, and application settings (theme, language, currency, notification preferences). Password change flow is bcrypt-verified server-side. Account deletion is a soft-delete to maintain relational data integrity and comply with App Store Guideline 5.1.1. GDPR data export is available via `GET /api/users/export-data`.

### 5.13 Data Export

INVESTFLOW provides multi-format data exports at both the project level and personal expense level:
- **CSV** — for spreadsheet or accounting software import
- **XLSX** — multi-sheet ExcelJS workbook with formatting (Summary + Expenses sheets)
- **JSON** — full data backup for portability
- **HTML** — styled printable report

### 5.14 File Uploads

Supports single-file uploads up to 10 MB via Multer disk storage. Files are stored on the server's local disk at `./uploads/`. Currently used for document attachments to spendings and projects.

---

## 6. Application Architecture

### 6.1 System Architecture Overview

```
+------------------------------------------------------------------+
|                        CLIENT (Mobile)                           |
|                                                                  |
|   React Native 0.75.5 — Android-first, bare workflow            |
|   +-----------------+  +-----------------+  +----------------+  |
|   |  AuthContext    |  |  RN Navigation  |  |   Axios API    |  |
|   | (global state)  |  |  (NativeStack)  |  |   Service      |  |
|   +-----------------+  +-----------------+  +----------------+  |
+------------------------------------------------------+-----------+
                                                       | HTTPS / Bearer JWT
                                                       |
+------------------------------------------------------+-----------+
|                      BACKEND (NestJS API)                        |
|   Global Prefix: /api — Port: 3000                              |
|                                                                  |
|   +----------+ +----------+ +----------+ +------------------+   |
|   |  Auth    | | Projects | | Finance  | |  Users / Admin   |   |
|   +----------+ +----------+ +----------+ +------------------+   |
|   +----------+ +----------+ +----------+ +------------------+   |
|   |Investments| |Modific.  | |Announce. | |  Notifications   |   |
|   +----------+ +----------+ +----------+ +------------------+   |
|   +----------+ +----------+ +----------+                        |
|   | Uploads  | |  Legal   | | Privacy  |                        |
|   +----------+ +----------+ +----------+                        |
|                                                                  |
|   Middleware: Helmet — ThrottlerGuard — ValidationPipe — CORS   |
+------------------------------------------------------------------+
                                                       | Mongoose ODM
                                                       |
+------------------------------------------------------+-----------+
|                         DATABASE (MongoDB)                       |
|                                                                  |
|   Collections:                                                   |
|   users, projects, spendings, ledgers                           |
|   notifications, modificationrequests, announcements             |
+------------------------------------------------------------------+
                                         |
                              +----------+----------+
                              |   Expo Push API     |
                              | (push notifications)|
                              +---------------------+
```

### 6.2 Frontend Technology Choices

The frontend is a **React Native 0.75.5 bare workflow application**. Key design choices:

- **Single-context state management** via `AuthContext` — no Redux or Zustand. All authentication state and user data lives in one place, making session restoration and permission checks simple and consistent.
- **Flat native stack navigation** — all 20 screens are in one `createNativeStackNavigator`. Screen availability is conditionally controlled by auth state and role checks, keeping the navigation tree predictable.
- **Axios API client** with automatic JWT injection, automatic 401-triggered token refresh with race condition prevention, and multi-URL fallback for development environments (ngrok, localhost, LAN).
- **Hermes JavaScript engine** for improved startup time and reduced memory footprint on Android.

### 6.3 Backend Technology Choices

The backend is **NestJS 11 with TypeScript 5.7**, following a strict modular architecture. Key design choices:

- **Global API prefix `/api`** — all endpoints are `/api/...`, making reverse proxy configuration clean.
- **Global `ValidationPipe`** with `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields in request bodies are automatically stripped and rejected, preventing parameter pollution.
- **Helmet** middleware sets all major HTTP security headers globally (CSP, HSTS, X-Frame-Options, etc.).
- **`@nestjs/throttler`** provides layered rate limiting — 60 req/min globally with tighter per-route limits on sensitive endpoints.
- **Mongoose Map type** for voting records — using `Map<userId, Vote>` as the storage type for both spending approvals and modification votes means the voting logic scales to any number of project members without schema changes.

---

## 7. Frontend Deep Dive

### 7.1 Navigation Structure

The entire navigation graph is a flat `NativeStackNavigator`. Screen availability is conditional on three states: unauthenticated, authenticated-but-not-onboarded, and fully authenticated. Combined with role checks (`isAdminUser`), each user only sees routes relevant to them.

```
NavigationContainer
+-- Stack.Navigator (headerShown: false)
        +-- [unauthenticated]
        |   +-- LoginScreen
        |   +-- SignUpScreen
        |
        +-- [authenticated, not onboarded]
        |   +-- OnboardingScreen
        |
        +-- [authenticated + onboarded]
                +-- InvestorDashboard          -- default for investor / project_admin
                +-- AdminDashboard             -- default for admin / super_admin
                |
                +-- [isAdminUser only]
                |   +-- CreateProject          (slide_from_bottom)
                |   +-- AddInvestor            (slide_from_bottom)
                |   +-- Announcements          (slide_from_bottom)
                |
                +-- Reports                    (slide_from_bottom)
                +-- Approvals                  (slide_from_bottom)
                +-- PortfolioAnalytics         (slide_from_bottom)
                +-- CreateProjectInvestor      (slide_from_bottom)
                +-- ManageProjectInvestors     (slide_from_bottom)
                +-- ProjectDetail              (slide_from_bottom)
                +-- ProjectApprovalDetail      (slide_from_bottom)
                +-- Profile
                +-- Notifications              (slide_from_right)
                +-- Settings                   (slide_from_bottom)
                +-- DailyExpenses              (slide_from_bottom)
                +-- ExpenseAnalytics           (slide_from_right)
```

`isAdminUser` is `true` when `userRole` is `admin`, `super_admin`, or `project_admin`.

### 7.2 Complete Screen Inventory

| Screen | File | Roles | Description |
|---|---|---|---|
| `LoginScreen` | `src/screens/LoginScreen.js` | Public | Email/password login. Quick Debug Mode for dev. |
| `SignUpScreen` | `src/screens/SignUpScreen.js` | Public | New user registration with password policy enforcement |
| `OnboardingScreen` | `src/screens/onboarding/OnboardingScreen.js` | First-login | 3-step welcome walkthrough, persisted per-user |
| `InvestorDashboard` | `src/screens/investor/InvestorDashboard.js` | investor+ | Main hub with 4-tab bottom controller: Home / Projects / Approvals / Expenses |
| `AdminDashboard` | `src/screens/admin/AdminDashboard.js` | admin+ | KPI overview: AUM, projects, investors, pending approvals, monthly growth |
| `ProjectDetailScreen` | `src/screens/investor/ProjectDetailScreen.js` | investor+ | Full project detail: spendings, member list, valuation history, voting |
| `CreateProjectInvestorScreen` | `src/screens/investor/CreateProjectInvestorScreen.js` | investor+ | Project creation form for non-admin investors |
| `ManageProjectInvestorsScreen` | `src/screens/investor/ManageProjectInvestorsScreen.js` | project_admin+ | Add/remove/update role of project members |
| `ProjectApprovalDetailScreen` | `src/screens/investor/ProjectApprovalDetailScreen.js` | investor+ | Modification request detail with voting progress and approve/reject actions |
| `ReportsScreen` | `src/screens/client/ReportsScreen.js` | investor+ | Quarterly report viewer with download and share |
| `ApprovalsScreen` | `src/screens/client/ApprovalsScreen.js` | investor+ | All pending modification votes across the user's projects |
| `PortfolioAnalyticsScreen` | `src/screens/client/PortfolioAnalyticsScreen.js` | investor+ | Portfolio performance analytics with period selector (1M/3M/6M/1Y/ALL) |
| `CreateProjectScreen` | `src/screens/admin/CreateProjectScreen.js` | admin+ | Admin project creation form |
| `AddInvestorScreen` | `src/screens/admin/AddInvestorScreen.js` | admin+ | Onboard a new investor to the platform |
| `AnnouncementsScreen` | `src/screens/admin/AnnouncementsScreen.js` | admin+ | Compose and view broadcast messages |
| `DailyExpensesScreen` | `src/screens/expenses/DailyExpensesScreen.js` | investor+ | PhonePe-style transaction history grouped by date, filterable by All/Personal/Project |
| `ExpenseAnalyticsScreen` | `src/screens/expenses/ExpenseAnalyticsScreen.js` | investor+ | Category pie charts, monthly budget tracking, export options |
| `ProfileScreen` | `src/screens/shared/ProfileScreen.js` | all | User profile view and edit |
| `SettingsScreen` | `src/screens/shared/SettingsScreen.js` | all | Theme, language, currency, notification preferences |
| `NotificationScreen` | `src/screens/shared/NotificationScreen.js` | all | In-app notification list with mark-read and delete |

### 7.3 State Management

INVESTFLOW uses a **single React Context** (`AuthContext` in `src/context/AuthContext.js`) for all global state. There is no external state management library.

**State variables:**

| Variable | Type | Purpose |
|---|---|---|
| `user` | Object | Full user object (id, name, email, role, permissions) |
| `isAuthenticated` | Boolean | Controls the navigation root |
| `isOnboarded` | Boolean | Persisted per-user via AsyncStorage key `INVESTFLOW_onboarded_{userId}` |
| `isFirstTimeUser` | Boolean | Persisted via `INVESTFLOW_has_logged_in_before` |
| `showInfoModal` | Boolean | Displayed once to first-time users |

**Exposed functions:**

| Function | Description |
|---|---|
| `login(userData)` | Sets user, resolves onboarding state, fetches permissions and app config |
| `logout()` | Clears both tokens from AsyncStorage, resets all state |
| `checkPermission(permission)` | Client-side RBAC check |
| `checkProjectAdmin(project)` | Returns true if current user created the project |
| `getProjectRole(project)` | Returns `PROJECT_ADMIN` if creator, otherwise membership role |
| `completeOnboarding()` | Persists onboarding completion keyed to userId |
| `dismissInfoModal()` | Hides the first-time info modal |

**Session restoration:** On every cold start, a `useEffect` checks AsyncStorage. If a token is found, it calls `GET /auth/me` and restores the session automatically without requiring re-login.

### 7.4 API Service Layer

`src/services/api.js` is a 923-line Axios-based API client — the sole point of communication between the frontend and backend.

**Key implementation details:**

- **Request interceptor** — attaches `Authorization: Bearer <token>` to every outgoing request from AsyncStorage
- **Response interceptor (401 handling)** — on receiving a `401 Unauthorized`, a single shared `refreshPromise` is created. Multiple simultaneous 401s share one refresh call without race conditions. All queued requests are retried with the new token once refresh completes. If refresh fails, tokens are cleared and the user is logged out.
- **Network fallback** — on network errors, cycles through `apiBaseCandidates` (ngrok, localhost, LAN IP) automatically
- **Normalizer functions** — `normalizeSpending()`, `normalizeModification()`, `normalizeLedger()`, `normalizeSettings()` map MongoDB ObjectId references to plain strings and fill missing derived fields before data reaches the UI

### 7.5 Utilities

| File | Purpose |
|---|---|
| `src/utils/permissions.js` | RBAC role definitions, permission constants, `hasPermission()`, `getAllPermissions()`, `isProjectAdmin()` |
| `src/utils/apiConfig.js` | Generates `apiBaseCandidates` for multi-environment URL fallback |
| `src/utils/dateTimeUtils.js` | Date formatting, relative time, fiscal quarter calculation |
| `src/utils/fileExport.js` | File export helpers generating CSV / HTML / JSON content |
| `src/utils/fileShare.js` | React Native Share API wrapper for the native share sheet |
| `src/utils/validationUtils.js` | Form validation; accepts backend-supplied password policy overrides from `GET /users/app-config` |

---

## 8. Backend Deep Dive

### 8.1 Module Architecture

The NestJS backend is composed of **13 modules**, each encapsulating its own controller, service, DTOs, schemas, and guards.

| Module | Directory | Responsibility |
|---|---|---|
| `AppModule` | `backend/src/` | Root module — imports and wires all other modules |
| `AuthModule` | `backend/src/auth/` | JWT strategy, Local strategy, Google OAuth, Apple Sign In, guards, token rotation |
| `UsersModule` | `backend/src/users/` | User CRUD, profile, settings, GDPR data export, soft deletion, push token management |
| `ProjectsModule` | `backend/src/projects/` | Full project lifecycle, investor membership, invitations, export, market metadata |
| `FinanceModule` | `backend/src/finance/` | Spending submission, democratic vote processing, ledger management, analytics, multi-format export |
| `InvestmentsModule` | `backend/src/investments/` | Portfolio aggregation, investment list, quarterly reports, performance metrics |
| `ModificationsModule` | `backend/src/modifications/` | Modification request creation, vote processing, approval/rejection with reason |
| `NotificationsModule` | `backend/src/notifications/` | In-app notifications CRUD, Expo push notification delivery |
| `AnnouncementsModule` | `backend/src/announcements/` | Admin broadcast messages with per-user read tracking |
| `AdminModule` | `backend/src/admin/` | System-wide KPI statistics, restricted to admin-level roles |
| `UploadsModule` | `backend/src/uploads/` | File upload via Multer diskStorage, max 10 MB |
| `LegalModule` | `backend/src/legal/` | Serves privacy policy and terms of service text |
| `PrivacyModule` | `backend/src/privacy/` | Response interceptors scrubbing sensitive fields from API responses |

### 8.2 Complete API Reference

All endpoints are prefixed with `/api`.

#### Auth (`/api/auth`)

| Method | Endpoint | Guard | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/auth/login` | LocalAuthGuard | 5/60s | Email + password login. Returns `access_token` + `refresh_token`. |
| `POST` | `/auth/register` | Public | 3/60s | Create new account. Blocks disposable emails. Role locked to guest/investor. |
| `POST` | `/auth/login/google` | Public | 60/min (global) | Google OAuth login. ID token verified via `google-auth-library`. |
| `POST` | `/auth/login/apple` | Public | 60/min (global) | Apple Sign In. JWT verified via Apple JWKS endpoint using `jose`. |
| `GET` | `/auth/me` | JwtAuthGuard | 60/min (global) | Returns the full user object for the authenticated user. |
| `POST` | `/auth/logout` | JwtAuthGuard | 60/min (global) | Clears `refreshTokenHash` from database, invalidating all refresh tokens. |
| `POST` | `/auth/refresh` | Public | 60/min (global) | Accepts refresh token in body, validates, rotates both tokens. |
| `GET` | `/auth/my-permissions` | JwtAuthGuard | 60/min (global) | Returns server-computed permission list for the current user's role. |

#### Users (`/api/users`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | List all users (admin, project_admin, super_admin only) |
| `GET` | `/users/profile` | Get own profile |
| `PUT` | `/users/profile` | Update own profile (name, phone, bio, etc.) |
| `GET` | `/users/settings` | Get application settings |
| `PUT` | `/users/settings` | Update settings (theme, language, currency) |
| `PUT` | `/users/settings/notifications` | Update notification preferences |
| `POST` | `/users/change-password` | Old password bcrypt-verified, new hash stored |
| `DELETE` | `/users/account` | Soft delete — sets `deletedAt` timestamp |
| `GET` | `/users/export-data` | GDPR-compliant full data export |
| `POST` | `/users/push-token` | Register Expo push notification token |
| `GET` | `/users/app-config` | Returns password policy and blocked email domain list |

#### Projects (`/api/projects`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/projects` | Create new investment project |
| `GET` | `/projects` | List projects visible to current user |
| `GET` | `/projects/:id` | Full project detail including members and valuation history |
| `PUT` | `/projects/:id` | Update project metadata, status, valuation |
| `GET` | `/projects/:id/export` | Export project report (`?format=xlsx\|csv`) |
| `POST` | `/projects/:id/investors` | Add an investor to the project |
| `DELETE` | `/projects/:id/investors/:userId` | Remove investor from project |
| `PUT` | `/projects/:id/investors/:userId` | Update investor's role or privacy settings |
| `GET` | `/projects/:id/invite-candidates` | List users eligible to be invited |
| `POST` | `/projects/:id/invites` | Send invitation to a user |
| `POST` | `/projects/:id/invites/accept` | Accept an incoming invitation |
| `POST` | `/projects/:id/invites/decline` | Decline an incoming invitation |
| `GET` | `/projects/analytics` | Portfolio-level analytics scoped to current user |
| `GET` | `/projects/metadata/types` | List of valid project types |
| `GET` | `/projects/metadata/risks` | List of valid risk levels |
| `GET` | `/projects/metadata/market-prices` | Current market prices metadata |
| `GET` | `/projects/metadata/news` | News feed metadata |
| `PUT` | `/projects/metadata/market-prices/:id` | Update a market price entry (super_admin only) |
| `PUT` | `/projects/metadata/news/:id` | Update a news item (super_admin only) |

#### Finance (`/api/finance`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/finance/spendings` | Submit a new spending proposal |
| `POST` | `/finance/spendings/:id/vote` | Cast a vote (approved/rejected) on a spending |
| `GET` | `/finance/spendings` | List spendings with filters (status, ownerUserId, fromDate, toDate) |
| `GET` | `/finance/spendings/search` | Paginated full-text search of spendings |
| `POST` | `/finance/ledgers` | Create a named ledger for a project |
| `GET` | `/finance/ledgers` | List ledgers for a project (`?projectId=X`) |
| `GET` | `/finance/ledgers/:id` | Ledger detail with sub-ledger list |
| `PUT` | `/finance/ledgers/:id` | Update ledger name or sub-ledger array |
| `DELETE` | `/finance/ledgers/:id` | Delete a ledger |
| `GET` | `/finance/my-expenses` | All approved expenses across all user's projects; paginated, filterable |
| `GET` | `/finance/expense-analytics` | Category totals, monthly trends, project breakdown |
| `GET` | `/finance/my-pending-approvals` | All spendings awaiting the current user's vote |
| `GET` | `/finance/spending-summary` | Pre-computed totals for a project (`?projectId=X`) |
| `GET` | `/finance/spending-summary/bulk` | Batch totals for multiple projects (`?projectIds=X,Y,Z`) |
| `GET` | `/finance/export` | Export expense data (`?format=csv\|xlsx\|json\|html`) |

#### Investments (`/api/investments`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/investments/portfolio` | Total invested, current value, returns — aggregated portfolio |
| `GET` | `/investments` | List of individual investments from project memberships |
| `GET` | `/investments/:id` | Individual investment detail |
| `GET` | `/investments/reports` | List of quarterly reports linked to current user's investments |
| `GET` | `/investments/reports/:reportId/download` | Download report (`?format=html`) |
| `GET` | `/investments/performance-metrics` | Sharpe ratio, CAGR, volatility (`?period=1M\|3M\|6M\|1Y\|ALL`) |

#### Modifications (`/api/modifications`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/modifications` | Create modification request (type: timeline/budget/scope/other) |
| `GET` | `/modifications` | List modification requests for a project (`?projectId=X`) |
| `POST` | `/modifications/:id/vote` | Cast a vote on a modification |
| `POST` | `/modifications/:id/approve` | Shorthand approve action |
| `POST` | `/modifications/:id/reject` | Reject with mandatory reason string |

#### Notifications, Announcements, Admin, Uploads, Legal

| Module | Method | Endpoint | Description |
|---|---|---|---|
| Notifications | `GET` | `/notifications` | List all notifications for current user |
| Notifications | `POST` | `/notifications/:id/read` | Mark single as read |
| Notifications | `POST` | `/notifications/read-all` | Bulk mark all as read |
| Notifications | `DELETE` | `/notifications/:id` | Delete notification |
| Announcements | `POST` | `/announcements` | Create announcement (admin+ only) |
| Announcements | `GET` | `/announcements` | List all announcements |
| Announcements | `POST` | `/announcements/:id/read` | Mark as read by current user |
| Announcements | `DELETE` | `/announcements/:id` | Delete announcement (admin+ only) |
| Admin | `GET` | `/admin/stats` | System-wide KPIs (admin+ only) |
| Uploads | `POST` | `/uploads` | Upload single file (max 10 MB) |
| Legal | `GET` | `/legal/privacy-policy` | Privacy policy text |
| Legal | `GET` | `/legal/terms` | Terms of service text |
| Health | `GET` | `/` | Application health check |

---

## 9. Database Schema

INVESTFLOW uses MongoDB with Mongoose. All schema definitions are code-first via Mongoose schema decorators.

### `users` Collection

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `email` | String | Required, Unique, Indexed | Login identifier |
| `username` | String | Optional, Unique, Sparse | Display name |
| `phone` | String | Optional, Unique, Sparse | Phone number |
| `passwordHash` | String | Required | bcrypt hash |
| `name` | String | Required | Full name |
| `role` | Enum | Default: `guest` | `guest / investor / project_admin / admin / super_admin` |
| `bankDetails` | Object | Optional | Bank account information |
| `settings` | Object | Default: `{}` | theme, darkMode, language, currency, notification prefs |
| `refreshTokenHash` | String | Optional | bcrypt hash of current refresh token (rotated on each use) |
| `googleSub` | String | Optional | Google OAuth subject ID for account linking |
| `appleSub` | String | Optional | Apple Sign In subject ID for account linking |
| `authProvider` | String | Default: `password` | `password / google / apple` |
| `deletedAt` | Date | Optional | Soft delete marker (`null` = active account) |
| `createdAt` / `updatedAt` | Date | Auto | Mongoose `timestamps: true` |

### `projects` Collection

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `name` | String | Required, Indexed | Project display name |
| `type` | String | Required | `real_estate / venture_capital / fixed_income / private_equity` |
| `description` | String | Optional | Free-text description |
| `targetAmount` | Number | Required | Funding target (INR) |
| `raisedAmount` | Number | Default: 0 | Current raised amount |
| `minInvestment` | Number | Optional | Minimum allowed investment |
| `returnRate` | Number | Optional | Expected return percentage |
| `duration` | String | Optional | Investment horizon |
| `riskLevel` | String | Required | `low / medium / high` |
| `currentValuation` | Number | Optional | Latest project valuation |
| `valuationHistory` | Array | Default: `[]` | `[{valuation: Number, date: Date}]` time-series |
| `status` | Enum | Default: `pending` | `pending / funding / active / completed` |
| `createdBy` | ObjectId → User | Required, Indexed | Creator reference |
| `investors` | Array | Default: `[]` | `ProjectInvestor[]` sub-documents |
| `pendingInvitations` | Array | Default: `[]` | `PendingInvitation[]` sub-documents |
| `createdAt` / `updatedAt` | Date | Auto | |

**`ProjectInvestor` sub-document:**

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId | Reference to User |
| `role` | String | `active` or `passive` |
| `investedAmount` | Number | Amount invested by this member |
| `privacySettings.isAnonymous` | Boolean | Show anonymous label instead of name |
| `privacySettings.displayName` | String | Custom anonymous display label |

### `spendings` Collection

| Field | Type | Constraints | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `amount` | Number | Required | Expense amount |
| `description` | String | Required | What this expense is for |
| `category` | Enum | Required | `Service` or `Product` |
| `paidTo` | Object | Optional | `{person?: String, place?: String}` |
| `materialType` | String | Optional | Product type name |
| `addedBy` | ObjectId → User | Required | Who submitted the spending |
| `fundedBy` | ObjectId → User | Optional | Who funded it |
| `project` | ObjectId → Project | Required, Indexed | Which project this belongs to |
| `ledger` | ObjectId → Ledger | Optional | Ledger category reference |
| `subLedger` | String | Optional | Sub-ledger label |
| `date` | String | Required | User-specified date (YYYY-MM-DD) |
| `status` | Enum | Default: `pending` | `pending / approved / rejected` |
| `approvals` | Map | Default: `{}` | `Map<userId, {user, userName, status, date}>` |
| `createdAt` / `updatedAt` | Date | Auto | |

### `ledgers` Collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Ledger display name |
| `project` | ObjectId → Project | Owning project |
| `subLedgers` | String[] | Array of sub-ledger category names |

### `notifications` Collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `title` | String | Notification title text |
| `body` | String | Notification message body |
| `payload` | Object | Contextual data (projectId, spendingId, etc.) |
| `recipient` | ObjectId → User | Target user |
| `isRead` | Boolean | Read status (default: `false`) |
| `createdAt` / `updatedAt` | Date | Auto |

### `modificationrequests` Collection

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `project` | ObjectId → Project | Which project this modifies |
| `type` | Enum | `timeline / budget / scope / other` |
| `title` | String | Short summary of the change |
| `description` | String | Full description |
| `details` | Object | Type-specific payload (new deadline, new budget, etc.) |
| `requestedBy` | ObjectId → User | Who created the request |
| `status` | Enum | `pending / approved / rejected` (default: `pending`) |
| `rejectedBy` | ObjectId → User | Who performed the rejection |
| `rejectedAt` | Date | Rejection timestamp |
| `rejectionReason` | String | Free-text rejection reason |
| `votes` | Map | `Map<userId, {user, status, date}>` |
| `createdAt` / `updatedAt` | Date | Auto |

---

## 10. Authentication & Security

### Authentication Flow

```
1. User POSTs to POST /api/auth/login
        ->
2. LocalAuthGuard -> validateUser() -> bcrypt.compare(password, passwordHash)
        ->
3. On success: sign access_token (JWT, 60 min) + refresh_token (JWT, 7 days)
        ->
4. bcrypt hash of refresh_token stored in users.refreshTokenHash
        ->
5. Both tokens returned to client -> stored in AsyncStorage
        ->
6. Every API call: Authorization: Bearer <access_token>
        ->
7. On 401 response: POST /api/auth/refresh with refresh_token body
        ->
8. Server: verify JWT + bcrypt compare hash -> issue new token pair + rehash
        ->
9. On logout: refreshTokenHash cleared from DB (all sessions invalidated)
```

### Social Authentication

| Provider | Verification Method | Library |
|---|---|---|
| Google | `OAuth2Client.verifyIdToken()` validates against web, Android, and iOS client IDs | `google-auth-library` |
| Apple | `jwtVerify()` against `https://appleid.apple.com/auth/keys` (JWKS) | `jose` |

Both providers use **upsert logic**: on first social login, a new user record is created. On subsequent logins with the same provider subject ID or matching email, the existing account is linked. Google and Apple logins can be linked to the same account via email matching.

### Guards Reference

| Guard | Purpose |
|---|---|
| `JwtAuthGuard` | Validates Bearer JWT on every protected route |
| `LocalAuthGuard` | Passport local strategy for email/password login |
| `RolesGuard` | Checks `@Roles(...)` decorator metadata against `req.user.role` |
| `PermissionsGuard` | Validates specific permission string membership |

### Security Hardening

| Layer | Mechanism |
|---|---|
| HTTP Headers | `helmet()` — sets CSP, HSTS, X-Frame-Options, X-Content-Type-Options globally |
| Rate Limiting | `@nestjs/throttler`: 60 req/min global; 5 logins/60s; 3 registrations/60s; 10 votes/60s |
| Input Validation | `ValidationPipe(whitelist: true, forbidNonWhitelisted: true)` — unknown fields rejected at DTO level |
| Disposable Emails | Registration blocked for known disposable email domains (configurable list in `app-config`) |
| Role Escalation Prevention | Registration API locks role to `guest` or `investor`; escalation requires DB-level access |
| Password Storage | bcrypt v6 with default cost factor |
| Token Storage | Access and refresh tokens never returned in any API response after initial issuance |
| Token Rotation | Refresh token rehashed and rotated on every use; old hash invalidated immediately |
| Payload Limit | 1 MB maximum on JSON and URL-encoded request bodies |
| CORS | Dynamic — reads `ALLOWED_ORIGINS` env var; defaults to `https://placeholder.investflow.example` in production |

---

## 11. Core Business Flows

### 11.1 Investment Lifecycle

```
Project Created (status: pending)
           ->
   Funding Opens (status: funding)
   Investors join via invitation or direct add
   raisedAmount accumulates as members join
           ->
   Project Active (status: active)
   Expenditures begin -> spendings require democratic approval
   Modifications require member voting
   Valuation updates tracked in valuationHistory array
           ->
   Project Completed (status: completed)
   Final return calculations available via performance-metrics
   Quarterly reports accessible for all members
   Historical data preserved for audit trail
```

### 11.2 Democratic Spending Approval

This is the central governance mechanism of INVESTFLOW. No single person can approve their own spending unilaterally — it requires member consensus.

```
Member submits spending (amount, description, category, ledger, date)
                                 ->
Spending created with status: "pending"
                                 ->
All active project members receive push notification + in-app notification
                                 ->
Each member opens the spending detail in their Approvals tab
                                 ->
Member casts vote -> "approved" or "rejected"
Vote stored in Map<userId, {status, date, userName}>
                                 ->
Exception: sole investor project -> auto-approved immediately
                                 ->
Majority threshold reached:
         - Approved: status becomes "approved"
                 Appears in all members' DailyExpenses and ExpenseAnalytics
         - Rejected: status becomes "rejected"
                 Permanently recorded in audit trail with all votes
                                 ->
Frontend voting progress bar updates in real time
```

### 11.3 Modification / Change Request Flow

```
Project admin creates modification request
(type: timeline / budget / scope / other, title, description, details)
                                                        ->
Modification stored with status: "pending"
All project members notified
                                                        ->
Members review in ApprovalsScreen -> ProjectApprovalDetailScreen
Each member votes: approve or reject + optional reason
Votes stored in Map<userId, {status, date}>
                                                        ->
Threshold reached:
         - Approved: project parameters updated, status: "approved"
         - Rejected: rejectedBy, rejectedAt, rejectionReason stored
                 status: "rejected" -> permanent record kept
```

### 11.4 Quarterly Reporting

Quarterly reports are linked to individual investments and listed via `GET /api/investments/reports`. Each report covers:
- Fiscal year and quarter (Q1–Q4)
- Publication date
- Portfolio growth percentage
- Returns and dividends figures
- Performance highlights

Reports are downloadable via `GET /api/investments/reports/:reportId/download?format=html`. The frontend's `ReportsScreen` provides a card list of all available reports with tap-to-view and native share sheet integration.

---

## 12. Data Export & Reporting

INVESTFLOW provides four export formats across two export surfaces — personal expenses and project-level data:

| Format | Description | Best For |
|---|---|---|
| **CSV** | Standard comma-separated values | Spreadsheet import (Excel, Google Sheets), accounting software |
| **XLSX** | ExcelJS multi-sheet workbook — Sheet 1: Summary, Sheet 2: Expense line items with column formatting | Professional reporting, fund accounting, archiving |
| **JSON** | Complete structured data backup | Data portability, developer use, import/restore scenarios |
| **HTML** | Styled printable report with tables and branding | Email reports, document printing, stakeholder sharing |

**Export endpoints:**
- Personal expenses export: `GET /api/finance/export?format=csv|xlsx|json|html`
- Project data export: `GET /api/projects/:id/export?format=xlsx|csv`

The frontend `ExpenseAnalyticsScreen` provides export action buttons that call the relevant endpoint, save the file locally via `react-native-fs`, and trigger the native OS share sheet via `react-native-share`.

---

## 13. Notifications System

INVESTFLOW has a two-layer notification architecture:

### In-App Notifications

Every relevant event creates a `Notification` document in MongoDB targeting the recipient. These are surfaced in `NotificationScreen`. The header displays an unread badge count. Users can:
- Mark a single notification as read — `POST /api/notifications/:id/read`
- Mark all notifications as read — `POST /api/notifications/read-all`
- Delete individual notifications — `DELETE /api/notifications/:id`

### Push Notifications

The `NotificationService` initialises Expo push notification listeners on app start. When users register a push token via `POST /api/users/push-token`, it is stored in the user document.

On key backend events, the server calls the **Expo Push Notification API** with the recipient's stored token:

| Trigger Event | Recipients Notified |
|---|---|
| Spending submitted | All active project members (vote request) |
| Vote received on a spending | Spending submitter |
| Spending approved/rejected | All project members |
| Modification request created | All project members |
| Announcement posted | All platform users |

---

## 14. Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.75.5 | Core mobile framework (bare workflow) |
| React | 18.3.1 | UI component library |
| React Navigation | 7.x | Navigation (`createNativeStackNavigator`) |
| Axios | ^1.13.5 | HTTP client with request/response interceptors |
| AsyncStorage | 2.2.0 | Secure JWT token persistence on device |
| React Native Linear Gradient | ^2.8.3 | Gradient background UI elements |
| React Native Vector Icons | ^10.3.0 | Icon sets (Ionicons, MaterialCommunityIcons) |
| React Native Share | ^12.2.0 | Native OS share sheet for export files |
| React Native FS | ^2.20.0 | File system read/write for export file handling |
| React Native Safe Area Context | ^5.6.2 | Camera notch and status bar safe area support |
| React Native Biometrics | ^3.0.1 | Biometric authentication dependency (stubbed) |
| PropTypes | ^15.8.1 | Runtime prop type validation in development |
| Jest | ^30.x | Unit test runner |
| @testing-library/react-native | ^11.x | Component testing utilities |
| Detox | Not configured in root package | Mobile E2E testing framework |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| NestJS | ^11.0.1 | Server application framework |
| TypeScript | ^5.7.3 | Type-safe development |
| Node.js | LTS | JavaScript runtime |
| MongoDB | Latest | NoSQL document database |
| Mongoose | ^9.2.0 | MongoDB Object Document Mapper |
| @nestjs/mongoose | ^11.0.4 | Mongoose/NestJS integration module |
| Passport | ^0.7.0 | Authentication middleware |
| passport-local | ^1.0.0 | Email/password authentication strategy |
| passport-jwt | ^4.0.1 | JWT bearer token authentication strategy |
| @nestjs/jwt | ^11.0.2 | JWT signing and verification |
| bcrypt | ^6.0.0 | Password and refresh token hashing |
| google-auth-library | ^10.5.0 | Google OAuth 2.0 ID token verification |
| jose | ^6.1.3 | Apple Sign In JWKS-based JWT verification |
| ExcelJS | ^4.4.0 | Multi-sheet XLSX workbook generation |
| @nestjs/throttler | ^6.5.0 | Rate limiting middleware |
| helmet | ^8.1.0 | HTTP security header management |
| class-validator | ^0.14.3 | DTO property validation decorators |
| class-transformer | ^0.5.1 | DTO serialisation and transformation |
| Multer | via @nestjs/platform-express | Multipart file upload handling |
| Jest | ^30.x | Unit test runner |
| Supertest | ^7.x | HTTP integration and E2E testing |

---

## 15. Project Structure

```
Split_flow_final_prod/
|
+-- App.js                       -- React Native entry point (navigation root)
+-- index.js                     -- RN application bootstrap
+-- package.json                 -- Frontend dependencies
+-- metro.config.js              -- Metro bundler configuration
+-- babel.config.js              -- Babel transpiler configuration
+-- jsconfig.json                -- JS path aliases
+-- react-native.config.js       -- RN native dependencies config
|
+-- src/
|   +-- screens/
|   |   +-- LoginScreen.js
|   |   +-- SignUpScreen.js
|   |   +-- onboarding/
|   |   |   +-- OnboardingScreen.js
|   |   +-- investor/
|   |   |   +-- InvestorDashboard.js
|   |   |   +-- ProjectDetailScreen.js
|   |   |   +-- CreateProjectInvestorScreen.js
|   |   |   +-- ManageProjectInvestorsScreen.js
|   |   |   +-- ProjectApprovalDetailScreen.js
|   |   +-- client/
|   |   |   +-- ReportsScreen.js
|   |   |   +-- ApprovalsScreen.js
|   |   |   +-- PortfolioAnalyticsScreen.js
|   |   +-- admin/
|   |   |   +-- AdminDashboard.js
|   |   |   +-- CreateProjectScreen.js
|   |   |   +-- AddInvestorScreen.js
|   |   |   +-- AnnouncementsScreen.js
|   |   +-- expenses/
|   |   |   +-- DailyExpensesScreen.js
|   |   |   +-- ExpenseAnalyticsScreen.js
|   |   +-- shared/
|   |       +-- ProfileScreen.js
|   |       +-- SettingsScreen.js
|   |       +-- NotificationScreen.js
|   |
|   +-- context/
|   |   +-- AuthContext.js         -- Global auth state and session management
|   |
|   +-- services/
|   |   +-- api.js                 -- Axios client (923 lines) with interceptors
|   |   +-- notificationService.js -- Expo push notification listener
|   |
|   +-- utils/
|       +-- permissions.js         -- RBAC definitions and permission checks
|       +-- apiConfig.js           -- Multi-environment URL resolution
|       +-- dateTimeUtils.js       -- Date formatting and fiscal quarter tools
|       +-- fileExport.js          -- CSV/HTML/JSON export generators
|       +-- fileShare.js           -- Native share sheet wrapper
|       +-- validationUtils.js     -- Form validation with server-config support
|
+-- android/
|   +-- app/
|   |   +-- build.gradle           -- App ID: com.lohithms.INVESTFLOW, v1.0.3
|   +-- build.gradle
|
+-- assets/
|   +-- fonts/                     -- Custom font files
|
+-- backend/
|   +-- src/
|   |   +-- main.ts                -- NestJS bootstrap: helmet, cors, throttler, validation
|   |   +-- app.module.ts          -- Root module wiring all imports
|   |   +-- auth/                  -- JWT + Local + Google + Apple auth
|   |   +-- users/                 -- User management
|   |   +-- projects/              -- Project lifecycle and membership
|   |   +-- finance/               -- Spendings, voting, ledgers, analytics
|   |   +-- investments/           -- Portfolio, reports, performance
|   |   +-- modifications/         -- Change request voting
|   |   +-- notifications/         -- In-app + Expo push
|   |   +-- announcements/         -- Admin broadcasts
|   |   +-- admin/                 -- System KPI statistics
|   |   +-- uploads/               -- File upload via Multer
|   |   +-- legal/                 -- Privacy policy and ToS endpoints
|   |   +-- privacy/               -- Response scrubbing interceptors
|   +-- uploads/                   -- Uploaded files stored on local disk
|   +-- tsconfig.json
|   +-- package.json               -- Backend dependencies
|   +-- nest-cli.json
|
+-- Investor_app/                  -- January 2026 prototype (standalone, mock data)
+-- docs/                          -- Technical documentation
|   +-- API.md
|   +-- ANDROID_PLAYSTORE_RELEASE.md
|   +-- WINDOWS_LONG_PATH_BUILD_FIX.md
+-- e2e/                           -- Detox E2E mobile tests
+-- tests/                         -- Frontend unit tests
```

---

## 16. Environment & Configuration

### Backend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string (local or Atlas) |
| `PORT` | Optional | Server port (default: `3000`) |
| `JWT_SECRET` | Yes | Secret for signing JWT access tokens |
| `JWT_EXPIRES_IN` | Optional | Access token TTL (default: `60m`) |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing refresh tokens |
| `GOOGLE_CLIENT_ID_WEB` | For Google OAuth | Google OAuth web client ID |
| `GOOGLE_CLIENT_ID_ANDROID` | For Google OAuth | Google OAuth Android client ID |
| `GOOGLE_CLIENT_ID_IOS` | For Google OAuth | Google OAuth iOS client ID |
| `APPLE_SERVICE_ID` | For Apple Sign In | Apple Service ID (web audience) |
| `APPLE_BUNDLE_ID` | For Apple Sign In | Apple Bundle ID (iOS audience) |
| `ALLOWED_ORIGINS` | Production | Comma-separated allowed CORS origins |

### Frontend Configuration

The frontend resolves the backend base URL at runtime through `src/utils/apiConfig.js`. It generates a prioritised list of URL candidates. For development:
- `10.0.2.2:3000` — Android emulator localhost
- LAN IP — physical device on the same network
- ngrok tunnel URL — remote development

No `.env` file is required — URLs are configured as constants in `apiConfig.js`.

---

## 17. Build & Deployment

### Android Build

```bash
# Development APK
cd android && ./gradlew assembleDebug

# Release APK
cd android && ./gradlew assembleRelease

# Release AAB (Play Store format)
cd android && ./gradlew bundleRelease

# Windows helper script
generate_apk.bat
```

**Release signing configuration** — set as environment variables or in `android/keystore.properties`:

```properties
INVESTFLOW_UPLOAD_STORE_FILE=path/to/keystore.jks
INVESTFLOW_UPLOAD_STORE_PASSWORD=<password>
INVESTFLOW_UPLOAD_KEY_ALIAS=<alias>
INVESTFLOW_UPLOAD_KEY_PASSWORD=<password>
```

**App Details:**

| Property | Value |
|---|---|
| Application ID | `com.lohithms.INVESTFLOW` |
| Version Name | `1.0.3` |
| Version Code | `4` |
| JS Engine | Hermes (enabled) |
| New Architecture | `false` (legacy mode) |

For the full Play Store submission workflow, refer to [docs/ANDROID_PLAYSTORE_RELEASE.md](docs/ANDROID_PLAYSTORE_RELEASE.md).

### Backend Deployment

```bash
# Install dependencies
cd backend && npm install

# Development server (hot reload)
npm run start:dev

# Build for production
npm run build

# Production start (runs compiled dist/main.js)
npm run start:prod
```

For production, wrap the process with **PM2** or **systemd** for process management, automatic restarts, and log management. No Docker configuration or CI/CD pipeline is included in the current codebase.

---

## 18. Testing

### Backend Tests

```bash
cd backend

# Run all unit tests
npm test

# Run with test coverage report
npm run test:cov

# Run E2E tests (requires a running MongoDB instance)
npm run test:e2e
```

Test coverage exists for all service classes, all controllers, and full end-to-end request/response flows using **Jest** and **Supertest**.

### Frontend Tests

```bash
# From workspace root
npm test

# With coverage report
npm test -- --coverage
```

Uses **Jest** and **@testing-library/react-native** for component and hook testing.

### Mobile E2E Tests

```bash
# Build the app for Detox E2E
npm run test:e2e:native:build

# Run E2E test suite
npm run test:e2e:native
```

Uses **Detox** targeting `android.emu.debug`. Configuration is in `e2e/jest.config.js`. E2E test flows are in `e2e/auth-flow.e2e.js`.

---

## 19. Known Limitations & Roadmap

| Area | Current State | Future Consideration |
|---|---|---|
| File Storage | Local disk only (`./uploads/`). No cloud storage integration. | Migrate to AWS S3 or Google Cloud Storage |
| Biometrics | `react-native-biometrics` dependency present but login flow not implemented yet | Full biometric unlock and transaction signing |
| CI/CD | No pipeline configured. Manual deployment only. | GitHub Actions / Bitbucket Pipelines with automated testing |
| iOS Build | Android-first. iOS requires additional Xcode configuration and native module linkage. | Full iOS build + App Store submission |
| Docker | No containerisation provided. | Docker Compose for local dev stack and production deployment |
| New Architecture | React Native New Architecture flag is `false` (legacy renderer). | Enable once ecosystem dependencies are fully compatible |
| OAuth Credentials | Google/Apple flows are fully implemented in code — credentials must be supplied via environment variables. | Production credential provisioning guide |
| `Investor_app/` | Standalone January 2026 prototype with mock data. Not connected to the production API. | Archive or formally deprecate |

---

## 20. Demo Credentials

The following test accounts are seeded for development and demonstration:

| Role | Email | Password | Notes |
|---|---|---|---|
| Investor | `lohith@investflow.com` | `investor123` | Member of multiple projects; demonstrates voting flows |
| Investor | `rahul@investflow.com` | `investor123` | Co-investor; demonstrates voting approval chains |
| Investor | `priya@investflow.com` | `investor123` | Co-investor; demonstrates rejection flows |
| Admin | `admin@investflow.example` | `admin123` | Full admin dashboard; all system KPIs |

The `LoginScreen` includes a **Quick Debug Mode** that pre-fills these credentials for rapid role-switching during development.

> **Warning:** These credentials are for development and demonstration only. Do not use them in any production environment. Rotate passwords and remove seeded accounts before any public deployment.

---

<p align="center">
  Built with care by the INVESTFLOW Development Team
</p>

