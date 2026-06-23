"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { getFirestore, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

interface CVOrder {
  orderId: string;
  customerDetails: {
    fullName: string;
    email: string;
  };
  payment: {
    amount: number;
    status: string;
  };
  serviceDetails: {
    price: number;
    deliveryDays: number;
  };
  status: string;
  createdAt: string;
  paidAt?: string;
}

const statusConfig = {
  payment_pending: {
    label: "Payment Pending",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    icon: Clock
  },
  paid: {
    label: "Paid - In Progress",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    icon: FileText
  },
  info_submitted: {
    label: "Info Submitted",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/30",
    icon: FileText
  },
  in_progress: {
    label: "Being Crafted",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
    icon: FileText
  },
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-500 border-green-500/30",
    icon: CheckCircle
  },
  payment_failed: {
    label: "Payment Failed",
    color: "bg-red-500/10 text-red-500 border-red-500/30",
    icon: AlertCircle
  }
};

export default function CVOrdersCard() {
  const [orders, setOrders] = useState<CVOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadCVOrders();
  }, []);

  const loadCVOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      console.log('📦 Loading CV orders for user:', user.uid);

      // Query cv_orders collection for this user
      const ordersRef = collection(firestore!, 'cv_orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const fetchedOrders: CVOrder[] = [];

      querySnapshot.forEach((doc) => {
        fetchedOrders.push({
          orderId: doc.id,
          ...doc.data()
        } as CVOrder);
      });

      console.log('✅ Loaded CV orders:', fetchedOrders.length);
      setOrders(fetchedOrders);
      setLoading(false);

    } catch (err) {
      console.error('❌ Error loading CV orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="bg-[#0F0F0F] border-[#333741] p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#AE94FF] animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-[#0F0F0F] border-[#333741] p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="bg-[#0F0F0F] border-[#333741] p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="w-12 h-12 text-[#9CA3AF] mb-4" />
          <h3 className="font-semibold text-[#F5F5F6] mb-2">No CV Orders Yet</h3>
          <p className="text-sm text-[#9CA3AF] mb-4">
            Get a professionally crafted CV to boost your job applications
          </p>
          <a href="/cv-services">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white"
            >
              Order CV Service
            </Button>
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0F0F0F] border-[#333741] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-manrope text-lg font-semibold text-[#F5F5F6]">
            Your CV Orders
          </h3>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Track your professional CV services
          </p>
        </div>
        {orders.length > 0 && (
          <a href="/cv-services">
            <Button
              size="sm"
              variant="outline"
              className="border-[#AE94FF] text-[#AE94FF] hover:bg-[#AE94FF]/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Order New
            </Button>
          </a>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.payment_pending;
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={order.orderId}
              className="bg-[#1A1A1A] border border-[#333741] rounded-lg p-4 hover:border-[#AE94FF]/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#AE94FF]" />
                    <span className="font-medium text-[#F5F5F6] text-sm">
                      Professional CV Package
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    Order ID: {order.orderId.slice(0, 20)}...
                  </p>
                </div>
                <Badge className={`${statusInfo.color} text-xs flex items-center gap-1 px-2 py-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[#9CA3AF]">Amount</p>
                  <p className="text-[#F5F5F6] font-medium">₹{order.serviceDetails.price}</p>
                </div>
                <div>
                  <p className="text-[#9CA3AF]">Order Date</p>
                  <p className="text-[#F5F5F6] font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {order.status === 'paid' && (
                <div className="mt-3 p-2 bg-[#5D29FF]/10 border border-[#5D29FF]/30 rounded text-xs text-[#AE94FF]">
                  ✉️ Check your email for the information collection form
                </div>
              )}
            </div>
          );
        })}
      </div>

      {orders.length >= 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-[#AE94FF] hover:text-[#8B7FD6] transition-colors">
            View All Orders →
          </button>
        </div>
      )}
    </Card>
  );
}
