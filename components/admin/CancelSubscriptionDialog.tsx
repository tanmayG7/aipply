"use client";

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface CancelSubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  subscriptionId: string | null;
  planPrice: number | null;
  onCancellationComplete: () => void;
}

export default function CancelSubscriptionDialog({
  isOpen,
  onClose,
  userId,
  userName,
  subscriptionId,
  planPrice,
  onCancellationComplete,
}: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [cancellationType, setCancellationType] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [issueRefund, setIssueRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(planPrice || 0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCancel = async () => {
    if (!reason) {
      MySwal.fire({
        icon: 'error',
        title: 'Cancellation Reason Required',
        text: 'Please select a reason for cancellation',
        background: '#1f2937',
        color: '#fff',
      });
      return;
    }

    // Confirmation dialog
    const result = await MySwal.fire({
      title: 'Confirm Cancellation',
      html: `
        <div class="text-left space-y-2">
          <p>You are about to cancel the subscription for <strong>${userName}</strong></p>
          <ul class="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>Type: <strong>${cancellationType === 'immediate' ? 'Immediate' : 'End of Billing Period'}</strong></li>
            <li>Refund: <strong>${issueRefund ? `Yes (₹${refundAmount})` : 'No'}</strong></li>
            <li>Reason: <strong>${reason}</strong></li>
          </ul>
          <p class="text-yellow-400 mt-4 text-sm">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Subscription',
      cancelButtonText: 'No, Go Back',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      background: '#1f2937',
      color: '#fff',
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('firebaseToken');

      const response = await fetch('/api/admin/subscriptions/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          reason,
          reasonDetails: reasonDetails || undefined,
          cancellationType,
          issueRefund,
          refundAmount: issueRefund ? refundAmount : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await MySwal.fire({
          icon: 'success',
          title: 'Subscription Cancelled',
          text: `Subscription cancelled successfully${data.refundIssued ? ` with refund of ₹${data.refundAmount}` : ''}`,
          background: '#1f2937',
          color: '#fff',
        });

        onCancellationComplete();
        onClose();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: error.message || 'An error occurred while cancelling the subscription',
        background: '#1f2937',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Cancel Subscription</h2>
            <p className="text-gray-400 text-sm mt-1">User: {userName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <strong>Warning:</strong> This action will cancel the user's premium subscription.
              Please ensure you understand the implications before proceeding.
            </div>
          </div>

          {/* Cancellation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cancellation Type *
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650">
                <input
                  type="radio"
                  name="cancellationType"
                  value="end_of_period"
                  checked={cancellationType === 'end_of_period'}
                  onChange={(e) => setCancellationType(e.target.value as 'end_of_period')}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">End of Billing Period</div>
                  <div className="text-sm text-gray-400">
                    User keeps access until the end of their paid period
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-650">
                <input
                  type="radio"
                  name="cancellationType"
                  value="immediate"
                  checked={cancellationType === 'immediate'}
                  onChange={(e) => setCancellationType(e.target.value as 'immediate')}
                  className="w-4 h-4 text-purple-600"
                />
                <div>
                  <div className="text-white font-medium">Immediate</div>
                  <div className="text-sm text-gray-400">
                    Subscription cancelled immediately, access revoked now
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cancellation Reason *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a reason...</option>
              <option value="too_expensive">Too Expensive</option>
              <option value="not_using">Not Using the Service</option>
              <option value="found_better">Found Better Alternative</option>
              <option value="technical_issues">Technical Issues</option>
              <option value="missing_features">Missing Features</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Reason Details */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="Enter any additional details about the cancellation..."
            />
          </div>

          {/* Refund Section */}
          <div className="border-t border-gray-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={issueRefund}
                onChange={(e) => setIssueRefund(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <span className="text-white font-medium">Issue Refund</span>
            </label>

            {issueRefund && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Refund Amount (₹)
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  min="0"
                  max={planPrice || 0}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Maximum refundable: ₹{planPrice || 0}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCancel}
            disabled={loading || !reason}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}
