"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Crown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  gracePeriodSubscriptions: number;
  monthlyRecurringRevenue: number;
  newSubscriptionsToday: number;
  cancellationsToday: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    cancelledSubscriptions: 0,
    expiredSubscriptions: 0,
    gracePeriodSubscriptions: 0,
    monthlyRecurringRevenue: 0,
    newSubscriptionsToday: 0,
    cancellationsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get Firebase token
      const token = localStorage.getItem('firebaseToken');

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    color: string;
  }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">Welcome to the AiPply Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="All registered users"
          color="text-blue-500"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={Crown}
          description="Premium subscribers"
          color="text-green-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRecurringRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="MRR this month"
          color="text-yellow-500"
        />
        <StatCard
          title="Grace Period"
          value={stats.gracePeriodSubscriptions}
          icon={AlertTriangle}
          description="Expiring soon"
          color="text-orange-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="New Today"
          value={stats.newSubscriptionsToday}
          icon={TrendingUp}
          description="New subscriptions today"
          color="text-green-400"
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelledSubscriptions}
          icon={AlertTriangle}
          description="Total cancelled"
          color="text-red-400"
        />
        <StatCard
          title="Expired"
          value={stats.expiredSubscriptions}
          icon={Calendar}
          description="Total expired"
          color="text-gray-400"
        />
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your subscription platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/admin/subscriptions"
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div>
                <h3 className="font-medium text-white">View All Subscriptions</h3>
                <p className="text-sm text-gray-400">Manage user subscriptions</p>
              </div>
              <Crown className="h-5 w-5 text-purple-500" />
            </a>
            <a
              href="/admin/analytics"
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <div>
                <h3 className="font-medium text-white">View Analytics</h3>
                <p className="text-sm text-gray-400">Revenue and churn metrics</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
