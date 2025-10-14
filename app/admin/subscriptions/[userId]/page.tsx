"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserProfile, getUserSubscription } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails, UserSubscription } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Crown,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import CancelSubscriptionDialog from '@/components/admin/CancelSubscriptionDialog';

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [userProfile, setUserProfile] = useState<UserDetails | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const profile = await getUserProfile(userId);
      const sub = await getUserSubscription(userId);
      setUserProfile(profile);
      setSubscription(sub);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'premium':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'expired':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-yellow-500" />;
      case 'grace_period':
        return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!userProfile || !subscription) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">User Not Found</h2>
        <p className="text-gray-400 mt-2">The requested user could not be found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {userProfile.firstName} {userProfile.lastName}
            </h1>
            <p className="text-gray-400 mt-1">{userProfile.email}</p>
          </div>
        </div>
        {subscription.subscriptionStatus === 'premium' && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Subscription Status Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            {getStatusIcon(subscription.subscriptionStatus)}
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-lg font-semibold text-white capitalize mt-1">
                {subscription.subscriptionStatus.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Plan Type</p>
              <p className="text-lg font-semibold text-white capitalize mt-1">
                {subscription.planTier} - {subscription.planType || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Plan Price</p>
              <p className="text-lg font-semibold text-white mt-1">
                {subscription.planPrice ? `₹${subscription.planPrice}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Started On</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatDate(subscription.subscriptionStartDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Next Billing</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatDate(subscription.nextBillingDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Payment</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatDate(subscription.lastPaymentDate)}
              </p>
            </div>
          </div>

          {subscription.cancelledDate && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
              <p className="text-sm text-yellow-200">
                <strong>Cancelled Date:</strong> {formatDate(subscription.cancelledDate)}
              </p>
            </div>
          )}

          {subscription.gracePeriodEndDate && (
            <div className="mt-6 p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
              <p className="text-sm text-orange-200">
                <strong>Grace Period Ends:</strong> {formatDate(subscription.gracePeriodEndDate)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Card */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <User className="w-6 h-6" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userProfile.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{userProfile.email}</p>
                </div>
              </div>
            )}
            {userProfile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">{userProfile.phone}</p>
                </div>
              </div>
            )}
            {userProfile.whereYouBased && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{userProfile.whereYouBased}</p>
                </div>
              </div>
            )}
            {userProfile.jobTitle && (
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Job Title</p>
                  <p className="text-white">{userProfile.jobTitle}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Details */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Razorpay Subscription ID</p>
              <p className="text-white font-mono text-sm mt-1">
                {subscription.razorpaySubscriptionId || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Razorpay Customer ID</p>
              <p className="text-white font-mono text-sm mt-1">
                {subscription.razorpayCustomerId || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Razorpay Plan ID</p>
              <p className="text-white font-mono text-sm mt-1">
                {subscription.razorpayPlanId || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <CancelSubscriptionDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        userId={userId}
        userName={`${userProfile.firstName} ${userProfile.lastName}`}
        subscriptionId={subscription.razorpaySubscriptionId}
        planPrice={subscription.planPrice}
        onCancellationComplete={fetchUserData}
      />
    </div>
  );
}
