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

**Author:** Andrei Saromo  
**Version:** Agent-Optimized v3 (No Backend / Free Setup)
