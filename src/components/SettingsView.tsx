import React, { useState } from "react";
import {
  Settings,
  User,
  Shield,
  HelpCircle,
  Save,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Target,
  Plus,
  Trash2,
} from "lucide-react";
import { MoneyGoal, UserProfile } from "../types";
import { formatEuro } from "../utils/calculations";

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  includeLoans: boolean;
  onToggleIncludeLoans: (include: boolean) => void;
  emergencyFundAmount: number;
  onUpdateEmergencyFund: (newAmount: number) => void;
  emergencyFundSentence: string;
  isClassifying: boolean;
  onReclassifyEmergencyFund: () => void;
  goals: MoneyGoal[];
  onUpdateGoals: (newGoals: MoneyGoal[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  includeLoans,
  onToggleIncludeLoans,
  emergencyFundAmount,
  onUpdateEmergencyFund,
  emergencyFundSentence,
  isClassifying,
  onReclassifyEmergencyFund,
  goals,
  onUpdateGoals,
}) => {
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [efAmount, setEfAmount] = useState<number>(emergencyFundAmount);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // New Goal Form Modal
  const [newGoalModalOpen, setNewGoalModalOpen] = useState<boolean>(false);
  const [goalName, setGoalName] = useState<string>("");
  const [goalType, setGoalType] = useState<"reach_net_worth" | "sustain_spending">("reach_net_worth");
  const [goalValue, setGoalValue] = useState<number>(100000);
  const [goalDate, setGoalDate] = useState<string>("2028-12");

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    onUpdateEmergencyFund(efAmount);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    const newGoal: MoneyGoal = {
      id: `goal-${Date.now()}`,
      name: goalName.trim(),
      targetType: goalType,
      targetValue: Number(goalValue),
      targetDate: goalDate,
      currentProgressPct: 40,
      status: "in_progress",
    };
    onUpdateGoals([...goals, newGoal]);
    setNewGoalModalOpen(false);
    setGoalName("");
  };

  const handleDeleteGoal = (id: string) => {
    onUpdateGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="flex-1 min-w-0 bg-white p-6 lg:p-10 space-y-8 max-w-5xl mx-auto" id="settings-view">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e8e8ed]">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1d1d1f] tracking-tight">System Settings & Profile</h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-medium mt-1">
            Portugal statutory baselines, personal expense boundaries, and Money Goals.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
        {/* User Profile Form (REQ-024) */}
        <div className="card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#e8e8ed]">
            <User className="w-4 h-4 text-[#1d1d1f]" />
            <h3 className="text-base font-extrabold text-[#1d1d1f]">Personal & Financial Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Age / Stage</label>
              <input
                type="number"
                value={profileForm.age}
                onChange={(e) => setProfileForm({ ...profileForm, age: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Employment Type in Portugal</label>
              <select
                value={profileForm.employmentType}
                onChange={(e) => setProfileForm({ ...profileForm, employmentType: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              >
                <option value="Freelancer / Independent Worker">
                  Freelancer / Independent Worker (Recibos Verdes / Unipessoal)
                </option>
                <option value="Employee / Salaried">Employee / Salaried (Trabalhador por Conta de Outrem)</option>
                <option value="Entrepreneur / Business Owner">Entrepreneur / Business Owner (Empresário)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Monthly Essential Expenses (€/mo)</label>
              <input
                type="number"
                required
                value={profileForm.monthlyEssentialExpenses}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, monthlyEssentialExpenses: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              />
              <span className="text-[10px] text-[#86868b] font-medium">Housing, food, utilities, essential insurance.</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Net Invoiced / After-Tax Income (€/mo)</label>
              <input
                type="number"
                required
                value={profileForm.afterTaxIncome}
                onChange={(e) => setProfileForm({ ...profileForm, afterTaxIncome: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              />
              <span className="text-[10px] text-[#86868b] font-medium">Used to establish monthly Safe-to-Spend.</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Profile Context Notes</label>
              <input
                type="text"
                value={profileForm.notes}
                onChange={(e) => setProfileForm({ ...profileForm, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Emergency Fund Designation (REQ-009, REQ-010) */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
            <div className="flex items-center space-x-2.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Emergency Fund Allocation</h3>
            </div>
            <button
              type="button"
              onClick={onReclassifyEmergencyFund}
              disabled={isClassifying}
              className="text-xs text-[#1d1d1f] hover:underline font-bold flex items-center gap-1 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? "animate-spin" : ""}`} />
              <span>{isClassifying ? "Evaluating..." : "Re-evaluate via Gemini LLM"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Designated Emergency Amount (€)</label>
              <input
                type="number"
                required
                value={efAmount}
                onChange={(e) => setEfAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl text-base font-extrabold text-[#1d1d1f] focus:ring-2 focus:ring-[#1d1d1f] focus:outline-none"
              />
              <span className="text-[10px] text-[#86868b] font-medium">
                Covers ~{(efAmount / (profileForm.monthlyEssentialExpenses || 1)).toFixed(1)} months of essential living costs.
              </span>
            </div>

            <div className="p-4 bg-white border border-[#e8e8ed] rounded-xl space-y-1">
              <span className="text-label block">
                Automatic LLM Classification Sentence
              </span>
              <p className="text-xs text-[#1d1d1f] font-medium italic">
                "{emergencyFundSentence}"
              </p>
            </div>
          </div>
        </div>

        {/* Portugal-First Statutory Defaults (REQ-013) */}
        <div className="card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#e8e8ed]">
            <span className="text-base">🇵🇹</span>
            <h3 className="text-base font-extrabold text-[#1d1d1f]">Portugal-First Statutory Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Annual Baseline Inflation (%)</label>
              <input
                type="number"
                step="0.1"
                value={profileForm.portugalInflationDefault}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, portugalInflationDefault: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
              />
              <span className="text-[10px] text-[#86868b] font-medium">INE Portuguese CPI reference.</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">IRS Capital Gains Flat Tax (%)</label>
              <input
                type="number"
                value={profileForm.portugalCgtRate}
                onChange={(e) => setProfileForm({ ...profileForm, portugalCgtRate: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
              />
              <span className="text-[10px] text-[#86868b] font-medium">Portuguese tax code Article 72.</span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1d1d1f]">Safe-to-Spend Commitment Window</label>
              <select
                value={profileForm.safeToSpendWindowDays}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, safeToSpendWindowDays: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
              >
                <option value={14}>14 Days (Bi-weekly)</option>
                <option value={30}>30 Days (Monthly horizon)</option>
              </select>
              <span className="text-[10px] text-[#86868b] font-medium">Horizon for upcoming commitments buffer.</span>
            </div>
          </div>
        </div>

        {/* Global Loans Toggle Preference (REQ-003, DEC-004) */}
        <div className="card space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Whole-App Global Loans Toggle</h3>
              <p className="text-xs text-[#86868b] font-medium mt-0.5">
                Controls whether loans and liabilities are deducted from your total Net Worth calculation across all screens.
              </p>
            </div>
            <div className="toggle-pill self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onToggleIncludeLoans(true)}
                className={includeLoans ? "toggle-active" : "text-[#86868b]"}
              >
                Include loans
              </button>
              <button
                type="button"
                onClick={() => onToggleIncludeLoans(false)}
                className={!includeLoans ? "toggle-active" : "text-[#86868b]"}
              >
                Exclude loans
              </button>
            </div>
          </div>
        </div>

        {/* Money Goals Management (REQ-019) */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
            <div className="flex items-center space-x-2.5">
              <Target className="w-4 h-4 text-[#1d1d1f]" />
              <h3 className="text-base font-extrabold text-[#1d1d1f]">Money Goals Management</h3>
            </div>
            <button
              type="button"
              onClick={() => setNewGoalModalOpen(true)}
              className="text-xs font-bold text-[#1d1d1f] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 bg-white border border-[#e8e8ed] rounded-xl flex items-center justify-between hover:border-[#86868b] transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#1d1d1f]">{goal.name}</span>
                    <span className="text-[10px] bg-[#f5f5f7] text-[#1d1d1f] px-2 py-0.5 rounded-full font-bold border border-[#e8e8ed]">
                      {goal.targetType === "reach_net_worth" ? "Target Net Worth" : "Sustain Spending"}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#86868b] font-medium">
                    Target: {formatEuro(goal.targetValue)} by {goal.targetDate}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-emerald-600">{goal.currentProgressPct}% Progress</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-[#86868b] hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#1d1d1f] hover:bg-black text-white font-bold rounded-full text-xs shadow-xs transition-colors flex items-center space-x-1.5"
            id="save-settings-btn"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings & Profile</span>
          </button>
        </div>
      </form>

      {/* New Goal Modal */}
      {newGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1d1d1f]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e8e8ed] space-y-4">
            <h3 className="text-base font-extrabold text-[#1d1d1f]">Define New Money Goal</h3>
            <form onSubmit={handleAddGoal} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Goal Name</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Sabbatical Year or Second Home"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Goal Type (REQ-019)</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl bg-white font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                >
                  <option value="reach_net_worth">Reach net worth of €X by date Y</option>
                  <option value="sustain_spending">Sustain monthly spending of €Z by date Y</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Target Value (€)</label>
                <input
                  type="number"
                  required
                  value={goalValue}
                  onChange={(e) => setGoalValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-extrabold text-sm focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1d1d1f]">Target Milestone Date (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  placeholder="2028-12"
                  className="w-full px-3.5 py-2.5 border border-[#e8e8ed] rounded-xl font-medium focus:ring-2 focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#e8e8ed]">
                <button
                  type="button"
                  onClick={() => setNewGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#86868b] hover:text-[#1d1d1f] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1f] hover:bg-black text-white font-bold rounded-full text-xs shadow-xs transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
