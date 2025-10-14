"use client";

import React from 'react';
import { Crown, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface SubscriptionWithUser {
  userId: string;
  userName: string;
  userEmail: string;
  subscriptionStatus: string;
  planType: string | null;
  planTier: string;
  planPrice: number | null;
  subscriptionStartDate: string | null;
  nextBillingDate: string | null;
  [key: string]: any; // Allow additional properties
}

interface SubscriptionTableProps {
  subscriptions: SubscriptionWithUser[];
  onViewDetails: (userId: string) => void;
}

export default function SubscriptionTable({
  subscriptions,
  onViewDetails,
}: SubscriptionTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'premium':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-yellow-500" />;
      case 'grace_period':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium':
        return 'text-green-500';
      case 'expired':
        return 'text-red-500';
      case 'cancelled':
        return 'text-yellow-500';
      case 'grace_period':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-400">No subscriptions found</h3>
        <p className="text-sm text-gray-500 mt-2">
          Try adjusting your filters or search term
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Next Billing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {subscriptions.map((subscription) => (
              <tr
                key={subscription.userId}
                className="hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {subscription.userName}
                    </div>
                    <div className="text-sm text-gray-400">{subscription.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(subscription.subscriptionStatus)}
                    <span
                      className={`text-sm font-medium capitalize ${getStatusColor(
                        subscription.subscriptionStatus
                      )}`}
                    >
                      {subscription.subscriptionStatus.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white capitalize">
                    {subscription.planTier} - {subscription.planType || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">
                    {subscription.planPrice ? `₹${subscription.planPrice}` : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatDate(subscription.subscriptionStartDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">
                    {formatDate(subscription.nextBillingDate)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onViewDetails(subscription.userId)}
                    className="text-purple-400 hover:text-purple-300 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
