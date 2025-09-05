import React, { useState } from "react";
import { View, TransactionType } from "../types";
import { DashboardIcon, CropsIcon, IncomeIcon, ExpensesIcon, ReportsIcon, SettingsIcon, DocumentIcon, FarmAIIcon, HydroponicsIcon,} from "./icons";
import { useFarm } from "../context/FarmContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  isExpanded,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center h-12 rounded-xl cursor-pointer px-3 transition-all duration-200 group
        ${isActive
          ? "bg-primary text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100 hover:text-primary"
        }`}
    >
      <div className="w-6 h-6 flex items-center justify-center mr-2">
        {icon}
      </div>
      <span
        className={`font-medium text-sm tracking-wide transition-all duration-200
          ${isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
        `}
      >
        {label}
      </span>
    </li>
  );
};

interface SideNavProps {
  setIsExpanded: (isExpanded: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ setIsExpanded }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { viewState, setViewState, triggerUIInteraction } = useFarm();

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      setIsHovered(false);
      setIsExpanded(false);
    }
  };

  const handleNav = (view: View, type?: TransactionType) => {
    setViewState({ view, type });
    setIsMobileOpen(false); // close sidebar on mobile
  };

  const clearHint = () => triggerUIInteraction(null);

  const navItems = [
    { view: "dashboard", label: "Dashboard", icon: <DashboardIcon />, hint: "Get a quick overview of your farm." },
    { view: "crops", label: "Crops", icon: <CropsIcon />, hint: "Manage your crops and fields." },
    { view: "equipment", label: "Hydroponics", icon: <HydroponicsIcon />, hint: "Track your hydroponic machinery." },
    { view: "transactions", type: TransactionType.INCOME, label: "Income", icon: <IncomeIcon />, hint: "Log and view all income." },
    { view: "transactions", type: TransactionType.EXPENSE, label: "Expenses", icon: <ExpensesIcon />, hint: "Log and view all expenses." },
    { view: "reports", label: "Reports", icon: <ReportsIcon />, hint: "Analyze your farm's performance." },
    { view: "summary", label: "Summary", icon: <DocumentIcon />, hint: "Generate printable summaries." },
    { view: "farm-ai", label: "Farm AI", icon: <FarmAIIcon />, hint: "Use AI-powered tools for your farm." },
  ];

  const settingsItem = {
    view: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    hint: "Configure your app settings.",
  };

  return (
    <>
      {/* ✅ Sidebar */}
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-40
          ${isHovered ? "w-60" : "w-16"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* ✅ Logo + Toggle */}
        <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <CropsIcon className="w-7 h-7 text-primary" />
            <span
              className={`text-lg font-bold text-primary transition-opacity duration-300
                ${isHovered || isMobileOpen ? "opacity-100" : "opacity-0"}
              `}
            >
              FARMY's LEDGER
            </span>
          </div>
          {/* Mobile Toggle */}
          <button
            className="md:hidden text-primary text-2xl"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? "✖" : "☰"}
          </button>
        </div>

        {/* ✅ Menu */}
        <ul className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              isExpanded={isHovered || isMobileOpen}
              isActive={
                viewState.view === item.view &&
                (item.type ? viewState.type === item.type : true)
              }
              onClick={() => handleNav(item.view as View, item.type as TransactionType)}
              onMouseEnter={() => triggerUIInteraction(item.hint)}
              onMouseLeave={clearHint}
            />
          ))}
        </ul>

        {/* ✅ Footer / Settings */}
        <div className="px-2 py-3 border-t border-gray-200">
          <NavItem
            label={settingsItem.label}
            icon={settingsItem.icon}
            isExpanded={isHovered || isMobileOpen}
            isActive={viewState.view === settingsItem.view}
            onClick={() => handleNav(settingsItem.view as View)}
            onMouseEnter={() => triggerUIInteraction(settingsItem.hint)}
            onMouseLeave={clearHint}
          />
        </div>
      </nav>

      {/* ✅ Dark overlay when sidebar is open on mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;
                                       
