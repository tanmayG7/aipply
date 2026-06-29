"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig/firebaseConfig';
import {
  createUserSubscription,
  getUserSubscription,
  canUseFeature,
  incrementAutoApplyUsage,
  getSubscriptionStatusWithWarnings,
  updateUserSubscription
} from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserSubscription } from '@/lib/types';

interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
}

export default function TestSubscription() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const log = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testCreateSubscription = async () => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log("🔄 Creating subscription for user...");
      const newSubscription = await createUserSubscription(user.uid);
      setSubscription(newSubscription);
      log("✅ Subscription created successfully!");
      log(`📊 Status: ${newSubscription.subscriptionStatus}, Tier: ${newSubscription.planTier}`);
    } catch (error: unknown) {
      log(`❌ Error creating subscription: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testGetSubscription = async () => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log("🔄 Getting user subscription...");
      const userSubscription = await getUserSubscription(user.uid);
      setSubscription(userSubscription);
      log("✅ Subscription retrieved successfully!");
      log(`📊 Status: ${userSubscription.subscriptionStatus}`);
      log(`💼 Features: Auto-apply: ${userSubscription.features.autoApply}, AI Resume: ${userSubscription.features.aiResumeBuilder}`);
      log(`📈 Usage: Today: ${userSubscription.usage.autoApplyToday}/${userSubscription.features.maxAutoApplyPerDay}`);
    } catch (error: unknown) {
      log(`❌ Error getting subscription: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testFeatureAccess = async (feature: string) => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log(`🔄 Testing feature access: ${feature}`);
      const access = await canUseFeature(user.uid, feature as "autoApply" | "aiResumeBuilder") as FeatureAccessResult;
      log(`✅ Feature test result: ${access.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
      if (!access.allowed && access.reason) log(`📝 Reason: ${access.reason}`);
    } catch (error: unknown) {
      log(`❌ Error testing feature: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testAutoApplyUsage = async () => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log("🔄 Testing auto-apply usage increment...");
      const success = await incrementAutoApplyUsage(user.uid);
      log(`✅ Auto-apply usage result: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
      const updatedSubscription = await getUserSubscription(user.uid);
      setSubscription(updatedSubscription);
      log(`📈 Updated usage: ${updatedSubscription.usage.autoApplyToday}/${updatedSubscription.features.maxAutoApplyPerDay}`);
    } catch (error: unknown) {
      log(`❌ Error testing auto-apply: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testStatusWithWarnings = async () => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log("🔄 Getting subscription status with warnings...");
      const statusInfo = await getSubscriptionStatusWithWarnings(user.uid);
      log(`✅ Effective Status: ${statusInfo.effectiveStatus}`);
      if (statusInfo.warnings.length > 0) statusInfo.warnings.forEach(warning => log(`⚠️ Warning: ${warning}`));
      else log("✅ No warnings");
    } catch (error: unknown) {
      log(`❌ Error getting status: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  const testUpgradeToPremium = async () => {
    if (!user) { log("❌ No user logged in"); return; }
    setLoading(true);
    try {
      log("🔄 Upgrading user to premium plan...");
      const currentSub = await getUserSubscription(user.uid);
      log(`📊 Current status: ${currentSub.subscriptionStatus}, tier: ${currentSub.planTier}`);
      if (currentSub.planTier === 'premium') { log("⚠️ User is already on premium plan"); setLoading(false); return; }
      const now = new Date();
      const renewalDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      const premiumUpdates = {
        subscriptionStatus: 'premium' as const, planType: 'monthly' as const, planTier: 'premium' as const,
        razorpaySubscriptionId: `test_sub_${Date.now()}`, razorpayCustomerId: `test_cust_${user.uid}`,
        razorpayPlanId: 'plan_Qpq8Ccn726wjfX', subscriptionStartDate: now.toISOString(),
        renewalDate: renewalDate.toISOString(), lastPaymentDate: now.toISOString(),
        nextBillingDate: renewalDate.toISOString(), planPrice: 666, planCurrency: 'INR' as const,
        features: { autoApply: true, unlimitedJobListings: true, aiResumeBuilder: true, aiMockInterviews: true, prioritySupport: true, maxAutoApplyPerDay: 20, maxAutoApplyPerMonth: 600, hasManualApply: true }
      };
      await updateUserSubscription(user.uid, premiumUpdates);
      log("✅ Successfully upgraded to premium plan!");
      log(`📅 Subscription valid until: ${renewalDate.toLocaleDateString()}`);
      const updatedSubscription = await getUserSubscription(user.uid);
      setSubscription(updatedSubscription);
    } catch (error: unknown) {
      log(`❌ Error upgrading subscription: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Subscription System Test</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p>❌ Please log in to test the subscription system</p>
            <p className="text-sm text-gray-400 mt-2">Go to /dashboard/onboarding/login to sign in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Subscription System Test</h1>
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
          <p><strong>User:</strong> {user.email}</p>
          <p><strong>UID:</strong> {user.uid}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Functions</h2>
            {[
              { label: "1. Create Subscription", fn: testCreateSubscription, color: "bg-green-600 hover:bg-green-700" },
              { label: "2. Get Subscription", fn: testGetSubscription, color: "bg-blue-600 hover:bg-blue-700" },
              { label: "3. Test Auto-Apply Access", fn: () => testFeatureAccess('autoApply'), color: "bg-purple-600 hover:bg-purple-700" },
              { label: "4. Test AI Resume Access", fn: () => testFeatureAccess('aiResumeBuilder'), color: "bg-purple-600 hover:bg-purple-700" },
              { label: "5. Increment Auto-Apply Usage", fn: testAutoApplyUsage, color: "bg-orange-600 hover:bg-orange-700" },
              { label: "6. Check Status & Warnings", fn: testStatusWithWarnings, color: "bg-yellow-600 hover:bg-yellow-700" },
            ].map(({ label, fn, color }) => (
              <button key={label} onClick={fn} disabled={loading} className={`w-full ${color} disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors`}>{label}</button>
            ))}
            <button onClick={testUpgradeToPremium} disabled={loading} className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4A9AFF] hover:to-[#5520FF] disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors font-semibold">🚀 Upgrade to Premium</button>
            <button onClick={() => setResults([])} className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">Clear Results</button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            {subscription ? (
              <div className="bg-gray-800 p-4 rounded-lg text-sm space-y-2">
                <p><strong>Status:</strong> {subscription.subscriptionStatus}</p>
                <p><strong>Tier:</strong> {subscription.planTier}</p>
                <p><strong>Auto-Apply:</strong> {subscription.features.autoApply ? '✅' : '❌'}</p>
                <p><strong>AI Resume:</strong> {subscription.features.aiResumeBuilder ? '✅' : '❌'}</p>
                <p><strong>Usage Today:</strong> {subscription.usage.autoApplyToday}/{subscription.features.maxAutoApplyPerDay}</p>
                <p><strong>Usage Month:</strong> {subscription.usage.autoApplyThisMonth}/{subscription.features.maxAutoApplyPerMonth}</p>
                <p><strong>Last Reset:</strong> {subscription.usage.lastResetDate}</p>
              </div>
            ) : <p className="text-gray-400">No subscription data loaded</p>}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-black p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
            {results.length === 0 ? <p className="text-gray-500">No test results yet. Click a test button above.</p>
              : results.map((result, index) => <div key={index} className="mb-1">{result}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
