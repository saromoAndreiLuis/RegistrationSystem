# TGLFI Community Outreach Registration System - User Guide

## Introduction
Welcome to the TGLFI Centralized Community Outreach Registration System! This system is designed to be fast, reliable, and easy to use, even in areas with poor internet connectivity. 

This guide will help you understand how to use the system whether you are a member of the Registration Team on the ground or an Administrator monitoring the data.

---

## 🏃 For the Registration Team (Field Operations)

**1. Launching the System**
- **Kiosk Mode:** We recommend launching the app directly from your tablet's home screen. This enables "Kiosk Mode," locking the app in full-screen to prevent distractions, accidental closures, or navigating away.

**2. Registering a New User**
- Open the **Registration Form**.
- Fill out the required demographics: First Name, Surname, Birth Date, Gender, Address, Contact Number, and Category. 
  - *Note: Age is automatically calculated from the Birth Date and cannot be manually edited.*
- Select the **Service Program** and **Program Type** they are attending today.
- Click **Submit**.
- You will immediately see a success screen with their temporary ID. The system saves this instantly and syncs it in the background so you can move to the next person without waiting!

**3. Scanning a Returning User ("Scan, Don't Type")**
- Click the **Scan QR** button at the top of the form.
- Use the tablet camera to scan their QR code, or use a USB Barcode Scanner (the system listens for scanner input automatically).
- The user's details will auto-fill and lock. You only need to input their current Service Program and Program Type. This cuts registration time down to under 30 seconds!

**4. Searching Manually**
If scanning fails, you have two manual search fallbacks:
- **By ID:** Type the user's 4-digit ID directly into the search bar and press Enter.
- **By Alias:** Type the user's alias (First Initial + Surname + Birth Year, e.g., `JDoe1990`) into the search bar. The system will search its offline cache instantly.

**5. Printing ID Cards**
- After registering a new user, click **Print ID Card** on the success screen.
- A print preview will open that is automatically scaled and optimized for 50x30mm thermal label printers.

---

## 👔 For Administrators

**1. Dashboard Overview**
- Navigate to the **Admin Dashboard**.
- You can view real-time overview graphs for total registrations, services logged, active programs, and database records.
- **Themes:** Use the toggle to switch between **Radiant Mode** (premium glass interface, no scrolling) and **Lite Mode** (traditional, spacious data view).

**2. User Management**
- Go to the **User List** to view all registered individuals.
- Click on any row to view full **Patient Details**, including their History Timeline (all programs they've attended) and their digital ID Card.
- Data loads instantly from the cache. Click the **Refresh** button (or check the "Live Registry Cache" pill) to pull the absolute latest data from Google Sheets.

**3. Data Integrity**
- The dashboard automatically filters out any "ghost records" (empty rows) to ensure your analytics are exactly accurate. 
- All IDs are padded to 4 digits (e.g., `0001`) for consistent CSV exports.

---

## ⚡ Keyboard Shortcuts (Power Users)
If you are using a physical keyboard, use these shortcuts for lightning-fast operations:
- **`Alt + N`** : Start a New Registration
- **`Alt + D`** : Go to the Dashboard
- **`Alt + R`** : Refresh Live Data
- **`Alt + F`** : Focus the Search/Scan Bar

---

## ❓ Frequently Asked Questions (FAQs) & Scenarios

**Scenario 1: The internet dropped at our outreach site. Can we keep registering people?**
**Yes!** The system is built "offline-first." Just keep registering users. Your submissions will be queued locally on the tablet. A 1-second delay throttle ensures that when the connection comes back, the system will safely and automatically batch-sync them to the Google Sheet without crashing the server.

**Scenario 2: The camera isn't scanning the user's QR code, and we don't have a USB scanner. What do I do?**
Use the **Smart Alias Search**. In the search bar, type their alias (First Initial + Surname + Birth Year, e.g., `JDelaCruz1980`). The system has a locally cached copy of all users and will find them instantly without needing internet.

**Scenario 3: I clicked "Submit" multiple times because the app seemed stuck. Did I create duplicate records?**
**No.** Every time you click submit, the system generates a unique, hidden `syncToken`. Even if the tablet retries sending the data multiple times due to a bad connection, the server recognizes the token and only saves the data once.

**Scenario 4: The age field is locked, but it's showing the wrong age. How do I fix it?**
The age is strictly auto-calculated based on the **Birth Date** to prevent manual data entry errors. Correct the Birth Date field, and the age will update instantly.

**Scenario 5: The total registrations on the dashboard don't seem to match the Google Sheet exactly. Why?**
First, look at the "Live Registry Cache" pill to see the exact time your dashboard last synced. Click it to refresh. If numbers still vary slightly, it's because the dashboard's strict data integrity filters automatically ignore empty rows or corrupted entries in the Google Sheet. 

**Scenario 6: How do I make sure the ID card prints correctly on our thermal printer?**
Click **Print ID Card** on the success screen. The system uses an invisible CSS layer that automatically strips away UI elements and fits the barcode perfectly onto standard thermal labels. Do not use the browser's default `Ctrl+P` on the regular form!
