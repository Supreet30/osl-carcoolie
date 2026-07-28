# Google Sheets email collection

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet (e.g. name it "OSL Car Coolie Subscribers").
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder `function myFunction() {}` code and paste in the contents of [Code.gs](Code.gs).
4. Click the disk icon (or Ctrl+S) to save. Name the project anything, e.g. "Subscribe Handler".
5. Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything.
   - Execute as: **Me**.
   - Who has access: **Anyone**.
6. Click **Deploy**. Google will ask you to authorize the script — click **Authorize access**, pick your Google account, then click **Advanced → Go to (project name) (unsafe)** → **Allow**. This warning is expected for your own unpublished script; it's calling your own sheet, nothing external.
7. Copy the **Web app URL** shown (it ends in `/exec`).
8. Paste that URL as the `GOOGLE_SCRIPT_URL` constant in [app/api/subscribe/route.js](../app/api/subscribe/route.js), then redeploy.

To read collected emails, just open the spreadsheet any time — or **File → Download → Comma Separated Values (.csv)** to export.

If you ever change the script code, you need to create a **new deployment version** (Deploy → Manage deployments → edit → New version) for the change to take effect on the existing URL. If you ever redeploy to a *new* URL instead, update the constant in `route.js` to match.
