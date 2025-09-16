"use client";
import React, { useState, useEffect, useRef } from "react";

interface AutoApplyStats {
  totalAutoApplied: number;
  todayAutoApplied: number;
  thisMonthAutoApplied: number;
}

interface MobileAutoApplyCarouselProps {
  stats: AutoApplyStats;
}

type StatsType = 'total' | 'today' | 'month';

const MobileAutoApplyCarousel: React.FC<MobileAutoApplyCarouselProps> = ({ stats }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<StatsType>('total');
  const [isAutoSliding, setIsAutoSliding] = useState<boolean>(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const autoSlideInterval = useRef<NodeJS.Timeout | null>(null);

  const statsData = [
    { key: 'total', label: 'Total', value: stats.totalAutoApplied },
    { key: 'today', label: 'Today', value: stats.todayAutoApplied },
    { key: 'month', label: 'This Month', value: stats.thisMonthAutoApplied }
  ];

  // Auto slide functionality
  useEffect(() => {
    if (isAutoSliding) {
      autoSlideInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % statsData.length);
      }, 2500);
    } else {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    }

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [isAutoSliding, statsData.length]);

  // Update selected type based on current index
  useEffect(() => {
    setSelectedType(statsData[currentIndex].key as StatsType);
  }, [currentIndex, statsData]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsAutoSliding(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % statsData.length);
    } else if (isRightSwipe) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? statsData.length - 1 : prevIndex - 1
      );
    }

    // Resume auto sliding after 5 seconds of inactivity
    setTimeout(() => setIsAutoSliding(true), 5000);
  };

  const handleSliderChange = (type: StatsType) => {
    const index = statsData.findIndex(item => item.key === type);
    setCurrentIndex(index);
    setSelectedType(type);
    setIsAutoSliding(false);

    // Resume auto sliding after 5 seconds of inactivity
    setTimeout(() => setIsAutoSliding(true), 5000);
  };

  return (
    <div className="flex flex-col gap-6 md:hidden w-full max-w-full overflow-hidden"> {/* Only show on mobile */}
      {/* Centered Title and Description */}
      <div className="text-center">
        <h2 className="font-inter text-[#ECECED] font-semibold text-xl mb-2">
          Auto Apply Statistics
        </h2>
        <p className="font-inter text-[#94969C] text-sm">
          Track your automated job applications performance
        </p>
      </div>

      {/* Horizontal Sliding Carousel */}
      <div className="relative w-full">
        <div
          className="overflow-hidden w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-in-out w-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {statsData.map((item, index) => (
              <div
                key={item.key}
                className="w-full flex-shrink-0 px-2"
              >
                <div className="border border-[#1F242F] bg-[#0C111D] px-4 py-8 rounded-xl relative w-full">
                  <div className="flex flex-col gap-3 items-center text-center">
                    <h3 className="text-text-sm-medium font-inter text-[#94969C]">
                      Jobs Applied
                    </h3>
                    <p className="text-display-lg-semibold font-inter text-[#F5F5F6]">
                      {item.value}
                    </p>
                  </div>
                  <div className="absolute hidden custom-md:flex top-0 m-auto left-0 right-0 w-[70%] h-[1px]">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {statsData.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#3B82F6]' : 'bg-[#94969C]/30'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Slider to Switch Between Types */}
      <div className="flex justify-center">
        <div className="flex bg-[#1F242F] rounded-lg p-1 gap-1">
          <button
            onClick={() => handleSliderChange('today')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'today'
                ? 'bg-[#3B82F6] text-white'
                : 'text-[#94969C] hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleSliderChange('total')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'total'
                ? 'bg-[#3B82F6] text-white'
                : 'text-[#94969C] hover:text-white'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => handleSliderChange('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'month'
                ? 'bg-[#3B82F6] text-white'
                : 'text-[#94969C] hover:text-white'
            }`}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAutoApplyCarousel;