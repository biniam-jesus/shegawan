import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { ExpenseCategory, PaymentMethod, ExpenseFilters as FiltersState } from "../types";

interface ExpenseFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
  onClearFilters: () => void;
  suppliersList: string[];
}

const CATEGORIES: (ExpenseCategory | "All")[] = [
  "All",
  "Rent",
  "Utilities",
  "Salaries",
  "Inventory Purchase",
  "Transportation",
  "Maintenance",
  "Marketing",
  "Equipment",
  "Internet",
  "Cleaning Supplies",
  "Taxes",
  "Other",
];

const PAYMENT_METHODS: (PaymentMethod | "All")[] = ["All", "Cash", "Bank", "Mobile Money"];

export const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  suppliersList,
}) => {
  const handleChange = (key: keyof FiltersState, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl p-4 shadow-sm mb-6 space-y-4 text-[#e0e0e2]">
      {/* Top Search Line */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Keywords Search */}
        <div className="relative flex-1">
          <input
            id="filter-search-query"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleChange("searchQuery", e.target.value)}
            placeholder="Search descriptions, notes, or items lists..."
            className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg pl-9 pr-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] text-neutral-200 placeholder-neutral-500"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
        </div>

        {/* Clear filter button */}
        <button
          id="btn-clear-filters"
          type="button"
          onClick={onClearFilters}
          className="px-4 py-2 text-xs font-semibold text-neutral-300 bg-[#1a1a1c] border border-[#2a2a2d] hover:bg-[#222224] rounded-lg shrink-0 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
          Reset Filters
        </button>
      </div>

      {/* Grid of advanced parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Category */}
        <div>
          <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#121214] text-neutral-200">
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
            Payment Method
          </label>
          <div className="relative">
            <select
              id="filter-payment"
              value={filters.paymentMethod}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] cursor-pointer"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method} className="bg-[#121214] text-neutral-200">
                  {method === "All" ? "All Methods" : method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
            From Date
          </label>
          <input
            id="filter-start-date"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
            To Date
          </label>
          <input
            id="filter-end-date"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
          />
        </div>
      </div>

      {/* Advanced Supplier select inline block */}
      {suppliersList.length > 0 && (
        <div className="pt-2.5 border-t border-[#2a2a2d] flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase mr-1 tracking-widest">
            Filter Supplier:
          </span>
          <button
            id="supplier-chip-all"
            type="button"
            onClick={() => handleChange("supplier", "")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer border ${
              filters.supplier === ""
                ? "bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/60 font-medium"
                : "bg-[#1a1a1c] text-neutral-400 border-transparent hover:bg-[#222224] hover:text-white"
            }`}
          >
            All Suppliers
          </button>
          
          {suppliersList.map((sup) => (
            <button
              key={sup}
              id={`supplier-chip-${sup.replace(/\s+/g, "-")}`}
              type="button"
              onClick={() => handleChange("supplier", sup)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-150 cursor-pointer truncate max-w-[150px] border ${
                filters.supplier === sup
                  ? "bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/60 font-medium"
                  : "bg-[#1a1a1c] text-neutral-400 border-transparent hover:bg-[#222224] hover:text-white"
              }`}
            >
              {sup}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
