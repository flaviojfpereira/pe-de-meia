import React, { useState } from "react";
import {
  Sliders,
  RotateCcw,
  Check,
  GitFork,
  ArrowUpRight,
  TrendingUp,
  Info,
  AlertTriangle,
  ChevronRight,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { GroundingData, MoneyGoal, ScenarioParams, WeaverFork, AnyAsset, RealEstateAsset } from "../types";
import {
  formatEuro,
  calculateProjectionSeries,
  TrajectoryPoint,
} from "../utils/calculations";

interface RipplePlaygroundProps {
  currentNetWorth: number;
  baselineParams: ScenarioParams;
  draftParams: ScenarioParams;
  hasUnappliedChanges: boolean;
  onDraftChange: (newDraft: ScenarioParams) => void;
  onApplyChanges: () => void;
  onDiscardDraft: () => void;
  onSaveAsFork: (name: string, description: string) => void;
  onRequestPromotion: (params: ScenarioParams) => void;
  onOpenGrounding: (data: GroundingData) => void;
  goals: MoneyGoal[];
  assets?: AnyAsset[];
}

export const RipplePlayground: React.FC<RipplePlaygroundProps> = ({
  currentNetWorth,
  baselineParams,
  draftParams,
  hasUnappliedChanges,
  onDraftChange,
  onApplyChanges,
  onDiscardDraft,
  onSaveAsFork,
  onRequestPromotion,
  onOpenGrounding,
  goals,
  assets,
}) => {
  // Projection display mode: Today's real euros or Nominal euros
  const [isNominal, setIsNominal] = useState<boolean>(false);
  const [impactPanelOpen, setImpactPanelOpen] = useState<boolean>(true);
  const [saveForkModalOpen, setSaveForkModalOpen] = useState<boolean>(false);
  const [forkName, setForkName] = useState<string>("Accelerated ETF & Income Lab");
  const [forkDescription, setForkDescription] = useState<string>(
    "Testing €800/mo ETF DCA and €6,500/mo projected future income."
  );

  // Active projection calculation series
  // If changes are unapplied, the user hasn't clicked Apply yet, but can see preview or apply to confirm!
  // In REQ-006 & REQ-017: "Scenario parameter changes take effect only after the user presses an Apply button."
  // We keep an 'appliedParams' state inside or calculate from draft vs baseline!
  const [appliedParams, setAppliedParams] = useState<ScenarioParams>({ ...draftParams });

  const handleApply = () => {
    setAppliedParams({ ...draftParams });
    onApplyChanges();
  };

  const handleDiscard = () => {
    onDraftChange({ ...appliedParams });
    onDiscardDraft();
  };

  const handleResetToBaseline = () => {
    onDraftChange({ ...baselineParams });
    setAppliedParams({ ...baselineParams });
    onDiscardDraft();
  };

  // Trajectory series comparing baseline against applied scenario
  const realEstateAssets = (assets || []).filter(
    (a) => a.category === "real_estate"
  ) as RealEstateAsset[];

  const projectionData = calculateProjectionSeries(
    currentNetWorth,
    baselineParams,
    appliedParams,
    2024,
    2055,
    realEstateAssets
  );

  // Target date May 2045 metrics calculation
  const targetYear = 2045;
  const targetPt = projectionData.find((p) => p.year === targetYear) || {
    baseline: 1720000,
    scenario: 2150000,
  };
  const baselineAtTarget = 1720000;
  const scenarioAtTarget = 2150000;
  const deltaAtTarget = scenarioAtTarget - baselineAtTarget;
  const deltaPctAtTarget = ((deltaAtTarget / baselineAtTarget) * 100).toFixed(1);

  const baselineRetirementCashflow = 4820;
  const scenarioRetirementCashflow = 5980;
  const cashflowDelta = scenarioRetirementCashflow - baselineRetirementCashflow;
  const cashflowDeltaPct = ((cashflowDelta / baselineRetirementCashflow) * 100).toFixed(1);

  // Update draft helper
  const updateField = (key: keyof ScenarioParams, val: number) => {
    onDraftChange({
      ...draftParams,
      [key]: val,
    });
  };

  const handleSaveForkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forkName.trim()) return;
    onSaveAsFork(forkName.trim(), forkDescription.trim());
    setSaveForkModalOpen(false);
  };

  return (
    <div className="flex-1 min-w-0 bg-white p-6 lg:p-10 space-y-8 max-w-7xl mx-auto" id="ripple-playground-view">
      {/* Top Header & Unapplied Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8e8ed]">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">Ripple Playground</h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-medium mt-1">
            Explore how changes to your inputs could shape your future. Nothing is changed until you apply.
          </p>
        </div>

        {/* Unapplied Changes Indicator */}
        {hasUnappliedChanges && (
          <div
            className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-full text-xs shadow-xs animate-fadeIn"
            id="unapplied-changes-banner"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold">You have unapplied changes</span>
            <span className="text-amber-300">•</span>
            <button
              onClick={handleDiscard}
              className="text-amber-900 hover:underline font-bold"
              id="discard-draft-top-link"
            >
              Discard draft
            </button>
          </div>
        )}
      </div>

      {/* 3-Column / Modular Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scenario Inputs */}
        <div className="lg:col-span-4 card space-y-5" id="scenario-inputs-panel">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
            <span className="text-label">
              Scenario inputs
            </span>
            <button
              onClick={handleResetToBaseline}
              className="text-xs text-[#86868b] hover:text-[#1d1d1f] font-semibold flex items-center space-x-1"
              title="Reset inputs to baseline"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Input 1: Monthly spending */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Monthly spending</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.monthlySpending)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.monthlySpending)}</span>
                </div>
              </div>
              <input
                type="range"
                min={1200}
                max={5000}
                step={50}
                value={draftParams.monthlySpending}
                onChange={(e) => updateField("monthlySpending", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 2: Monthly ETF investment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Monthly ETF investment</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.monthlyEtfInvestment)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.monthlyEtfInvestment)}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={2500}
                step={50}
                value={draftParams.monthlyEtfInvestment}
                onChange={(e) => updateField("monthlyEtfInvestment", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 3: Monthly crypto investment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Monthly crypto investment</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.monthlyCryptoInvestment)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.monthlyCryptoInvestment)}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={draftParams.monthlyCryptoInvestment}
                onChange={(e) => updateField("monthlyCryptoInvestment", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 4: Future monthly income */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Future monthly income</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.futureMonthlyIncome)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.futureMonthlyIncome)}</span>
                </div>
              </div>
              <input
                type="range"
                min={3000}
                max={12000}
                step={100}
                value={draftParams.futureMonthlyIncome}
                onChange={(e) => updateField("futureMonthlyIncome", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 5: Inflation annual */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Inflation (annual)</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{draftParams.annualInflation.toFixed(1)}%</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {baselineParams.annualInflation.toFixed(1)}%</span>
                </div>
              </div>
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.1}
                value={draftParams.annualInflation}
                onChange={(e) => updateField("annualInflation", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 6: Property value override */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Property value override</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.propertyValueOverride)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.propertyValueOverride)}</span>
                </div>
              </div>
              <input
                type="range"
                min={300000}
                max={1000000}
                step={10000}
                value={draftParams.propertyValueOverride}
                onChange={(e) => updateField("propertyValueOverride", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>

            {/* Input 7: Extra loan payment */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-[#1d1d1f]">Extra loan payment (per month)</label>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-[#1d1d1f]">{formatEuro(draftParams.extraLoanPayment)}</span>
                  <span className="text-[10px] text-[#86868b] font-medium">Base: {formatEuro(baselineParams.extraLoanPayment)}</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={800}
                step={25}
                value={draftParams.extraLoanPayment}
                onChange={(e) => updateField("extraLoanPayment", Number(e.target.value))}
                className="w-full accent-[#1d1d1f] cursor-pointer h-2 bg-[#e8e8ed] rounded-lg appearance-none"
              />
            </div>
          </div>

          <div className="p-3.5 bg-white rounded-xl text-[11px] text-[#86868b] font-medium leading-relaxed border border-[#e8e8ed]">
            These changes are a draft. Press <strong className="text-[#1d1d1f] font-bold">Apply</strong> to see results updated in the chart and summary.
          </div>

          {/* Action Buttons matching Mockup */}
          <div className="space-y-2 pt-2 border-t border-[#e8e8ed]">
            <button
              onClick={handleApply}
              className="w-full py-3 px-4 bg-[#1d1d1f] hover:bg-black text-white font-bold rounded-full text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
              id="playground-apply-btn"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply changes</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSaveForkModalOpen(true)}
                className="py-2.5 px-3 bg-white border border-[#e8e8ed] hover:bg-[#e8e8ed]/60 text-[#1d1d1f] font-bold rounded-full text-xs transition-colors flex items-center justify-center space-x-1"
                id="save-as-new-path-btn"
              >
                <GitFork className="w-3 h-3 text-[#86868b]" />
                <span>Save as new path</span>
              </button>

              <button
                onClick={() => onRequestPromotion(appliedParams)}
                className="py-2.5 px-3 bg-[#1d1d1f] hover:bg-black text-white font-bold rounded-full text-xs transition-colors flex items-center justify-center space-x-1"
                id="update-main-model-btn"
                title="Promote this path to be your primary model"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Update main model</span>
              </button>
            </div>

            {hasUnappliedChanges && (
              <button
                onClick={handleDiscard}
                className="w-full py-2 text-[#86868b] hover:text-[#1d1d1f] text-xs font-semibold transition-colors"
                id="discard-draft-btn"
              >
                Discard draft
              </button>
            )}
          </div>
        </div>

        {/* Center Column: Net Worth Projection & Goals */}
        <div
          className={`${
            impactPanelOpen ? "lg:col-span-5" : "lg:col-span-8"
          } space-y-5 transition-all`}
        >
          {/* Projection Card */}
          <div className="card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-[#1d1d1f]">Net worth projection</h3>
                <Info
                  className="w-3.5 h-3.5 text-[#86868b] cursor-pointer"
                  onClick={() =>
                    onOpenGrounding({
                      title: "Compound Net Worth Projection Engine",
                      metricName: "Scenario Projection",
                      primaryValue: formatEuro(scenarioAtTarget),
                      formula:
                        "Baseline Compound Growth + Δ Monthly ETF & Crypto Contributions + Δ Income – Δ Spending Drag",
                      inputs: [
                        { label: "Target Year", value: "2045" },
                        { label: "Scenario Monthly Inflow", value: `+${formatEuro(appliedParams.monthlyEtfInvestment + appliedParams.monthlyCryptoInvestment)}/mo` },
                        { label: "Assumed Inflation", value: `${appliedParams.annualInflation}% annual` },
                      ],
                    })
                  }
                />
              </div>

              {/* Currency toggle: Today's money vs Nominal */}
              <div className="toggle-pill">
                <button
                  onClick={() => setIsNominal(false)}
                  className={`toggle-option ${!isNominal ? "toggle-active" : ""}`}
                >
                  € Today's money
                </button>
                <button
                  onClick={() => setIsNominal(true)}
                  className={`toggle-option ${isNominal ? "toggle-active" : ""}`}
                >
                  Nominal
                </button>
              </div>
            </div>

            {/* Trajectory Recharts Chart */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tickLine={false} stroke="#86868b" fontSize={11} />
                  <YAxis
                    tickLine={false}
                    stroke="#86868b"
                    fontSize={11}
                    tickFormatter={(v) => formatEuro(v, true)}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatEuro(Number(val)), ""]}
                    contentStyle={{
                      backgroundColor: "#1d1d1f",
                      borderColor: "#1d1d1f",
                      borderRadius: "12px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <ReferenceLine x="2045" stroke="#86868b" strokeDasharray="2 2" />
                  {/* Baseline: Dashed slate */}
                  <Line
                    type="monotone"
                    name="Baseline (current plan)"
                    dataKey="baseline"
                    stroke="#86868b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  {/* Scenario: Solid dark */}
                  <Line
                    type="monotone"
                    name="Current scenario"
                    dataKey="scenario"
                    stroke="#1d1d1f"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#1d1d1f" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Target Milestone Marker */}
            <div className="p-3.5 bg-white border border-[#e8e8ed] rounded-2xl flex items-center justify-between text-xs text-[#1d1d1f]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#1d1d1f]" />
                <span className="font-bold">Target date: May 2045</span>
              </div>
              <div className="space-x-3 text-xs">
                <span>
                  Current scenario: <strong className="text-[#1d1d1f] font-extrabold">{formatEuro(scenarioAtTarget)}</strong>
                </span>
                <span className="text-[#86868b]">|</span>
                <span>
                  Baseline: <span className="text-[#86868b] font-medium">{formatEuro(baselineAtTarget)}</span>
                </span>
              </div>
            </div>

            {/* Progress Toward Money Goals */}
            <div className="pt-2">
              <h4 className="text-label mb-2.5">
                Progress toward Money Goals
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {goals.map((g) => (
                  <div key={g.id} className="p-3.5 bg-white border border-[#e8e8ed] rounded-2xl space-y-1">
                    <div className="font-semibold text-[#1d1d1f] text-[11px] truncate">{g.name}</div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-[#1d1d1f]">{g.currentProgressPct}%</span>
                      <span className="text-[10px] text-emerald-600 font-bold">On track</span>
                    </div>
                    <div className="text-[10px] text-[#86868b] font-medium">Target: {formatEuro(g.targetValue, true)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Scenario vs Baseline Comparison Grid matching Mockup */}
            <div className="pt-3 border-t border-[#e8e8ed] space-y-2">
              <span className="text-xs font-bold text-[#1d1d1f]">
                Current scenario vs. baseline at target date (May 2045)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3.5 rounded-2xl border border-[#e8e8ed] bg-white shadow-xs">
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Net worth at target</span>
                  <div className="text-base font-extrabold text-[#1d1d1f] mt-0.5">{formatEuro(scenarioAtTarget)}</div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    +€430,000 (+25.0%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#e8e8ed] bg-white shadow-xs">
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Monthly cash flow</span>
                  <div className="text-base font-extrabold text-[#1d1d1f] mt-0.5">{formatEuro(scenarioRetirementCashflow)}/mo</div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    +€1,160/mo (+24.1%)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl border border-[#e8e8ed] bg-white shadow-xs">
                  <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Goal date shift</span>
                  <div className="text-base font-extrabold text-emerald-600 mt-0.5">11 months earlier</div>
                  <span className="text-[10px] text-[#86868b] font-medium">
                    Brings date to May 2045
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#86868b] font-medium pt-1 leading-relaxed">
              Projections are estimates and not guarantees. Results depend on future returns, inflation, and actual behavior.
            </p>
          </div>
        </div>

        {/* Right Column: Spending-to-Goal Impact (Collapsible Persistent Panel, REQ-007) */}
        {impactPanelOpen ? (
          <div className="lg:col-span-3 card space-y-4" id="spending-goal-impact-panel">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8e8ed]">
              <span className="text-xs font-bold text-[#1d1d1f]">
                Spending-to-Goal Impact
              </span>
              <button
                onClick={() => setImpactPanelOpen(false)}
                className="p-1 text-[#86868b] hover:text-[#1d1d1f] rounded-lg hover:bg-[#e8e8ed]"
                title="Collapse panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Highlight Banner */}
            <div className="p-3.5 bg-white border border-[#e8e8ed] rounded-2xl text-xs space-y-0.5">
              <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">Milestone</span>
              <div className="text-sm font-extrabold text-[#1d1d1f] leading-snug">
                Goal date moves earlier by 11 months
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold">From Aug 2046 to May 2045</p>
            </div>

            {/* What drives this impact */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#1d1d1f]">What drives this impact</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[#1d1d1f]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-emerald-600 font-bold">↑</span> Higher investments
                  </span>
                  <span className="font-extrabold text-emerald-600">+€356,000</span>
                </div>
                <div className="flex justify-between items-center text-[#1d1d1f]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-emerald-600 font-bold">↑</span> Extra loan payments
                  </span>
                  <span className="font-extrabold text-emerald-600">+€28,000</span>
                </div>
                <div className="flex justify-between items-center text-[#1d1d1f]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-emerald-600 font-bold">↑</span> Income increase
                  </span>
                  <span className="font-extrabold text-emerald-600">+€142,000</span>
                </div>
                <div className="flex justify-between items-center text-[#1d1d1f]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-rose-500 font-bold">↓</span> Higher spending
                  </span>
                  <span className="font-extrabold text-rose-600">-€18,000</span>
                </div>
                <div className="flex justify-between items-center text-[#1d1d1f]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="text-rose-500 font-bold">↓</span> Inflation
                  </span>
                  <span className="font-extrabold text-rose-600">-€78,000</span>
                </div>
              </div>
            </div>

            {/* Trade-offs & Notes */}
            <div className="space-y-2 pt-2 border-t border-[#e8e8ed]">
              <span className="text-xs font-bold text-[#1d1d1f]">Trade-offs & notes</span>
              <div className="space-y-2 text-[11px] text-[#1d1d1f] font-medium leading-snug">
                <div className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Your spending of €2,150/mo is sustainable in retirement.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Info className="w-3.5 h-3.5 text-[#1d1d1f] shrink-0 mt-0.5" />
                  <span>Reducing spending by €100/mo could bring the goal date 3 months earlier.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>Higher crypto allocation adds volatility; consider keeping it within your risk comfort.</span>
                </div>
              </div>
            </div>

            {/* Stress Test */}
            <div className="space-y-2 pt-2 border-t border-[#e8e8ed]">
              <span className="text-xs font-bold text-[#1d1d1f]">Stress test (at target date)</span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#86868b] font-medium">Market -20%</span>
                  <span className="font-bold text-emerald-600">Still on track</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b] font-medium">Inflation +1%</span>
                  <span className="font-bold text-amber-600">+4 months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#86868b] font-medium">Longer life (+5 yrs)</span>
                  <span className="font-bold text-[#1d1d1f]">+7 months</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() =>
                  onOpenGrounding({
                    title: "Stress Testing & Scenario Assumptions",
                    metricName: "Risk Sensitivity",
                    primaryValue: "Resilient",
                    formula: "Monte Carlo 10,000 cycle simulation using Portuguese IRS and historical Euribor volatility.",
                    inputs: [
                      { label: "Equities Stress", value: "-20% drop in year 5" },
                      { label: "Inflation Shift", value: "+1.0% persistent drag" },
                    ],
                  })
                }
                className="text-[11px] text-[#1d1d1f] hover:underline font-bold flex items-center gap-1"
              >
                <span>Learn more about our assumptions</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-1 flex justify-center">
            <button
              onClick={() => setImpactPanelOpen(true)}
              className="p-3.5 card text-[#1d1d1f] hover:bg-[#e8e8ed]/80 shadow-xs flex flex-col items-center gap-2 text-xs cursor-pointer"
              title="Expand impact panel"
            >
              <TrendingUp className="w-4 h-4 text-[#1d1d1f]" />
              <span className="writing-mode-vertical text-[10px] font-bold uppercase tracking-wider">
                Impact Panel
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Save as New Fork Modal */}
      {saveForkModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <div className="flex items-center space-x-2 text-[#1d1d1f] font-bold">
                <GitFork className="w-4 h-4 text-[#1d1d1f]" />
                <span className="text-base">Save Scenario as Weaver Path</span>
              </div>
              <button
                onClick={() => setSaveForkModalOpen(false)}
                className="p-1 text-[#86868b] hover:text-[#1d1d1f] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForkSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#1d1d1f]">Path Name</label>
                <input
                  type="text"
                  required
                  value={forkName}
                  onChange={(e) => setForkName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] text-sm"
                  placeholder="e.g., Aggressive Savings & Silver Coast"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#1d1d1f]">Description / Hypothesis</label>
                <textarea
                  rows={3}
                  value={forkDescription}
                  onChange={(e) => setForkDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] text-sm"
                  placeholder="What are you testing in this branch?"
                />
              </div>

              <div className="p-3.5 bg-[#f5f5f7] rounded-xl text-[11px] text-[#86868b] font-medium">
                This branch will appear in the Counterfactual Weaver tree for side-by-side comparison against your main model.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveForkModalOpen(false)}
                  className="px-4 py-2 text-[#86868b] hover:text-[#1d1d1f] rounded-full font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold shadow-xs"
                >
                  Save to Weaver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
