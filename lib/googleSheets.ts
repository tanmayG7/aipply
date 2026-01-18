import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export interface LeadData {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    source?: string;
    timestamp?: string;
}

export const appendLeadToSheet = async (data: LeadData) => {
    try {
        const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const sheetId = process.env.GOOGLE_SHEET_ID;

        if (!serviceAccountEmail || !privateKey || !sheetId) {
            console.warn("⚠️ Google Sheets credentials missing. Skipping sheet append.");
            return { success: false, error: "Missing Credentials" };
        }

        const auth = new JWT({
            email: serviceAccountEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, auth);

        await doc.loadInfo(); // loads document properties and worksheets

        const sheet = doc.sheetsByIndex[0]; // use the first sheet

        // Auto-initialize headers if the sheet is new/empty
        await sheet.loadHeaderRow(); // Load existing headers
        if (sheet.headerValues.length === 0) {
            console.log("📝 Sheet is empty. Initializing headers...");
            await sheet.setHeaderRow(['FirstName', 'LastName', 'Email', 'Phone', 'Date', 'Source']);
        }

        // Append the row using the object map (now safe because headers exist)
        await sheet.addRow({
            FirstName: data.firstName,
            LastName: data.lastName,
            Email: data.email,
            Phone: `'${data.mobileNumber}`, // Apostrophe forces text format in GSheets
            Date: data.timestamp || new Date().toISOString(),
            Source: data.source || 'Offer Page'
        });

        console.log("✅ Lead added to Google Sheet");
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to append to Google Sheet:", error);
        // Don't throw, just return failure so we don't block the app
        return { success: false, error };
    }
};
