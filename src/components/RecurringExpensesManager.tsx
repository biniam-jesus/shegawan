import React, { useState } from "react";
import { Plus, Trash2, Calendar, DollarSign, Activity, CheckCircle, Play, Pause, AlertTriangle, HelpCircle, X } from "lucide-react";
import { RecurringExpense, ExpenseCategory, PaymentMethod, UserRole } from "../types";

interface RecurringExpensesManagerProps {
  schedules: RecurringExpense[];
  currentRole: UserRole;
  currentDateStr: string;
  onAddSchedule: (schedule: RecurringExpense) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleScheduleStatus: (id: string) => void;
  onTriggerAutoGeneration: () => void;
  generatedCountSinceBoot: number;
}

const CATEGORIES: ExpenseCategory[] = [
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
  "Other"
];

const METHODS: PaymentMethod[] = ["Cash", "Bank", "Mobile Money"];

export const RecurringExpensesManager: React.FC<RecurringExpensesManagerProps> = ({
  schedules,
  currentRole,
  currentDateStr,
  onAddSchedule,
  onDeleteSchedule,
  onToggleScheduleStatus,
  onTriggerAutoGeneration,
  generatedCountSinceBoot,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Utilities");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly" | "Yearly">("Monthly");
  const [startDate, setStartDate] = useState(currentDateStr);
  const [endDate, setEndDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Bank");
  const [notes, setNotes] = useState("");

  const openForm = () => {
    setDescription("");
    setAmount("");
    setCategory("Utilities");
    setFrequency("Monthly");
    setStartDate(currentDateStr);
    setEndDate("");
    setSupplier("");
    setPaymentMethod("Bank");
    setNotes("");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || !supplier.trim()) return;

    if (currentRole === "Store Keeper" || currentRole === "Staff") {
      alert("Permission Denied: Kitchen Staff and Storekeepers cannot write recurring schedules.");
      return;
    }

    onAddSchedule({
      id: `recur-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category,
      frequency,
      startDate,
      endDate: endDate || undefined,
      lastGeneratedDate: undefined, // Fresh, has not run yet or starts running on trigger
      supplier,
      paymentMethod,
      status: "Active",
      notes,
      createdAt: new Date().toISOString(),
    });

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (currentRole !== "Owner" && currentRole !== "Manager") {
      alert("Permission Denied: Only Owners or Managers can remove templates.");
      return;
    }
    if (window.confirm("Are you sure you want to stop and delete this recurring expense schedule?")) {
      onDeleteSchedule(id);
    }
  };

  return (
    <div className="space-y-6 text-[#e0e0e2]">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2a2a2d] pb-4">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase font-serif">
            Recurring <span className="text-gold-accent italic font-semibold">Expenses & Subscriptions</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            Automate monthly leasing, utilities, Wi-Fi contracts, and routine supplier agreements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            id="btn-auto-evaluate-recur"
            type="button"
            onClick={onTriggerAutoGeneration}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-[#1a1a1c] hover:bg-[#222224] text-neutral-200 border border-[#c5a059]/40 text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer transition-all"
            title="Scan database and generate uncreated recurrence records"
          >
            <Activity className="h-4 w-4 text-[#c5a059]" /> Verify Due Schedules
          </button>
          
          {currentRole !== "Store Keeper" && currentRole !== "Staff" && (
            <button
              id="btn-add-recur-trigger"
              type="button"
              onClick={openForm}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1 bg-[#c5a059] hover:bg-[#b08e4d] text-dark-bg text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" /> Setup Schedule
            </button>
          )}
        </div>
      </div>

      {/* System info bar on generation */}
      {generatedCountSinceBoot > 0 && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-pulse">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Trigger Completed:</strong> Automatically generated and appended <strong>{generatedCountSinceBoot}</strong> purchase ledger transactions from active subscription contracts on target date: <strong>{currentDateStr}</strong>!
          </span>
        </div>
      )}

      {/* Master List Grid */}
      <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-[#1a1a1c] border-b border-[#2a2a2d] font-semibold text-neutral-300 text-xs tracking-wider uppercase flex items-center justify-between">
          <span>Active Subscriptions & Routine Schedules ({schedules.length})</span>
          <span className="text-[10px] text-[#c5a059] font-mono lowercase">system anchor: {currentDateStr}</span>
        </div>

        {schedules.length === 0 ? (
          <div className="p-12 text-center bg-[#121214]">
            <Calendar className="h-10 w-10 text-[#c5a059] mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-light text-neutral-300">No active repeating expense designs</p>
            <p className="text-xs text-neutral-500 mt-1">Configure automated items such as broadband bills or grease-trap services.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1a1a1c] border-b border-[#2a2a2d] text-neutral-400 font-semibold uppercase tracking-widest text-[10px]">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Detail Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Frequency</th>
                  <th className="px-4 py-3">Date Boundaries</th>
                  <th className="px-4 py-3">Vendor / Supplier</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2d] font-light text-neutral-300">
                {schedules.map((schedule) => {
                  const isActive = schedule.status === "Active";
                  return (
                    <tr key={schedule.id} className="hover:bg-[#1a1a1c]/40 font-mono">
                      
                      {/* Active Toggle Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          id={`toggle-recur-${schedule.id}`}
                          type="button"
                          onClick={() => onToggleScheduleStatus(schedule.id)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isActive
                              ? "bg-emerald-950 border border-emerald-500/25 text-emerald-400"
                              : "bg-amber-950 border border-amber-500/25 text-amber-500"
                          }`}
                          title={isActive ? "Pause automated billing" : "Resume automated billing"}
                        >
                          {isActive ? (
                            <>
                              <Play className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <Pause className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Paused
                            </>
                          )}
                        </button>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 font-sans font-normal text-neutral-200">
                        <span className="block truncate max-w-[200px]" title={schedule.description}>
                          {schedule.description}
                        </span>
                        {schedule.notes && (
                          <span className="block text-[10px] text-neutral-500 font-light truncate max-w-[200px] mt-0.5">
                            Memo: {schedule.notes}
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-3">
                        <span className="bg-[#1a1a1c] text-neutral-300 border border-[#2a2a2d] px-2 py-0.5 rounded text-[10px]">
                          {schedule.category}
                        </span>
                      </td>

                      {/* Frequency */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="font-bold text-[#c5a059] tracking-wide text-xs">
                          {schedule.frequency}
                        </span>
                      </td>

                      {/* Date bounds */}
                      <td className="px-4 py-3 text-neutral-400 text-[10px] leading-tight">
                        <div className="flex flex-col">
                          <span>Starts: {schedule.startDate}</span>
                          <span>Ends: {schedule.endDate || "Indefinite"}</span>
                          {schedule.lastGeneratedDate && (
                            <span className="text-[9px] text-[#c5a059] mt-0.5">Run: {schedule.lastGeneratedDate.split("T")[0]}</span>
                          )}
                        </div>
                      </td>

                      {/* Purveyor */}
                      <td className="px-4 py-3 text-neutral-200 truncate max-w-[150px]">
                        {schedule.supplier}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right font-bold text-[#c5a059] whitespace-nowrap text-xs">
                        ${schedule.amount.toFixed(2)}
                      </td>

                      {/* Trash action */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          id={`del-recur-schedule-${schedule.id}`}
                          type="button"
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1 rounded bg-[#1a1a1c] border border-red-950 text-neutral-400 hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
                          title="Remove recurring schedule"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recurrence Setup Form Dialog Overlay */}
      {isFormOpen && (
        <div id="recur-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121214] rounded-xl shadow-xl w-full max-w-lg border border-[#2a2a2d] overflow-hidden text-[#e0e0e2]">
            <div className="flex justify-between items-center bg-[#1a1a1c] border-b border-[#2a2a2d] p-4">
              <h3 className="font-serif text-[#e0e0e2] text-md font-semibold tracking-wide uppercase flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-[#c5a059]" /> Establish Repeating Ledger Rule
              </h3>
              <button
                id="close-recur-modal"
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Subscription Memo / Description <span className="text-[#c5a059]">*</span>
                </label>
                <input
                  id="recur-form-desc"
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Broadband Business Fiber Lease"
                  className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059]"
                />
              </div>

              {/* Amount & Frequency */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Monthly Bill Amount ($) <span className="text-[#c5a059]">*</span>
                  </label>
                  <input
                    id="recur-form-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Recurrence Interval
                  </label>
                  <select
                    id="recur-form-freq"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    <option value="Daily" className="bg-[#121214]">Every Single Day</option>
                    <option value="Weekly" className="bg-[#121214]">Weekly Billing</option>
                    <option value="Monthly" className="bg-[#121214]">Monthly Reoccurrence</option>
                    <option value="Yearly" className="bg-[#121214]">Annual Bill / Taxes</option>
                  </select>
                </div>
              </div>

              {/* Start & End boundary date fields */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Initial Start Date <span className="text-[#c5a059]">*</span>
                  </label>
                  <input
                    id="recur-form-start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Optional End boundary
                  </label>
                  <input
                    id="recur-form-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-[#e0e0e2]"
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Ledger Category
                  </label>
                  <select
                    id="recur-form-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#121214]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Default Settlement Method
                  </label>
                  <select
                    id="recur-form-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    {METHODS.map((met) => (
                      <option key={met} value={met} className="bg-[#121214]">
                        {met}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Supplier / Purveyor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Linked Purveyor / Supplier <span className="text-[#c5a059]">*</span>
                  </label>
                  <input
                    id="recur-form-supplier"
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Port Side Seafoods Inc."
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    System Notes / Memo
                  </label>
                  <input
                    id="recur-form-notes"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Billing reference number..."
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2d]">
                <button
                  id="btn-cancel-recur"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-350 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-recur"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg cursor-pointer"
                >
                  Save repeating ledger rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
