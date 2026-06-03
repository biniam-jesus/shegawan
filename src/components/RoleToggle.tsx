import React from "react";
import { Shield, User, Info, Key, ShoppingCart, Truck, CreditCard, Languages, LogOut } from "lucide-react";
import { UserRole } from "../types";
import { translations, Language } from "../lib/translations";

interface RoleToggleProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  language: Language;
  onLanguageToggle: () => void;
  currentUser: any;
  onLogout: () => void;
  activeBranch: "Shegawan" | "Teyemshega";
  onBranchChange: (branch: "Shegawan" | "Teyemshega") => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ 
  currentRole, 
  onRoleChange,
  language,
  onLanguageToggle,
  currentUser,
  onLogout,
  activeBranch,
  onBranchChange
}) => {
  const t = translations[language];

  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-border-dark bg-card-bg p-4 gap-4 text-[#e0e0e2]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-accent/10 border border-gold-accent/20 text-gold-accent">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-light tracking-wide uppercase font-serif">
            {t.appName} <span className="text-gold-accent italic font-semibold">{t.appSubName}</span>
          </h2>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
            {language === "am" 
              ? "የቅርንጫፍ ግዢዎች እና የገቢ ዕቃዎች ዝርዝር መዝገብ" 
              : "Premium Multi-Branch Procurement & Ledger Panel"}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Active Restaurant Branch Router */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 shrink-0 flex items-center gap-1">
            🏢 {t.branchLabel}:
          </span>
          <div className="flex bg-input-bg p-1 border border-border-dark rounded-xl">
            <button
              id="branch-btn-shegawan"
              type="button"
              onClick={() => onBranchChange("Shegawan")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeBranch === "Shegawan"
                  ? "bg-gold-accent/25 text-gold-accent border border-gold-accent/30 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${activeBranch === "Shegawan" ? "bg-gold-accent" : "bg-neutral-600"}`} />
              <span>{language === "am" ? "ሸጋዋን" : "Shegawan"}</span>
            </button>

            <button
              id="branch-btn-teyemshega"
              type="button"
              onClick={() => onBranchChange("Teyemshega")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeBranch === "Teyemshega"
                  ? "bg-gold-accent/25 text-gold-accent border border-gold-accent/30 font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${activeBranch === "Teyemshega" ? "bg-gold-accent" : "bg-neutral-600"}`} />
              <span>{language === "am" ? "ጠየምሸጋ" : "Teyemshega"}</span>
            </button>
          </div>
        </div>

        {/* Security Role Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-medium text-neutral-400 shrink-0 flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-gold-accent" /> {t.roleLabel}:
          </span>
          <div className="flex flex-wrap gap-1 bg-input-bg p-1 border border-border-dark rounded-xl">
            <button
              id="role-btn-owner"
              type="button"
              onClick={() => onRoleChange("Owner")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                currentRole === "Owner"
                  ? "bg-gold-accent text-dark-bg font-bold shadow-md shadow-gold-accent/15"
                  : "text-neutral-400 hover:text-white hover:bg-border-light"
              }`}
              title="Owner: Unrestricted full visual controls and ledger permissions."
            >
              <Shield className="h-3 w-3" />
              {language === "am" ? "ባለቤት" : "Owner"}
            </button>

            <button
              id="role-btn-manager"
              type="button"
              onClick={() => onRoleChange("Manager")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                currentRole === "Manager"
                  ? "bg-gold-accent text-dark-bg font-bold shadow-md shadow-gold-accent/15"
                  : "text-neutral-400 hover:text-white hover:bg-border-light"
              }`}
              title="Manager: Create, view and approve Purchase Orders."
            >
              <ShoppingCart className="h-3 w-3" />
              {language === "am" ? "ሥራ አስኪያጅ" : "Manager"}
            </button>

            <button
              id="role-btn-keeper"
              type="button"
              onClick={() => onRoleChange("Store Keeper")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                currentRole === "Store Keeper"
                  ? "bg-gold-accent text-dark-bg font-bold shadow-md shadow-gold-accent/15"
                  : "text-neutral-400 hover:text-white hover:bg-border-light"
              }`}
              title="Store Keeper: View approved POs and receive incoming deliveries (GRN/Partial) only."
            >
              <Truck className="h-3 w-3" />
              {language === "am" ? "መጋዘን ጠባቂ" : "Store Keeper"}
            </button>

            <button
              id="role-btn-accountant"
              type="button"
              onClick={() => onRoleChange("Accountant")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                currentRole === "Accountant"
                  ? "bg-gold-accent text-dark-bg font-bold shadow-md shadow-gold-accent/15"
                  : "text-neutral-400 hover:text-white hover:bg-border-light"
              }`}
              title="Accountant: Access supplier payment ledgers, invoice settlements, and print reports."
            >
              <CreditCard className="h-3 w-3" />
              {language === "am" ? "ሒሳብ ባለሙያ" : "Accountant"}
            </button>

            <button
              id="role-btn-staff"
              type="button"
              onClick={() => onRoleChange("Staff")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                currentRole === "Staff"
                  ? "bg-gold-accent text-dark-bg font-bold shadow-md shadow-gold-accent/15"
                  : "text-neutral-400 hover:text-white hover:bg-border-light"
              }`}
              title="Kitchen Staff: Request purchases, log receipts, and parse receipts."
            >
              <User className="h-3 w-3" />
              {language === "am" ? "ሠራተኛ" : "Staff"}
            </button>
          </div>
        </div>

        {/* Global Toolbar Additions: Language Toggle & User Auth Panel */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Language toggler */}
          <button
            id="global-lang-switch-btn"
            type="button"
            onClick={onLanguageToggle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-border-light border border-border-dark transition-all cursor-pointer bg-input-bg"
          >
            <Languages className="h-3.5 w-3.5 text-gold-accent" />
            <span>{language === "en" ? "አማርኛ" : "English"}</span>
          </button>

          {/* User authenticated block */}
          {currentUser && (
            <div className="flex items-center gap-2 p-1.5 pl-3 border border-border-dark bg-input-bg rounded-xl text-xs font-semibold text-neutral-300 max-w-[240px]">
              <span className="truncate max-w-[110px]" title={currentUser.email}>
                {currentUser.email}
              </span>
              <button
                id="global-logout-btn"
                type="button"
                onClick={onLogout}
                className="p-1 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title={t.logoutButton}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

