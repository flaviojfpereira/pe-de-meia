import React from "react";
import { X, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";
import { GroundingData } from "../types";

interface GroundingDrawerProps {
  data: GroundingData | null;
  onClose: () => void;
}

export const GroundingDrawer: React.FC<GroundingDrawerProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1d1d1f]/40 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e8e8ed] overflow-y-auto"
        id="grounding-drawer"
      >
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#e8e8ed]">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1d1d1f] tracking-tight">Calculation Grounding</h3>
                <p className="text-xs text-[#86868b] font-medium">Transparent derivation & methodology</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-grounding-drawer-btn"
              className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Value Card */}
          <div className="mt-6 p-5 rounded-[20px] bg-[#f5f5f7] border border-[#e8e8ed]">
            <div className="text-label">{data.metricName}</div>
            <div className="text-3xl font-extrabold text-[#1d1d1f] mt-1 tracking-tight">{data.primaryValue}</div>
            <p className="text-xs text-[#86868b] font-medium mt-1">{data.title}</p>
          </div>

          {/* Formula */}
          <div className="mt-6">
            <h4 className="text-label mb-2">Formula</h4>
            <div className="p-4 rounded-xl bg-[#1d1d1f] text-white font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
              {data.formula}
            </div>
          </div>

          {/* Component Inputs */}
          <div className="mt-6">
            <h4 className="text-label mb-3">Input Components</h4>
            <div className="space-y-2">
              {data.inputs.map((inp, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-[#e8e8ed] bg-white hover:border-[#86868b] transition-colors"
                >
                  <div>
                    <span className="text-xs font-bold text-[#1d1d1f]">{inp.label}</span>
                    {inp.note && <p className="text-[11px] text-[#86868b] font-medium mt-0.5">{inp.note}</p>}
                  </div>
                  <span className="text-xs font-extrabold text-[#1d1d1f] ml-4 whitespace-nowrap">{inp.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Thought / Reasoning Steps */}
          {data.reasoningSteps && data.reasoningSteps.length > 0 && (
            <div className="mt-6">
              <h4 className="text-label mb-3">
                Reasoning & Contextual Grounding
              </h4>
              <div className="space-y-2.5">
                {data.reasoningSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#1d1d1f] leading-relaxed font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portugal Context / Assumptions */}
          {data.contextNote && (
            <div className="mt-6 p-4 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed] text-xs text-[#1d1d1f] leading-relaxed">
              <div className="font-bold text-[#1d1d1f] flex items-center gap-1.5 mb-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#1d1d1f]" />
                Portugal Statutory Context
              </div>
              <p className="text-[#86868b] font-medium">{data.contextNote}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#e8e8ed] bg-[#f5f5f7] flex items-center justify-between text-xs text-[#86868b] font-medium">
          <span>Deterministically verified</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1d1d1f] text-white rounded-full font-bold hover:bg-black transition-colors text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
