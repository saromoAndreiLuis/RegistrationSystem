# Centralized Community Outreach Registration System
## Agent-Ready System Design Document (system.md - Apps Script Version)

---

## 1. Project Definition

### 1.1 Objective
Build a web-based centralized registration system for community outreach programs using Google Sheets + Google Apps Script (no backend server) for 100% free deployment.

### 1.2 Success Criteria
- Registration submission < 2 seconds
- Supports ≥ 20 concurrent encoders
- Works on mobile devices
- Data saved reliably to Google Sheets

---

## 2. System Architecture

### 2.1 Architecture Pattern
Client (React) → Apps Script Web App → Google Sheets

### 2.2 Tech Stack (MANDATORY)

#### Frontend
- React (Vite)
- Tailwind CSS
- Axios

#### Backend Replacement
- Google Apps Script (Web App endpoint)

#### Database
- Google Sheets (single source of truth)

#### Hosting
- Frontend: Vercel / Netlify
- Backend: NOT REQUIRED

---

## 3. Core Features

### 3.1 Registration Module (CRITICAL)
Fields (STRICT):
- firstName (string)
- surname (string)
- birthDate (string - YYYY-MM-DD)
- age (number - auto-calculated)
- gender (string)
- address (string)
- contactNumber (string)
- category (string)

Requirements:
- Fast input UI
- Client-side validation
- POST request to Apps Script
- Instant success/failure feedback (Optimistic UI)

---

## 4. Apps Script API Contract

### Endpoint
POST → Web App URL

### Request Body (JSON)
{
  "firstName": "string",
  "surname": "string",
  "birthDate": "string",
  "age": number,
  "gender": "string",
  "address": "string",
  "contactNumber": "string",
  "category": "string"
}

### Response
{
  "success": true
}

---

## 5. Data Model (STRICT)

### Google Sheets Columns (ORDER MUST MATCH)
1. id
2. timestamp
3. firstName
4. surname
5. birthDate
6. age
7. gender
8. address
9. contactNumber
10. category
11. status

### Rules
- id: UUID generated in Apps Script
- timestamp: auto-generated

---

## 6. Apps Script Logic (REQUIRED BEHAVIOR)

### doPost(e)
- Parse JSON body
- Validate required fields
- Generate UUID
- Append row to sheet
- Return JSON response

### Constraints
- Must not reorder columns
- Must not skip fields

---

## 7. Frontend Structure

### Pages
- / → Registration Page
- /admin → Dashboard (optional MVP+)

### Components
- RegistrationForm
- InputField
- SubmitButton

---

## 8. Submission Flow

1. User fills form
2. Frontend validates
3. Axios POST to Apps Script URL
4. Apps Script processes data
5. Row appended to Google Sheets
6. Response returned
7. UI shows success

---

## 9. Error Handling

### Frontend
- Show "Submission failed" message
- Optional retry button

### Network Issues
- If request fails:
  - Save data to localStorage queue
  - Retry every 5–10 seconds

---

## 10. Constraints

- No paid services
- No backend server
- Must run on mobile browsers
- Must work on unstable internet

---

## 11. Non-Functional Requirements

### Performance
- Handle 20+ concurrent users

### Reliability
- Prevent duplicate submissions
- Ensure retry logic exists

### Usability
- Large input fields
- Fast typing flow

---

## 12. Development Plan (Agent Execution Order)

### Step 1: Setup Frontend
- Create React app (Vite)
- Install Axios

### Step 2: Setup Google Sheet
- Create columns (strict order)

### Step 3: Setup Apps Script
- Implement doPost(e)
- Deploy as Web App

### Step 4: Connect Frontend
- Replace API URL with Apps Script URL

### Step 5: UX Improvements
- Add dropdowns (gender/category)
- Add loading state

### Step 6: Reliability
- Implement localStorage retry queue

---

## 13. Future Enhancements

- Admin dashboard (read via Apps Script GET)
- Edit/Delete endpoints
- QR-based lookup
- Offline-first PWA

---

## 14. Notes for AI Agents

- Do NOT introduce backend servers
- Do NOT change field names
- Keep implementation simple
- Prioritize speed over complexity
- Follow column order strictly

---

## 15. Version History

