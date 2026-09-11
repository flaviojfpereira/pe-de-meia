import React from "react";
import {
  Home,
  Sliders,
  GitFork,
  Briefcase,
  Settings,
  Sparkles,
  ChevronDown,
  PanelLeftClose,
  X,
} from "lucide-react";
import { UserProfile } from "../types";

export type NavTab = "home" | "playground" | "weaver" | "assets" | "settings";

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userProfile: UserProfile;
  hasUnappliedDraft: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  hasUnappliedDraft,
  isOpen,
  onClose,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "playground", label: "Playground", icon: Sliders },
    { id: "weaver", label: "Weaver", icon: GitFork },
    { id: "assets", label: "Assets", icon: Briefcase },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1d1d1f]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white flex flex-col justify-between select-none h-full h-[100dvh] overflow-y-auto transition-all duration-300 ease-in-out lg:static lg:z-auto ${
          isOpen
            ? "w-72 sm:w-64 translate-x-0 shadow-2xl lg:shadow-none lg:w-64 lg:border-r lg:border-[#e8e8ed] lg:opacity-100 lg:pointer-events-auto"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none"
        }`}
        id="main-sidebar-nav"
      >
        <div className="w-72 sm:w-64 p-6 shrink-0 flex flex-col">
          {/* Brand Header with Close/Hide Menu Button */}
          <div className="flex items-center justify-between px-1 py-1 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-[#1d1d1f] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base text-[#1d1d1f] tracking-tight leading-none">
                  Pé de Meia
                </h1>
                <span className="text-[11px] text-[#86868b] font-semibold tracking-wider uppercase">Portugal</span>
              </div>
            </div>

            {/* Close / Hide button */}
            <button
              onClick={onClose}
              id="close-sidebar-btn"
              title="Hide menu (Ctrl+B)"
              aria-label="Hide navigation menu"
              className="p-2 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-full transition-colors active:scale-95"
            >
              <PanelLeftClose className="w-4 h-4 hidden lg:block" />
              <X className="w-4 h-4 lg:hidden" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const showDraftDot = item.id === "playground" && hasUnappliedDraft;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all ${
                    isActive
                      ? "bg-[#1d1d1f] text-white font-bold shadow-xs"
                      : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] font-semibold"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-[#86868b]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {showDraftDot && (
                    <span
                      title="Unapplied scenario changes"
                      className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="w-72 sm:w-64 p-5 space-y-4 shrink-0">
          {/* Portugal First Card */}
          <div
            className="relative overflow-hidden rounded-[24px] p-5 bg-[#1d1d1f] text-white shadow-xs"
            id="portugal-first-banner"
          >
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-white mb-1.5">
                <span>Portugal First</span>
                <span>🇵🇹</span>
              </div>
              <p className="text-[11px] text-[#86868b] leading-relaxed font-medium">
                Local tax insights & real estate indices with global perspective.
              </p>
            </div>
          </div>

          {/* User Profile Footer */}
          <div
            onClick={() => onSelectTab("settings")}
            className="flex items-center justify-between p-3 rounded-[20px] bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors cursor-pointer"
            id="sidebar-user-profile-button"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xs">
                {userProfile.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#1d1d1f] leading-tight">
                  {userProfile.name}
                </div>
                <div className="text-[10px] text-[#86868b] font-medium leading-tight">
                  {userProfile.employmentType.split("/")[0].trim()}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-center pt-1">
            <span className="text-[10px] text-[#86868b] font-medium">
              Press <kbd className="px-1.5 py-0.5 bg-[#f5f5f7] border border-[#e8e8ed] rounded text-[9px] font-bold text-[#1d1d1f]">Ctrl+B</kbd> to toggle menu
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
