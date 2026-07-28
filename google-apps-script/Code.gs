// Paste this into Extensions > Apps Script on your Google Sheet, then deploy
// as a Web App (Execute as: Me, Who has access: Anyone). See README.md in
// this folder for the full step-by-step.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Subscribers");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Subscribers");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Email", "Submitted At"]);
  }

  var data = JSON.parse(e.postData.contents);
  var email = data.email;

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailPattern.test(email)) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid email" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([email, new Date().toISOString()]);

  return ContentService.createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
