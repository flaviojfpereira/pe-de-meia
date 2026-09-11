export type AssetCategory = "bank" | "real_estate" | "stock" | "crypto" | "vehicle";

export interface BankAsset {
  id: string;
  category: "bank";
  name: string;
  institution: string;
  balance: number;
  isLiquid: boolean;
  currency: string;
}

export interface RealEstateAsset {
  id: string;
  category: "real_estate";
  name: string;
  location: string;
  typology: string; // T0, T1, T2, T3, T4, T5+
  areaM2: number;
  condition: "New" | "Renovated" | "Good" | "Needs Renovation";
  yearBuilt: number;
  energyRating: string; // A+, A, B, B-, C, D
  features: string[];
  bathrooms?: number; // e.g. 2 WCs
  balconiesCount?: number; // e.g. 2 varandas
  heatingType?: string; // e.g. Radiadores a Gás
  hasAC?: boolean; // false if no AC
  hasElevator?: boolean;
  hasGarage?: boolean;
  hasStorage?: boolean;
  notes?: string;
  purchasePrice?: number;
  purchaseYear?: number;
  currentValuation: number;
  valuationSource: "Gemini LLM Appraisal" | "Manual Estimate" | "Registry" | "AI & Idealista Valuation";
  valuationDate: string;
  reasoningChain?: string[];
  pricePerSqm?: number;
  askingPriceEstimate?: number;
  negotiationDiscountPercent?: number;
  marketTier?: string;
  sourcesUsed?: string[];
  comparables?: Array<{
    title: string;
    price: number;
    pricePerM2: number;
    source: string;
    status?: "active" | "inactive" | "transacted";
    dateRecorded?: string;
    notes?: string;
    url?: string;
    linkType?: "property" | "search";
  }>;
  // Real Estate Investment & Rental Engine
  purpose?: "hpp" | "investment" | "secondary";
  isRented?: boolean;
  monthlyRentGross?: number;
  rentalExpensesMonthly?: number; // Condo, insurance, maintenance reserve
  annualImi?: number; // Imposto Municipal sobre Imóveis anual
  vacancyRatePct?: number; // Allowance for vacancy / turnover (e.g. 3-5%)
  rentalTaxRate?: number; // e.g. 25 (standard autonomous), 15 (5-10 yr contract), 10 (>10 yr contract)
  expectedAppreciationYoY?: number; // Expected annual appreciation % (e.g. 3.5%)
  netMonthlyRentalCashflow?: number; // Calculated net cash flow
  annualGrossYield?: number; // (gross rent * 12 / valuation) * 100
  annualNetYield?: number; // (net rent * 12 / valuation) * 100
  cirsTaxShieldSavingsAnnual?: number; // Annual tax savings from CIRS Art. 41 expense deductions
}

export interface RealEstateMilestone {
  id: string;
  name: string;
  targetYear: number;
  estimatedPurchasePrice: number;
  downPaymentPercent: number;
  projectedMonthlyRent: number;
  strategy: "rent_long_term" | "student_rooms" | "vacation_al" | "hpp_upgrade";
  status: "planned" | "in_progress" | "achieved";
  location?: string;
  notes?: string;
  // Transaction closing costs & friction audit (IMT, Stamp duty, Notary, Bank fees)
  closingCostsEstimate?: number;
  totalRequiredCapital?: number;
}

export interface StockAsset {
  id: string;
  category: "stock";
  name: string;
  ticker: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  monthlyContribution: number;
  platform: string;
}

export interface CryptoAsset {
  id: string;
  category: "crypto";
  name: string;
  ticker: string;
  amount: number;
  currentPrice: number;
  totalValue: number;
  monthlyContribution: number;
  storage: string;
}

export interface VehicleAsset {
  id: string;
  category: "vehicle";
  name: string;
  value: number;
  year?: number;
}

export type AnyAsset = BankAsset | RealEstateAsset | StockAsset | CryptoAsset | VehicleAsset;

export interface LoanItem {
  id: string;
  name: string;
  type: "housing" | "vehicle" | "personal";
  totalBalance: number;
  monthlyPayment: number;
  interestRate: number; // percentage, e.g. 3.8
  maturityYear: number;
  institution: string;
}

export interface UserProfile {
  name: string;
  age: number | string;
  employmentType: string;
  monthlyEssentialExpenses: number;
  afterTaxIncome: number;
  notes: string;
  safeToSpendWindowDays: number;
  portugalInflationDefault: number;
  portugalCgtRate: number;
}

export interface MoneyGoal {
  id: string;
  name: string;
  targetType: "reach_net_worth" | "sustain_spending";
  targetValue: number;
  targetDate: string; // YYYY-MM
  note?: string;
  currentProgressPct: number;
  projectedDate?: string;
  status: "on_track" | "in_progress" | "at_risk";
}

export interface ScenarioParams {
  monthlySpending: number;
  monthlyEtfInvestment: number;
  monthlyCryptoInvestment: number;
  futureMonthlyIncome: number;
  annualInflation: number;
  propertyValueOverride: number;
  extraLoanPayment: number;
}

export interface WeaverFork {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  parentId?: string; // root has no parent
  isMainModel: boolean;
  params: ScenarioParams;
  metrics: {
    netWorthIn10Y: number;
    netWorthIn20Y: number;
    targetNetWorth2045: number;
    monthlyRetirementCashflow: number;
    earlyRetirementDate: string;
    goalDateShiftMonths: number; // e.g. +11
    runwayMonths: number;
  };
}

export interface GroundingData {
  title: string;
  metricName: string;
  primaryValue: string;
  formula: string;
  inputs: { label: string; value: string; note?: string }[];
  reasoningSteps?: string[];
  contextNote?: string;
}
