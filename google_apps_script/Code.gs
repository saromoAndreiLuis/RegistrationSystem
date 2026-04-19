/**
 * Google Apps Script for Community Outreach Registration System
 * 
 * Instructions:
 * 1. Create a new Google Sheet.
 * 2. Set the column headers in Row 1 exactly as follows:
 *    A1: id
 *    B1: timestamp
 *    C1: fullName
 *    D1: age
 *    E1: gender
 *    F1: address
 *    G1: contactNumber
 *    H1: category
 * 3. Go to Extensions > Apps Script.
 * 4. Paste this code into Code.gs.
 * 5. Click Deploy > New deployment.
 * 6. Select "Web app".
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone".
 * 9. Click Deploy and authorize the script.
 * 10. Copy the Web app URL and use it in the frontend.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Validate required fields
    const requiredFields = ['fullName', 'age', 'gender', 'address', 'contactNumber', 'category'];
    for (let i = 0; i < requiredFields.length; i++) {
      if (!data[requiredFields[i]]) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          error: "Missing required field: " + requiredFields[i] 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Generate UUID
    const id = Utilities.getUuid();
    
    // Current Timestamp
    const timestamp = new Date().toISOString();
    
    // STRICT ORDER: id, timestamp, fullName, age, gender, address, contactNumber, category
    sheet.appendRow([
      id,
      timestamp,
      data.fullName,
      data.age,
      data.gender,
      data.address,
      data.contactNumber,
      data.category
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight CORS requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
