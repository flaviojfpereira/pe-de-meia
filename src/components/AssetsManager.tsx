import React, { useState } from "react";
import {
  Plus,
  Building2,
  Landmark,
  TrendingUp,
  Coins,
  Car,
  CreditCard,
  Sparkles,
  Trash2,
  Edit2,
  Check,
  X,
  Info,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Compass,
  Calendar,
  DollarSign,
  Percent,
  Target,
  Home,
  ArrowUpRight,
  PieChart,
  HelpCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AnyAsset,
  BankAsset,
  CryptoAsset,
  GroundingData,
  LoanItem,
  RealEstateAsset,
  RealEstateMilestone,
  StockAsset,
  VehicleAsset,
} from "../types";
import {
  formatEuro,
  calculateClosingCosts,
  calculateCirsRentalCashflow,
} from "../utils/calculations";

interface AssetsManagerProps {
  assets: AnyAsset[];
  loans: LoanItem[];
  onAddAsset: (asset: AnyAsset) => void;
  onUpdateAsset: (asset: AnyAsset) => void;
  onDeleteAsset: (id: string) => void;
  onAddLoan: (loan: LoanItem) => void;
  onDeleteLoan: (id: string) => void;
  onOpenGrounding: (data: GroundingData) => void;
  realEstateMilestones?: RealEstateMilestone[];
  onAddRealEstateMilestone?: (milestone: RealEstateMilestone) => void;
  onUpdateRealEstateMilestone?: (milestone: RealEstateMilestone) => void;
  onDeleteRealEstateMilestone?: (id: string) => void;
}

