"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  BarChart3,
  Zap,
  Star,
  CheckCircle2,
  Rocket
} from "lucide-react";
import { Icon } from "./Icon";

interface AnimatedProductShowcaseProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const flagshipFeatures = [
  {
    icon: Rocket,
    title: "AI-Powered Job Matching",
    description: "Smart algorithms find perfect job matches based on your profile",
    color: "from-blue-400 to-purple-600",
    delay: 0
  },
  {
    icon: Zap,
    title: "Auto-Apply Technology",
    description: "Apply to hundreds of jobs automatically while you sleep",
    color: "from-purple-400 to-pink-600",
    delay: 0.2
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your application success rate and optimize your strategy",
    color: "from-green-400 to-blue-500",
    delay: 0.4
  },
  {
    icon: Sparkles,
    title: "ATS Optimization",
    description: "Ensure your resume passes through any tracking system",
    color: "from-yellow-400 to-orange-500",
    delay: 0.6
  }
];

const statsData = [
  { label: "Jobs Applied", value: "10K+", iconName: "bar-chart" as const },
  { label: "Success Rate", value: "78%", iconName: "target" as const },
  { label: "Time Saved", value: "40hrs", iconName: "alarm-clock" as const },
  { label: "Interviews", value: "3x More", iconName: "briefcase" as const }
];

export const AnimatedProductShowcase: React.FC<AnimatedProductShowcaseProps> = ({
  isVisible}) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const sequence = async () => {
      // Phase 1: Show main title and subtitle
      setAnimationPhase(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Animate features one by one
      setAnimationPhase(2);
      for (let i = 0; i < flagshipFeatures.length; i++) {
        setCurrentFeature(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Phase 3: Show stats
      setAnimationPhase(3);
      setShowStats(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 4: Final call-to-action
      setAnimationPhase(4);
    };

    sequence();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#AE94FF] to-[#52A9FF] opacity-20 blur-3xl rounded-full transform scale-150"></div>
        
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-3xl p-8 md:p-12 text-center overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#AE94FF] via-transparent to-[#52A9FF] animate-pulse"></div>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 bg-white rounded-full animate-ping",
                  `top-${Math.random() * 100}% left-${Math.random() * 100}%`
                )}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              ></div>
            ))}
          </div>

          {/* Processing Indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-8 h-8 border-2 border-[#AE94FF] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#AE94FF] text-sm font-medium">Analyzing your resume...</span>
          </div>

          {/* Main Title Animation */}
          <div className={cn(
            "transition-all duration-1000 transform",
            animationPhase >= 1 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-8 scale-95"
          )}>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#AE94FF] to-[#52A9FF] bg-clip-text text-transparent mb-4">
              AiPply
            </h1>
            <p className="text-xl md:text-2xl text-[#CECFD2] mb-8 font-light">
              The Future of Job Applications
            </p>
          </div>

          {/* Features Showcase */}
          {animationPhase >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {flagshipFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                const isActive = index <= currentFeature;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "relative p-6 rounded-2xl border transition-all duration-700 transform",
                      isActive
                        ? "opacity-100 translate-y-0 scale-100 border-[#AE94FF] bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]"
                        : "opacity-30 translate-y-4 scale-95 border-[#333741] bg-[#111111]"
                    )}
                    style={{ transitionDelay: `${feature.delay}s` }}
                  >
                    {/* Feature Icon with Gradient */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto",
                      `bg-gradient-to-r ${feature.color}`,
                      isActive && "animate-pulse"
                    )}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#F5F5F6] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#CECFD2] leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Active Feature Glow */}
                    {isActive && index === currentFeature && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#AE94FF] to-[#52A9FF] opacity-20 blur-xl animate-pulse"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats Animation */}
          {animationPhase >= 3 && (
            <div className={cn(
              "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-1000",
              showStats
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            )}>
              {statsData.map((stat, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-[#333741] rounded-xl p-4 text-center hover:border-[#AE94FF] transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-2">
                    <Icon name={stat.iconName} size={32} ariaLabel={stat.label} />
                  </div>
                  <div className="text-xl font-bold text-[#AE94FF] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#CECFD2]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Final CTA */}
          {animationPhase >= 4 && (
            <div className={cn(
              "transition-all duration-1000 transform",
              "opacity-100 translate-y-0 scale-100"
            )}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-[#F5F5F6] font-medium">
                  Ready to transform your job search?
                </span>
                <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] rounded-full text-white font-medium hover:from-[#4A9FEF] hover:to-[#5323EF] transition-all duration-300 cursor-pointer">
                <CheckCircle2 className="w-5 h-5" />
                <span>Get Started with AiPply</span>
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            </div>
          )}

          {/* Floating Elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-[#AE94FF] to-[#52A9FF] rounded-full opacity-20 animate-bounce"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-[#52A9FF] to-[#AE94FF] rounded-full opacity-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};