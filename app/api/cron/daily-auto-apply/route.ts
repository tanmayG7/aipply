
  async function handleCronJob(req: Request) {
    console.log("====================================");
    console.log("🟢 Daily auto-apply cron job triggered");
    console.log("Time:", new Date().toISOString());
    console.log("====================================");

    const body = await req.json().catch(() => ({}));
    console.log("Request body received:", body);

    console.log("✅ Authorization verified");

    try {
      // Get all users with active premium subscriptions
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

      // Process users in smaller batches with delays
      const batchSize = 2;
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const allResults = [];
      let totalSuccessful = 0;
      let totalFailed = 0;
      let totalApplications = 0;

      console.log(`🚀 Processing ${userIds.length} users in batches of ${batchSize}...`);

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchNumber = Math.floor(i/batchSize) + 1;
        const totalBatches = Math.ceil(userIds.length/batchSize);

        console.log(`🚀 Processing batch ${batchNumber}/${totalBatches} with ${batch.length} users...`);

        try {
          const batchResponse = await fetch(`${API_URL}/api/auto-apply/daily`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userIds: batch, testMode: false }),
            signal: AbortSignal.timeout(120000), // 2 minutes per batch
          });

          if (!batchResponse.ok) {
            const errorText = await batchResponse.text();
            console.error(`❌ Batch ${batchNumber} failed:`, errorText);
            totalFailed += batch.length;
          } else {
            const batchResult = await batchResponse.json();
            console.log(`✅ Batch ${batchNumber} completed:`, {
              processedUsers: batchResult.processedUsers,
              successfulUsers: batchResult.successfulUsers,
              applications: batchResult.summary?.totalApplications || 0
            });

            allResults.push(batchResult);
            totalSuccessful += batchResult.successfulUsers || 0;
            totalFailed += batchResult.failedUsers || 0;
            totalApplications += batchResult.summary?.totalApplications || 0;
          }

        } catch (error) {
          console.error(`❌ Batch ${batchNumber} error:`, error);
          totalFailed += batch.length;
        }

        // Wait between batches (except for the last batch)
        if (i + batchSize < userIds.length) {
          console.log("⏳ Waiting 30 seconds before next batch...");
          await delay(30000);
        }
      }

      // Prepare final summary
      const finalSummary = {
        message: "Daily auto-apply cron job completed successfully",
        cronJobStarted: new Date().toISOString(),
        subscriptionsFound: subscriptionsSnapshot.size,
        validUserIds: userIds.length,
        invalidSubscriptions: invalidSubscriptions.length,
        batchProcessingResult: {
          totalUsers: userIds.length,
          processedUsers: totalSuccessful + totalFailed,
          successfulUsers: totalSuccessful,
          failedUsers: totalFailed,
          totalApplications: totalApplications,
          batchesProcessed: allResults.length,
        },
        processingTime: {
          started: new Date().toISOString(),
          completed: new Date().toISOString(),
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