export const AssetsManager: React.FC<AssetsManagerProps> = ({
  assets,
  loans,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onAddLoan,
  onDeleteLoan,
  onOpenGrounding,
  realEstateMilestones = [],
  onAddRealEstateMilestone,
  onUpdateRealEstateMilestone,
  onDeleteRealEstateMilestone,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "real_estate" | "bank" | "stock" | "crypto" | "vehicle" | "loans"
  >("real_estate");

  // Real estate sub-view toggle: inventory list vs investment trajectory/pathway
  const [reSubView, setReSubView] = useState<"inventory" | "pathway">("inventory");

  // Real estate LLM valuation modal / form state
  const [realEstateModalOpen, setRealEstateModalOpen] = useState<boolean>(false);
  const [isValuatingWithLLM, setIsValuatingWithLLM] = useState<boolean>(false);
  const [llmFeedback, setLlmFeedback] = useState<any>(null);
  const [valuationSourceEngine, setValuationSourceEngine] = useState<string>("");

  // Form fields for Real Estate (defaults set to Portuguese home context)
  const [reTitle, setReTitle] = useState<string>("Apartamento T3");
  const [reLocation, setReLocation] = useState<string>("S. Martinho do Bispo, Coimbra");
  const [reTypology, setReTypology] = useState<string>("T3");
  const [reAreaM2, setReAreaM2] = useState<number>(110);
  const [reCondition, setReCondition] = useState<"New" | "Renovated" | "Good" | "Needs Renovation">("Good");
  const [reYearBuilt, setReYearBuilt] = useState<number>(2003);
  const [reEnergyRating, setReEnergyRating] = useState<string>("C");
  const [reBathrooms, setReBathrooms] = useState<number>(2);
  const [reBalconiesCount, setReBalconiesCount] = useState<number>(2);
  const [reHeatingType, setReHeatingType] = useState<string>("Gas Central Heating (Wall Radiators)");
  const [reHasAC, setReHasAC] = useState<boolean>(false);
  const [reParking, setReParking] = useState<string>("Covered Garage Space");
  const [reHasElevator, setReHasElevator] = useState<boolean>(true);
  const [reHasStorage, setReHasStorage] = useState<boolean>(true);
  const [reNotes, setReNotes] = useState<string>("Double glazed windows with thermal break, 2 sunny facades, close to Covões Hospital and ISCAC");
  const [reFeatures, setReFeatures] = useState<string[]>([
    "Sea / River View",
  ]);
  const [reValuation, setReValuation] = useState<number>(310000);

  // Real Estate Investment & Rental Form State
  const [rePurpose, setRePurpose] = useState<"hpp" | "investment" | "secondary">("hpp");
  const [reIsRented, setReIsRented] = useState<boolean>(true);
  const [reMonthlyRentGross, setReMonthlyRentGross] = useState<number>(950);
  const [reRentalExpensesMonthly, setReRentalExpensesMonthly] = useState<number>(65);
  const [reRentalTaxRate, setReRentalTaxRate] = useState<number>(25); // 25% autonomous, 15% 5-10y, 10% >10y, 0%
  const [reExpectedAppreciationYoY, setReExpectedAppreciationYoY] = useState<number>(3.5);

  // Real Estate Investment Milestone Modal State
  const [milestoneModalOpen, setMilestoneModalOpen] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<RealEstateMilestone | null>(null);
  const [msName, setMsName] = useState<string>("");
  const [msTargetYear, setMsTargetYear] = useState<number>(2028);
  const [msPrice, setMsPrice] = useState<number>(225000);
  const [msDownPaymentPct, setMsDownPaymentPct] = useState<number>(20);
  const [msMonthlyRent, setMsMonthlyRent] = useState<number>(950);
  const [msStrategy, setMsStrategy] = useState<"rent_long_term" | "student_rooms" | "vacation_al" | "hpp_upgrade">("student_rooms");
  const [msStatus, setMsStatus] = useState<"planned" | "in_progress" | "achieved">("planned");
  const [msLocation, setMsLocation] = useState<string>("Coimbra - S. Martinho do Bispo / Covões");
  const [msNotes, setMsNotes] = useState<string>("");

  // Generic asset / loan modals
  const [genericAssetModalOpen, setGenericAssetModalOpen] = useState<boolean>(false);
  const [loanModalOpen, setLoanModalOpen] = useState<boolean>(false);

  // New Generic Asset Form
  const [assetCat, setAssetCat] = useState<"bank" | "stock" | "crypto" | "vehicle">("bank");
  const [assetName, setAssetName] = useState<string>("");
  const [assetValue, setAssetValue] = useState<number>(10000);
  const [assetInstitution, setAssetInstitution] = useState<string>("Millennium BCP");
  const [assetMonthlyContribution, setAssetMonthlyContribution] = useState<number>(0);

  // New Loan Form
  const [loanName, setLoanName] = useState<string>("");
  const [loanType, setLoanType] = useState<"housing" | "vehicle" | "personal">("housing");
  const [loanBalance, setLoanBalance] = useState<number>(250000);
  const [loanPayment, setLoanPayment] = useState<number>(950);
  const [loanRate, setLoanRate] = useState<number>(3.5);
  const [loanMaturity, setLoanMaturity] = useState<number>(2050);
  const [loanInstitution, setLoanInstitution] = useState<string>("Millennium BCP");

  // Call server-side Gemini route for Real Estate estimation with Idealista & INE search grounding
  const handleEstimateWithGemini = async (customOverrides?: Partial<{
    title: string;
    location: string;
    typology: string;
    areaM2: number;
    condition: string;
    yearBuilt: number;
    energyRating: string;
    features: string[];
    bathrooms: number;
    balconiesCount: number;
    heatingType: string;
    hasAC: boolean;
    parkingSpaces: string;
    hasElevator: boolean;
    hasStorage: boolean;
    notes: string;
  }>) => {
    setIsValuatingWithLLM(true);
    try {
      const activeYear = customOverrides?.yearBuilt ?? reYearBuilt;
      const activeBathrooms = customOverrides?.bathrooms ?? reBathrooms;
      const activeBalconies = customOverrides?.balconiesCount ?? reBalconiesCount;
      const activeHeating = customOverrides?.heatingType ?? reHeatingType;
      const activeAC = customOverrides?.hasAC ?? reHasAC;
      const activeElevator = customOverrides?.hasElevator ?? reHasElevator;
      const activeStorage = customOverrides?.hasStorage ?? reHasStorage;
      const activeParking = customOverrides?.parkingSpaces ?? reParking;
      const activeNotes = customOverrides?.notes ?? reNotes;

      const compiledFeatures = [
        `${activeBathrooms} Bathrooms`,
        activeBalconies > 0 ? `${activeBalconies} Balconies` : "No Balcony",
        activeHeating,
        activeAC ? "With Air Conditioning" : "No Air Conditioning",
        activeElevator ? "With Elevator" : "Without Elevator",
        activeStorage ? "With Storage Room" : "Without Storage Room",
        activeParking,
        ...(customOverrides?.features ?? reFeatures).filter(
          (f) => !f.includes("Bathroom") && !f.includes("Balcon") && !f.includes("Elevator") && !f.includes("Storage")
        ),
      ];

      const res = await fetch("/api/real-estate/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customOverrides?.title ?? reTitle,
          location: customOverrides?.location ?? reLocation,
          typology: customOverrides?.typology ?? reTypology,
          areaM2: customOverrides?.areaM2 ?? reAreaM2,
          condition: customOverrides?.condition ?? reCondition,
          yearBuilt: activeYear,
          energyRating: customOverrides?.energyRating ?? reEnergyRating,
          features: compiledFeatures,
          bathrooms: activeBathrooms,
          balconiesCount: activeBalconies,
          heatingType: activeHeating,
          hasAC: activeAC,
          parkingSpaces: activeParking,
          hasElevator: activeElevator,
          hasStorage: activeStorage,
          notes: activeNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLlmFeedback(data.data);
        setValuationSourceEngine(data.source || "AI & Idealista Valuation");
        setReValuation(data.data.estimatedValue);
      }
    } catch (err) {
      console.error("Valuation request failed:", err);
    } finally {
      setIsValuatingWithLLM(false);
    }
  };

  const openRealEstateModal = () => {
    setRealEstateModalOpen(true);
    if (!llmFeedback) {
      // Prompt valuation is active by default
      setTimeout(() => {
        handleEstimateWithGemini();
      }, 50);
    }
  };

  const handleSaveRealEstate = (e: React.FormEvent) => {
    e.preventDefault();
    const compiledFeatures = [
      `${reBathrooms} Bathrooms`,
      reBalconiesCount > 0 ? `${reBalconiesCount} Balconies` : "No Balcony",
      reHeatingType,
      reHasAC ? "With Air Conditioning" : "No Air Conditioning",
      reHasElevator ? "With Elevator" : "Without Elevator",
      reHasStorage ? "With Storage Room" : "Without Storage Room",
      reParking,
      ...reFeatures.filter(
        (f) => !f.includes("Bathroom") && !f.includes("Balcon") && !f.includes("Elevador") && !f.includes("Storage")
      ),
    ];

    const isInv = rePurpose === "investment";
    const grossRent = isInv ? Number(reMonthlyRentGross) : undefined;
    const taxRate = isInv ? Number(reRentalTaxRate) : undefined;
    const expenses = isInv ? Number(reRentalExpensesMonthly) : undefined;
    const yoy = Number(reExpectedAppreciationYoY) || 3.5;

    let netCashflow: number | undefined = undefined;
    let grossYield: number | undefined = undefined;
    let netYield: number | undefined = undefined;
    let cirsTaxShieldSavingsAnnual: number | undefined = undefined;

    if (isInv && grossRent) {
      const cirsRes = calculateCirsRentalCashflow({
        grossRentMonthly: grossRent,
        propertyValuation: Number(reValuation),
        taxRatePercent: taxRate || 25,
        expensesMonthly: expenses || 0,
        annualImi: 0,
        vacancyRatePercent: 0,
      });
      netCashflow = cirsRes.netMonthlyCashflow;
      grossYield = cirsRes.grossYield;
      netYield = cirsRes.netYield;
      cirsTaxShieldSavingsAnnual = cirsRes.cirsTaxShieldBenefitAnnual;
    }

    const newAsset: RealEstateAsset = {
      id: `re-${Date.now()}`,
      category: "real_estate",
      name: reTitle,
      location: reLocation,
      typology: reTypology,
      areaM2: Number(reAreaM2),
      condition: reCondition,
      yearBuilt: Number(reYearBuilt),
      energyRating: reEnergyRating,
      features: compiledFeatures,
      bathrooms: reBathrooms,
      balconiesCount: reBalconiesCount,
      heatingType: reHeatingType,
      hasAC: reHasAC,
      hasElevator: reHasElevator,
      hasGarage: !reParking.toLowerCase().includes("sem"),
      hasStorage: reHasStorage,
      notes: reNotes,
      currentValuation: Number(reValuation),
      valuationSource: "AI & Idealista Valuation",
      valuationDate: "2024-09",
      pricePerSqm: Math.round(Number(reValuation) / Number(reAreaM2)),
      askingPriceEstimate: llmFeedback?.askingPriceEstimate,
      negotiationDiscountPercent: llmFeedback?.negotiationDiscountPercent,
      marketTier: llmFeedback?.marketTier,
      sourcesUsed: llmFeedback?.sourcesUsed,
      comparables: llmFeedback?.comparables,
      purpose: rePurpose,
      isRented: isInv ? reIsRented : false,
      monthlyRentGross: grossRent,
      rentalExpensesMonthly: expenses,
      rentalTaxRate: taxRate,
      expectedAppreciationYoY: yoy,
      netMonthlyRentalCashflow: netCashflow,
      annualGrossYield: grossYield,
      annualNetYield: netYield,
      cirsTaxShieldSavingsAnnual,
      reasoningChain: llmFeedback?.reasoningChain || [
        `Valued at €${Number(reValuation).toLocaleString("pt-PT")} for ${reAreaM2} m² in ${reLocation}.`,
      ],
    };
    onAddAsset(newAsset);
    setRealEstateModalOpen(false);
  };

  const handleOpenAddMilestone = () => {
    setEditingMilestone(null);
    setMsName("");
    setMsTargetYear(new Date().getFullYear() + 2);
    setMsPrice(225000);
    setMsDownPaymentPct(20);
    setMsMonthlyRent(950);
    setMsStrategy("student_rooms");
    setMsStatus("planned");
    setMsLocation("Coimbra - S. Martinho do Bispo / Covões");
    setMsNotes("");
    setMilestoneModalOpen(true);
  };

  const handleOpenEditMilestone = (m: RealEstateMilestone) => {
    setEditingMilestone(m);
    setMsName(m.name);
    setMsTargetYear(m.targetYear);
    setMsPrice(m.estimatedPurchasePrice);
    setMsDownPaymentPct(m.downPaymentPercent);
    setMsMonthlyRent(m.projectedMonthlyRent);
    setMsStrategy(m.strategy);
    setMsStatus(m.status);
    setMsLocation(m.location || "");
    setMsNotes(m.notes || "");
    setMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msName.trim()) return;

    const price = Number(msPrice);
    const downPayment = Math.round((price * Number(msDownPaymentPct)) / 100);
    const closing = calculateClosingCosts(
      price,
      downPayment,
      msStrategy === "hpp_upgrade" ? "hpp" : "investment"
    );

    if (editingMilestone && onUpdateRealEstateMilestone) {
      onUpdateRealEstateMilestone({
        ...editingMilestone,
        name: msName.trim(),
        targetYear: Number(msTargetYear),
        estimatedPurchasePrice: price,
        downPaymentPercent: Number(msDownPaymentPct),
        projectedMonthlyRent: Number(msMonthlyRent),
        strategy: msStrategy,
        status: msStatus,
        location: msLocation.trim() || undefined,
        notes: msNotes.trim() || undefined,
        closingCostsEstimate: closing.totalClosingCosts,
        totalRequiredCapital: closing.totalUpfrontCapitalRequired,
      });
    } else if (onAddRealEstateMilestone) {
      const newM: RealEstateMilestone = {
        id: `rem-${Date.now()}`,
        name: msName.trim(),
        targetYear: Number(msTargetYear),
        estimatedPurchasePrice: price,
        downPaymentPercent: Number(msDownPaymentPct),
        projectedMonthlyRent: Number(msMonthlyRent),
        strategy: msStrategy,
        status: msStatus,
        location: msLocation.trim() || undefined,
        notes: msNotes.trim() || undefined,
        closingCostsEstimate: closing.totalClosingCosts,
        totalRequiredCapital: closing.totalUpfrontCapitalRequired,
      };
      onAddRealEstateMilestone(newM);
    }
    setMilestoneModalOpen(false);
  };

  const handleToggleMilestoneStatus = (m: RealEstateMilestone) => {
    if (!onUpdateRealEstateMilestone) return;
    const nextStatus =
      m.status === "planned"
        ? "in_progress"
        : m.status === "in_progress"
        ? "achieved"
        : "planned";
    onUpdateRealEstateMilestone({ ...m, status: nextStatus });
  };

  const handleSaveGenericAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim()) return;

    if (assetCat === "bank") {
      const bAsset: BankAsset = {
        id: `bank-${Date.now()}`,
        category: "bank",
        name: assetName.trim(),
        institution: assetInstitution.trim() || "Portuguese Bank",
        balance: Number(assetValue),
        isLiquid: true,
        currency: "EUR",
      };
      onAddAsset(bAsset);
    } else if (assetCat === "stock") {
      const sAsset: StockAsset = {
        id: `stock-${Date.now()}`,
        category: "stock",
        name: assetName.trim(),
        ticker: assetName.slice(0, 4).toUpperCase(),
        shares: 100,
        currentPrice: Number(assetValue) / 100,
        totalValue: Number(assetValue),
        monthlyContribution: Number(assetMonthlyContribution),
        platform: assetInstitution.trim() || "Broker",
      };
      onAddAsset(sAsset);
    } else if (assetCat === "crypto") {
      const cAsset: CryptoAsset = {
        id: `crypto-${Date.now()}`,
        category: "crypto",
        name: assetName.trim(),
        ticker: assetName.slice(0, 3).toUpperCase(),
        amount: 1,
        currentPrice: Number(assetValue),
        totalValue: Number(assetValue),
        monthlyContribution: Number(assetMonthlyContribution),
        storage: "Hardware Wallet",
      };
      onAddAsset(cAsset);
    } else if (assetCat === "vehicle") {
      // REQ-021: Simple valued assets
      const vAsset: VehicleAsset = {
        id: `veh-${Date.now()}`,
        category: "vehicle",
        name: assetName.trim(),
        value: Number(assetValue),
      };
      onAddAsset(vAsset);
    }

    setGenericAssetModalOpen(false);
    setAssetName("");
    setAssetValue(10000);
  };

  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim()) return;
    const newLoan: LoanItem = {
      id: `loan-${Date.now()}`,
      name: loanName.trim(),
      type: loanType,
      totalBalance: Number(loanBalance),
      monthlyPayment: Number(loanPayment),
      interestRate: Number(loanRate),
      maturityYear: Number(loanMaturity),
      institution: loanInstitution.trim() || "Bank",
    };
    onAddLoan(newLoan);
    setLoanModalOpen(false);
    setLoanName("");
  };

  const toggleFeature = (feat: string) => {
    if (reFeatures.includes(feat)) {
      setReFeatures(reFeatures.filter((f) => f !== feat));
    } else {
      setReFeatures([...reFeatures, feat]);
    }
  };

  const realEstateList = assets.filter((a): a is RealEstateAsset => a.category === "real_estate");
  const bankList = assets.filter((a): a is BankAsset => a.category === "bank");
  const stockList = assets.filter((a): a is StockAsset => a.category === "stock");
  const cryptoList = assets.filter((a): a is CryptoAsset => a.category === "crypto");
  const vehicleList = assets.filter((a): a is VehicleAsset => a.category === "vehicle");

  return (
    <div className="flex-1 min-w-0 bg-white p-6 lg:p-10 space-y-8 max-w-7xl mx-auto" id="assets-manager-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8e8ed]">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">Portfolio Assets & Liabilities</h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-medium mt-1">
            Single authoritative inventory. Portugal-first real estate valuation grounded in physical property features.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openRealEstateModal}
            className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
            id="add-real-estate-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Value & Add Property</span>
          </button>
          <button
            onClick={() => setGenericAssetModalOpen(true)}
            className="px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors border border-[#e8e8ed]"
            id="add-asset-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
          <button
            onClick={() => setLoanModalOpen(true)}
            className="px-4 py-2.5 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] rounded-full text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors border border-[#e8e8ed]"
            id="add-loan-btn"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Add Loan</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#e8e8ed] overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab("real_estate")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "real_estate"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Real Estate ({realEstateList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("bank")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "bank"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Banks & Cash ({bankList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("stock")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "stock"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Stocks & ETFs ({stockList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("crypto")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "crypto"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Crypto ({cryptoList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("vehicle")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "vehicle"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Vehicles ({vehicleList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("loans")}
          className={`px-4 py-2 rounded-full font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
            activeSubTab === "loans"
              ? "bg-[#1d1d1f] text-white shadow-xs"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Loans ({loans.length})</span>
        </button>
      </div>

      {/* Tab Content: Real Estate with Feature Valuation */}
      {activeSubTab === "real_estate" && (() => {
        const totalReValuation = realEstateList.reduce((s, r) => s + r.currentValuation, 0);
        const rentedInvestments = realEstateList.filter((r) => r.purpose === "investment" && r.isRented);
        const totalMonthlyNetRent = rentedInvestments.reduce((s, r) => s + (r.netMonthlyRentalCashflow || 0), 0);
        const totalMonthlyGrossRent = rentedInvestments.reduce((s, r) => s + (r.monthlyRentGross || 0), 0);
        const totalAnnualNetRent = totalMonthlyNetRent * 12;
        const totalAnnualGrossRent = totalMonthlyGrossRent * 12;
        const totalInvestmentValuation = realEstateList
          .filter((r) => r.purpose === "investment")
          .reduce((s, r) => s + r.currentValuation, 0);

        const avgGrossYield = totalInvestmentValuation > 0
          ? ((totalAnnualGrossRent / totalInvestmentValuation) * 100).toFixed(1)
          : "0.0";
        const avgNetYield = totalInvestmentValuation > 0
          ? ((totalAnnualNetRent / totalInvestmentValuation) * 100).toFixed(1)
          : "0.0";

        const weightedYoYAppreciation = totalReValuation > 0
          ? (
              realEstateList.reduce(
                (s, r) => s + r.currentValuation * (r.expectedAppreciationYoY ?? 3.5),
                0
              ) / totalReValuation
            ).toFixed(1)
          : "3.5";

        const totalAnnualAppreciationEuro = Math.round(
          realEstateList.reduce(
            (s, r) => s + (r.currentValuation * (r.expectedAppreciationYoY ?? 3.5)) / 100,
            0
          )
        );

        return (
        <div className="space-y-4" id="real-estate-list-section">
          {/* Real Estate Subview Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e8e8ed]">
            <div className="flex items-center space-x-1.5 p-1 bg-[#f5f5f7] rounded-full border border-[#e8e8ed] self-start">
              <button
                onClick={() => setReSubView("inventory")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  reSubView === "inventory"
                    ? "bg-[#1d1d1f] text-white shadow-xs"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
                id="re-subview-inventory-btn"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Imóveis Atuais ({realEstateList.length})</span>
              </button>
              <button
                onClick={() => setReSubView("pathway")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  reSubView === "pathway"
                    ? "bg-[#1d1d1f] text-white shadow-xs"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
                id="re-subview-pathway-btn"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Caminho de Investimento ({realEstateMilestones.length} metas)</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              {reSubView === "pathway" ? (
                <button
                  onClick={handleOpenAddMilestone}
                  className="btn-primary text-xs flex items-center space-x-1.5 py-1.5 px-3.5"
                  id="add-milestone-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Marco de Investimento</span>
                </button>
              ) : (
                <button
                  onClick={openRealEstateModal}
                  className="btn-primary text-xs flex items-center space-x-1.5 py-1.5 px-3.5"
                  id="add-property-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Property</span>
                </button>
              )}
            </div>
          </div>

          {reSubView === "inventory" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-label">
                  Properties appraised from physical features & Portuguese registries
                </span>
                <div className="flex items-center space-x-4">
                  {totalMonthlyNetRent > 0 && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Net Rental Cash Flow: +€{totalMonthlyNetRent.toLocaleString("pt-PT")}/mo
                    </span>
                  )}
                  <span className="text-[#86868b] font-medium">
                    Total Real Estate:{" "}
                    <strong className="text-[#1d1d1f] font-extrabold">
                      {formatEuro(totalReValuation)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realEstateList.map((re) => (
              <div
                key={re.id}
                className="card space-y-4 relative hover:border-[#86868b] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase bg-[#1d1d1f] text-white px-2.5 py-0.5 rounded-full">
                        {re.typology} • {re.areaM2} m²
                      </span>
                      {re.yearBuilt && (
                        <span className="text-[10px] bg-[#f5f5f7] text-[#1d1d1f] px-2 py-0.5 rounded-full font-bold border border-[#e8e8ed]">
                          Built {re.yearBuilt}
                        </span>
                      )}
                      <span className="text-[10px] bg-white text-[#1d1d1f] px-2 py-0.5 rounded-full font-bold border border-[#e8e8ed]">
                        Energy {re.energyRating}
                      </span>
                      {/* Investment or HPP Badge */}
                      {re.purpose === "investment" ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          <span>Investment {re.isRented ? "• Rented" : "• Vacant"}</span>
                        </span>
                      ) : re.purpose === "secondary" ? (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          🏖️ Secondary
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          🏠 Primary Residence
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-[#1d1d1f] mt-1.5">{re.name}</h4>
                    <p className="text-xs text-[#86868b] font-medium">{re.location}</p>
                    {re.notes && (
                      <p className="text-[11px] text-[#86868b] italic mt-0.5">
                        "{re.notes}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteAsset(re.id)}
                    className="p-1.5 text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white transition-colors"
                    title="Delete property"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-[#e8e8ed] flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Current Fair Market Value</span>
                    <div className="text-2xl font-extrabold text-[#1d1d1f]">{formatEuro(re.currentValuation)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">Square Meter Metric</span>
                    <span className="text-xs font-bold text-[#1d1d1f]">
                      €{Math.round(re.currentValuation / re.areaM2).toLocaleString("pt-PT")} /m²
                    </span>
                  </div>
                </div>

                {/* RENTAL & CASH FLOW STRIP FOR INVESTMENTS */}
                {re.purpose === "investment" && (
                  <div className="bg-[#f5fbf7] border border-emerald-200/70 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 text-emerald-600" />
                        <span>Lease & Rental Cash Flow</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                        +{re.expectedAppreciationYoY ?? 3.5}% YoY appreciation
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-emerald-200/50">
                      <div>
                        <span className="text-[9px] text-[#86868b] uppercase font-semibold block">Gross Rent</span>
                        <span className="text-xs font-extrabold text-[#1d1d1f]">
                          {re.monthlyRentGross ? `€${re.monthlyRentGross.toLocaleString("pt-PT")}/mo` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-800 uppercase font-semibold block">Net Cash Flow</span>
                        <span className="text-xs font-black text-emerald-700">
                          {re.netMonthlyRentalCashflow ? `+€${re.netMonthlyRentalCashflow.toLocaleString("pt-PT")}/mo` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#86868b] uppercase font-semibold block">Gross Yield</span>
                        <span className="text-xs font-extrabold text-[#1d1d1f]">
                          {re.annualGrossYield ? `${re.annualGrossYield}%` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-emerald-800 uppercase font-semibold block">Net Yield</span>
                        <span className="text-xs font-black text-emerald-700">
                          {re.annualNetYield ? `${re.annualNetYield}%` : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#86868b] pt-1 flex items-center justify-between border-t border-emerald-200/30 flex-wrap gap-1">
                      <span>Tax Regime: {re.rentalTaxRate ?? 25}% autonomous IRS</span>
                      <span>HOA / Exp: €{re.rentalExpensesMonthly ?? 0}/mo</span>
                      {re.cirsTaxShieldSavingsAnnual && re.cirsTaxShieldSavingsAnnual > 0 && (
                        <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Art. 41 CIRS: -€{re.cirsTaxShieldSavingsAnnual}/yr IRS
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* YoY APPRECIATION STRIP FOR HPP OR SECONDARY */}
                {re.purpose !== "investment" && (
                  <div className="bg-[#f5f5f7] p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#1d1d1f]" />
                      <span className="text-[#86868b] font-medium">Projected YoY Appreciation:</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-[#1d1d1f]">+{re.expectedAppreciationYoY ?? 3.5}% / yr</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        +€{Math.round((re.currentValuation * (re.expectedAppreciationYoY ?? 3.5)) / 100).toLocaleString("pt-PT")}/yr
                      </span>
                    </div>
                  </div>
                )}

                {/* Asking Price vs Real Deed & Negotiation Discount */}
                {re.askingPriceEstimate ? (
                  <div className="bg-[#f5f5f7] p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-[#86868b] font-medium block">Idealista Asking Price:</span>
                      <span className="font-extrabold text-[#1d1d1f]">{formatEuro(re.askingPriceEstimate)}</span>
                    </div>
                    {re.negotiationDiscountPercent && (
                      <div className="text-right">
                        <span className="text-[#86868b] font-medium block">Deed Gap:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[10px]">
                          -{re.negotiationDiscountPercent}% negotiation
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {re.features.map((f, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-white text-[#1d1d1f] px-2.5 py-0.5 rounded-full border border-[#e8e8ed]"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                {/* Comparable Listings Preview if available */}
                {re.comparables && re.comparables.length > 0 && (
                  <div className="pt-2 border-t border-[#e8e8ed] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wider block">
                        Market Comparables ({re.comparables.length} referências)
                      </span>
                      <span className="text-[10px] text-[#86868b]">
                        Ativos & Transacionados
                      </span>
                    </div>
                    <div className="space-y-1">
                      {re.comparables.slice(0, 3).map((comp, cIdx) => {
                        const isActive = comp.status === "active" && !!comp.url;
                        return (
                          <div
                            key={cIdx}
                            className="bg-white border border-[#e8e8ed] p-2 rounded-lg flex items-center justify-between text-[10px] gap-2"
                          >
                            <div className="truncate pr-1 flex items-center space-x-1.5">
                              {isActive ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#e8f5e9] text-[#2e7d32] shrink-0">
                                  🟢 Active
                                </span>
                              ) : comp.status === "transacted" ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#f5f5f7] text-[#515154] shrink-0">
                                  🏛️ Deed Record
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#fbe9e7] text-[#d84315] shrink-0">
                                  🔴 Inactive
                                </span>
                              )}
                              <span className="font-semibold text-[#1d1d1f] truncate">{comp.title}</span>
                              {comp.dateRecorded && (
                                <span className="text-[#86868b] text-[9px] hidden sm:inline">
                                  • {comp.dateRecorded}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 shrink-0">
                              <span className="font-extrabold text-[#1d1d1f]">
                                €{comp.price.toLocaleString("pt-PT")}
                              </span>
                              {isActive && comp.url ? (
                                <a
                                  href={comp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#1d1d1f] hover:text-[#0071e3] p-0.5"
                                  title="Ver pesquisa ativa no portal"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[9px] text-[#86868b] italic">
                                  (inativo)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grounding Link for Real Estate Valuation */}
                <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#86868b] font-medium">Source: {re.valuationSource}</span>
                  <button
                    onClick={() =>
                      onOpenGrounding({
                        title: `Real Estate Market Grounding: ${re.name}`,
                        metricName: "Property Fair Market Value",
                        primaryValue: formatEuro(re.currentValuation),
                        formula: `Area (${re.areaM2} m²) × Calibrated Parish Index (€${Math.round(
                          re.currentValuation / re.areaM2
                        )}/m²) = ${formatEuro(re.currentValuation)}${
                          re.askingPriceEstimate
                            ? ` (Derived from Idealista asking price €${re.askingPriceEstimate.toLocaleString("pt-PT")} with -${re.negotiationDiscountPercent || 6}% deed negotiation gap)`
                            : ""
                        }`,
                        inputs: [
                          { label: "Location", value: re.location },
                          { label: "Typology", value: re.typology },
                          { label: "Area", value: `${re.areaM2} m² útil` },
                          { label: "Condition", value: re.condition },
                          { label: "Features", value: re.features.join(", ") },
                          ...(re.askingPriceEstimate
                            ? [{ label: "Idealista Asking Price", value: formatEuro(re.askingPriceEstimate) }]
                            : []),
                          ...(re.negotiationDiscountPercent
                            ? [{ label: "Negotiation Margin", value: `-${re.negotiationDiscountPercent}% from asking to deed` }]
                            : []),
                          ...(re.sourcesUsed
                            ? [{ label: "Market Sources", value: re.sourcesUsed.join("; ") }]
                            : []),
                        ],
                        reasoningSteps: [
                          ...(re.reasoningChain || []),
                          ...(re.comparables && re.comparables.length > 0
                            ? [
                                `Market Comparables: ${re.comparables
                                  .map(
                                    (c) =>
                                      `${c.title} (${c.source} • ${
                                        c.status === "active"
                                          ? c.linkType === "property"
                                            ? "🏠 Direct Listing"
                                            : "🔍 Parish Search"
                                          : c.status === "transacted"
                                          ? "🏛️ Notary Deed"
                                          : "🔴 Inactive/Sold"
                                      }${c.dateRecorded ? ` [${c.dateRecorded}]` : ""}): €${c.price.toLocaleString("pt-PT")}`
                                  )
                                  .join(" | ")}`,
                              ]
                            : []),
                        ],
                        contextNote:
                          "Grounded on live Idealista asking price comparables, INE official notary deed registry data, and Portuguese market transaction discounts.",
                      })
                    }
                    className="text-[#1d1d1f] hover:underline font-bold text-[11px] flex items-center space-x-1"
                  >
                    <span>View Grounding</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
          )}

          {/* PATHWAY & TRAJECTORY VIEW */}
          {reSubView === "pathway" && (
            <div className="space-y-6" id="real-estate-pathway-view">
              {/* Top 4 KPI Metrics Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="card p-4 space-y-1">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">
                    Current Real Estate Assets
                  </span>
                  <div className="text-2xl font-extrabold text-[#1d1d1f]">
                    {formatEuro(totalReValuation)}
                  </div>
                  <span className="text-[11px] text-[#86868b] font-medium flex items-center space-x-1">
                    <span>{realEstateList.length} properties under active management</span>
                  </span>
                </div>

                <div className="card p-4 space-y-1 bg-[#f5fbf7] border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Net Rental Cash Flow
                  </span>
                  <div className="text-2xl font-black text-emerald-700">
                    +€{totalMonthlyNetRent.toLocaleString("pt-PT")}/mo
                  </div>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    +€{totalAnnualNetRent.toLocaleString("pt-PT")}/yr after IRS & condo expenses
                  </span>
                </div>

                <div className="card p-4 space-y-1">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">
                    Rental Yield
                  </span>
                  <div className="text-2xl font-extrabold text-[#1d1d1f]">
                    {avgNetYield}% <span className="text-sm font-bold text-[#86868b]">Net</span>
                  </div>
                  <span className="text-[11px] text-[#86868b] font-medium">
                    {avgGrossYield}% gross on market value
                  </span>
                </div>

                <div className="card p-4 space-y-1">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">
                    YoY Capital Appreciation
                  </span>
                  <div className="text-2xl font-extrabold text-[#1d1d1f]">
                    +{weightedYoYAppreciation}% <span className="text-sm font-bold text-[#86868b]">/yr</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">
                    +€{totalAnnualAppreciationEuro.toLocaleString("pt-PT")}/yr in equity gains
                  </span>
                </div>
              </div>

              {/* Milestone Roadmap Section */}
              <div className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e8e8ed]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-[#1d1d1f]" />
                      <h3 className="text-base font-extrabold text-[#1d1d1f]">
                        Housing Investment Pathway (Milestone Roadmap)
                      </h3>
                    </div>
                    <p className="text-xs text-[#86868b] font-medium mt-0.5">
                      Strategic roadmap for new acquisitions, down payment savings (20%), and debt payoff.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenAddMilestone}
                    className="btn-primary text-xs flex items-center space-x-1.5 py-2 px-4 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Milestone</span>
                  </button>
                </div>

                {/* Milestones List */}
                <div className="space-y-3">
                  {realEstateMilestones.length === 0 ? (
                    <div className="text-center py-8 bg-[#f5f5f7] rounded-xl border border-dashed border-[#e8e8ed] space-y-2">
                      <Compass className="w-8 h-8 text-[#86868b] mx-auto opacity-50" />
                      <p className="text-xs text-[#86868b] font-semibold">
                        No investment milestones defined yet.
                      </p>
                      <button
                        onClick={handleOpenAddMilestone}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Add First Milestone
                      </button>
                    </div>
                  ) : (
                    realEstateMilestones
                      .slice()
                      .sort((a, b) => a.targetYear - b.targetYear)
                      .map((m) => {
                        const downPaymentEuro = Math.round(
                          (m.estimatedPurchasePrice * m.downPaymentPercent) / 100
                        );
                        const loanEuro = m.estimatedPurchasePrice - downPaymentEuro;
                        const estGrossYield =
                          m.estimatedPurchasePrice > 0
                            ? ((m.projectedMonthlyRent * 12 / m.estimatedPurchasePrice) * 100).toFixed(1)
                            : "0.0";

                        return (
                          <div
                            key={m.id}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              m.status === "achieved"
                                ? "bg-[#f5fbf7] border-emerald-200"
                                : m.status === "in_progress"
                                ? "bg-amber-50/50 border-amber-200"
                                : "bg-white border-[#e8e8ed] hover:border-[#86868b]"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center space-x-2.5">
                                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#1d1d1f] text-white">
                                  Year {m.targetYear}
                                </span>
                                <h4 className="text-sm font-extrabold text-[#1d1d1f]">{m.name}</h4>
                                {m.location && (
                                  <span className="text-xs text-[#86868b] font-medium hidden md:inline">
                                    • {m.location}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                {/* Status clickable pill */}
                                <button
                                  onClick={() => handleToggleMilestoneStatus(m)}
                                  title="Click to toggle status"
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all flex items-center space-x-1 ${
                                    m.status === "achieved"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : m.status === "in_progress"
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : "bg-[#f5f5f7] text-[#86868b] border border-[#e8e8ed]"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      m.status === "achieved"
                                        ? "bg-emerald-500"
                                        : m.status === "in_progress"
                                        ? "bg-amber-500"
                                        : "bg-neutral-400"
                                    }`}
                                  ></span>
                                  <span>
                                    {m.status === "achieved"
                                      ? "Achieved / Active"
                                      : m.status === "in_progress"
                                      ? "In Progress / Negotiation"
                                      : "Planned"}
                                  </span>
                                </button>

                                <button
                                  onClick={() => handleOpenEditMilestone(m)}
                                  className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-white transition-colors"
                                  title="Edit milestone"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {onDeleteRealEstateMilestone && (
                                  <button
                                    onClick={() => onDeleteRealEstateMilestone(m.id)}
                                    className="p-1.5 text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white transition-colors"
                                    title="Remove milestone"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Milestone Key Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#e8e8ed]/60 text-xs">
                              <div>
                                <span className="text-[9px] text-[#86868b] font-semibold uppercase block">
                                  Purchase Price
                                </span>
                                <span className="font-extrabold text-[#1d1d1f]">
                                  {formatEuro(m.estimatedPurchasePrice)}
                                </span>
                              </div>

                              <div>
                                <span className="text-[9px] text-[#86868b] font-semibold uppercase block">
                                  Bank Down Payment ({m.downPaymentPercent}%)
                                </span>
                                <span className="font-extrabold text-amber-700">
                                  {formatEuro(downPaymentEuro)}
                                </span>
                                {m.totalRequiredCapital && m.totalRequiredCapital > downPaymentEuro ? (
                                  <span className="text-[10px] text-rose-700 font-bold block leading-tight mt-0.5" title="Includes IMT, Purchase Stamp Duty (0.8%), Loan Stamp Duty (0.6%), Notary and Bank appraisal fees">
                                    Total w/ Taxes: <strong>{formatEuro(m.totalRequiredCapital)}</strong>
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-[#86868b] block">
                                    Financing: {formatEuro(loanEuro)}
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="text-[9px] text-[#86868b] font-semibold uppercase block">
                                  Projected Monthly Rent
                                </span>
                                <span className="font-extrabold text-emerald-700">
                                  {m.projectedMonthlyRent > 0
                                    ? `+€${m.projectedMonthlyRent.toLocaleString("pt-PT")}/mo`
                                    : "Primary Residence"}
                                </span>
                                {m.projectedMonthlyRent > 0 && (
                                  <span className="text-[9px] text-[#86868b] block">
                                    Est. Gross Yield: ~{estGrossYield}%
                                  </span>
                                )}
                              </div>

                              <div>
                                <span className="text-[9px] text-[#86868b] font-semibold uppercase block">
                                  Strategy
                                </span>
                                <span className="font-bold text-[#1d1d1f]">
                                  {m.strategy === "student_rooms"
                                    ? "🎓 Student Rooms"
                                    : m.strategy === "rent_long_term"
                                    ? "🏢 Long-Term Rental"
                                    : m.strategy === "vacation_al"
                                    ? "🌊 Flexible / Vacation Rental"
                                    : "🏠 Primary Residence Upgrade"}
                                </span>
                              </div>
                            </div>

                            {m.notes && (
                              <p className="text-[11px] text-[#86868b] italic pt-1 border-t border-[#e8e8ed]/40">
                                {m.notes}
                              </p>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>

              {/* 10-Year & 20-Year Real Estate Compounding & Equity Forecast */}
              <div className="card p-5 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#1d1d1f]">
                    Compound Real Estate Wealth Forecast (YoY Appreciation + Accumulated Rents)
                  </h3>
                  <p className="text-xs text-[#86868b] font-medium mt-0.5">
                    Projected real estate portfolio growth combining annual appreciation ({weightedYoYAppreciation}% YoY) and accumulated net reinvested rents.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e8e8ed] text-[10px] text-[#86868b] uppercase tracking-wider">
                        <th className="py-2.5 px-3 font-semibold">Time Horizon</th>
                        <th className="py-2.5 px-3 font-semibold">Property Value (YoY)</th>
                        <th className="py-2.5 px-3 font-semibold">Accumulated Net Rents</th>
                        <th className="py-2.5 px-3 font-semibold">Total Real Estate Wealth</th>
                        <th className="py-2.5 px-3 font-semibold">Monthly Passive Income</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e8e8ed]/60 font-medium">
                      {[
                        { years: 0, label: "Year 0 (Today, 2026)" },
                        { years: 3, label: "+3 Years (2029)" },
                        { years: 5, label: "+5 Years (2031)" },
                        { years: 10, label: "+10 Years (2036)" },
                        { years: 20, label: "+20 Years (2046)" },
                      ].map((horizon, idx) => {
                        const yoyRate = parseFloat(weightedYoYAppreciation) / 100 || 0.035;
                        const compoundedReVal = Math.round(
                          totalReValuation * Math.pow(1 + yoyRate, horizon.years)
                        );
                        let cumRent = 0;
                        for (let y = 1; y <= horizon.years; y++) {
                          cumRent += totalAnnualNetRent * Math.pow(1.02, y - 1);
                        }
                        cumRent = Math.round(cumRent);

                        const monthlyPassive = Math.round(
                          totalMonthlyNetRent * Math.pow(1.02, horizon.years)
                        );

                        return (
                          <tr key={idx} className="hover:bg-[#f5f5f7]/50 transition-colors">
                            <td className="py-3 px-3 font-extrabold text-[#1d1d1f]">
                              {horizon.label}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#1d1d1f]">
                              {formatEuro(compoundedReVal)}
                            </td>
                            <td className="py-3 px-3 text-emerald-700 font-bold">
                              {cumRent > 0 ? `+${formatEuro(cumRent)}` : "€0"}
                            </td>
                            <td className="py-3 px-3 font-black text-[#1d1d1f]">
                              {formatEuro(compoundedReVal + cumRent)}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-emerald-700">
                              {monthlyPassive > 0 ? `+€${monthlyPassive.toLocaleString("pt-PT")}/mo` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Portuguese Invisible Costs & Fiscal Audit Guide */}
                <div className="bg-[#fbfbfd] p-4 rounded-2xl border border-[#e8e8ed] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-[#1d1d1f] text-white rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-extrabold text-[#1d1d1f] text-xs">
                        Financial Friction & Hidden Costs Audit (Portugal)
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Net Efficiency Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 1. Custos de Aquisição */}
                    <div className="bg-white p-3 rounded-xl border border-[#e8e8ed] space-y-1.5">
                      <span className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
                        <span>🏛️</span>
                        <span>Acquisition Friction (IMT & Notary Deed)</span>
                      </span>
                      <p className="text-[11px] text-[#86868b] leading-relaxed">
                        When purchasing real estate in Portugal, buyers incur <strong>5% to 8% in statutory closing costs and taxes</strong> on top of deed price:
                      </p>
                      <ul className="text-[10px] text-[#1d1d1f] space-y-1 pl-1">
                        <li>• <strong>IMT</strong>: Progressive municipal property transfer tax (1% to 8% of deed value).</li>
                        <li>• <strong>Stamp Duty (Imposto de Selo)</strong>: 0.8% on purchase deed + 0.6% on financed loan amount.</li>
                        <li>• <strong>Notary & Bank Registry</strong>: ~€1,500 (Casa Pronta + appraisal + dossier processing).</li>
                      </ul>
                      <div className="text-[10px] text-amber-800 bg-amber-50/70 p-2 rounded-lg font-medium">
                        💡 <strong>Golden Rule</strong>: Required capital to purchase is <em>Down Payment + Closing Friction</em> (already integrated into simulator above).
                      </div>
                    </div>

                    {/* 2. Escudo Fiscal CIRS Artigo 41 */}
                    <div className="bg-white p-3 rounded-xl border border-[#e8e8ed] space-y-1.5">
                      <span className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
                        <span>🛡️</span>
                        <span>Tax Shield: CIRS Article 41</span>
                      </span>
                      <p className="text-[11px] text-[#86868b] leading-relaxed">
                        Under Portuguese residential tenancy law, landlords can deduct eligible maintenance and operating costs directly from gross rental income before IRS calculation:
                      </p>
                      <ul className="text-[10px] text-[#1d1d1f] space-y-1 pl-1">
                        <li>• <strong>Eligible Deductions</strong>: HOA/condo fees, multi-risk insurance, annual IMI property tax, and maintenance repairs.</li>
                        <li>• <strong>IRS Tax Rate</strong>: 25% (standard autonomous rate), dropping to 15% for 5-year leases or 10% for ≥ 10-year contracts.</li>
                      </ul>
                      <div className="text-[10px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg font-medium">
                        💡 <strong>Impact</strong>: For every €1,000 in documented condo fees/insurance deducted, you save up to €250 in IRS tax.
                      </div>
                    </div>

                    {/* 3. Encargos do Crédito */}
                    <div className="bg-white p-3 rounded-xl border border-[#e8e8ed] space-y-1.5">
                      <span className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
                        <span>💳</span>
                        <span>Invisible Mortgage Friction</span>
                      </span>
                      <p className="text-[11px] text-[#86868b] leading-relaxed">
                        Bank mortgages contain recurring statutory frictions that add to initial monthly payment costs:
                      </p>
                      <ul className="text-[10px] text-[#1d1d1f] space-y-1 pl-1">
                        <li>• <strong>Interest Stamp Duty</strong>: 4% statutory stamp duty on every monthly interest installment.</li>
                        <li>• <strong>Bank Life Insurance</strong>: Frequently priced at double external market rates. Decree-Law 222/2009 permits external policy transfers without penalty to contracted spread.</li>
                      </ul>
                    </div>

                    {/* 4. Mercados Financeiros & Cripto */}
                    <div className="bg-white p-3 rounded-xl border border-[#e8e8ed] space-y-1.5">
                      <span className="font-bold text-[#1d1d1f] flex items-center gap-1.5">
                        <span>📈</span>
                        <span>Market Friction & The 365-Day Rule</span>
                      </span>
                      <p className="text-[11px] text-[#86868b] leading-relaxed">
                        Across financial securities and digital assets in the portfolio:
                      </p>
                      <ul className="text-[10px] text-[#1d1d1f] space-y-1 pl-1">
                        <li>• <strong>Accumulating ETFs</strong>: Avoid 28% IRS drag on internal dividend reinvestment and feature ultra-low TERs (0.07%-0.22%).</li>
                        <li>• <strong>Crypto Assets (Art. 10 CIRS)</strong>: Complete IRS capital gains exemption (0%) for assets held for 365 days or longer.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Tab Content: Banks & Cash */}
      {activeSubTab === "bank" && (
        <div className="space-y-3" id="banks-list-section">
          <div className="flex justify-between items-center text-xs">
            <span className="text-label">Bank Accounts & Deposits</span>
            <span className="text-xs text-[#86868b] font-medium">
              Total Cash:{" "}
              <strong className="text-[#1d1d1f] font-extrabold">
                {formatEuro(bankList.reduce((s, b) => s + b.balance, 0))}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bankList.map((b) => (
              <div
                key={b.id}
                className="card flex justify-between items-start hover:border-[#86868b] transition-all"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1d1d1f]">{b.name}</span>
                    {b.isLiquid && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Liquid
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#86868b] font-medium mt-0.5">{b.institution}</p>
                  <div className="text-xl font-extrabold text-[#1d1d1f] mt-2">{formatEuro(b.balance)}</div>
                </div>
                <button
                  onClick={() => onDeleteAsset(b.id)}
                  className="text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Stocks & ETFs */}
      {activeSubTab === "stock" && (
        <div className="space-y-3" id="stocks-list-section">
          <div className="flex justify-between items-center text-xs">
            <span className="text-label">Equities, Funds & Treasury Certificates</span>
            <span className="text-xs text-[#86868b] font-medium">
              Total Equities:{" "}
              <strong className="text-[#1d1d1f] font-extrabold">
                {formatEuro(stockList.reduce((s, st) => s + st.totalValue, 0))}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockList.map((st) => (
              <div
                key={st.id}
                className="card flex justify-between items-start hover:border-[#86868b] transition-all"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1d1d1f]">{st.name}</span>
                  </div>
                  <div className="text-[10px] text-[#86868b] font-mono mt-0.5">
                    {st.ticker} • {st.platform}
                  </div>
                  <div className="text-xl font-extrabold text-[#1d1d1f] mt-2">{formatEuro(st.totalValue)}</div>
                  {st.monthlyContribution > 0 && (
                    <div className="text-[10px] text-[#1d1d1f] font-bold mt-1 bg-white px-2 py-0.5 rounded-full inline-block border border-[#e8e8ed]">
                      DCA: +{formatEuro(st.monthlyContribution)}/mo
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDeleteAsset(st.id)}
                  className="text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Crypto */}
      {activeSubTab === "crypto" && (
        <div className="space-y-3" id="crypto-list-section">
          <div className="flex justify-between items-center text-xs">
            <span className="text-label">Digital Assets & Self-Custody</span>
            <span className="text-xs text-[#86868b] font-medium">
              Total Crypto:{" "}
              <strong className="text-[#1d1d1f] font-extrabold">
                {formatEuro(cryptoList.reduce((s, c) => s + c.totalValue, 0))}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cryptoList.map((c) => (
              <div
                key={c.id}
                className="card flex justify-between items-start hover:border-[#86868b] transition-all"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1d1d1f]">{c.name}</span>
                  </div>
                  <div className="text-[10px] text-[#86868b] font-medium mt-0.5">
                    Storage: {c.storage} • {c.amount} {c.ticker}
                  </div>
                  <div className="text-xl font-extrabold text-[#1d1d1f] mt-2">{formatEuro(c.totalValue)}</div>
                  {c.monthlyContribution > 0 && (
                    <div className="text-[10px] text-[#1d1d1f] font-bold mt-1 bg-white px-2 py-0.5 rounded-full inline-block border border-[#e8e8ed]">
                      DCA: +{formatEuro(c.monthlyContribution)}/mo
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDeleteAsset(c.id)}
                  className="text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Vehicles (REQ-021: simple valued assets) */}
      {activeSubTab === "vehicle" && (
        <div className="space-y-3" id="vehicles-list-section">
          <div className="flex justify-between items-center text-xs">
            <span className="text-label">
              Vehicles (Valued as simple assets, no depreciation model)
            </span>
            <span className="text-xs text-[#86868b] font-medium">
              Total Vehicles:{" "}
              <strong className="text-[#1d1d1f] font-extrabold">
                {formatEuro(vehicleList.reduce((s, v) => s + v.value, 0))}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vehicleList.map((v) => (
              <div
                key={v.id}
                className="card flex justify-between items-start hover:border-[#86868b] transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-[#86868b]" />
                    <span className="text-xs font-bold text-[#1d1d1f]">{v.name}</span>
                  </div>
                  <div className="text-xl font-extrabold text-[#1d1d1f] mt-2">{formatEuro(v.value)}</div>
                </div>
                <button
                  onClick={() => onDeleteAsset(v.id)}
                  className="text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Loans */}
      {activeSubTab === "loans" && (
        <div className="space-y-3" id="loans-tab-section">
          <div className="flex justify-between items-center text-xs">
            <span className="text-label">Active Debt & Financing Accounts</span>
            <span className="text-xs text-[#86868b] font-medium">
              Total Debt:{" "}
              <strong className="text-[#1d1d1f] font-extrabold">
                {formatEuro(loans.reduce((s, l) => s + l.totalBalance, 0))}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {loans.map((l) => (
              <div
                key={l.id}
                className="card flex justify-between items-start hover:border-[#86868b] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-[#1d1d1f]">{l.name}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#1d1d1f] bg-white px-2 py-0.5 rounded-full inline-block border border-[#e8e8ed]">
                    {l.type}
                  </span>
                  <div className="text-xl font-extrabold text-[#1d1d1f] pt-1">{formatEuro(l.totalBalance)}</div>
                  <div className="text-[11px] text-[#86868b] font-medium">
                    Payment: {formatEuro(l.monthlyPayment)}/mo • {l.interestRate}% interest
                  </div>
                </div>
                <button
                  onClick={() => onDeleteLoan(l.id)}
                  className="text-[#86868b] hover:text-rose-500 rounded-full hover:bg-white p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Real Estate LLM-From-Features Appraisal (REQ-002) */}
      {realEstateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#1d1d1f]">Add Real Estate Property</h3>
                  <p className="text-xs text-[#86868b] font-medium">
                    Feature-weighted appraisal calibrated to Portuguese INE & Idealista transaction registries.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRealEstateModalOpen(false)}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRealEstate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Property Nickname</label>
                  <input
                    type="text"
                    required
                    value={reTitle}
                    onChange={(e) => setReTitle(e.target.value)}
                    placeholder="e.g. Cascais Seaside Apartment"
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Location (Parish / Municipality)</label>
                  <input
                    type="text"
                    required
                    value={reLocation}
                    onChange={(e) => setReLocation(e.target.value)}
                    placeholder="e.g. Lisboa - Parque das Nações or Porto - Foz"
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Typology</label>
                  <select
                    value={reTypology}
                    onChange={(e) => setReTypology(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none bg-white font-medium"
                  >
                    <option value="T0">T0 (Studio)</option>
                    <option value="T1">T1 (1 Bedroom)</option>
                    <option value="T2">T2 (2 Bedrooms)</option>
                    <option value="T3">T3 (3 Bedrooms)</option>
                    <option value="T4">T4 (4 Bedrooms)</option>
                    <option value="T5+">T5+ (Villa / Penthouse)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Area (m² gross private / útil)</label>
                  <input
                    type="number"
                    required
                    min={20}
                    max={1000}
                    value={reAreaM2}
                    onChange={(e) => setReAreaM2(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Year Built</label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2030}
                    value={reYearBuilt}
                    onChange={(e) => setReYearBuilt(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Condition</label>
                  <select
                    value={reCondition}
                    onChange={(e) => setReCondition(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none bg-white font-medium"
                  >
                    <option value="New">Brand New / New Construction</option>
                    <option value="Renovated">Renovated</option>
                    <option value="Good">Good Condition</option>
                    <option value="Needs Renovation">Needs Renovation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Energy Certificate</label>
                  <select
                    value={reEnergyRating}
                    onChange={(e) => setReEnergyRating(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none bg-white font-medium"
                  >
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>

              {/* Granular Property Specifications for High Accuracy */}
              <div className="p-4 bg-[#fbfbfd] border border-[#e8e8ed] rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#1d1d1f] uppercase tracking-wider">
                    Detailed Features & Thermal Comfort (High Accuracy)
                  </span>
                  <span className="text-[10px] text-[#86868b] font-medium">
                    Directly calibrates comparable appraisal & liquidity
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Bathrooms / WCs */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Bathrooms</label>
                    <select
                      value={reBathrooms}
                      onChange={(e) => setReBathrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] bg-white font-medium text-xs"
                    >
                      <option value={1}>1 Bathroom (Full)</option>
                      <option value={2}>2 Bathrooms (Full)</option>
                      <option value={3}>3 Bathrooms (1 En-suite + 2)</option>
                      <option value={4}>4+ Bathrooms</option>
                    </select>
                  </div>

                  {/* Balconies Count */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Balconies & Outdoor Space</label>
                    <select
                      value={reBalconiesCount}
                      onChange={(e) => setReBalconiesCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] bg-white font-medium text-xs"
                    >
                      <option value={0}>No Balcony</option>
                      <option value={1}>1 Balcony</option>
                      <option value={2}>2 Balconies</option>
                      <option value={3}>3+ Balconies / Large Terrace</option>
                    </select>
                  </div>

                  {/* Heating System */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Heating System</label>
                    <select
                      value={reHeatingType}
                      onChange={(e) => setReHeatingType(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] bg-white font-medium text-xs"
                    >
                      <option value="Gas Central Heating (Wall Radiators)">Gas Central Heating (Wall Radiators)</option>
                      <option value="Heat Pump / Radiant Floor Heating">Heat Pump / Radiant Floor Heating</option>
                      <option value="Reversible Air Conditioning">Reversible Air Conditioning</option>
                      <option value="Fireplace / Heat Recovery Unit">Fireplace / Heat Recovery Unit</option>
                      <option value="No Central Heating">No Central Heating</option>
                    </select>
                  </div>

                  {/* Air Conditioning (AC) */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Air Conditioning (AC)</label>
                    <select
                      value={reHasAC ? "yes" : "no"}
                      onChange={(e) => setReHasAC(e.target.value === "yes")}
                      className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] bg-white font-medium text-xs"
                    >
                      <option value="no">No Air Conditioning</option>
                      <option value="yes">Equipped with Air Conditioning</option>
                    </select>
                  </div>

                  {/* Parking / Garage */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Parking & Garage</label>
                    <select
                      value={reParking}
                      onChange={(e) => setReParking(e.target.value)}
                      className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] bg-white font-medium text-xs"
                    >
                      <option value="Covered Garage Space">Covered Garage Space</option>
                      <option value="Private Garage Box">Closed Private Garage Box</option>
                      <option value="2 Garage Spaces">2 Garage Spaces</option>
                      <option value="Street Parking (No Garage)">Street Parking (No Garage)</option>
                    </select>
                  </div>

                  {/* Building Amenities Toggles */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#1d1d1f]">Building Amenities</label>
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setReHasElevator(!reHasElevator)}
                        className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                          reHasElevator
                            ? "bg-[#1d1d1f] border-[#1d1d1f] text-white"
                            : "bg-white border-[#e8e8ed] text-[#86868b] hover:border-[#86868b]"
                        }`}
                      >
                        {reHasElevator ? "✓ With Elevator" : "Without Elevator"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReHasStorage(!reHasStorage)}
                        className={`p-2 rounded-xl border text-center font-bold text-xs transition-all ${
                          reHasStorage
                            ? "bg-[#1d1d1f] border-[#1d1d1f] text-white"
                            : "bg-white border-[#e8e8ed] text-[#86868b] hover:border-[#86868b]"
                        }`}
                      >
                        {reHasStorage ? "✓ Storage Room" : "Without Storage"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Nuances & Notes */}
                <div className="space-y-1 pt-1">
                  <label className="font-bold text-[#1d1d1f] text-xs">
                    Property Notes & Highlights (Grounded LLM Context)
                  </label>
                  <input
                    type="text"
                    value={reNotes}
                    onChange={(e) => setReNotes(e.target.value)}
                    placeholder="e.g., Double glazed windows with thermal break, dual sun exposure, close to hospitals and university campus..."
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none bg-white font-medium text-xs text-[#1d1d1f]"
                  />
                </div>
              </div>

              {/* Other Features (Distinct amenities, without repeating the granular specs above) */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-[#1d1d1f] block">Other Features & Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    "Sea / River View",
                    "Swimming Pool",
                    "Private Garden / Yard",
                    "Solar Panels",
                    "Furnished",
                    "Gated Community / Security",
                  ].map((feat) => {
                    const isChecked = reFeatures.includes(feat);
                    return (
                      <button
                        type="button"
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? "bg-[#1d1d1f] border-[#1d1d1f] text-white font-bold"
                            : "bg-[#f5f5f7] border-[#e8e8ed] text-[#1d1d1f] font-medium hover:border-[#86868b]"
                        }`}
                      >
                        <span className="text-[11px] truncate">{feat}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gemini & Idealista Valuation Engine */}
              <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-[#1d1d1f] text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        AI & Idealista Valuation Engine (Portugal)
                      </span>
                      <span className="text-[10px] bg-white text-[#1d1d1f] px-2 py-0.5 rounded-full font-bold border border-[#e8e8ed]">
                        Default Prompt
                      </span>
                    </div>
                    <p className="text-[11px] text-[#86868b] mt-0.5 font-medium">
                      Calibrated against live Idealista listings, INE notary deed registry, and realistic negotiation discounts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEstimateWithGemini()}
                    disabled={isValuatingWithLLM}
                    className="px-4 py-2 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-xs disabled:opacity-50 shrink-0"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isValuatingWithLLM ? "animate-spin" : ""}`} />
                    <span>{isValuatingWithLLM ? "Searching Portals..." : "Re-run Valuation"}</span>
                  </button>
                </div>

                {isValuatingWithLLM && (
                  <div className="p-4 bg-white rounded-xl border border-[#e8e8ed] text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-2 bg-[#f5f5f7] rounded-full text-[#1d1d1f] animate-pulse">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                    </div>
                    <div className="text-xs font-bold text-[#1d1d1f]">
                      Querying Idealista & Official Registry...
                    </div>
                    <p className="text-[11px] text-[#86868b]">
                      Gathering comparable {reTypology} listings in {reLocation} and factoring negotiation margins.
                    </p>
                  </div>
                )}

                {!isValuatingWithLLM && llmFeedback && (
                  <div className="space-y-3">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="p-3 bg-white rounded-xl border border-[#e8e8ed]">
                        <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">
                          Official Notary Deed Value
                        </span>
                        <div className="text-lg font-extrabold text-[#1d1d1f] mt-0.5">
                          {formatEuro(llmFeedback.estimatedValue)}
                        </div>
                        <span className="text-[10px] text-[#86868b] font-medium">
                          €{llmFeedback.pricePerSqm}/m²
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-[#e8e8ed]">
                        <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">
                          Idealista Asking Price
                        </span>
                        <div className="text-lg font-extrabold text-[#1d1d1f] mt-0.5">
                          {formatEuro(llmFeedback.askingPriceEstimate || Math.round(llmFeedback.estimatedValue * 1.07))}
                        </div>
                        <span className="text-[10px] text-[#86868b] font-medium">
                          Portal Listed Benchmark
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-[#e8e8ed]">
                        <span className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider block">
                          Negotiation Margin
                        </span>
                        <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                          -{llmFeedback.negotiationDiscountPercent || 6.7}%
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Asking vs Notary Gap
                        </span>
                      </div>
                    </div>

                    {/* Confidence Range */}
                    <div className="px-3 py-2 bg-white rounded-xl border border-[#e8e8ed] flex items-center justify-between text-xs">
                      <span className="text-[#86868b] font-medium">Valuation Confidence Range:</span>
                      <span className="font-bold text-[#1d1d1f]">
                        {formatEuro(llmFeedback.minConfidence)} – {formatEuro(llmFeedback.maxConfidence)}
                      </span>
                    </div>

                    {/* Comparable Listings from Idealista & Real Estate Portals */}
                    {llmFeedback.comparables && llmFeedback.comparables.length > 0 && (
                      <div className="p-3.5 bg-white rounded-xl border border-[#e8e8ed] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#1d1d1f] block">
                              Comparable Market Listings & Benchmarks
                            </span>
                            <span className="text-[10px] text-[#86868b]">
                              Direct listings open property page; search links open active parish options; deed transactions are historical records
                            </span>
                          </div>
                          <span className="text-[10px] text-[#86868b] font-medium shrink-0 ml-2">
                            {llmFeedback.comparables.length} benchmarks
                          </span>
                        </div>

                        <div className="space-y-2">
                          {llmFeedback.comparables.map((comp: any, idx: number) => {
                            const isActive = comp.status === "active" && !!comp.url;
                            const isPropertyLink = isActive && comp.linkType === "property";
                            const isSearchLink = isActive && comp.linkType !== "property";
                            const isTransacted = comp.status === "transacted";
                            return (
                              <div
                                key={idx}
                                className="p-2.5 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span className="text-[9px] font-extrabold bg-[#1d1d1f] text-white px-2 py-0.5 rounded-full">
                                      {comp.source}
                                    </span>

                                    {isPropertyLink ? (
                                      <span className="text-[9px] font-bold bg-[#e8f5e9] text-[#2e7d32] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                                        🏠 Direct Property Listing
                                      </span>
                                    ) : isSearchLink ? (
                                      <span className="text-[9px] font-bold bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                                        🔍 Active Parish Market Search
                                      </span>
                                    ) : isTransacted ? (
                                      <span className="text-[9px] font-bold bg-[#ede7f6] text-[#512da8] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#512da8]" />
                                        Official Notary Deed Record
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold bg-[#fbe9e7] text-[#d84315] px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#d84315]" />
                                        Inactive / Sold Listing
                                      </span>
                                    )}

                                    {comp.dateRecorded && (
                                      <span className="text-[10px] text-[#86868b] font-medium">
                                        📅 {comp.dateRecorded}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-[#1d1d1f] text-xs">{comp.title}</span>
                                  </div>

                                  {comp.notes && (
                                    <p className="text-[11px] text-[#86868b] font-medium leading-relaxed">
                                      {comp.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                  <div>
                                    <div className="font-extrabold text-[#1d1d1f] text-sm">
                                      €{comp.price.toLocaleString("pt-PT")}
                                    </div>
                                    {comp.pricePerSqm && (
                                      <div className="text-[10px] text-[#86868b] font-medium">
                                        €{comp.pricePerSqm}/m²
                                      </div>
                                    )}
                                  </div>

                                  {isPropertyLink && comp.url ? (
                                    <a
                                      href={comp.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1d1d1f] text-white text-[10px] font-bold hover:bg-[#333336] transition-colors shadow-sm"
                                      title="Open direct listing for this property"
                                    >
                                      <span>View Property ({comp.source?.includes("Remax") ? "Remax" : comp.source?.includes("Tartaruga") ? "Tartaruga" : comp.source?.includes("Imovirtual") ? "Imovirtual" : "Portal"})</span>
                                      <ExternalLink className="w-3 h-3 ml-0.5" />
                                    </a>
                                  ) : isSearchLink && comp.url ? (
                                    <a
                                      href={comp.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#0071e3] text-white text-[10px] font-bold hover:bg-[#0077ed] transition-colors shadow-sm"
                                      title="Open filtered search with active comparable properties in this parish"
                                    >
                                      <span>View Search on {comp.source?.includes("Imovirtual") ? "Imovirtual" : "Idealista"}</span>
                                      <ExternalLink className="w-3 h-3 ml-0.5" />
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-[#86868b] italic bg-white/70 px-2 py-0.5 rounded border border-[#e8e8ed]">
                                      {comp.status === "transacted" ? "Deed Record (no link)" : "Inactive (no link)"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Sources Badges */}
                    {llmFeedback.sourcesUsed && llmFeedback.sourcesUsed.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-[#86868b] font-semibold">Sources Grounded:</span>
                        {llmFeedback.sourcesUsed.map((src: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="text-[9px] font-bold bg-white text-[#1d1d1f] px-2 py-0.5 rounded-full border border-[#e8e8ed]"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reasoning Chain */}
                    {llmFeedback.reasoningChain && (
                      <div className="p-3 bg-white rounded-xl border border-[#e8e8ed] space-y-1.5 text-[11px] text-[#86868b]">
                        <span className="font-bold text-[#1d1d1f] block text-xs">
                          Appraisal Rationale & Calculations:
                        </span>
                        {llmFeedback.reasoningChain.map((r: string, i: number) => (
                          <div key={i} className="flex items-start space-x-1.5">
                            <span className="text-[#1d1d1f] font-bold">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Override / Final Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Confirmed Fair Market Value (€)</label>
                  <input
                    type="number"
                    required
                    value={reValuation}
                    onChange={(e) => setReValuation(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl text-base font-extrabold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Expected Annual Appreciation (% YoY)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={reExpectedAppreciationYoY}
                    onChange={(e) => setReExpectedAppreciationYoY(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl text-sm font-bold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none"
                    placeholder="3.5"
                  />
                </div>
              </div>

              {/* Purpose & Rental Investment Option */}
              <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed] space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f] block text-xs">
                    Property Usage & Strategy
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "hpp", label: "🏠 Primary Residence" },
                      { id: "investment", label: "📈 Rental Investment" },
                      { id: "secondary", label: "🏖️ Secondary Home" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setRePurpose(p.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          rePurpose === p.id
                            ? "bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs"
                            : "bg-white text-[#1d1d1f] border-[#e8e8ed] hover:border-[#86868b]"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment & Rental Specific Inputs */}
                {rePurpose === "investment" && (
                  <div className="pt-3 border-t border-[#e8e8ed] space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1d1d1f] flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reIsRented}
                          onChange={(e) => setReIsRented(e.target.checked)}
                          className="w-4 h-4 rounded text-[#1d1d1f] focus:ring-[#1d1d1f]"
                        />
                        <span>Property currently has an active tenant / lease contract</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-[#86868b] text-[11px]">
                          Gross Monthly Rent (€)
                        </label>
                        <input
                          type="number"
                          value={reMonthlyRentGross}
                          onChange={(e) => setReMonthlyRentGross(Number(e.target.value))}
                          placeholder="e.g. 950"
                          className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl bg-white text-xs font-bold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-[#86868b] text-[11px]">
                          Monthly Expenses (€/mo)
                        </label>
                        <input
                          type="number"
                          value={reRentalExpensesMonthly}
                          onChange={(e) => setReRentalExpensesMonthly(Number(e.target.value))}
                          placeholder="Condo + insurance (e.g. 60)"
                          className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl bg-white text-xs font-bold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-[#86868b] text-[11px]">
                          IRS Regime (Autonomous Tax Rate)
                        </label>
                        <select
                          value={reRentalTaxRate}
                          onChange={(e) => setReRentalTaxRate(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl bg-white text-xs font-bold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f]"
                        >
                          <option value="25">25% (Standard autonomous rate)</option>
                          <option value="15">15% (Lease ≥ 5 years)</option>
                          <option value="10">10% (Lease ≥ 10 years)</option>
                          <option value="0">0% (Accessible Housing Exemption)</option>
                        </select>
                      </div>
                    </div>

                    {/* Live Metric Computation Preview */}
                    {reMonthlyRentGross > 0 && reValuation > 0 && (() => {
                      const cirs = calculateCirsRentalCashflow({
                        grossRentMonthly: reMonthlyRentGross,
                        propertyValuation: reValuation,
                        taxRatePercent: reRentalTaxRate,
                        expensesMonthly: reRentalExpensesMonthly,
                      });

                      return (
                        <div className="space-y-2">
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-3 gap-2 text-center">
                            <div>
                              <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                                Net Cash Flow
                              </span>
                              <span className="text-sm font-black text-emerald-700">
                                +€{cirs.netMonthlyCashflow}/mo
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                                Gross Yield
                              </span>
                              <span className="text-sm font-black text-[#1d1d1f]">
                                {cirs.grossYield}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-800 uppercase font-semibold block">
                                Net Yield
                              </span>
                              <span className="text-sm font-black text-emerald-700">
                                {cirs.netYield}%
                              </span>
                            </div>
                          </div>
                          {cirs.cirsTaxShieldBenefitAnnual > 0 && (
                            <div className="text-[11px] bg-white border border-emerald-200 rounded-lg p-2 text-emerald-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span><strong>Article 41 CIRS</strong>: Eligible expenses deducted from taxable rental income</span>
                              </span>
                              <span className="font-bold text-emerald-700">
                                Saves €{cirs.cirsTaxShieldBenefitAnnual}/yr in IRS
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e8e8ed]">
                <button
                  type="button"
                  onClick={() => setRealEstateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold text-xs shadow-xs transition-colors"
                >
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Real Estate Milestone */}
      {milestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-[#1d1d1f]">
                  {editingMilestone
                    ? "Edit Investment Milestone"
                    : "New Real Estate Investment Milestone"}
                </h3>
              </div>
              <button
                onClick={() => setMilestoneModalOpen(false)}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Milestone / Property Title</label>
                <input
                  type="text"
                  required
                  value={msName}
                  onChange={(e) => setMsName(e.target.value)}
                  placeholder="e.g. 2-Bed Student Rental (Coimbra University)"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Target Acquisition Year</label>
                  <input
                    type="number"
                    min={2026}
                    max={2055}
                    required
                    value={msTargetYear}
                    onChange={(e) => setMsTargetYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-bold focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Milestone Status</label>
                  <select
                    value={msStatus}
                    onChange={(e) => setMsStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  >
                    <option value="planned">Planned (Target Horizon)</option>
                    <option value="in_progress">In Sourcing / Negotiation</option>
                    <option value="achieved">Achieved (Deed Signed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Investment Strategy</label>
                  <select
                    value={msStrategy}
                    onChange={(e) => setMsStrategy(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  >
                    <option value="rent_long_term">Long-term Residential Lease</option>
                    <option value="student_rooms">Student Rooms / Campus Housing</option>
                    <option value="vacation_al">Mid-term / Vacation Rental</option>
                    <option value="hpp_upgrade">Primary Residence Upgrade</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Target Location</label>
                  <input
                    type="text"
                    required
                    value={msLocation}
                    onChange={(e) => setMsLocation(e.target.value)}
                    placeholder="e.g. Coimbra (São Martinho do Bispo)"
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Estimated Price (€)</label>
                  <input
                    type="number"
                    required
                    value={msPrice}
                    onChange={(e) => setMsPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl font-bold focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Min. Down Payment (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    required
                    value={msDownPaymentPct}
                    onChange={(e) => setMsDownPaymentPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl font-bold focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Projected Rent (€/mo)</label>
                  <input
                    type="number"
                    value={msMonthlyRent}
                    onChange={(e) => setMsMonthlyRent(Number(e.target.value))}
                    placeholder="0 if primary residence"
                    className="w-full px-3 py-2 border border-[#e8e8ed] rounded-xl font-bold focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>
              </div>

              {/* Live Preview Card & Invisible Costs Engine */}
              {msPrice > 0 && (() => {
                const downPayment = Math.round((msPrice * msDownPaymentPct) / 100);
                const loan = msPrice - downPayment;
                const closing = calculateClosingCosts(
                  msPrice,
                  downPayment,
                  msStrategy === "hpp_upgrade" ? "hpp" : "investment"
                );
                const estYield = msMonthlyRent > 0
                  ? ((msMonthlyRent * 12 / msPrice) * 100).toFixed(1)
                  : "—";

                return (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-[#86868b] uppercase font-semibold block">
                          Down Payment ({msDownPaymentPct}%)
                        </span>
                        <span className="text-xs font-black text-amber-700">
                          €{downPayment.toLocaleString("pt-PT")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#86868b] uppercase font-semibold block">
                          Mortgage Financing
                        </span>
                        <span className="text-xs font-black text-[#1d1d1f]">
                          €{loan.toLocaleString("pt-PT")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#86868b] uppercase font-semibold block">
                          Projected Gross Yield
                        </span>
                        <span className="text-xs font-black text-emerald-700">
                          {estYield !== "—" ? `${estYield}%` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Portuguese Statutory Closing Costs Breakdown */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1">
                          <span>🏛️ Transaction Friction & Hidden Costs:</span>
                          <span className="text-amber-800 font-bold">
                            +€{closing.totalClosingCosts.toLocaleString("pt-PT")} ({closing.closingCostsPercentOfPrice}% of price)
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-amber-950/80">
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                          <span className="text-[9px] text-[#86868b] block font-semibold">IMT (Transfer Tax)</span>
                          <span className="font-extrabold text-[#1d1d1f]">€{closing.imt.toLocaleString("pt-PT")}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                          <span className="text-[9px] text-[#86868b] block font-semibold">Stamp Duty Purchase (0.8%)</span>
                          <span className="font-extrabold text-[#1d1d1f]">€{closing.stampDutyPurchase.toLocaleString("pt-PT")}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                          <span className="text-[9px] text-[#86868b] block font-semibold">Stamp Duty Loan (0.6%)</span>
                          <span className="font-extrabold text-[#1d1d1f]">€{closing.stampDutyLoan.toLocaleString("pt-PT")}</span>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/50">
                          <span className="text-[9px] text-[#86868b] block font-semibold">Deed & Notary Fee</span>
                          <span className="font-extrabold text-[#1d1d1f]">€{(closing.notaryAndRegistry + closing.bankAppraisalAndDossier).toLocaleString("pt-PT")}</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-amber-200/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#1d1d1f]">
                          Total Upfront Cash Required (Down + Costs):
                        </span>
                        <span className="text-sm font-black text-rose-700">
                          €{closing.totalUpfrontCapitalRequired.toLocaleString("pt-PT")}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="font-semibold text-[#86868b]">Strategic Notes & Funding Plan</label>
                <textarea
                  rows={2}
                  value={msNotes}
                  onChange={(e) => setMsNotes(e.target.value)}
                  placeholder="e.g. Focus on university medical campus. Down payment accumulated via monthly DCA and rental income reinvestment."
                  className="w-full px-3.5 py-2 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e8e8ed]">
                <button
                  type="button"
                  onClick={() => setMilestoneModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold text-xs shadow-xs transition-colors"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Generic Asset (Bank, Stock, Crypto, Vehicle) */}
      {genericAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Add Portfolio Asset</h3>
              <button
                onClick={() => setGenericAssetModalOpen(false)}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGenericAsset} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Category</label>
                <select
                  value={assetCat}
                  onChange={(e) => setAssetCat(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                >
                  <option value="bank">Bank / Cash Account</option>
                  <option value="stock">Stock / ETF Fund</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="vehicle">Vehicle (Simple Valued Asset)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Asset Name</label>
                <input
                  type="text"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. ActivoBank Checking or Tesla Model 3"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Current Value (€)</label>
                <input
                  type="number"
                  required
                  value={assetValue}
                  onChange={(e) => setAssetValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-extrabold text-sm focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              {assetCat !== "vehicle" && (
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Institution / Platform</label>
                  <input
                    type="text"
                    value={assetInstitution}
                    onChange={(e) => setAssetInstitution(e.target.value)}
                    placeholder="e.g. Millennium BCP, Degiro, Ledger"
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>
              )}

              {(assetCat === "stock" || assetCat === "crypto") && (
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Monthly Contribution (€/mo)</label>
                  <input
                    type="number"
                    value={assetMonthlyContribution}
                    onChange={(e) => setAssetMonthlyContribution(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e8e8ed]">
                <button
                  type="button"
                  onClick={() => setGenericAssetModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold text-xs shadow-xs transition-colors"
                >
                  Add to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Loan */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Add Loan Account</h3>
              <button
                onClick={() => setLoanModalOpen(false)}
                className="p-1.5 text-[#86868b] hover:text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Loan Name</label>
                <input
                  type="text"
                  required
                  value={loanName}
                  onChange={(e) => setLoanName(e.target.value)}
                  placeholder="e.g. Millennium BCP Mortgage"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Type</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  >
                    <option value="housing">Housing Mortgage</option>
                    <option value="vehicle">Auto Loan</option>
                    <option value="personal">Personal Loan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Outstanding Principal (€)</label>
                  <input
                    type="number"
                    required
                    value={loanBalance}
                    onChange={(e) => setLoanBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-extrabold text-sm focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Monthly Payment (€/mo)</label>
                  <input
                    type="number"
                    required
                    value={loanPayment}
                    onChange={(e) => setLoanPayment(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1d1d1f]">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e8e8ed]">
                <button
                  type="button"
                  onClick={() => setLoanModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full font-bold text-xs shadow-xs transition-colors"
                >
                  Save Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