### [v0.0.4] - 2026-04-20
**Aesthetics & Flow Optimization**
- **Dual UI Architecture:** Introduced Radiant (Premium) and Lite (Minimalist) modes with global toggle.
- **Registration Hierarchy:** Restructured form to follow `Service Program > Program Type > Patient Details`.
- **Conditional Logic:** Added dynamic fields for Blood Letting (Blood Type, Last Donation, Referrer).
- **Simultaneous Logging:** Backend now supports `registerAndAddService` to create patient and history records in one click.
- **Responsive Layout:** Form now uses a 2-column grid on desktop to fit entire registration on one screen without scrolling.
- **Improved Navigation:** All Back buttons now use browser history (`navigate(-1)`) instead of hardcoded paths.
- **Easter Egg:** Added a cute Lighthouse animation triggered by the heart icon in Radiant Mode.

### [v0.0.5] - 2026-04-20
**Smart Scan Registration — "Scan, Don't Type."**
- **User ID Card:** New registrations now generate a digital shareable ID card (PNG) with TGLFI branding, a QR code, and a Code-128 barcode. Users take this card to every outreach event.
- **QR Camera Scan:** A "Scan QR" button at the top of the registration form opens a live camera viewfinder. Scanning a user's QR code auto-fills and locks their record instantly.
- **USB Barcode Scanner Support:** The registration form passively listens for USB barcode scanner input at all times (no clicks required). Keystroke-timing heuristics distinguish scanner bursts from human typing.
- **User ID Search:** A manual text input in the scan bar allows registrars to type a User ID directly and press Enter to look up a returning user — a third fallback alongside QR and barcode.
- **Auto-fill & Lock:** On any successful scan or ID search, the user's details fill automatically and lock (grayed out). Only Service Program and Type remain editable — enabling a full service log in under 30 seconds.
- **Patient Cache (Offline Support):** App fetches and caches the full user list in `localStorage` on load. All scan/search lookups resolve from cache — works even when internet drops at the event.
- **Offline Queue:** Submissions made while offline are queued in `localStorage` and auto-synced when the connection restores.
- **Terminology Rename:** All UI-facing "Patient" labels renamed to "User" across the entire application (form, list, ID card, buttons, error messages).
- **Navigation Fix:** All Back buttons now use `navigate(-1)` (browser history) instead of hardcoded routes.
- **VS Code Fix:** Added `.vscode/settings.json` to suppress false-positive `@theme` CSS warnings caused by Tailwind v4.


### [v0.0.6] - 2026-04-21
**Concurrency & Integrity Hardening — "The Beta Prep."**
- **SyncToken (UUID) Generation:** Every submission now generates a unique `syncToken` the moment "Submit" is clicked. This token is persisted in the offline queue and prevents the server from creating duplicate records if a sync request is retried multiple times.
- **Queue Throttling:** Implemented a 1-second delay between sync requests in the offline queue. This manages the "burst" load on Google Apps Script when multiple devices come back online simultaneously, reducing 429 errors.
- **Server-Side Locking (Planned):** Prepared the architecture for `LockService.getPublicLock()` to ensure atomic writes during concurrent registrations.
- **ID Padding:** All IDs are now consistently padded to 4 digits (e.g., `0001`) across the UI, ID cards, and CSV exports for better alignment with outreach standards.

## App Hierarchy Documentation

```text
TGLFI SYSTEM HIERARCHY (v0.0.7)
==============================
[ROOT] App.jsx
 ├── [CONTEXTS] 
 │    ├── AppModeContext (Theme state)
 │    └── PatientCacheContext (Global Data Storage - THE HEART)
 ├── [COMPONENTS]
 │    ├── Navbar (Global Navigation & Status)
 │    └── ModeToggle (Theme Switcher)
 └── [PAGES]
      ├── / (LandingPage) -> [EasterEgg]
      ├── /register (RegistrationPage) -> [RegistrationForm] -> [Scanner/USB]
      ├── /admin (DashboardPage) -> [Quick Links]
      ├── /admin/:category (PatientList) -> [Paginated Table + Export]
      └── /admin/:category/:id (PatientDetails) -> [History Timeline + ID Card]

BACKEND
=======
Google Apps Script (Code.gs) 
 └── API: doPost (Writes) / doGet (Reads)
      └── Storage: Google Sheets [Patients | History | SyncTokens]
```

