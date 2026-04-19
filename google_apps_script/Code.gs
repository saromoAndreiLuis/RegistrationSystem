/**
 * Google Apps Script for Community Outreach Registration System
 * 
 * Instructions:
 * 1. Ensure you have two sheets (tabs) named: "Patients" and "History".
 * 2. "Patients" headers (Row 1): id, timestamp, fullName, age, gender, address, contactNumber, category, status
 * 3. "History" headers (Row 1): patientId, eventName, date, serviceName, time, remarks
 */

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const patientsSheet = doc.getSheetByName("Patients");
    const historySheet = doc.getSheetByName("History");

    if (!patientsSheet || !historySheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheets 'Patients' or 'History' not found. Please ensure both tabs exist." 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'registerPatient'; // default action

    if (action === 'registerPatient') {
      const requiredFields = ['fullName', 'age', 'gender', 'address', 'contactNumber', 'category'];
      for (let i = 0; i < requiredFields.length; i++) {
        if (!data[requiredFields[i]]) {
          return ContentService.createTextOutput(JSON.stringify({ 
            success: false, 
            error: "Missing required field: " + requiredFields[i] 
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
      
      const lastRow = patientsSheet.getLastRow();

      // If row 1 is header, subtract 1 to get actual count, then +1 for next ID
      const nextIdNum = lastRow; 

      const id = String(nextIdNum).padStart(4, '0');

      const timestamp = new Date().toISOString();
      const status = "active"; // Default status
      
      patientsSheet.appendRow([
        id,
        timestamp,
        data.fullName,
        data.age,
        data.gender,
        data.address,
        data.contactNumber,
        data.category,
        status
      ]);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        id: id,
        message: "Registration successful" 
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'addService') {
      const requiredFields = ['patientId', 'eventName', 'date', 'serviceName', 'time'];
      for (let i = 0; i < requiredFields.length; i++) {
        if (!data[requiredFields[i]]) {
          return ContentService.createTextOutput(JSON.stringify({ 
            success: false, 
            error: "Missing required field: " + requiredFields[i] 
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }

      historySheet.appendRow([
        data.patientId,
        data.eventName,
        data.date,
        data.serviceName,
        data.time,
        data.remarks || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Service logged successfully" 
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Unknown action" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const patientsSheet = doc.getSheetByName("Patients");
    const historySheet = doc.getSheetByName("History");

    if (!patientsSheet || !historySheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: "Sheets 'Patients' or 'History' not found. Please ensure both tabs exist." 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Helper to read sheet to array of objects
    const readSheet = (sheet) => {
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      if (values.length <= 1) return [];
      const headers = values[0];
      return values.slice(1).map(row => {
        const rowObject = {};
        headers.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });
    };

    const patients = readSheet(patientsSheet);
    const history = readSheet(historySheet);

    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      data: {
        patients: patients,
        history: history
      }
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
