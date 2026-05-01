/**
 * COMMUNITY OUTREACH REGISTRATION SYSTEM - BACKEND (v0.0.9)
 * Efficiency Features: Batch Sync, Delta Sync, Concurrency Locking.
 * Original Conventions: sync_tokens, patient_id.
 */

const CONFIG = {
  PATIENTS_SHEET: "patients",
  HISTORY_SHEET: "history",
  TOKENS_SHEET: "sync_tokens",
  ID_PADDING: 4,
  API_KEY: "TGLFI-SECURE-KEY-2026"
};

function doGet(e) {
  try {
    // API KEY VERIFICATION
    if (e.parameter.apiKey !== CONFIG.API_KEY) {
      return createJsonResponse({ success: false, error: "Unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const patientsSheet = ss.getSheetByName(CONFIG.PATIENTS_SHEET);
    const historySheet = ss.getSheetByName(CONFIG.HISTORY_SHEET);

    // Support for Delta Sync: If a timestamp is provided, we filter rows
    const lastSync = e.parameter.since ? new Date(e.parameter.since) : null;

    // Use getDisplayValues to preserve 0001 format
    const patientsRaw = patientsSheet.getDataRange().getDisplayValues();
    const historyRaw = historySheet.getDataRange().getDisplayValues();

    let patients = mapRows(patientsRaw);
    let history = mapRows(historyRaw);

    // If Delta Sync is requested, only return rows newer than lastSync
    if (lastSync) {
      patients = patients.filter(p => new Date(p.timestamp || 0) > lastSync);
      history = history.filter(h => new Date(h.timestamp || h.date || 0) > lastSync);
    }

    return createJsonResponse({ 
      success: true, 
      data: { patients, history },
      server_time: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const contents = JSON.parse(e.postData.contents);

    // API KEY VERIFICATION
    if (contents.apiKey !== CONFIG.API_KEY) {
      return createJsonResponse({ success: false, error: "Unauthorized" });
    }
    
    // Support for BATCH SYNC (v0.0.9 Feature)
    if (contents.action === "batch_sync" && Array.isArray(contents.payloads)) {
      const results = contents.payloads.map(payload => {
        if (payload.syncToken && isDuplicate(ss, payload.syncToken)) return { success: true, message: "Duplicate" };
        const res = processAction(ss, payload);
        if (res.success && payload.syncToken) logSyncToken(ss, payload.syncToken);
        return res;
      });
      return createJsonResponse({ success: true, results });
    }

    // Standard Single Action - Suppress duplicates only for creation actions
    const shouldCheckDuplicate = contents.action !== "updatePatient" && contents.action !== "updateHistory";
    if (shouldCheckDuplicate && contents.syncToken && isDuplicate(ss, contents.syncToken)) {
      return createJsonResponse({ success: true, message: "Duplicate suppressed" });
    }

    const result = processAction(ss, contents);
    // Only log tokens for creation actions to prevent future duplicate suppression for updates
    if (result.success && contents.syncToken && shouldCheckDuplicate) {
      logSyncToken(ss, contents.syncToken);
    }

    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function processAction(ss, data) {
  // SERVER-SIDE VALIDATION
  if (data.action === "register" || data.action === "registerAndAddService") {
    if (!data.firstName || !data.surname || !data.category) {
      return { success: false, error: "Missing required fields (firstName, surname, category)" };
    }
    return handleRegistration(ss, data);
  } else if (data.action === "addService") {
    return handleAddService(ss, data);
  } else if (data.action === "updatePatient") {
    return handleUpdatePatient(ss, data);
  } else if (data.action === "updateHistory") {
    return handleUpdateHistory(ss, data);
  }
  return { success: false, error: "Invalid action" };
}

function handleRegistration(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.PATIENTS_SHEET);
  const rows = sheet.getDataRange().getValues();
  
  let nextId;
  if (data.providedId) {
    nextId = data.providedId;
  } else {
    let maxId = 0;
    for (let i = 1; i < rows.length; i++) {
      const val = parseInt(rows[i][0], 10);
      if (!isNaN(val)) maxId = Math.max(maxId, val);
    }
    nextId = String(maxId + 1).padStart(CONFIG.ID_PADDING, '0');
  }

  const newRow = [
    "'" + nextId,
    new Date().toISOString(), // ISO Timestamp for Delta Sync
    data.firstName,
    data.surname,
    data.suffix || "",      // [NEW] Suffix (Jr., Sr., etc)
    data.birthDate,
    data.age,
    data.gender,
    data.address,
    data.contactNumber,
    data.category,
    data.bloodType || "",   // [NEW] Blood Type
    "active"                // Status
  ];
  
  sheet.appendRow(newRow);
  
  if (data.action === "registerAndAddService") {
    data.patientId = nextId;
    handleAddService(ss, data);
  }

  return { success: true, patientId: nextId };
}

function handleUpdatePatient(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.PATIENTS_SHEET);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => String(h).trim());
  const idCol = headers.indexOf("id");
  
  if (idCol === -1) return { success: false, error: "ID column not found" };

  const targetIdStr = String(data.id || data.patientId || "").replace(/^'+/, '');
  const targetIdNum = parseInt(targetIdStr, 10);
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    const currentRowIdStr = String(rows[i][idCol]).replace(/^'+/, '');
    const currentRowIdNum = parseInt(currentRowIdStr, 10);
    
    // Match by numeric value OR exact string match (fallback)
    if (currentRowIdNum === targetIdNum || currentRowIdStr === targetIdStr) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "Patient not found (ID: " + targetIdStr + ")" };

  // Map incoming data to column indexes
  const updatedRow = [...rows[rowIndex - 1]];
  
  // We only update specific fields to avoid overwriting metadata like original timestamp
  const fieldsToUpdate = [
    'firstName', 'surname', 'suffix', 'birthDate', 'age', 
    'gender', 'address', 'contactNumber', 'category', 'bloodType', 'status'
  ];

  fieldsToUpdate.forEach(field => {
    const colIndex = headers.indexOf(field);
    if (colIndex !== -1 && data[field] !== undefined) {
      updatedRow[colIndex] = data[field];
    }
  });

  // Ensure the ID column maintains its string formatting (leading zeros)
  if (idCol !== -1) {
    updatedRow[idCol] = "'" + String(updatedRow[idCol]).replace(/^'+/, '');
  }

  sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);
  return { success: true };
}

function handleAddService(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.HISTORY_SHEET);
  const logs = Array.isArray(data.logs) ? data.logs : [data];

  logs.forEach(log => {
    const pid = log.patientId || log.id;
    const row = [
      "'" + pid,
      log.eventName,
      log.date || new Date().toISOString().split('T')[0],
      log.serviceName,
      log.time || new Date().toLocaleTimeString(),
      log.remarks || "",
      log.bloodType || "",
      log.lastDonationDate || "",
      log.referredBy || "",
      log.syncToken || ""
    ];
    sheet.appendRow(row);

    // [NEW] If bloodType is provided during a Blood Letting event, update the patient record
    if (log.bloodType && log.eventName === 'Blood Letting') {
      updatePatientBloodType(ss, pid, log.bloodType);
    }
  });

  return { success: true };
}

function updatePatientBloodType(ss, patientId, bloodType) {
  const patientSheet = ss.getSheetByName(CONFIG.PATIENTS_SHEET);
  const patientsData = patientSheet.getDataRange().getValues();
  const headers = patientsData[0].map(h => String(h).trim());
  const idCol = headers.indexOf("id");
  const bloodTypeCol = headers.indexOf("bloodType");
  
  if (idCol !== -1 && bloodTypeCol !== -1) {
    const targetPid = String(patientId).replace(/^'+/, '');
    const targetPidNum = parseInt(targetPid, 10);

    for (let i = 1; i < patientsData.length; i++) {
      const rowIdStr = String(patientsData[i][idCol]).replace(/^'+/, '');
      const rowIdNum = parseInt(rowIdStr, 10);

      if (rowIdNum === targetPidNum || rowIdStr === targetPid) {
        patientSheet.getRange(i + 1, bloodTypeCol + 1).setValue(bloodType);
        return true;
      }
    }
  }
  return false;
}

function handleUpdateHistory(ss, data) {
  const sheet = ss.getSheetByName(CONFIG.HISTORY_SHEET);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0].map(h => String(h).trim());
  const tokenCol = headers.indexOf("syncToken");
  
  if (tokenCol === -1) return { success: false, error: "syncToken column not found in history" };

  const targetToken = data.syncToken;
  if (!targetToken) return { success: false, error: "Missing syncToken for update" };

  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][tokenCol]) === String(targetToken)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return { success: false, error: "History record not found" };

  const updatedRow = [...rows[rowIndex - 1]];
  const fields = ['eventName', 'date', 'serviceName', 'time', 'remarks', 'bloodType', 'lastDonationDate', 'referredBy'];

  fields.forEach(field => {
    const colIndex = headers.indexOf(field);
    if (colIndex !== -1 && data[field] !== undefined) {
      updatedRow[colIndex] = data[field];
    }
  });

  sheet.getRange(rowIndex, 1, 1, updatedRow.length).setValues([updatedRow]);

  // [NEW] If bloodType is provided during a Blood Letting event, update the patient record
  if (data.bloodType && data.eventName === 'Blood Letting') {
    let patientIdCol = headers.indexOf("patientId");
    if (patientIdCol === -1) patientIdCol = headers.indexOf("id"); // Try 'id' if 'patientId' is missing
    if (patientIdCol !== -1) {
      updatePatientBloodType(ss, updatedRow[patientIdCol], data.bloodType);
    }
  }

  return { success: true };
}

function isDuplicate(ss, token) {
  let sheet = ss.getSheetByName(CONFIG.TOKENS_SHEET);
  if (!sheet) return false;
  const values = sheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === token) return true;
  }
  return false;
}

function logSyncToken(ss, token) {
  let sheet = ss.getSheetByName(CONFIG.TOKENS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.TOKENS_SHEET);
    sheet.appendRow(["token", "timestamp"]);
  }
  sheet.appendRow([token, new Date().toISOString()]);
}

function mapRows(raw) {
  if (raw.length < 2) return [];
  const headers = raw[0].map(h => String(h).trim());
  return raw.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i];
    });
    return obj;
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
