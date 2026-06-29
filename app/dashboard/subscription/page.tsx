"use client";
import React, { useState, useEffect } from 'react';
import { auth, getUserSubscription } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { UserSubscription } from '@/lib/types';
import { Crown, CreditCard, AlertTriangle, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CancellationWizard from '@/components/subscription/CancellationWizard';
import { getMonthlyEquivalentPrice } from '@/lib/utils/retentionOffers';

const SubscriptionPage = () => {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showCancellationWizard, setShowCancellationWizard] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const subscription = await getUserSubscription(currentUser.uid);
          setUserSubscription(subscription);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          setUserSubscription(null);
        }
      } else {
        setUser(null);
        setUserSubscription(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    if (!auth) { setLoading(false); return; }
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const subscription = await getUserSubscription(currentUser.uid);
        setUserSubscription(subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setUserSubscription(null);
      }
    }
    setLoading(false);
  };

  const handleCancellationComplete = () => {
    fetchSubscriptionData();
  };

  const handleSyncSubscription = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      if (!user) throw new Error('User not authenticated');
      const token = await user.getIdToken();
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to sync subscription');
      if (data.foundActiveSubscription) {
        setSyncMessage({ type: 'success', text: `Subscription synced successfully! Your ${data.subscription.planType} plan is now active.` });
        await fetchSubscriptionData();
      } else {
        setSyncMessage({ type: 'info', text: data.message || 'No active subscription found in Razorpay.' });
      }
    } catch (error) {
      setSyncMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to sync subscription' });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'text-green-500';
      case 'expired': return 'text-red-500';
      case 'cancelled': return 'text-yellow-500';
      case 'grace_period': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'premium': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'expired': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'cancelled': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'grace_period': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020217] to-[#1a1a2e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020217] to-[#1a1a2e] flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader><CardTitle className="text-white text-center">Access Denied</CardTitle></CardHeader>
          <CardContent><p className="text-gray-400 text-center">Please log in to view your subscription details.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020217] to-[#1a1a2e] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
          </div>
          <p className="text-gray-400">Manage your AiPply Premium subscription and billing details.</p>
        </div>

        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              {getStatusIcon(userSubscription?.subscriptionStatus || 'free')}
              Current Plan Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userSubscription ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Status</p>
                    <p className={`text-lg font-semibold capitalize ${getStatusColor(userSubscription.subscriptionStatus)}`}>
                      {userSubscription.subscriptionStatus.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Plan Type</p>
                    <p className="text-white text-lg font-semibold capitalize">
                      {userSubscription.planTier} - {userSubscription.planType || 'N/A'}
                    </p>
                  </div>
                  {userSubscription.subscriptionStartDate && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Started On</p>
                      <p className="text-white text-lg">{formatDate(userSubscription.subscriptionStartDate)}</p>
                    </div>
                  )}
                  {userSubscription.nextBillingDate && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Next Billing</p>
                      <p className="text-white text-lg">{formatDate(userSubscription.nextBillingDate)}</p>
                    </div>
                  )}
                  {userSubscription.planPrice && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Amount</p>
                      <p className="text-white text-lg font-semibold">
                        ₹{userSubscription.planPrice} / {userSubscription.planType}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        (₹{getMonthlyEquivalentPrice(
                          userSubscription.planType as 'monthly' | 'quarterly' | 'yearly',
                          userSubscription.planPrice
                        )}/month)
                      </p>
                    </div>
                  )}
                </div>

                {userSubscription.subscriptionStatus === 'free' && (
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-200 mb-3">
                          <strong>Paid but not seeing your subscription?</strong> Click below to sync with Razorpay.
                        </p>
                        <Button onClick={handleSyncSubscription} disabled={syncing} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {syncing ? (<><span className="mr-2">Syncing...</span><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></>) : 'Sync Subscription'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {syncMessage && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    syncMessage.type === 'success' ? 'bg-green-900/20 border-green-700/50 text-green-200' :
                    syncMessage.type === 'error' ? 'bg-red-900/20 border-red-700/50 text-red-200' :
                    'bg-blue-900/20 border-blue-700/50 text-blue-200'
                  }`}>
                    <p className="text-sm">{syncMessage.text}</p>
                  </div>
                )}

                {userSubscription.cancelledDate && (
                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-200">
                        <strong>Subscription Cancelled</strong>
                        <p className="mt-1">
                          Cancelled on {formatDate(userSubscription.cancelledDate)}.
                          You&apos;ll keep premium access until {formatDate(userSubscription.renewalDate || userSubscription.nextBillingDate)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-lg mb-4">You&apos;re currently on the free plan</p>
                <Button onClick={() => window.open('/pricing', '_blank')} className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                  Upgrade to Premium
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {userSubscription?.subscriptionStatus === 'premium' && (
          <Card className="mb-6 bg-gradient-to-r from-purple-900/20 to-violet-900/20 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                Premium Features Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Unlimited Auto-Apply', 'AI Resume Builder', 'Priority Support', 'Advanced Analytics'].map(f => (
                  <div key={f} className="flex items-center gap-3 text-green-400">
                    <CheckCircle2 className="w-5 h-5" /><span>{f}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {userSubscription && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                Manage Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => window.open('/pricing', '_blank')} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  <ExternalLink className="w-4 h-4 mr-2" />View All Plans
                </Button>
                {userSubscription.subscriptionStatus === 'premium' && !userSubscription.cancelledDate && (
                  <Button onClick={() => setShowCancellationWizard(true)} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                    <XCircle className="w-4 h-4 mr-2" />Cancel Subscription
                  </Button>
                )}
                {userSubscription.cancelledDate && userSubscription.subscriptionStatus === 'premium' && (
                  <div className="flex-1 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <p className="text-sm text-blue-200">
                      <strong>Want to keep your subscription?</strong><br />
                      Contact support to reactivate: <a href="mailto:tanmay@aipply.io" className="text-blue-400 hover:underline">tanmay@aipply.io</a>
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-400 text-sm">
                  <strong>Need help?</strong> Contact our support team at{' '}
                  <a href="mailto:tanmay@aipply.io" className="text-purple-400 hover:underline">tanmay@aipply.io</a>{' '}
                  for subscription changes, billing questions, or technical support.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {userSubscription && (
          <CancellationWizard
            isOpen={showCancellationWizard}
            onClose={() => setShowCancellationWizard(false)}
            subscription={userSubscription}
            onCancellationComplete={handleCancellationComplete}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
