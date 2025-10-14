"use client";

import React, { useState } from 'react';
import { RetentionOffer, UserSubscription } from '@/lib/types';
import { calculateRetentionOffers, calculateOfferSavings } from '@/lib/utils/retentionOffers';
import { Gift, Clock, TrendingDown, Sparkles, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface RetentionOffersProps {
  subscription: UserSubscription;
  onOfferAccepted: (offerType: 'discount' | 'pause' | 'downgrade', newPlanType?: string) => void;
  onSkip: () => void;
}

export default function RetentionOffers({
  subscription,
  onOfferAccepted,
  onSkip,
}: RetentionOffersProps) {
  const [loading, setLoading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const offers = calculateRetentionOffers(subscription);

  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Gift className="w-8 h-8 text-green-500" />;
      case 'pause':
        return <Clock className="w-8 h-8 text-blue-500" />;
      case 'downgrade':
        return <TrendingDown className="w-8 h-8 text-purple-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-yellow-500" />;
    }
  };

  const handleAcceptOffer = async (offer: RetentionOffer) => {
    setSelectedOffer(offer.type);
    setLoading(true);

    try {
      const token = localStorage.getItem('firebaseToken');

      const response = await fetch('/api/subscription/retention-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          offerType: offer.type,
          newPlanType: offer.newPlanType,
          pauseMonths: offer.pauseMonths,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await MySwal.fire({
          icon: 'success',
          title: 'Offer Applied!',
          text: data.message,
          background: '#1f2937',
          color: '#fff',
        });

        onOfferAccepted(offer.type, offer.newPlanType);
      } else {
        throw new Error(data.error || 'Failed to apply offer');
      }
    } catch (error: any) {
      console.error('Error applying offer:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Failed to Apply Offer',
        text: error.message || 'An error occurred',
        background: '#1f2937',
        color: '#fff',
      });
    } finally {
      setLoading(false);
      setSelectedOffer(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-purple-600/20 rounded-full">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Wait! Special Offers Just for You
        </h2>
        <p className="text-gray-400">
          We value you as a customer. Here are some exclusive offers before you go:
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid gap-4">
        {offers.map((offer, index) => {
          const savings = calculateOfferSavings(subscription, offer.type);
          const isSelected = selectedOffer === offer.type;

          return (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getOfferIcon(offer.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {offer.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {offer.description}
                  </p>

                  {/* Savings Badge */}
                  {savings > 0 && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-400 text-sm font-medium mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save ₹{savings}</span>
                    </div>
                  )}

                  {/* Accept Button */}
                  <button
                    onClick={() => handleAcceptOffer(offer)}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-purple-700 text-white cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isSelected && loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Applying...
                      </span>
                    ) : (
                      'Accept This Offer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Button */}
      <div className="text-center pt-4">
        <button
          onClick={onSkip}
          disabled={loading}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium disabled:opacity-50"
        >
          No thanks, I still want to cancel
        </button>
      </div>
    </div>
  );
}
