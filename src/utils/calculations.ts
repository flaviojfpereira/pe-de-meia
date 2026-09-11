import { AnyAsset, LoanItem, ScenarioParams, RealEstateAsset } from "../types";

export function formatEuro(amount: number, compact: boolean = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `€${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `€${(amount / 1_000).toFixed(0)}k`;
    }
  }
  return `€${Math.round(amount).toLocaleString("pt-PT")}`;
}

export function calculateTotalAssets(assets: AnyAsset[]): number {
  return assets.reduce((sum, asset) => {
    switch (asset.category) {
      case "bank":
        return sum + asset.balance;
      case "real_estate":
        return sum + asset.currentValuation;
      case "stock":
        return sum + asset.totalValue;
      case "crypto":
        return sum + asset.totalValue;
      case "vehicle":
        return sum + asset.value;
      default:
        return sum;
    }
  }, 0);
}

export function calculateTotalLoans(loans: LoanItem[]): number {
  return loans.reduce((sum, loan) => sum + loan.totalBalance, 0);
}

export function calculateLiquidAssets(assets: AnyAsset[]): number {
  return assets
    .filter((a) => a.category === "bank" && (a as any).isLiquid)
    .reduce((sum, a) => sum + (a as any).balance, 0);
}

export function calculateNetWorth(
  assets: AnyAsset[],
  loans: LoanItem[],
  includeLoans: boolean
): number {
  const totalAssets = calculateTotalAssets(assets);
  const totalLoans = calculateTotalLoans(loans);
  return includeLoans ? totalAssets - totalLoans : totalAssets;
}

// ==========================================
// PORTUGUESE REAL ESTATE TAX & INVISIBLE FEES ENGINE
// ==========================================

/**
 * Calculates IMT (Imposto Municipal sobre as Transmissões Onerosas de Imóveis)
 * Based on Portuguese OE brackets for Continente.
 */
export function calculateIMT(
  price: number,
  purpose: "hpp" | "investment" | "secondary" = "investment"
): number {
  if (price <= 0) return 0;

  if (purpose === "hpp") {
    // Habitação Própria e Permanente (Continente)
    if (price <= 101917) return 0;
    if (price <= 139412) return Math.max(0, Math.round(price * 0.02 - 2038.34));
    if (price <= 190086) return Math.max(0, Math.round(price * 0.05 - 6220.70));
    if (price <= 316772) return Math.max(0, Math.round(price * 0.07 - 10022.42));
    if (price <= 633453) return Math.max(0, Math.round(price * 0.08 - 13190.14));
    if (price <= 1102920) return Math.round(price * 0.06);
    return Math.round(price * 0.075);
  } else {
    // Habitação Secundária ou Arrendamento / Investimento (Continente)
    if (price <= 101917) return Math.round(price * 0.01);
    if (price <= 139412) return Math.max(0, Math.round(price * 0.02 - 1019.17));
    if (price <= 190086) return Math.max(0, Math.round(price * 0.05 - 5201.53));
    if (price <= 316772) return Math.max(0, Math.round(price * 0.07 - 9003.25));
    if (price <= 611758) return Math.max(0, Math.round(price * 0.08 - 12170.97));
    if (price <= 1102920) return Math.round(price * 0.06);
    return Math.round(price * 0.075);
  }
}

export interface PropertyClosingCosts {
  imt: number;
  stampDutyPurchase: number; // 0.8% Imposto de Selo de Compra
  stampDutyLoan: number; // 0.6% Imposto de Selo sobre o Crédito
  notaryAndRegistry: number; // Escritura, Notário e Registo Predial (Casa Pronta ~€750)
  bankAppraisalAndDossier: number; // Comissão de avaliação e formalização (~€750 se financiado)
  totalClosingCosts: number;
  totalUpfrontCapitalRequired: number; // Entrada + custos de fecho
  closingCostsPercentOfPrice: number;
}

/**
 * Computes all statutory invisible fees & transaction friction when acquiring property in Portugal
 */
export function calculateClosingCosts(
  purchasePrice: number,
  downPaymentAmount: number,
  purpose: "hpp" | "investment" | "secondary" = "investment"
): PropertyClosingCosts {
  if (purchasePrice <= 0) {
    return {
      imt: 0,
      stampDutyPurchase: 0,
      stampDutyLoan: 0,
      notaryAndRegistry: 0,
      bankAppraisalAndDossier: 0,
      totalClosingCosts: 0,
      totalUpfrontCapitalRequired: 0,
      closingCostsPercentOfPrice: 0,
    };
  }

  const loanAmount = Math.max(0, purchasePrice - downPaymentAmount);
  const imt = calculateIMT(purchasePrice, purpose);
  const stampDutyPurchase = Math.round(purchasePrice * 0.008);
  const stampDutyLoan = loanAmount > 0 ? Math.round(loanAmount * 0.006) : 0;
  const notaryAndRegistry = 750;
  const bankAppraisalAndDossier = loanAmount > 0 ? 750 : 0;

  const totalClosingCosts =
    imt + stampDutyPurchase + stampDutyLoan + notaryAndRegistry + bankAppraisalAndDossier;
  const totalUpfrontCapitalRequired = downPaymentAmount + totalClosingCosts;
  const closingCostsPercentOfPrice = Number(((totalClosingCosts / purchasePrice) * 100).toFixed(1));

  return {
    imt,
    stampDutyPurchase,
    stampDutyLoan,
    notaryAndRegistry,
    bankAppraisalAndDossier,
    totalClosingCosts,
    totalUpfrontCapitalRequired,
    closingCostsPercentOfPrice,
  };
}

export interface RentalCalculationResult {
  grossAnnualRent: number;
  effectiveGrossRent: number; // after vacancy
  annualOperatingExpenses: number; // condo + insurance
  annualImi: number;
  taxDeductibleExpenses: number; // condo + insurance + IMI (CIRS Art. 41)
  taxableBaseAnnual: number; // max(0, effectiveGrossRent - taxDeductibleExpenses)
  annualIrsTax: number;
  monthlyIrsTax: number;
  netAnnualCashflow: number;
  netMonthlyCashflow: number;
  grossYield: number;
  netYield: number;
  cirsTaxShieldBenefitAnnual: number; // Tax saved due to CIRS Art. 41 expense deduction
}

/**
 * Calculates rental yields and true net cash-flow according to Portuguese IRS rules (Artigo 41.º do CIRS)
 * where documented expenses (condomínio, seguros, IMI) are deducted from gross rent before tax.
 */
export function calculateCirsRentalCashflow({
  grossRentMonthly,
  propertyValuation,
  taxRatePercent = 25,
  expensesMonthly = 0,
  annualImi = 0,
  vacancyRatePercent = 0,
}: {
  grossRentMonthly: number;
  propertyValuation: number;
  taxRatePercent?: number;
  expensesMonthly?: number;
  annualImi?: number;
  vacancyRatePercent?: number;
}): RentalCalculationResult {
  const grossAnnualRent = grossRentMonthly * 12;
  const vacancyDrag = grossAnnualRent * (vacancyRatePercent / 100);
  const effectiveGrossRent = Math.max(0, grossAnnualRent - vacancyDrag);

  const annualOperatingExpenses = expensesMonthly * 12;
  const totalDeductibleExpenses = annualOperatingExpenses + annualImi;

  // CIRS Artigo 41.º: Despesas de manutenção, conservação, condomínio, seguros e IMI são dedutíveis
  const taxableBaseAnnual = Math.max(0, effectiveGrossRent - totalDeductibleExpenses);
  const annualIrsTax = Math.round(taxableBaseAnnual * (taxRatePercent / 100));
  const monthlyIrsTax = Math.round(annualIrsTax / 12);

  // Without CIRS 41 deduction, the unshielded tax would be effectiveGrossRent * rate
  const unshieldedTax = Math.round(effectiveGrossRent * (taxRatePercent / 100));
  const cirsTaxShieldBenefitAnnual = Math.max(0, unshieldedTax - annualIrsTax);

  const netAnnualCashflow = Math.round(
    effectiveGrossRent - annualOperatingExpenses - annualImi - annualIrsTax
  );
  const netMonthlyCashflow = Math.round(netAnnualCashflow / 12);

  const grossYield =
    propertyValuation > 0
      ? Number(((grossAnnualRent / propertyValuation) * 100).toFixed(2))
      : 0;

  const netYield =
    propertyValuation > 0
      ? Number(((netAnnualCashflow / propertyValuation) * 100).toFixed(2))
      : 0;

  return {
    grossAnnualRent,
    effectiveGrossRent,
    annualOperatingExpenses,
    annualImi,
    taxDeductibleExpenses: totalDeductibleExpenses,
    taxableBaseAnnual,
    annualIrsTax,
    monthlyIrsTax,
    netAnnualCashflow,
    netMonthlyCashflow,
    grossYield,
    netYield,
    cirsTaxShieldBenefitAnnual,
  };
}

export interface TrajectoryPoint {
  year: number;
  label: string;
  baseline: number;
  scenario: number;
}

// Deterministic projection engine calibrated to real returns, inflation, DCA contributions, and property-specific appreciation/rent
export function calculateProjectionSeries(
  currentNetWorth: number,
  baselineParams: ScenarioParams,
  scenarioParams: ScenarioParams,
  startYear: number = 2024,
  endYear: number = 2055,
  realEstateAssets?: RealEstateAsset[]
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];

  let baselineNW = currentNetWorth;
  let scenarioNW = currentNetWorth;

  // Real estate portfolio appreciation & rental yield calibration
  let propertyWeightedAppreciation = 0.035;
  let annualNetRentalCashflow = 0;
  let reWeightInNW = 0.45; // Default ~45% of wealth in real estate

  if (realEstateAssets && realEstateAssets.length > 0) {
    const totalReVal = realEstateAssets.reduce((s, r) => s + r.currentValuation, 0);
    if (totalReVal > 0) {
      propertyWeightedAppreciation =
        realEstateAssets.reduce(
          (s, r) => s + r.currentValuation * ((r.expectedAppreciationYoY ?? 3.5) / 100),
          0
        ) / totalReVal;
      reWeightInNW = Math.min(0.8, Math.max(0.2, totalReVal / Math.max(1, currentNetWorth)));
    }
    annualNetRentalCashflow = realEstateAssets
      .filter((r) => r.purpose === "investment" && r.isRented)
      .reduce((s, r) => s + (r.netMonthlyRentalCashflow || 0) * 12, 0);
  }

  // Combined baseline return weighted by assets
  // (Equities ~6.5% real, crypto ~9% real, real estate dynamic appreciation)
  const baselineDynamicReturn = 0.052 + (propertyWeightedAppreciation - 0.035) * reWeightInNW;
  const scenarioDynamicReturn = 0.056 + (propertyWeightedAppreciation - 0.035) * reWeightInNW;

  const yearsCount = endYear - startYear;

  for (let i = 0; i <= yearsCount; i++) {
    const year = startYear + i;

    if (i === 0) {
      points.push({
        year,
        label: `${year}`,
        baseline: Math.round(baselineNW),
        scenario: Math.round(scenarioNW),
      });
      continue;
    }

    // Annual contribution deltas
    const baselineAnnualDCA =
      (baselineParams.monthlyEtfInvestment * 12) +
      (baselineParams.monthlyCryptoInvestment * 12) +
      (baselineParams.extraLoanPayment * 12) +
      annualNetRentalCashflow;

    const scenarioAnnualDCA =
      (scenarioParams.monthlyEtfInvestment * 12) +
      (scenarioParams.monthlyCryptoInvestment * 12) +
      (scenarioParams.extraLoanPayment * 12) +
      annualNetRentalCashflow;

    // Compound baseline
    const baselineGrowth = baselineNW * baselineDynamicReturn + baselineAnnualDCA;
    baselineNW += baselineGrowth;

    // Compound scenario with input adjustments
    const incomeDelta = Math.max(0, (scenarioParams.futureMonthlyIncome - baselineParams.futureMonthlyIncome) * 12 * 0.5);
    const spendingDelta = (baselineParams.monthlySpending - scenarioParams.monthlySpending) * 12;
    const inflationDrag = (scenarioParams.annualInflation - baselineParams.annualInflation) * 0.01 * scenarioNW;

    const scenarioGrowth =
      scenarioNW * scenarioDynamicReturn +
      scenarioAnnualDCA +
      incomeDelta +
      spendingDelta -
      inflationDrag;

    scenarioNW += scenarioGrowth;

    // Sample every 5 years or key milestone years
    if (year === 2024 || year === 2030 || year === 2035 || year === 2040 || year === 2045 || year === 2050 || year === 2055) {
      points.push({
        year,
        label: `${year}`,
        baseline: Math.round(baselineNW),
        scenario: Math.round(scenarioNW),
      });
    }
  }

  return points;
}
