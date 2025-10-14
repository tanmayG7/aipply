"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { checkAdminRole } from '@/lib/utils/adminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/dashboard/onboarding/login');
        return;
      }

      // Check if user is admin
      const adminStatus = await checkAdminRole();

      if (!adminStatus) {
        // Not an admin, redirect to user dashboard
        router.push('/dashboard/home');
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020217] to-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020217] to-[#1a1a2e] flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="fixed w-64 h-screen">
          <AdminSidebar />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Admin Panel</h1>
            {/* Add mobile menu button here if needed */}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
