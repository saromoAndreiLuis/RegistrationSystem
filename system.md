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
- fullName (string)
- age (number)
- gender (string)
- address (string)
- contactNumber (string)
- category (string)

Requirements:
- Fast input UI
- Client-side validation
- POST request to Apps Script
- Instant success/failure feedback

---

## 4. Apps Script API Contract

### Endpoint
POST → Web App URL

### Request Body (JSON)
{
  "fullName": "string",
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
3. fullName
4. age
5. gender
6. address
7. contactNumber
8. category

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


**Author:** Andrei Saromo  
**Version:** Agent-Optimized v3 (No Backend / Free Setup)

---

