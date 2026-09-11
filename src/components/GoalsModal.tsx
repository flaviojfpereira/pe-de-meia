import React from "react";
import { X, Target, Plus, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { MoneyGoal } from "../types";
import { formatEuro } from "../utils/calculations";

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: MoneyGoal[];
  onNavigateToPlayground: () => void;
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen,
  onClose,
  goals,
  onNavigateToPlayground,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-5" id="goals-modal">
        <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Your Money Goals</h3>
              <p className="text-xs text-[#86868b] font-medium">Tracked against your followed Main Model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-[18px] border border-[#e8e8ed] bg-[#f5f5f7] space-y-2 hover:border-[#86868b] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#1d1d1f]">{g.name}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    g.status === "on_track"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-[#1d1d1f] text-white"
                  }`}
                >
                  {g.status === "on_track" ? "On track" : "In progress"}
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Target Metric</span>
                  <span className="text-lg font-extrabold text-[#1d1d1f]">{formatEuro(g.targetValue)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Milestone Target</span>
                  <span className="text-xs font-bold text-[#1d1d1f]">{g.targetDate}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#86868b] font-medium">Overall Completion</span>
                  <span className="font-extrabold text-[#1d1d1f]">{g.currentProgressPct}%</span>
                </div>
                <div className="w-full h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1d1d1f] rounded-full transition-all"
                    style={{ width: `${g.currentProgressPct}%` }}
                  />
                </div>
              </div>

              {g.note && <p className="text-[11px] text-[#86868b] font-medium italic mt-1">{g.note}</p>}
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              onClose();
              onNavigateToPlayground();
            }}
            className="text-[#1d1d1f] hover:underline font-bold"
          >
            Simulate goal acceleration in Playground →
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#1d1d1f] text-white rounded-full font-bold hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
