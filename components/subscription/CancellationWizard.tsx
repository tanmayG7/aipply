"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle2, Frown, ChevronDown } from 'lucide-react';
import { UserSubscription, CancellationReason } from '@/lib/types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { motion, AnimatePresence } from 'framer-motion';

const MySwal = withReactContent(Swal);

// Design System Constants
const BUTTON_STYLES = {
  primary: "px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 hover:text-black transition-colors shadow-sm min-h-[44px]",
  secondary: "px-6 py-2.5 bg-gray-800 text-white border border-gray-600 rounded-lg font-medium hover:bg-gray-750 transition-colors min-h-[44px]",
  destructive: "px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 min-h-[44px]",
  ghost: "px-6 py-2.5 text-gray-100 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors min-h-[44px]"
} as const;

interface CancellationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscription;
  onCancellationComplete: () => void;
}

type Step = 1 | 2 | 3;

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

  const modalRef = useRef<HTMLDivElement>(null);

  // Keyboard Navigation (Issue #13)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modal
      if (e.key === 'Escape' && !loading) {
        onClose();
      }

      // Enter key to proceed
      if (e.key === 'Enter' && !loading) {
        if (currentStep === 1) {
          handleNext();
        } else if (currentStep === 2 && reason) {
          handleNext();
        } else if (currentStep === 3) {
          handleFinalCancel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, loading, reason]);

  // Focus Management (Issue #13)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      // Focus first element after a brief delay to ensure render is complete
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 100);
    }

    // Trap focus within modal
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, currentStep]);

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
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Close wizard immediately
        setLoading(false);
        onClose();

        // Show success modal after wizard closes (250ms for animation)
        setTimeout(async () => {
          await MySwal.fire({
            icon: 'success',
            title: 'Subscription Cancelled',
            html: `
              <div class="text-left space-y-3">
                <p class="text-white">Your subscription has been cancelled.</p>
                <p class="text-gray-300">You'll keep premium access until <strong class="text-white">${new Date(data.accessEndDate).toLocaleDateString()}</strong> (${data.remainingDays} days)</p>
                <p class="text-gray-300 text-sm mt-4">We're sorry to see you go. You can reactivate anytime by contacting support.</p>
              </div>
            `,
            background: '#1f2937',
            color: '#fff',
            confirmButtonColor: '#8b5cf6',
          });

          // Refresh subscription data after user dismisses success modal
          onCancellationComplete();
        }, 250);

        return; // Exit early to skip finally block
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

            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-red-200">
                  <p className="font-semibold">You'll lose access to:</p>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Automatic job applications (up to {subscription.features.maxAutoApplyPerDay} per day)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>AI Resume Builder</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>AI Mock Interviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Priority Support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Advanced Analytics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-green-200">
                  <p className="font-semibold">You'll keep:</p>
                  <ul className="space-y-2 mt-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Your profile and saved information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Job tracker history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Manual job applications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                      <span>Basic job board access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={onClose}
                className={BUTTON_STYLES.primary}
              >
                Keep My Subscription
              </button>
              <button
                onClick={handleNext}
                className={BUTTON_STYLES.ghost}
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
              <div className="relative">
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as CancellationReason)}
                  className="w-full px-4 py-2.5 pr-10 bg-gray-700 text-white border border-gray-500 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Select a reason...</option>
                  <option value="too_expensive">Too Expensive</option>
                  <option value="not_using">Not Using the Service</option>
                  <option value="found_better">Found a Better Alternative</option>
                  <option value="technical_issues">Technical Issues</option>
                  <option value="missing_features">Missing Features</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
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
                className="w-full px-4 py-2.5 bg-gray-700 text-white border border-gray-500 rounded-lg placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                className={BUTTON_STYLES.secondary}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!reason}
                className={`${BUTTON_STYLES.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 3:
        const accessEndDate = subscription.renewalDate || subscription.nextBillingDate;
        const isDateValid = accessEndDate && new Date(accessEndDate) > new Date();

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
                <p className="text-sm text-gray-300">Your Premium Access Until</p>
                {isDateValid ? (
                  <>
                    <p className="text-lg font-semibold text-green-400">
                      {new Date(accessEndDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })} at 11:59 PM IST
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      You'll have full access until the end of this day
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-orange-400">
                      Date Not Available
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please contact support at{' '}
                      <a href="mailto:support@aipply.io" className="text-purple-400 hover:underline">
                        support@aipply.io
                      </a>{' '}
                      for subscription details
                    </p>
                  </>
                )}
              </div>
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300 font-medium">What Happens Next?</p>
                <ul className="mt-3 space-y-2.5 text-sm text-gray-300">
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
                    <span>You can reactivate anytime by contacting support</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={loading}
                className={`${BUTTON_STYLES.secondary} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Back
              </button>
              <button
                onClick={handleFinalCancel}
                disabled={loading}
                className={`${BUTTON_STYLES.destructive} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
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
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancellation-wizard-title"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <h2 id="cancellation-wizard-title" className="sr-only">
            Subscription Cancellation Wizard - Step {currentStep} of 3
          </h2>

          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
            <div>
              <h3 className="text-sm font-medium text-gray-300">
                Step {currentStep} of 3
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              aria-label="Close cancellation wizard"
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-700/50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 sm:px-6 pt-2">
            <div
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={3}
              aria-label={`Step ${currentStep} of 3`}
              className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden relative"
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {renderStep()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
