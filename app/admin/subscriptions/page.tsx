"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionTable from '@/components/admin/SubscriptionTable';
import { Search, Filter } from 'lucide-react';

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
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('firebaseToken');

      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSubscriptions();
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/admin/subscriptions/${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
        <p className="text-gray-400 mt-2">View and manage all user subscriptions</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="premium">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
            <option value="grace_period">Grace Period</option>
            <option value="free">Free</option>
          </select>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Search
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total Subscriptions</p>
          <p className="text-2xl font-bold text-white mt-1">{subscriptions.length}</p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-500 mt-1">
            {subscriptions.filter((s) => s.subscriptionStatus === 'premium').length}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Cancelled</p>
          <p className="text-2xl font-bold text-yellow-500 mt-1">
            {subscriptions.filter((s) => s.subscriptionStatus === 'cancelled').length}
          </p>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400">Grace Period</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">
            {subscriptions.filter((s) => s.subscriptionStatus === 'grace_period').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <SubscriptionTable
          subscriptions={subscriptions}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