### v0.0.7 Release Notes (Caching & Performance)
- **Global Cache**: Implemented `PatientCacheContext` to store all patients and history in `localStorage`.
- **Instant Nav**: User List and User Details now load instantly from the cache.
- **Manual Refresh**: Added a refresh button to the Admin lists to force a sync with Google Sheets.
- **Improved UX**: Reduced network overhead and improved offline reliability.

### v0.0.8 Release Notes (The Power User Update)
- **Skeleton UI**: Replaced loading spinners with ghost layouts. Radiant mode features a shimmer animation, while Speed mode uses a pulse effect.
- **Keyboard Shortcuts**: Implemented global `Alt` key combinations (`Alt+N`, `Alt+D`, `Alt+R`, `Alt+F`) for lightning-fast navigation and data entry.
- **Command Toasts**: Added real-time visual feedback for keyboard commands.
- **Robust ID Matching**: Fixed profile lookup to handle leading zeros and numeric IDs correctly.
- **Improved Date Formatting**: Implemented a safety wrapper to prevent "Invalid Date" errors from appearing in the UI.

### [v0.0.9] Release Notes (Network & Security Hardening)
- **Batch Submission**: Implemented a robust batch-sync strategy for the offline queue. All queued records are now sent in a single optimized request, significantly reducing server overhead and 429 (Too Many Requests) errors.
- **Kiosk Mode Lock**: Enforced a secure full-screen interface lock. The system now requires a "Launch & Lock" initialization to prevent accidental browser navigation and ensure a focused registration environment.
- **Improved Sync Reliability**: Added a unique `syncToken` to every batch request to prevent duplicate data entries during unstable network conditions.
- **Developer Tools**: Integrated a hidden Dev Mode panel for stress-testing data synchronization and simulating network outages during beta prep.
- **Bug Fixes**: Resolved profile lookup issues where leading zeros in IDs were occasionally stripped.

### [v0.1.0] Release Notes (Analytics & Premium UI)
- **Program Dashboard**: Rebuilt the analytics hub to feature real-time overview graphs for total registrations, services logged, active programs, and database records.
- **Dual-Mode Architecture**: The Dashboard now conditionally renders completely distinct UI layouts while sharing the exact same data-processing engine.
  - **Radiant Mode**: Features a High-End SaaS aesthetic (glass panels, floating bento grids, HTML-based category progress bars, and custom background typography for trend charts). Strictly constrained to `100vh` to eliminate scrolling entirely.
  - **Lite Mode**: Retains the clean, spacious, and traditional data visualization aesthetic using full Recharts components.
- **Data Integrity Filtering**: Implemented strict validation checks in `PatientCacheContext` to automatically strip "ghost records" (empty rows) from Google Sheets, ensuring exact accuracy for dashboard metrics.
- **Timezone Logic**: Fixed dashboard metrics to use local timezone date parsing rather than strict UTC strings, ensuring "Today" and "7-Day Trend" stats reflect accurately for the user.
### [v0.1.1] Release Notes (Field Ops & Smart Demographics)
- **Zero-Delay Optimistic UI**: Registration submissions are now completely non-blocking. The UI instantly generates a local sequential ID, displays the success screen, and quietly pushes the data to a background queue, eliminating all network waiting time for staff.
- **PWA Kiosk Installation**: The system is now installable as a Progressive Web App (PWA). Launching from the tablet home screen enforces a strict standalone view, disabling the address bar and back buttons.
- **Smart Alias Search**: If staff cannot scan a QR code, they can now type an auto-generated alias (e.g. `ASAROMO2004`) directly into the search bar. The system dynamically matches this against the cache using `[First Initial] + [Surname] + [Birth Year]`.
- **Thermal Barcode Integration**: Added a "Print ID Card" button on the success screen that opens a Print Preview Modal. It includes an invisible `@media print` CSS layer that strips all UI elements and perfectly scales the barcode for thermal label printers.
- **Demographics Upgrade**: The database schema was upgraded to split "Full Name" into `firstName` and `surname`, and added a native `birthDate` picker. The `age` field is now strictly auto-calculated and locked to prevent data entry errors.
- **Live Sync Monitor**: Added a global "Live Registry Cache" pill to the dashboard and registration headers, showing the exact time of the last sync and providing a 1-click manual refresh tool.

**Author:** Andrei Saromo  
**Version:** Agent-Optimized v7 (v0.1.1 / Field Operations Ready)

---
