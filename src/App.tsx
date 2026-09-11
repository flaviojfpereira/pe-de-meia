import React, { useState, useEffect } from "react";
import { Navigation, NavTab } from "./components/Navigation";
import { PresentStateHome } from "./components/PresentStateHome";
import { RipplePlayground } from "./components/RipplePlayground";
import { CounterfactualWeaver } from "./components/CounterfactualWeaver";
import { AssetsManager } from "./components/AssetsManager";
import { SettingsView } from "./components/SettingsView";
import { GroundingDrawer } from "./components/GroundingDrawer";
import { GoalsModal } from "./components/GoalsModal";
import { PanelLeftClose, PanelLeftOpen, Target } from "lucide-react";
import {
  AnyAsset,
  GroundingData,
  LoanItem,
  MoneyGoal,
  ScenarioParams,
  UserProfile,
  WeaverFork,
  RealEstateMilestone,
} from "./types";
import {
  initialAssets,
  initialBaselineParams,
  initialForks,
  initialGoals,
  initialLoans,
  initialPlaygroundDraft,
  initialUserProfile,
  initialRealEstateMilestones,
} from "./data/initialState";
import { calculateNetWorth } from "./utils/calculations";

const DRAFT_STORAGE_KEY = "lumen_playground_draft_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  // Core Main Model state (single source of truth)
  const [assets, setAssets] = useState<AnyAsset[]>(initialAssets);
  const [loans, setLoans] = useState<LoanItem[]>(initialLoans);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [goals, setGoals] = useState<MoneyGoal[]>(initialGoals);
  const [includeLoans, setIncludeLoans] = useState<boolean>(true); // Whole-app loans toggle

  // Emergency Fund
  const [emergencyFundAmount, setEmergencyFundAmount] = useState<number>(17850);
  const [emergencyFundSentence, setEmergencyFundSentence] = useState<string>(
    "Healthy for your profile — covers ~7 months of essentials."
  );
  const [emergencyFundStatus, setEmergencyFundStatus] = useState<string>("optimal");
  const [isClassifyingEmergencyFund, setIsClassifyingEmergencyFund] = useState<boolean>(false);

  // Baseline Scenario Parameters (from Main Model)
  const [baselineParams, setBaselineParams] = useState<ScenarioParams>({
    ...initialBaselineParams,
  });

  // Playground draft with session persistence (REQ-022)
  const [draftParams, setDraftParams] = useState<ScenarioParams>(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return { ...initialPlaygroundDraft };
  });

  const [hasUnappliedChanges, setHasUnappliedChanges] = useState<boolean>(() => {
    // Check if initial draft differs from baseline
    return JSON.stringify(draftParams) !== JSON.stringify(initialBaselineParams);
  });

  // Weaver Forks
  const [forks, setForks] = useState<WeaverFork[]>(initialForks);
  const [mainForkId, setMainForkId] = useState<string>("fork-main");

  // Grounding Drawer & Goals Modal
  const [activeGrounding, setActiveGrounding] = useState<GroundingData | null>(null);
  const [goalsModalOpen, setGoalsModalOpen] = useState<boolean>(false);

  // Real Estate Investment Milestones (Pathway)
  const [realEstateMilestones, setRealEstateMilestones] = useState<RealEstateMilestone[]>(() => {
    try {
      const saved = localStorage.getItem("lumen_re_milestones_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return initialRealEstateMilestones;
  });

  useEffect(() => {
    try {
      localStorage.setItem("lumen_re_milestones_v1", JSON.stringify(realEstateMilestones));
    } catch (e) {
      // ignore
    }
  }, [realEstateMilestones]);

  // Sidebar visibility state (closeable / hidable)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("lumen_sidebar_open");
      if (saved !== null) return saved === "true";
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Synchronize draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftParams));
    } catch (e) {
      // ignore
    }
  }, [draftParams]);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("lumen_sidebar_open", String(isSidebarOpen));
    } catch (e) {
      // ignore
    }
  }, [isSidebarOpen]);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle menu, Escape to close on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      } else if (e.key === "Escape" && isSidebarOpen) {
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  // Handler: Draft parameter changes in Playground
  const handleDraftChange = (newDraft: ScenarioParams) => {
    setDraftParams(newDraft);
    setHasUnappliedChanges(true);
  };

  const handleApplyChanges = () => {
    setHasUnappliedChanges(false);
  };

  const handleDiscardDraft = () => {
    setDraftParams({ ...baselineParams });
    setHasUnappliedChanges(false);
    try {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  // Handler: Save Playground as a new Fork in Weaver (REQ-018)
  const handleSaveAsFork = (name: string, description: string) => {
    const newFork: WeaverFork = {
      id: `fork-${Date.now()}`,
      name,
      description,
      createdAt: new Date().toISOString().split("T")[0],
      parentId: mainForkId,
      isMainModel: false,
      params: { ...draftParams },
      metrics: {
        netWorthIn10Y: 2150000,
        netWorthIn20Y: 3480000,
        targetNetWorth2045: 2150000,
        monthlyRetirementCashflow: 5980,
        earlyRetirementDate: "May 2045",
        goalDateShiftMonths: 11,
        runwayMonths: 11.3,
      },
    };
    setForks([...forks, newFork]);
    setActiveTab("weaver");
  };

  // Handler: Promote Fork to Main Model (REQ-015, REQ-023)
  const handlePromoteFork = (forkId: string, note?: string) => {
    const targetFork = forks.find((f) => f.id === forkId);
    if (!targetFork) return;

    // Update baseline params
    setBaselineParams({ ...targetFork.params });
    setDraftParams({ ...targetFork.params });
    setHasUnappliedChanges(false);

    // Update main model fork identity
    const updatedForks = forks.map((f) => ({
      ...f,
      isMainModel: f.id === forkId,
    }));
    setForks(updatedForks);
    setMainForkId(forkId);

    // Optional user feedback or navigation to Home
    setActiveTab("home");
  };

  // Handler: Trigger promotion from Playground button
  const handleRequestPromotionFromPlayground = (params: ScenarioParams) => {
    // Check if an existing fork has these exact params or create temporary promotion fork
    const matchingFork = forks.find(
      (f) => JSON.stringify(f.params) === JSON.stringify(params)
    );
    if (matchingFork) {
      handlePromoteFork(matchingFork.id);
    } else {
      const promotedFork: WeaverFork = {
        id: `fork-promoted-${Date.now()}`,
        name: "Custom Accelerated Trajectory",
        description: "Promoted from Playground exploration.",
        createdAt: new Date().toISOString().split("T")[0],
        parentId: mainForkId,
        isMainModel: true,
        params: { ...params },
        metrics: {
          netWorthIn10Y: 2150000,
          netWorthIn20Y: 3480000,
          targetNetWorth2045: 2150000,
          monthlyRetirementCashflow: 5980,
          earlyRetirementDate: "May 2045",
          goalDateShiftMonths: 11,
          runwayMonths: 11.3,
        },
      };
      setForks([...forks.map((f) => ({ ...f, isMainModel: false })), promotedFork]);
      setMainForkId(promotedFork.id);
      setBaselineParams({ ...params });
      setHasUnappliedChanges(false);
      setActiveTab("home");
    }
  };

  // Handler: Classify Emergency Fund via Gemini API
  const handleClassifyEmergencyFund = async () => {
    setIsClassifyingEmergencyFund(true);
    try {
      const res = await fetch("/api/emergency-fund/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designatedAmount: emergencyFundAmount,
          monthlyEssentialExpenses: userProfile.monthlyEssentialExpenses,
          liquidCash: 34500,
          userProfile: {
            age: userProfile.age,
            employmentType: userProfile.employmentType,
            notes: userProfile.notes,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEmergencyFundSentence(data.data.classificationSentence);
        setEmergencyFundStatus(data.data.status);
      }
    } catch (e) {
      console.error("Emergency fund classification failed:", e);
    } finally {
      setIsClassifyingEmergencyFund(false);
    }
  };

  // Asset handlers
  const handleAddAsset = (newAsset: AnyAsset) => {
    setAssets((prev) => [...prev, newAsset]);
  };
  const handleUpdateAsset = (updated: AnyAsset) => {
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };
  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  // Loan handlers
  const handleAddLoan = (newLoan: LoanItem) => {
    setLoans((prev) => [...prev, newLoan]);
  };
  const handleDeleteLoan = (id: string) => {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  };

  const currentNetWorth = calculateNetWorth(assets, loans, includeLoans);

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-white text-[#1d1d1f] font-sans relative" id="lumen-app-root">
      {/* Sidebar Navigation (Closeable / Hidable) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
        userProfile={userProfile}
        hasUnappliedDraft={hasUnappliedChanges}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main View Area with Dedicated Scroll Container */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-y-auto relative" id="main-scroll-area">
        {/* Pinned Top Bar for Opening/Closing Menu and Context - ALWAYS VISIBLE AT TOP-0 */}
        <header
          className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e8e8ed] bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs"
          id="top-navigation-bar"
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              id="toggle-sidebar-btn"
              title={isSidebarOpen ? "Hide menu (Ctrl+B)" : "Show menu (Ctrl+B)"}
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs active:scale-95 cursor-pointer ${
                !isSidebarOpen
                  ? "bg-[#1d1d1f] text-white hover:bg-black border-[#1d1d1f] shadow-md"
                  : "bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border-[#e8e8ed]"
              }`}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
              <span>{isSidebarOpen ? "Hide Menu" : "Menu"}</span>
              {hasUnappliedChanges && !isSidebarOpen && (
                <span
                  title="Unapplied scenario changes in Playground"
                  className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                />
              )}
            </button>

            <div className="h-4 w-px bg-[#e8e8ed]" />

            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-[#1d1d1f] tracking-tight">
                {activeTab === "home" && "Overview"}
                {activeTab === "playground" && "Ripple Playground"}
                {activeTab === "weaver" && "Counterfactual Weaver"}
                {activeTab === "assets" && "Assets & Debt"}
                {activeTab === "settings" && "Settings"}
              </span>
              <span className="hidden sm:inline-block text-[11px] text-[#86868b] font-medium">
                • Pé de Meia
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setGoalsModalOpen(true)}
              id="header-goals-btn"
              className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] px-3 py-1.5 rounded-full border border-[#e8e8ed] transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-[#1d1d1f]" />
              <span>Goals ({goals.length})</span>
            </button>

            <span className="text-[11px] font-bold text-[#1d1d1f] bg-[#f5f5f7] px-3 py-1 rounded-full border border-[#e8e8ed]">
              🇵🇹 Portugal
            </span>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {activeTab === "home" && (
          <PresentStateHome
            assets={assets}
            loans={loans}
            userProfile={userProfile}
            goals={goals}
            includeLoans={includeLoans}
            onToggleIncludeLoans={setIncludeLoans}
            emergencyFundAmount={emergencyFundAmount}
            emergencyFundSentence={emergencyFundSentence}
            emergencyFundStatus={emergencyFundStatus}
            isClassifyingEmergencyFund={isClassifyingEmergencyFund}
            onRefreshClassification={handleClassifyEmergencyFund}
            onOpenGrounding={setActiveGrounding}
            onOpenGoalsModal={() => setGoalsModalOpen(true)}
            onNavigateToPlayground={() => setActiveTab("playground")}
          />
        )}

        {activeTab === "playground" && (
          <RipplePlayground
            currentNetWorth={currentNetWorth}
            baselineParams={baselineParams}
            draftParams={draftParams}
            hasUnappliedChanges={hasUnappliedChanges}
            onDraftChange={handleDraftChange}
            onApplyChanges={handleApplyChanges}
            onDiscardDraft={handleDiscardDraft}
            onSaveAsFork={handleSaveAsFork}
            onRequestPromotion={handleRequestPromotionFromPlayground}
            onOpenGrounding={setActiveGrounding}
            goals={goals}
            assets={assets}
          />
        )}

        {activeTab === "weaver" && (
          <CounterfactualWeaver
            forks={forks}
            mainForkId={mainForkId}
            onSelectForkForPlayground={(fork) => {
              setDraftParams({ ...fork.params });
              setHasUnappliedChanges(true);
              setActiveTab("playground");
            }}
            onPromoteFork={handlePromoteFork}
            onCreateNewFork={(name, desc, params) => {
              const newF: WeaverFork = {
                id: `fork-${Date.now()}`,
                name,
                description: desc,
                createdAt: new Date().toISOString().split("T")[0],
                parentId: mainForkId,
                isMainModel: false,
                params: { ...params },
                metrics: {
                  netWorthIn10Y: 2150000,
                  netWorthIn20Y: 3480000,
                  targetNetWorth2045: 2150000,
                  monthlyRetirementCashflow: 5980,
                  earlyRetirementDate: "May 2045",
                  goalDateShiftMonths: 11,
                  runwayMonths: 11.3,
                },
              };
              setForks([...forks, newF]);
            }}
            onOpenGrounding={setActiveGrounding}
          />
        )}

        {activeTab === "assets" && (
          <AssetsManager
            assets={assets}
            loans={loans}
            onAddAsset={handleAddAsset}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onAddLoan={handleAddLoan}
            onDeleteLoan={handleDeleteLoan}
            onOpenGrounding={setActiveGrounding}
            realEstateMilestones={realEstateMilestones}
            onAddRealEstateMilestone={(m) => setRealEstateMilestones((prev) => [...prev, m])}
            onUpdateRealEstateMilestone={(m) =>
              setRealEstateMilestones((prev) => prev.map((item) => (item.id === m.id ? m : item)))
            }
            onDeleteRealEstateMilestone={(id) =>
              setRealEstateMilestones((prev) => prev.filter((item) => item.id !== id))
            }
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            includeLoans={includeLoans}
            onToggleIncludeLoans={setIncludeLoans}
            emergencyFundAmount={emergencyFundAmount}
            onUpdateEmergencyFund={setEmergencyFundAmount}
            emergencyFundSentence={emergencyFundSentence}
            isClassifying={isClassifyingEmergencyFund}
            onReclassifyEmergencyFund={handleClassifyEmergencyFund}
            goals={goals}
            onUpdateGoals={setGoals}
          />
        )}
        </main>

        {/* Floating Quick Re-open button when menu is hidden on smaller screens */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            id="floating-reopen-menu-btn"
            title="Open navigation menu (Ctrl+B)"
            aria-label="Open navigation menu"
            className="fixed bottom-6 left-6 z-40 lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-[#1d1d1f] hover:bg-black text-white rounded-full text-xs font-bold shadow-2xl border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 text-white" />
            <span>Menu</span>
            {hasUnappliedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Grounding Drawer (REQ-012) */}
      <GroundingDrawer
        data={activeGrounding}
        onClose={() => setActiveGrounding(null)}
      />

      {/* Money Goals Modal (REQ-019) */}
      <GoalsModal
        isOpen={goalsModalOpen}
        onClose={() => setGoalsModalOpen(false)}
        goals={goals}
        onNavigateToPlayground={() => {
          setGoalsModalOpen(false);
          setActiveTab("playground");
        }}
      />
    </div>
  );
}
