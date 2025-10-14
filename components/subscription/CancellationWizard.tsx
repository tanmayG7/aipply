"use client";

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Frown } from 'lucide-react';
import { UserSubscription, CancellationReason } from '@/lib/types';
import RetentionOffers from './RetentionOffers';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface CancellationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onCancellationComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

export default function CancellationWizard({
  isOpen,
  onClose,
  subscription,
  onCancellationComplete,
}: CancellationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [reason, setReason] = useState<CancellationReason | ''>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [retentionOfferShown, setRetentionOfferShown] = useState(false);
  const [retentionOfferAccepted, setRetentionOfferAccepted] = useState(false);
  const [retentionOfferType, setRetentionOfferType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!reason) {
        MySwal.fire({
          icon: 'warning',
          title: 'Reason Required',
          text: 'Please select a reason for cancellation',
          background: '#1f2937',
          color: '#fff',
        });
        return;
      }
      setCurrentStep(3);
      setRetentionOfferShown(true);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleOfferAccepted = (offerType: string) => {
    setRetentionOfferAccepted(true);
    setRetentionOfferType(offerType);

    // Close wizard and refresh
    MySwal.fire({
      icon: 'success',
      title: 'Great Choice!',
      text: 'Your offer has been applied. Your cancellation has been prevented.',
      background: '#1f2937',
      color: '#fff',
    }).then(() => {
      onClose();
      onCancellationComplete();
    });
  };

  const handleFinalCancel = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('firebaseToken');

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
          reasonDetails: reasonDetails || undefined,
          cancellationType: 'end_of_period', // Default to keeping access until period ends
          retentionOfferShown,
          retentionOfferAccepted,
          retentionOfferType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await MySwal.fire({
          icon: 'success',
          title: 'Subscription Cancelled',
          html: `
            <div class="text-left space-y-2">
              <p>Your subscription has been cancelled.</p>
              <p class="text-gray-400">You'll keep premium access until <strong>${new Date(data.accessEndDate).toLocaleDateString()}</strong> (${data.remainingDays} days)</p>
              <p class="text-gray-400 text-sm mt-4">After that, you'll be moved to the free plan.</p>
            </div>
          `,
          background: '#1f2937',
          color: '#fff',
        });

        onClose();
        onCancellationComplete();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Cancellation Failed',
        text: error.message || 'An error occurred',
        background: '#1f2937',
        color: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Frown className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                We're Sorry to See You Go
              </h2>
              <p className="text-gray-400">
                Are you sure you want to cancel your premium subscription?
              </p>
            </div>

            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-red-200">
                  <p className="font-semibold">You'll lose access to:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-300">
                    <li>Automatic job applications (up to {subscription.features.maxAutoApplyPerDay} per day)</li>
                    <li>AI Resume Builder</li>
                    <li>AI Mock Interviews</li>
                    <li>Priority Support</li>
                    <li>Advanced Analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-green-200">
                  <p className="font-semibold">You'll keep:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-300">
                    <li>Your profile and saved information</li>
                    <li>Job tracker history</li>
                    <li>Manual job applications</li>
                    <li>Basic job board access</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Keep My Subscription
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Continue to Cancel
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Help Us Improve
              </h2>
              <p className="text-gray-400">
                Please tell us why you're cancelling
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Cancellation *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as CancellationReason)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select a reason...</option>
                <option value="too_expensive">Too Expensive</option>
                <option value="not_using">Not Using the Service</option>
                <option value="found_better">Found a Better Alternative</option>
                <option value="technical_issues">Technical Issues</option>
                <option value="missing_features">Missing Features</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                rows={4}
                placeholder="Tell us more about your experience..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!reason}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <RetentionOffers
            subscription={subscription}
            onOfferAccepted={handleOfferAccepted}
            onSkip={handleNext}
          />
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Final Confirmation
              </h2>
              <p className="text-gray-400">
                You're about to cancel your premium subscription
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {subscription.planTier} - {subscription.planType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Price</p>
                <p className="text-lg font-semibold text-white">
                  ₹{subscription.planPrice}/{subscription.planType}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Your Premium Access Until</p>
                <p className="text-lg font-semibold text-green-400">
                  {new Date(subscription.renewalDate || subscription.nextBillingDate || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">What Happens Next?</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You'll keep premium access until your current billing period ends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>No more charges will be made to your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>After that, you'll be moved to the free plan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>You can reactivate anytime</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleFinalCancel}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-sm font-medium text-gray-400">
              Step {currentStep} of 4
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-2">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
