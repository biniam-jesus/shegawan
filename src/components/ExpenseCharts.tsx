import React, { useState } from "react";
import { TrendingUp, PieChart, ShoppingBag, Calendar, DollarSign } from "lucide-react";
import { Expense, ExpenseCategory, ExpenseSummary } from "../types";

interface ExpenseChartsProps {
  expenses: Expense[];
  summary: ExpenseSummary;
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ expenses, summary }) => {
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group expenses by category
  const categoryTotals: Record<ExpenseCategory, number> = {} as any;
  expenses.forEach((e) => {
    if (!categoryTotals[e.category]) {
      categoryTotals[e.category] = 0;
    }
    categoryTotals[e.category] += e.amount;
  });

  const categoriesData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: cat as ExpenseCategory,
    value: total,
    pct: expenses.reduce((acc, exp) => acc + exp.amount, 0)
      ? (total / expenses.reduce((acc, exp) => acc + exp.amount, 0)) * 100
      : 0,
  })).sort((a, b) => b.value - a.value);

  // Monthly breakdown for trend chart (last 6 months)
  const getLastMonths = () => {
    const list = [];
    const date = new Date("2026-06-02"); // Anchor date based on prompt metadata
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed
      list.push({ label, year, month, amount: 0 });
    }
    return list;
  };

  const monthsList = getLastMonths();
  monthsList.forEach((item) => {
    expenses.forEach((exp) => {
      const expDate = new Date(exp.expenseDate);
      if (expDate.getFullYear() === item.year && expDate.getMonth() === item.month) {
        item.amount += exp.amount;
      }
    });
  });

  // Calculate coordinates for SVG area/line chart
  const maxAmount = Math.max(...monthsList.map((m) => m.amount), 500); // Guard division by zero
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 500;
  const chartHeight = 160;

  const points = monthsList.map((m, idx) => {
    const x = paddingX + (idx / (monthsList.length - 1)) * (chartWidth - paddingX * 2);
    // Invert Y direction
    const y = chartHeight - paddingY - (m.amount / maxAmount) * (chartHeight - paddingY * 2);
    return { x, y, label: m.label, amount: m.amount };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : "";

  // Coordinated Metallic/Gold category colors for Sophisticated Dark theme
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Rent: "#c5a059", // Core Gold Accent
      Utilities: "#a37e3d", // Darker Gold
      Salaries: "#e5cca1", // Champagne Gold
      "Inventory Purchase": "#85652d", // Warm Bronze
      Transportation: "#dec088", // Soft Brass
      Maintenance: "#d4b57b", // Antique Gold
      Marketing: "#997f50", // Muted Brass
      Equipment: "#bfa370", // Brushed Gold
      Internet: "#59492d", // Deep Earth Bronze
      "Cleaning Supplies": "#ecdcb9", // Pale Gold
      Taxes: "#705b33", // Olive Bronze
      Other: "#45381f", // Shadow Bronze
    };
    return colors[cat] || "#c5a059";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4 rounded-xl flex items-center justify-between hover:border-[#c5a059]/40 transition-colors">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Today</p>
            <p className="text-2xl font-light font-serif text-[#c5a059] mt-1">
              ${summary.today.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4 rounded-xl flex items-center justify-between hover:border-[#c5a059]/40 transition-colors">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">This Week</p>
            <p className="text-2xl font-light font-serif text-[#c5a059] mt-1">
              ${summary.thisWeek.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4 rounded-xl flex items-center justify-between hover:border-[#c5a059]/40 transition-colors">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">This Month</p>
            <p className="text-2xl font-light font-serif text-[#c5a059] mt-1">
              ${summary.thisMonth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4 rounded-xl flex items-center justify-between hover:border-[#c5a059]/40 transition-colors bg-gradient-to-br from-[#121214] to-[#1a1a1c]">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Year to Date</p>
            <p className="text-2xl font-light font-serif text-[#c5a059] mt-1">
              ${summary.thisYear.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Expense Trend Chart Widget */}
      <div className="md:col-span-1 lg:col-span-2 bg-[#121214] border border-[#2a2a2d] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#c5a059]" />
              <h3 className="font-light text-sm tracking-wide text-neutral-200">Expense Trend Chart (6 Months)</h3>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Max: ${maxAmount.toFixed(0)}</span>
          </div>

          <div className="relative w-full overflow-hidden" style={{ minHeight: "170px" }}>
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              id="expense-trend-chart-svg"
            >
              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#2a2a2d" strokeDasharray="3 3" />
              <line
                x1={paddingX}
                y1={(chartHeight - paddingY * 2) / 2 + paddingY}
                x2={chartWidth - paddingX}
                y2={(chartHeight - paddingY * 2) / 2 + paddingY}
                stroke="#2a2a2d"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={chartHeight - paddingY}
                x2={chartWidth - paddingX}
                y2={chartHeight - paddingY}
                stroke="#2a2a2d"
                strokeWidth="1.5"
              />

              {/* Area Under Line */}
              {areaPath && (
                <path d={areaPath} fill="url(#trend-gradient)" opacity="0.3" className="transition-all duration-300" />
              )}

              {/* Path Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#c5a059"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              )}

              {/* Interactive Circles / Dots */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredTrendIdx === idx ? "7" : "4.5"}
                    fill="#c5a059"
                    stroke="#0a0a0b"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredTrendIdx(idx)}
                    onMouseLeave={() => setHoveredTrendIdx(null)}
                  />
                  {/* Axis Label */}
                  <text
                    x={p.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-neutral-500 font-mono"
                  >
                    {p.label}
                  </text>
                </g>
              ))}

              {/* Define Gradients */}
              <defs>
                <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c5a059" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#121214" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredTrendIdx !== null && (
              <div
                className="absolute bg-[#1a1a1c] border border-[#2a2a2d] text-[#e0e0e2] px-2.5 py-1.5 rounded-lg text-xs font-mono shadow-md -translate-x-1/2 pointer-events-none transition-all duration-100 z-10"
                style={{
                  left: `${(points[hoveredTrendIdx].x / chartWidth) * 100}%`,
                  top: `${(points[hoveredTrendIdx].y / chartHeight) * 100 - 30}%`,
                }}
              >
                <p className="font-semibold text-[10px] text-neutral-400 uppercase">{points[hoveredTrendIdx].label}</p>
                <p className="font-bold text-[#c5a059] mt-0.5">${points[hoveredTrendIdx].amount.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 text-[10px] text-neutral-500 flex items-center justify-between border-t border-[#2a2a2d] pt-2">
          <span>Data derived from standard purchase logs</span>
          <span className="flex items-center gap-1 font-medium text-[#c5a059]">
            Active tracking enabled
          </span>
        </div>
      </div>

      {/* Expenses by Category Widget */}
      <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-[#c5a059]" />
            <h3 className="font-light text-sm tracking-wide text-neutral-200">Category Share</h3>
          </div>

          <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
            {categoriesData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-neutral-500">No records to analyze</p>
              </div>
            ) : (
              categoriesData.map((elem) => {
                const hexColor = getCategoryColor(elem.name);

                return (
                  <div
                    key={elem.name}
                    className="group cursor-default"
                    onMouseEnter={() => setHoveredCategory(elem.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hexColor }} />
                        {elem.name}
                      </span>
                      <span className="font-mono text-neutral-400 font-medium">
                        ${elem.value.toFixed(2)} ({elem.pct.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Visual Bar Indicator */}
                    <div className="w-full bg-[#1a1a1c] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          backgroundColor: hexColor,
                          width: `${elem.pct}%`,
                          opacity: hoveredCategory && hoveredCategory !== elem.name ? 0.4 : 1,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="border-t border-[#2a2a2d] pt-2 mt-2 text-[10px] text-neutral-500 text-center uppercase tracking-wider">
          Sorted by total transaction volume
        </div>
      </div>
    </div>
  );
};
