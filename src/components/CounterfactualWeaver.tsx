import React, { useState } from "react";
import {
  GitFork,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Clock,
  Plus,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { WeaverFork, ScenarioParams, GroundingData } from "../types";
import { formatEuro } from "../utils/calculations";

interface CounterfactualWeaverProps {
  forks: WeaverFork[];
  mainForkId: string;
  onSelectForkForPlayground: (fork: WeaverFork) => void;
  onPromoteFork: (forkId: string, note?: string) => void;
  onCreateNewFork: (name: string, description: string, params: ScenarioParams) => void;
  onOpenGrounding: (data: GroundingData) => void;
}

export const CounterfactualWeaver: React.FC<CounterfactualWeaverProps> = ({
  forks,
  mainForkId,
  onSelectForkForPlayground,
  onPromoteFork,
  onCreateNewFork,
  onOpenGrounding,
}) => {
  const [selectedForkId, setSelectedForkId] = useState<string>(
    forks.find((f) => !f.isMainModel)?.id || forks[0].id
  );
  const [promoteModalOpen, setPromoteModalOpen] = useState<boolean>(false);
  const [promotionNote, setPromotionNote] = useState<string>("");

  const mainFork = forks.find((f) => f.id === mainForkId) || forks[0];
  const activeFork = forks.find((f) => f.id === selectedForkId) || mainFork;

  const handleOpenPromotionModal = (forkId: string) => {
    setSelectedForkId(forkId);
    setPromotionNote("");
    setPromoteModalOpen(true);
  };

  const handleConfirmPromotion = () => {
    onPromoteFork(selectedForkId, promotionNote);
    setPromoteModalOpen(false);
  };

  return (
    <div className="flex-1 min-w-0 bg-white p-6 lg:p-10 space-y-8 max-w-7xl mx-auto" id="weaver-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8e8ed]">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">Counterfactual Weaver</h2>
            <span className="text-[11px] bg-[#1d1d1f] text-white font-bold px-2.5 py-0.5 rounded-full">
              Financial Forking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#86868b] font-medium mt-1">
            Compare alternative life paths against your followed Main Model. Promote when decisions crystallize.
          </p>
        </div>

        <button
          onClick={() => onSelectForkForPlayground(mainFork)}
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#1d1d1f] text-white rounded-full text-xs font-bold hover:bg-black transition-colors shadow-xs"
          id="fork-from-playground-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Exploration in Playground</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tree & Branch Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card space-y-3" id="weaver-tree-panel">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <span className="text-label">
                Weaver Branch Tree
              </span>
              <span className="text-xs text-[#86868b] font-semibold">{forks.length} paths active</span>
            </div>

            <div className="space-y-2.5">
              {forks.map((fork) => {
                const isSelected = fork.id === selectedForkId;
                const isMain = fork.isMainModel;

                return (
                  <div
                    key={fork.id}
                    onClick={() => setSelectedForkId(fork.id)}
                    className={`p-4 rounded-[18px] border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-white border-[#1d1d1f] shadow-sm"
                        : "bg-white/80 border-[#e8e8ed] hover:border-[#86868b]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          {isMain ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1d1d1f] text-white">
                              ★ Main Model
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5f5f7] text-[#1d1d1f] border border-[#e8e8ed]">
                              <GitFork className="w-2.5 h-2.5 mr-1 text-[#86868b]" />
                              Path Fork
                            </span>
                          )}
                          <span className="text-[10px] text-[#86868b] font-medium">{fork.createdAt}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#1d1d1f] pt-1 leading-snug">{fork.name}</h4>
                        <p className="text-[11px] text-[#86868b] font-medium line-clamp-2 mt-0.5">{fork.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#e8e8ed] flex items-center justify-between text-[11px]">
                      <span className="text-[#86868b] font-medium">2045 Net Worth:</span>
                      <span className="font-extrabold text-[#1d1d1f]">{formatEuro(fork.metrics.targetNetWorth2045)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Detailed Comparison & Diffs against Main Model */}
        <div className="lg:col-span-8 space-y-4">
          <div className="card space-y-5" id="fork-comparison-details">
            {/* Fork Title & Promotion Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8ed]">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-extrabold text-[#1d1d1f]">{activeFork.name}</h3>
                  {activeFork.isMainModel ? (
                    <span className="bg-[#1d1d1f] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Authoritative Source of Truth
                    </span>
                  ) : (
                    <span className="bg-white border border-[#e8e8ed] text-[#1d1d1f] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Alternative Laboratory Path
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#86868b] font-medium mt-1">{activeFork.description}</p>
              </div>

              {!activeFork.isMainModel && (
                <button
                  onClick={() => handleOpenPromotionModal(activeFork.id)}
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full text-xs font-bold shadow-xs flex items-center space-x-1.5 shrink-0 transition-colors"
                  id="promote-to-main-model-btn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Promote to Main Model</span>
                </button>
              )}
            </div>

            {/* Side-by-Side Diffs Table */}
            <div className="space-y-3">
              <span className="text-label block">
                Side-by-Side Metrics: Main Model vs. This Path
              </span>

              <div className="overflow-x-auto rounded-2xl border border-[#e8e8ed] bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f7] border-b border-[#e8e8ed] text-[#86868b] font-bold text-[11px]">
                      <th className="py-3 px-4">Metric</th>
                      <th className="py-3 px-4">Main Model (Baseline)</th>
                      <th className="py-3 px-4">
                        <span className="text-[#1d1d1f] font-extrabold">{activeFork.name}</span>
                      </th>
                      <th className="py-3 px-4">Differential</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8ed] text-[#1d1d1f]">
                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1d1d1f]">Net Worth in 10 Years</td>
                      <td className="py-3 px-4 font-medium text-[#86868b]">{formatEuro(mainFork.metrics.netWorthIn10Y)}</td>
                      <td className="py-3 px-4 font-extrabold text-[#1d1d1f]">
                        {formatEuro(activeFork.metrics.netWorthIn10Y)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${activeFork.metrics.netWorthIn10Y >= mainFork.metrics.netWorthIn10Y ? "text-emerald-600" : "text-rose-600"}`}>
                          {activeFork.metrics.netWorthIn10Y >= mainFork.metrics.netWorthIn10Y ? "+" : ""}
                          {formatEuro(activeFork.metrics.netWorthIn10Y - mainFork.metrics.netWorthIn10Y)}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1d1d1f]">Net Worth in 20 Years (2045)</td>
                      <td className="py-3 px-4 font-medium text-[#86868b]">{formatEuro(mainFork.metrics.targetNetWorth2045)}</td>
                      <td className="py-3 px-4 font-extrabold text-[#1d1d1f]">
                        {formatEuro(activeFork.metrics.targetNetWorth2045)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${activeFork.metrics.targetNetWorth2045 >= mainFork.metrics.targetNetWorth2045 ? "text-emerald-600" : "text-rose-600"}`}>
                          {activeFork.metrics.targetNetWorth2045 >= mainFork.metrics.targetNetWorth2045 ? "+" : ""}
                          {formatEuro(activeFork.metrics.targetNetWorth2045 - mainFork.metrics.targetNetWorth2045)}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1d1d1f]">Monthly Retirement Cashflow</td>
                      <td className="py-3 px-4 font-medium text-[#86868b]">{formatEuro(mainFork.metrics.monthlyRetirementCashflow)}/mo</td>
                      <td className="py-3 px-4 font-extrabold text-[#1d1d1f]">
                        {formatEuro(activeFork.metrics.monthlyRetirementCashflow)}/mo
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">
                          +{formatEuro(activeFork.metrics.monthlyRetirementCashflow - mainFork.metrics.monthlyRetirementCashflow)}/mo
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1d1d1f]">Goal Milestone Date</td>
                      <td className="py-3 px-4 font-medium text-[#86868b]">{mainFork.metrics.earlyRetirementDate}</td>
                      <td className="py-3 px-4 font-extrabold text-[#1d1d1f]">
                        {activeFork.metrics.earlyRetirementDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-600">
                          {activeFork.metrics.goalDateShiftMonths > 0
                            ? `${activeFork.metrics.goalDateShiftMonths} months earlier`
                            : "Baseline pacing"}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="py-3 px-4 font-bold text-[#1d1d1f]">Liquid Cash Runway</td>
                      <td className="py-3 px-4 font-medium text-[#86868b]">{mainFork.metrics.runwayMonths} months</td>
                      <td className="py-3 px-4 font-extrabold text-[#1d1d1f]">
                        {activeFork.metrics.runwayMonths} months
                      </td>
                      <td className="py-3 px-4 text-[#86868b] font-medium">Stable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parameter Differences */}
            <div className="space-y-3 pt-2">
              <span className="text-label block">
                Parameter Inputs in this Path
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-2xl border border-[#e8e8ed] shadow-xs">
                  <span className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wider block">Monthly ETF</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(activeFork.params.monthlyEtfInvestment)}</div>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(mainFork.params.monthlyEtfInvestment)}</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8e8ed] shadow-xs">
                  <span className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wider block">Monthly Crypto</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(activeFork.params.monthlyCryptoInvestment)}</div>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(mainFork.params.monthlyCryptoInvestment)}</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8e8ed] shadow-xs">
                  <span className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wider block">Projected Income</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(activeFork.params.futureMonthlyIncome)}</div>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(mainFork.params.futureMonthlyIncome)}</span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-[#e8e8ed] shadow-xs">
                  <span className="text-[#86868b] text-[10px] font-semibold uppercase tracking-wider block">Extra Debt Paydown</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(activeFork.params.extraLoanPayment)}</div>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(mainFork.params.extraLoanPayment)}</span>
                </div>
              </div>
            </div>

            {/* Launch into Playground */}
            <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between">
              <span className="text-xs text-[#86868b] font-medium">
                Want to tweak the numbers in this specific branch?
              </span>
              <button
                onClick={() => onSelectForkForPlayground(activeFork)}
                className="text-xs font-bold text-[#1d1d1f] hover:underline flex items-center gap-1"
              >
                <span>Open in Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explicit Promotion Review Modal (REQ-015, REQ-023) */}
      {promoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-5" id="promotion-review-modal">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#e8e8ed]">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1d1d1f]">Promote Path to Main Model</h3>
                <p className="text-xs text-[#86868b] font-medium">Confirm update to your authoritative single source of truth</p>
              </div>
            </div>

            {/* Consequence Statement */}
            <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl text-xs text-[#1d1d1f] leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-[#1d1d1f]">
                <AlertCircle className="w-4 h-4 text-[#1d1d1f] shrink-0" />
                Consequence Notice
              </div>
              You are about to replace your current main model with this path. All existing forks will remain available for comparison in the Counterfactual Weaver.
            </div>

            {/* Side-by-side key metrics comparison */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1d1d1f]">Key Metric Shifts</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border border-[#e8e8ed] bg-[#f5f5f7]">
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Current Main Model</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(mainFork.metrics.targetNetWorth2045)}</div>
                  <span className="text-[10px] text-[#86868b] font-medium">{mainFork.metrics.earlyRetirementDate}</span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#1d1d1f] bg-white shadow-xs">
                  <span className="text-[10px] text-[#1d1d1f] font-bold uppercase tracking-wider block">New Main Model (Promoted)</span>
                  <div className="font-extrabold text-[#1d1d1f] text-sm mt-0.5">{formatEuro(activeFork.metrics.targetNetWorth2045)}</div>
                  <span className="text-[10px] text-emerald-600 font-bold">{activeFork.metrics.earlyRetirementDate} (+11 mos)</span>
                </div>
              </div>
            </div>

            {/* Optional Note Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1d1d1f]">
                Decision Note (Optional)
              </label>
              <textarea
                rows={2}
                value={promotionNote}
                onChange={(e) => setPromotionNote(e.target.value)}
                placeholder="e.g. Confirmed rate increase with client; committing to €800/mo ETF DCA."
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl text-xs focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-[#e8e8ed]">
              <button
                type="button"
                onClick={() => setPromoteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                id="cancel-promotion-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPromotion}
                className="px-5 py-2.5 text-xs font-bold bg-[#1d1d1f] hover:bg-black text-white rounded-full shadow-xs transition-colors"
                id="confirm-promotion-btn"
              >
                Promote to Main Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
