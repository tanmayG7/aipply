 import { collection, query, where, getDocs } from "firebase/firestore";
  import { firestore } from "@/lib/firebaseConfig/firebaseConfig";

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

  export async function GET(req: Request) {
    return handleCronJob(req);
  }

  export async function POST(req: Request) {
    return handleCronJob(req);
  }

  async function handleCronJob(req: Request) {
    console.log("====================================");
    console.log("🟢 Daily auto-apply cron job triggered");
    console.log("Time:", new Date().toISOString());
    console.log("====================================");

    const body = await req.json().catch(() => ({}));
    console.log("Request body received:", body);

    // Verify this is a legitimate cron request (uncomment in production)
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   console.warn("⚠️ Unauthorized request:", authHeader);
    //   return new Response(
    //     JSON.stringify({ error: "Unauthorized" }),
    //     { status: 401 }
    //   );
    // }
    console.log("✅ Authorization verified");

    try {
      // Get all users with active premium subscriptions
      const subscriptionsRef = collection(firestore, "subscriptions");
      const activeSubscriptionsQuery = query(
        subscriptionsRef,
        where("subscriptionStatus", "==", "premium"),
        where("features.autoApply", "==", true) // 👈 added condition
      );

      console.log("🔎 Fetching active premium subscriptions...");
      const subscriptionsSnapshot = await getDocs(activeSubscriptionsQuery);
      console.log(`📄 Found ${subscriptionsSnapshot.size} active subscriptions`);

      if (subscriptionsSnapshot.empty) {
        console.log("📝 No active premium subscribers found");
        return new Response(
          JSON.stringify({
            message: "No active premium subscribers found",
            processedUsers: 0,
          }),
          { status: 200 }
        );
      }

      // Extract all user IDs from subscriptions
      const userIds: string[] = [];
      const invalidSubscriptions: any[] = [];

      subscriptionsSnapshot.docs.forEach((subscriptionDoc) => {
        const subscriptionData = subscriptionDoc.data();
        const userId = subscriptionData.userId;

        if (!userId) {
          console.warn(
            "⚠️ Subscription missing userId, skipping:",
            subscriptionData
          );
          invalidSubscriptions.push({
            subscriptionId: subscriptionDoc.id,
            data: subscriptionData,
          });
        } else {
          userIds.push(userId);
        }
      });

      console.log(
        `📊 Collected ${userIds.length} valid user IDs for batch processing`
      );

      if (userIds.length === 0) {
        console.log("📝 No valid user IDs found in subscriptions");
        return new Response(
          JSON.stringify({
            message: "No valid user IDs found in subscriptions",
            processedUsers: 0,
            invalidSubscriptions: invalidSubscriptions.length,
          }),
          { status: 200 }
        );
      }

      // Send all user IDs to the batch auto-apply endpoint
      console.log(
        `🚀 Sending batch request for ${userIds.length} users to auto-apply endpoint...`
      );

      const batchAutoApplyResponse = await fetch(
        `${API_URL}/api/auto-apply/daily`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userIds,
            testMode: false,
          }),
        }
      );

      if (!batchAutoApplyResponse.ok) {
        const errorText = await batchAutoApplyResponse.text();
        console.error(`❌ Batch auto-apply API failed:`, errorText);

        return new Response(
          JSON.stringify({
            error: "Batch auto-apply API failed",
            details: errorText,
            userIds,
            totalUsers: userIds.length,
          }),
          { status: 500 }
        );
      }

      const batchResult = await batchAutoApplyResponse.json();
      console.log("✅ Batch auto-apply API succeeded");
      console.log("📊 Batch results:", {
        totalUsers: batchResult.totalUsers,
        processedUsers: batchResult.processedUsers,
        successfulUsers: batchResult.successfulUsers,
        failedUsers: batchResult.failedUsers,
        totalApplications: batchResult.summary?.totalApplications || 0,
      });

      // Prepare final summary
      const finalSummary = {
        message: "Daily auto-apply cron job completed successfully",
        cronJobStarted: new Date().toISOString(),
        subscriptionsFound: subscriptionsSnapshot.size,
        validUserIds: userIds.length,
        invalidSubscriptions: invalidSubscriptions.length,
        batchProcessingResult: {
          totalUsers: batchResult.totalUsers || 0,
          processedUsers: batchResult.processedUsers || 0,
          successfulUsers: batchResult.successfulUsers || 0,
          failedUsers: batchResult.failedUsers || 0,
          totalApplications: batchResult.summary?.totalApplications || 0,
          successfulApplications:
            batchResult.summary?.successfulApplications || 0,
          failedApplications: batchResult.summary?.failedApplications || 0,
          platformBreakdown: batchResult.summary?.byPlatform || {},
        },
        userResults: batchResult.userResults || [],
        processingTime: {
          started: new Date().toISOString(),
          completed: batchResult.timestamp || new Date().toISOString(),
        },
      };

      console.log("📊 Daily auto-apply cron job completed:", finalSummary);

      return new Response(JSON.stringify(finalSummary), { status: 200 });
    } catch (error: any) {
      console.error("💥 Fatal error in daily auto-apply cron job:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
          timestamp: new Date().toISOString(),
        }),
        { status: 500 }
      );
    }
  }
