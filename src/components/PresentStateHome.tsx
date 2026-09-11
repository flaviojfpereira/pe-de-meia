import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  RotateCw,
  TrendingUp,
  Info,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Car,
  CreditCard,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnyAsset, GroundingData, LoanItem, MoneyGoal, UserProfile } from "../types";
import {
  formatEuro,
  calculateNetWorth,
  calculateTotalAssets,
  calculateTotalLoans,
  calculateLiquidAssets,
} from "../utils/calculations";

interface PresentStateHomeProps {
  assets: AnyAsset[];
  loans: LoanItem[];
  userProfile: UserProfile;
  goals: MoneyGoal[];
  includeLoans: boolean;
  onToggleIncludeLoans: (include: boolean) => void;
  emergencyFundAmount: number;
  emergencyFundSentence: string;
  emergencyFundStatus: string;
  isClassifyingEmergencyFund: boolean;
  onRefreshClassification: () => void;
  onOpenGrounding: (data: GroundingData) => void;
  onOpenGoalsModal: () => void;
  onNavigateToPlayground: () => void;
}

export const PresentStateHome: React.FC<PresentStateHomeProps> = ({
  assets,
  loans,
  userProfile,
  goals,
  includeLoans,
  onToggleIncludeLoans,
  emergencyFundAmount,
  emergencyFundSentence,
  emergencyFundStatus,
  isClassifyingEmergencyFund,
  onRefreshClassification,
  onOpenGrounding,
  onOpenGoalsModal,
  onNavigateToPlayground,
}) => {
  const [showValues, setShowValues] = useState<boolean>(true);
  const [loansExpanded, setLoansExpanded] = useState<boolean>(false);
  const [actionPlanOpen, setActionPlanOpen] = useState<boolean>(false);
  const [whyActionMattersOpen, setWhyActionMattersOpen] = useState<boolean>(false);

  const totalAssets = calculateTotalAssets(assets);
  const totalLoans = calculateTotalLoans(loans);
  const netWorth = calculateNetWorth(assets, loans, includeLoans);
  const liquidCash = calculateLiquidAssets(assets);

  // Safe-to-spend formula (REQ-020 & DEC-016)
  // Monthly discretionary: After-tax income - Essential expenses = €2,150
  // Liquid reserve after emergency fund: €34,500 - €17,850 = €16,650
  const monthlySafeToSpend = Math.max(
    0,
    userProfile.afterTaxIncome - userProfile.monthlyEssentialExpenses
  );

  // Cash runway in months (REQ-010)
  const runwayMonths = Number(
    (liquidCash / (userProfile.monthlyEssentialExpenses || 1)).toFixed(1)
  );

  // Historical 6-month net worth trend
  const historicalTrend = [
    { month: "Nov '23", value: netWorth - 82400 },
    { month: "Jan '24", value: netWorth - 68000 },
    { month: "Mar '24", value: netWorth - 52000 },
    { month: "May '24", value: netWorth - 38000 },
    { month: "Jul '24", value: netWorth - 21000 },
    { month: "Sep '24", value: netWorth - 6000 },
    { month: "Today", value: netWorth },
  ];

  const handleOpenNetWorthGrounding = () => {
    onOpenGrounding({
      title: "Consolidated Total Net Worth",
      metricName: "Net Worth",
      primaryValue: formatEuro(netWorth),
      formula: includeLoans
        ? "Total Assets (€" +
          totalAssets.toLocaleString("pt-PT") +
          ") – Outstanding Loans (€" +
          totalLoans.toLocaleString("pt-PT") +
          ") = €" +
          netWorth.toLocaleString("pt-PT")
        : "Total Assets (Loans Excluded via Global Toggle) = €" +
          netWorth.toLocaleString("pt-PT"),
      inputs: [
        {
          label: "Real Estate Valuations",
          value: formatEuro(
            assets
              .filter((a) => a.category === "real_estate")
              .reduce((s, a) => s + (a as any).currentValuation, 0)
          ),
          note: "Valued from physical features & Portuguese INE transaction benchmarks.",
        },
        {
          label: "Liquid Cash & Bank Deposits",
          value: formatEuro(
            assets
              .filter((a) => a.category === "bank")
              .reduce((s, a) => s + (a as any).balance, 0)
          ),
          note: "Checking, high-yield term deposits, and tactical liquidity.",
        },
        {
          label: "Equities & Global ETFs",
          value: formatEuro(
            assets
              .filter((a) => a.category === "stock")
              .reduce((s, a) => s + (a as any).totalValue, 0)
          ),
          note: "VWCE, VUAA, and Portuguese Certificados de Aforro Série F.",
        },
        {
          label: "Crypto Holdings",
          value: formatEuro(
            assets
              .filter((a) => a.category === "crypto")
              .reduce((s, a) => s + (a as any).totalValue, 0)
          ),
          note: "Cold storage self-custodied BTC & ETH.",
        },
        {
          label: "Vehicles",
          value: formatEuro(
            assets
              .filter((a) => a.category === "vehicle")
              .reduce((s, a) => s + (a as any).value, 0)
          ),
          note: "REQ-021: Simple valued assets (Tesla Model 3, Vespa).",
        },
        ...(includeLoans
          ? [
              {
                label: "Liabilities Deducted",
                value: `-${formatEuro(totalLoans)}`,
                note: "3 active loans (Mortgage, auto, renovation credit).",
              },
            ]
          : [
              {
                label: "Liabilities Excluded",
                value: "€0 deducted",
                note: "Excluded by user preference via the global loans toggle.",
              },
            ]),
      ],
      reasoningSteps: [
        "All asset valuations are updated and calibrated to current Portuguese market pricing.",
        "The global loans toggle is applied system-wide, preserving single-source-of-truth integrity.",
      ],
      contextNote:
        "Loans in Portugal under Banco de Portugal CRC rules are tracked cleanly with Euribor amortization schedules.",
    });
  };

  const handleOpenSafeToSpendGrounding = () => {
    onOpenGrounding({
      title: "Safe-to-Spend Discretionary Baseline",
      metricName: "Safe-to-Spend",
      primaryValue: `${formatEuro(monthlySafeToSpend)} /mo`,
      formula:
        "Net After-Tax Income (€4,350) – Essential Monthly Expenses (€2,200) = €2,150 /mo available for lifestyle & investments",
      inputs: [
        {
          label: "Net Invoicing / After-Tax Income",
          value: formatEuro(userProfile.afterTaxIncome),
          note: "Net Portuguese income after IRS retention and Social Security contributions.",
        },
        {
          label: "Essential Living Expenses",
          value: `-${formatEuro(userProfile.monthlyEssentialExpenses)}`,
          note: "Housing payments, utilities, basic groceries, and essential health insurance.",
        },
        {
          label: "Liquid Safety Cushion",
          value: formatEuro(Math.max(0, liquidCash - emergencyFundAmount)),
          note: "Surplus cash above the designated emergency fund.",
        },
      ],
      reasoningSteps: [
        "Guarantees that your essential commitments are fully protected before any discretionary lifestyle or speculative investments are executed.",
        "Consistent with Portuguese freelancer cash-flow stabilization best practices.",
      ],
    });
  };

  const handleOpenRunwayGrounding = () => {
    onOpenGrounding({
      title: "Cash Runway Estimation",
      metricName: "Cash Runway",
      primaryValue: `${runwayMonths} months`,
      formula:
        "Total Cash & Liquid Assets (€" +
        liquidCash.toLocaleString("pt-PT") +
        ") ÷ Essential Monthly Expenses (€" +
        userProfile.monthlyEssentialExpenses.toLocaleString("pt-PT") +
        ") = " +
        runwayMonths +
        " months",
      inputs: [
        {
          label: "Total Liquid Cash",
          value: formatEuro(liquidCash),
          note: "Immediate checking & accessible cash accounts.",
        },
        {
          label: "Designated Emergency Fund",
          value: formatEuro(emergencyFundAmount),
          note: `Guarantees ${(emergencyFundAmount / userProfile.monthlyEssentialExpenses).toFixed(1)} months of absolute emergency coverage.`,
        },
        {
          label: "Monthly Burn Rate",
          value: `${formatEuro(userProfile.monthlyEssentialExpenses)} /mo`,
          note: "Zero-lifestyle baseline survival costs.",
        },
      ],
      reasoningSteps: [
        "Provides sufficient peace of mind to weather prolonged client contract gaps without selling equity or property assets in down markets.",
      ],
    });
  };

  const handleOpenEmergencyFundGrounding = () => {
    onOpenGrounding({
      title: "Emergency Fund Classification",
      metricName: "Emergency Fund",
      primaryValue: formatEuro(emergencyFundAmount),
      formula:
        "Designated Amount (€" +
        emergencyFundAmount.toLocaleString("pt-PT") +
        ") ÷ Monthly Essentials (€" +
        userProfile.monthlyEssentialExpenses.toLocaleString("pt-PT") +
        ") = ~" +
        Math.round(emergencyFundAmount / userProfile.monthlyEssentialExpenses) +
        " months of resilience",
      inputs: [
        {
          label: "Designated Emergency Buffer",
          value: formatEuro(emergencyFundAmount),
          note: "Earmarked specifically as untouchable emergency liquidity.",
        },
        {
          label: "Employment Type",
          value: userProfile.employmentType,
          note: "Freelancers require 6-9 months due to invoice cycle variability.",
        },
      ],
      reasoningSteps: [
        emergencyFundSentence,
        "Generates psychological calm, removing market anxiety during periodic portfolio consultations.",
      ],
    });
  };

  return (
    <div className="flex-1 min-w-0 bg-white p-6 lg:p-10 space-y-8 max-w-7xl mx-auto" id="present-state-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">Present State</h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-medium mt-1">Your complete financial picture. All amounts in euros.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-[#86868b] font-semibold">
          <span className="status-dot"></span>
          <span>Live synchronized • Today, 09:41</span>
          <button
            onClick={() => {}}
            title="Refresh market data & valuations"
            className="p-1 text-[#86868b] hover:text-[#1d1d1f] transition-colors rounded-full hover:bg-[#f5f5f7] ml-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero Net Worth Card with Bold Typography */}
      <div
        className="card relative overflow-hidden transition-all shadow-xs"
        id="hero-net-worth-card"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-label">Net Worth</span>
            <button
              onClick={() => setShowValues(!showValues)}
              className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-0.5 rounded"
              title={showValues ? "Hide values" : "Show values"}
            >
              {showValues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Global Loans Toggle Pills matching theme */}
          <div className="toggle-pill self-start md:self-auto">
            <button
              onClick={() => onToggleIncludeLoans(true)}
              className={includeLoans ? "toggle-active" : "toggle-inactive"}
              id="toggle-include-loans-btn"
            >
              Include loans
            </button>
            <button
              onClick={() => onToggleIncludeLoans(false)}
              className={!includeLoans ? "toggle-active" : "toggle-inactive"}
              id="toggle-exclude-loans-btn"
            >
              Exclude loans
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-6 space-y-2">
            <div className="text-huge">
              {showValues ? formatEuro(netWorth) : "••••••••"}
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-600 font-bold pt-1">
              <TrendingUp className="w-4 h-4" />
              <span>↑ €82,400 (6.1%) vs 6 months ago</span>
            </div>
            <div className="pt-2">
              <button
                onClick={handleOpenNetWorthGrounding}
                className="text-xs font-bold text-[#1d1d1f] hover:underline flex items-center space-x-1 group"
                id="see-net-worth-grounding-btn"
              >
                <span>See how this was calculated</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Lightweight Trend Chart */}
          <div className="lg:col-span-6 h-28 sm:h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d1d1f" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1d1d1f" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#86868b", fontWeight: 600 }}
                  interval="preserveStartEnd"
                />
                <YAxis hide domain={["dataMin - 50000", "dataMax + 20000"]} />
                <Tooltip
                  formatter={(val: any) => [formatEuro(Number(val)), "Net Worth"]}
                  contentStyle={{
                    backgroundColor: "#1d1d1f",
                    borderColor: "#1d1d1f",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#1d1d1f"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#netWorthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4 Key Metric Cards with Bold Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="key-metrics-grid">
        {/* Metric 1: Money Health */}
        <div className="card flex flex-col justify-between hover:bg-[#ececee] transition-all">
          <div>
            <div className="flex items-center justify-between text-label mb-2">
              <span className="flex items-center gap-2">
                <span className="status-dot"></span>
                Money Health
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">Good</div>
                <p className="text-[11px] text-[#86868b] font-medium leading-snug mt-1">
                  You're on track toward your Money Goals.
                </p>
              </div>
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#e8e8ed]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="72, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-[#1d1d1f]">72</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-3 flex items-center gap-1">
              <span>↑ Improving vs 6 months ago</span>
            </div>
          </div>
          <button
            onClick={() =>
              onOpenGrounding({
                title: "Money Health Diagnostic",
                metricName: "Money Health Score",
                primaryValue: "72 / 100 (Good)",
                formula:
                  "Weighted composite: Goal Pacing (40%) + Cash Runway (25%) + Debt-to-Asset Ratio (20%) + Liquidity Buffer (15%)",
                inputs: [
                  { label: "Goal Pacing", value: "85/100", note: "Goals #1 and #2 on pace." },
                  { label: "Runway Buffer", value: "90/100", note: "11.3 months of emergency protection." },
                  { label: "Debt-to-Asset", value: "68/100", note: "Mortgage leverage at ~21% of gross asset value." },
                ],
                reasoningSteps: [
                  "Trajectory toward planned goals is healthy under Portuguese inflation baselines.",
                ],
              })
            }
            className="text-[11px] font-bold text-[#1d1d1f] hover:underline mt-4 flex items-center space-x-1 group pt-2 border-t border-[#e8e8ed]"
          >
            <span>See full breakdown</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Metric 2: Safe-to-spend */}
        <div className="card flex flex-col justify-between hover:bg-[#ececee] transition-all">
          <div>
            <div className="flex items-center justify-between text-label mb-2">
              <span className="flex items-center gap-1.5">
                Safe-to-spend
                <Info className="w-3.5 h-3.5 text-[#86868b] cursor-pointer hover:text-[#1d1d1f]" onClick={handleOpenSafeToSpendGrounding} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
              {showValues ? `${formatEuro(monthlySafeToSpend)}` : "••••••••"}
            </div>
            <div className="text-[11px] text-[#86868b] font-medium mt-0.5">/ month discretionary</div>
            <p className="text-[11px] text-[#86868b] font-medium leading-snug mt-1">
              Available for lifestyle & investments after essentials.
            </p>
            <div className="mt-3 space-y-1 text-[10px] text-[#86868b] font-medium border-t border-[#e8e8ed] pt-2">
              <div className="flex justify-between">
                <span>Net after-tax</span>
                <span className="font-bold text-[#1d1d1f]">{formatEuro(userProfile.afterTaxIncome)}/mo</span>
              </div>
              <div className="flex justify-between">
                <span>Essential expenses</span>
                <span className="font-bold text-[#1d1d1f]">-{formatEuro(userProfile.monthlyEssentialExpenses)}/mo</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenSafeToSpendGrounding}
            className="text-[11px] font-bold text-[#1d1d1f] hover:underline mt-4 flex items-center space-x-1 group pt-2 border-t border-[#e8e8ed]"
          >
            <span>See details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Metric 3: Cash Runway */}
        <div className="card flex flex-col justify-between hover:bg-[#ececee] transition-all">
          <div>
            <div className="flex items-center justify-between text-label mb-2">
              <span className="flex items-center gap-1.5">
                Cash Runway
                <Info className="w-3.5 h-3.5 text-[#86868b] cursor-pointer hover:text-[#1d1d1f]" onClick={handleOpenRunwayGrounding} />
              </span>
            </div>
            <div className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
              {showValues ? `${runwayMonths} months` : "••••••••"}
            </div>
            <div className="text-[11px] text-[#86868b] font-medium mt-0.5">zero-income coverage</div>
            <p className="text-[11px] text-[#86868b] font-medium leading-snug mt-1">
              Based on essential living costs and liquid reserves.
            </p>
            <div className="mt-3 text-[11px] text-[#1d1d1f] bg-white rounded-xl p-2.5 font-bold shadow-xs">
              Covers full year living costs with zero bill pressure.
            </div>
          </div>
          <button
            onClick={handleOpenRunwayGrounding}
            className="text-[11px] font-bold text-[#1d1d1f] hover:underline mt-4 flex items-center space-x-1 group pt-2 border-t border-[#e8e8ed]"
          >
            <span>See calculations</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Metric 4: Emergency Fund */}
        <div className="card flex flex-col justify-between hover:bg-[#ececee] transition-all">
          <div>
            <div className="flex items-center justify-between text-label mb-2">
              <span className="flex items-center gap-1.5">
                Emergency Fund
                <span className="ai-badge">Gemini</span>
                <Info className="w-3.5 h-3.5 text-[#86868b] cursor-pointer hover:text-[#1d1d1f]" onClick={handleOpenEmergencyFundGrounding} />
              </span>
              <button
                onClick={onRefreshClassification}
                disabled={isClassifyingEmergencyFund}
                title="Re-run LLM classification"
                className="text-[#86868b] hover:text-[#1d1d1f] disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isClassifyingEmergencyFund ? "animate-spin text-blue-600" : ""}`} />
              </button>
            </div>
            <div className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mt-1">
              {showValues ? formatEuro(emergencyFundAmount) : "••••••••"}
            </div>
            {/* Automatic short LLM classification sentence */}
            <p className="text-[11px] text-[#1d1d1f] font-medium leading-snug mt-2 italic bg-white p-2.5 rounded-xl shadow-xs">
              "{emergencyFundSentence}"
            </p>
          </div>
          <button
            onClick={handleOpenEmergencyFundGrounding}
            className="text-[11px] font-bold text-[#1d1d1f] hover:underline mt-4 flex items-center space-x-1 group pt-2 border-t border-[#e8e8ed]"
          >
            <span>See details</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Recommended Action Card & Money Goals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recommended Action Card in high-contrast card */}
        <div
          className="lg:col-span-7 card-dark flex flex-col justify-between relative overflow-hidden"
          id="recommended-action-card"
        >
          <div>
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 rounded-2xl bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">
                  Recommended Action
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-1.5 leading-snug">
                  Accelerate your emergency fund to 9 months to strengthen long-term resilience.
                </h4>
                <p className="text-xs text-[#86868b] mt-1.5 leading-relaxed font-medium">
                  This supports Goal #1 (Financial Security) and improves your ability to take advantage of future opportunities.
                </p>
              </div>
              <button
                onClick={() => setActionPlanOpen(!actionPlanOpen)}
                className="hidden sm:inline-flex px-4 py-2.5 bg-white text-[#1d1d1f] text-xs font-bold rounded-full hover:bg-neutral-200 transition-colors shrink-0 shadow-xs"
                id="view-action-plan-btn"
              >
                {actionPlanOpen ? "Hide Plan" : "View Action Plan →"}
              </button>
            </div>

            {/* Action Plan Interactive Drawer/Accordion */}
            {actionPlanOpen && (
              <div className="mt-5 p-4 rounded-2xl bg-white/10 text-xs text-white space-y-3 animate-fadeIn">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3-Month Implementation Path
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="bg-white text-[#1d1d1f] p-3 rounded-xl font-medium">
                    <span className="font-bold text-[#1d1d1f] block">Month 1</span>
                    <p className="text-[#86868b] mt-0.5">Route €650 from discretionary cash into ActivoBank liquid vault.</p>
                  </div>
                  <div className="bg-white text-[#1d1d1f] p-3 rounded-xl font-medium">
                    <span className="font-bold text-[#1d1d1f] block">Month 2</span>
                    <p className="text-[#86868b] mt-0.5">Route €650, achieving €19,150 total emergency reserve.</p>
                  </div>
                  <div className="bg-white text-[#1d1d1f] p-3 rounded-xl font-medium">
                    <span className="font-bold text-[#1d1d1f] block">Month 3</span>
                    <p className="text-[#86868b] mt-0.5">Reach €19,800 (full 9 months coverage for independent worker profile).</p>
                  </div>
                </div>
              </div>
            )}

            {/* Why This Matters Accordion */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setWhyActionMattersOpen(!whyActionMattersOpen)}
                className="text-xs text-[#86868b] hover:text-white flex items-center space-x-1.5 font-semibold"
              >
                <span>Why this matters</span>
                {whyActionMattersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {whyActionMattersOpen && (
                <div className="mt-3 text-xs text-[#86868b] leading-relaxed space-y-2 pl-2 border-l-2 border-white/20 font-medium">
                  <p>
                    In Portugal, independent workers and contractors experience seasonal invoicing delays (IRS retention timing and European summer billing slowdowns).
                  </p>
                  <p>
                    A 9-month reserve ensures you never have to liquidate your global equity ETFs during market downturns.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Money Goals Card with Bold Typography */}
        <div
          className="lg:col-span-5 card flex flex-col justify-between"
          id="present-money-goals-card"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <div className="flex items-center space-x-2">
                <span className="text-label">Money Goals</span>
                <span className="text-[10px] bg-white text-[#1d1d1f] px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                  {goals.length} active
                </span>
              </div>
              <button
                onClick={onOpenGoalsModal}
                className="text-xs text-[#1d1d1f] hover:underline font-bold"
                id="view-all-goals-btn"
              >
                View all goals →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#1d1d1f]">{goal.name}</div>
                    <div className="text-[11px] text-[#86868b] font-medium">Target: {formatEuro(goal.targetValue)}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-[#1d1d1f]">{goal.currentProgressPct}%</div>
                      <div
                        className={`text-[10px] font-bold ${
                          goal.status === "on_track" ? "text-emerald-600" : "text-[#1d1d1f]"
                        }`}
                      >
                        {goal.status === "on_track" ? "On track" : "In progress"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#e8e8ed] flex items-center justify-between text-xs text-[#86868b] font-semibold">
            <span>Explore future trajectories</span>
            <button
              onClick={onNavigateToPlayground}
              className="font-bold text-[#1d1d1f] hover:underline flex items-center gap-1"
            >
              Open Ripple Playground →
            </button>
          </div>
        </div>
      </div>

      {/* Loans Section */}
      <div
        className="card p-0 overflow-hidden"
        id="loans-collapsible-section"
      >
        <button
          onClick={() => setLoansExpanded(!loansExpanded)}
          className="w-full flex items-center justify-between p-6 hover:bg-[#ececee] transition-colors text-left"
          id="toggle-loans-accordion-btn"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#1d1d1f] shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#1d1d1f]">Loans & Liabilities</span>
              <div className="text-xs text-[#86868b] font-medium mt-0.5">
                Total outstanding: <span className="font-bold text-[#1d1d1f]">{formatEuro(totalLoans)}</span> • {loans.length} accounts
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#86868b] font-bold">
            <span>{loansExpanded ? "Collapse" : "Expand"}</span>
            {loansExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {loansExpanded && (
          <div className="p-6 pt-0 border-t border-[#e8e8ed] space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
              {loans.map((loan) => (
                <div key={loan.id} className="p-4 rounded-2xl bg-white shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1d1d1f]">{loan.name}</span>
                    <span className="text-[10px] uppercase font-bold text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">
                      {loan.type}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-[#1d1d1f]">{formatEuro(loan.totalBalance)}</div>
                  <div className="text-xs text-[#86868b] font-medium space-y-1 pt-1.5 border-t border-[#f5f5f7]">
                    <div className="flex justify-between">
                      <span>Monthly payment:</span>
                      <span className="font-bold text-[#1d1d1f]">{formatEuro(loan.monthlyPayment)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interest rate:</span>
                      <span className="font-bold text-[#1d1d1f]">{loan.interestRate}% (Euribor)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maturity:</span>
                      <span className="font-bold text-[#1d1d1f]">{loan.maturityYear}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white rounded-2xl text-xs text-[#1d1d1f] font-semibold flex items-center justify-between mt-3 shadow-xs">
              <span>
                Controlled by whole-app loans toggle: {includeLoans ? "Currently deducted from Net Worth" : "Currently excluded from Net Worth"}
              </span>
              <button
                onClick={() => onToggleIncludeLoans(!includeLoans)}
                className="underline font-bold text-[#1d1d1f]"
              >
                Toggle setting
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Methodology Footer */}
      <div className="pt-4 pb-2 border-t border-[#e8e8ed] flex flex-col sm:flex-row items-center justify-between text-xs text-[#86868b] font-medium gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Your data is encrypted and secure. We never sell your data.</span>
        </div>
        <button
          onClick={handleOpenNetWorthGrounding}
          className="hover:text-[#1d1d1f] font-semibold transition-colors underline"
        >
          About calculations & methodology →
        </button>
      </div>
    </div>
  );
};
