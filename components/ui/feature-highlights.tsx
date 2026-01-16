import React from "react";
import { Briefcase, LayoutDashboard, FileText, ShieldCheck } from "lucide-react";

export function FeatureHighlights() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <FeatureCard
                icon={Briefcase}
                title="Auto-Apply"
                desc="20 apps/day"
            />
            <FeatureCard
                icon={LayoutDashboard}
                title="Job Tracker"
                desc="Track apps dashboard"
            />
            <FeatureCard
                icon={FileText}
                title="ATS Checker"
                desc="Resume optimizer"
            />
            <FeatureCard
                icon={ShieldCheck}
                title="Verified Jobs"
                desc="100% Real listings"
            />
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10 group flex flex-col items-start h-full">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-semibold text-white text-sm sm:text-base leading-tight mb-1">{title}</h4>
            <p className="text-xs text-gray-400 leading-snug">{desc}</p>
        </div>
    );
}
