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

    // Standard Single Action
    if (contents.syncToken && isDuplicate(ss, contents.syncToken)) {
      return createJsonResponse({ success: true, message: "Duplicate suppressed" });
    }

    const result = processAction(ss, contents);
    if (result.success && contents.syncToken) logSyncToken(ss, contents.syncToken);

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
    data.birthDate,
    data.age,
    data.gender,
    data.address,
    data.contactNumber,
    data.category,
    "active"
  ];
  
  sheet.appendRow(newRow);
  
  if (data.action === "registerAndAddService") {
    data.patientId = nextId;
    handleAddService(ss, data);
  }

  return { success: true, patientId: nextId };
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
      new Date().toISOString() // ISO Timestamp for Delta Sync
    ];
    sheet.appendRow(row);
  });

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
  const headers = raw[0];
  return raw.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
