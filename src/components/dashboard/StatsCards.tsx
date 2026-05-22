import React from "react";
import { FileText, MessageSquare, BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsProps {
  totalForms: number;
  totalResponses: number;
  aiAnalyzed: number;
}

export function StatsCards({ totalForms, totalResponses, aiAnalyzed }: StatsProps) {
  const stats = [
    {
      label: "Total Forms",
      value: totalForms,
      icon: FileText,
    },
    {
      label: "Total Submissions",
      value: totalResponses,
      icon: MessageSquare,
    },
    {
      label: "AI Insights Generated",
      value: aiAnalyzed,
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="group relative overflow-hidden border-none bg-gradient-to-br from-blue-600/90 via-sky-500/95 to-sky-400/90 p-3.5 text-white shadow-md shadow-blue-500/[0.08] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/20"
          >
            {/* Highlight glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-inner">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-blue-50 uppercase tracking-wider block">{stat.label}</span>
                <span className="text-2xl font-extrabold tracking-tight text-white block mt-0.5">{stat.value}</span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
