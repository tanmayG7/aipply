
import { adminDb } from '../lib/firebaseAdmin';

async function checkLeads() {
    console.log("🔍 Checking 'leads' collection in Firestore...");

    try {
        const snapshot = await adminDb.collection('leads')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        if (snapshot.empty) {
            console.log("⚠️ No leads found in 'leads' collection.");
            return;
        }

        console.log(`✅ Found ${snapshot.size} recent lead(s):`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log("------------------------------------------------");
            console.log(`ID: ${doc.id}`);
            console.log(`Email: ${data.email}`);
            console.log(`Name: ${data.firstName} ${data.lastName}`);
            console.log(`Phone: ${data.mobileNumber}`);
            console.log(`Source: ${data.source}`);
            console.log(`Timestamp: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt}`);
            console.log("------------------------------------------------");
        });

    } catch (error) {
        console.error("❌ Error fetching leads:", error);
    } finally {
        process.exit(0);
    }
}

checkLeads();
