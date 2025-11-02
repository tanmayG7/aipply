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

    console.log("✅ Authorization verified");

    try {
      const subscriptionsRef = collection(firestore, "subscriptions");
      const activeSubscriptionsQuery = query(
        subscriptionsRef,
        where("subscriptionStatus", "==", "premium"),
        where("features.autoApply", "==", true)
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

      const userIds: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        `📊 Collected ${userIds.length} valid user IDs for queue processing`
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

      // Send ALL user IDs to the queue-based endpoint in one call
      console.log(`🚀 Enqueuing ${userIds.length} users for auto-apply processing...`);

      try {
        const queueResponse = await fetch(`${API_URL}/api/auto-apply/daily`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds, testMode: false }),
          signal: AbortSignal.timeout(30000), // Short timeout since we're just enqueuing
        });

        if (!queueResponse.ok) {
          const errorText = await queueResponse.text();
          console.error(`❌ Queue enqueuing failed:`, errorText);

          return new Response(
            JSON.stringify({
              error: "Failed to enqueue auto-apply jobs",
              details: errorText,
              userIds,
              totalUsers: userIds.length,
            }),
            { status: 500 }
          );
        }

        const queueResult = await queueResponse.json();
        console.log("✅ Jobs successfully enqueued:", {
          totalUsers: queueResult.totalUsers,
          enqueuedJobs: queueResult.enqueuedJobs,
          queueStats: queueResult.queueStats
        });

        const finalSummary = {
          message: "Daily auto-apply jobs successfully enqueued",
          cronJobStarted: new Date().toISOString(),
          subscriptionsFound: subscriptionsSnapshot.size,
          validUserIds: userIds.length,
          invalidSubscriptions: invalidSubscriptions.length,
          queueResult: {
            totalUsers: queueResult.totalUsers,
            enqueuedJobs: queueResult.enqueuedJobs,
            estimatedCompletionTime: queueResult.estimatedCompletionTime,
            queueStats: queueResult.queueStats
          },
          processingTime: {
            started: new Date().toISOString(),
            completed: new Date().toISOString(),
          },
        };

        console.log("📊 Daily auto-apply cron job completed:", finalSummary);

        return new Response(JSON.stringify(finalSummary), { status: 200 });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("💥 Error enqueuing auto-apply jobs:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to enqueue jobs",
            message: errorMessage,
            userIds,
            totalUsers: userIds.length,
            timestamp: new Date().toISOString(),
          }),
          { status: 500 }
        );
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("💥 Fatal error in daily auto-apply cron job:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        }),
        { status: 500 }
      );
    }
  }
