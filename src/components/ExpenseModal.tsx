import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Info, Calendar, DollarSign, Tag } from "lucide-react";
import { Expense, ExpenseCategory, PaymentMethod, ExpenseItem } from "../types";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
  expenseToEdit?: Expense | null;
  scannedData?: Partial<Expense> & { items?: any[] } | null;
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
  "Other",
];

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Bank", "Mobile Money"];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  scannedData,
}) => {
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Inventory Purchase");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ExpenseItem[]>([]);

  // Local states for item lines
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  // Load state when editing or scan completes
  useEffect(() => {
    if (expenseToEdit) {
      setExpenseDate(expenseToEdit.expenseDate);
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount);
      setPaymentMethod(expenseToEdit.paymentMethod);
      setSupplier(expenseToEdit.supplier);
      setNotes(expenseToEdit.notes || "");
      setItems(expenseToEdit.items || []);
    } else if (scannedData) {
      setExpenseDate(scannedData.expenseDate || new Date().toISOString().split("T")[0]);
      setCategory(scannedData.category || "Inventory Purchase");
      setDescription(scannedData.description || "");
      setAmount(scannedData.amount || 0);
      setPaymentMethod(scannedData.paymentMethod || "Cash");
      setSupplier(scannedData.supplier || "");
      setNotes(scannedData.notes || "");
      
      if (scannedData.items && scannedData.items.length > 0) {
        const itemLines: ExpenseItem[] = scannedData.items.map((it: any, index: number) => ({
          id: `scan-${index}-${Date.now()}`,
          itemName: it.itemName || "",
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          totalCost: Number(it.totalCost) || (Number(it.quantity || 1) * Number(it.unitPrice || 0))
        }));
        setItems(itemLines);
      } else {
        setItems([]);
      }
    } else {
      // Create defaults
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setCategory("Inventory Purchase");
      setDescription("");
      setAmount(0);
      setPaymentMethod("Cash");
      setSupplier("");
      setNotes("");
      setItems([]);
    }
  }, [expenseToEdit, scannedData, isOpen]);

  // Handle automatic amount update if items exist
  useEffect(() => {
    if (items.length > 0) {
      const computedTotal = items.reduce((sum, item) => sum + item.totalCost, 0);
      setAmount(Number(computedTotal.toFixed(2)));
    }
  }, [items]);

  if (!isOpen) return null;

  // Add sub-item to list
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const finalPrice = Number(newItemPrice) || 0;
    const finalQty = Number(newItemQty) || 1;
    const lineCost = Number((finalPrice * finalQty).toFixed(2));

    const itemObj: ExpenseItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itemName: newItemName,
      quantity: finalQty,
      unitPrice: finalPrice,
      totalCost: lineCost,
    };

    setItems([...items, itemObj]);
    setNewItemName("");
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  // Remove sub-item
  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Submit complete form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDate || !description.trim() || amount <= 0 || !supplier.trim()) {
      alert("Please fill in all required fields (Supplier, Date, Description, & Amount > 0).");
      return;
    }

    onSave({
      expenseDate,
      category,
      description,
      amount,
      paymentMethod,
      supplier,
      notes: notes.trim() ? notes : undefined,
      items: items.length > 0 ? items : undefined,
      createdBy: expenseToEdit?.createdBy || "Owner",
    });
  };

  return (
    <div id="expense-modal-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        id="expense-modal-content"
        className="bg-[#121214] rounded-xl shadow-xl w-full max-w-3xl overflow-hidden border border-[#2a2a2d] my-8 max-h-[90vh] flex flex-col text-[#e0e0e2]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a2d] bg-[#1a1a1c] p-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#c5a059]" />
            <h3 className="font-light text-neutral-200 text-base tracking-wide uppercase font-serif">
              {expenseToEdit ? "Edit ERP " : "Create "} <span className="text-[#c5a059] italic font-semibold">Expense Record</span>
            </h3>
          </div>
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Main ERP Card Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Vendor / Supplier */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Supplier / Vendor <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <input
                id="form-supplier"
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g. Fresh Garden Products Inc."
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-550 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Purchase Date <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="form-date"
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg pl-9 pr-3 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
                />
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Finance Category <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <select
                id="form-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#121214] text-neutral-250">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Payment Method <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <select
                id="form-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="bg-[#121214] text-neutral-250">
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Overall Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Description / Memo <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <input
                id="form-description"
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Bulk food stock delivery (Seafood, cod, tomatoes)"
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-550 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
              />
            </div>
          </div>

          {/* Simple Owner Version: Itemized Purchase Grid (List builder) */}
          <div className="border border-[#2a2a2d] rounded-xl p-4 bg-[#1a1a1c]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-[#c5a059]" />
                  Itemized Purchase Lines
                </h4>
                <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                  Optional. Define item rows below. The overall total amount validates as their cumulative sum automatically.
                </p>
              </div>
              <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                Owner Detail Grid
              </span>
            </div>

            {/* Sub-item inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-3 items-end">
              <div className="sm:col-span-5">
                <input
                  id="item-input-name"
                  type="text"
                  placeholder="Item details (e.g. Salmon cases, Chef apron)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs bg-[#121214] border border-[#2a2a2d] rounded-md px-2.5 py-1.5 focus:outline-hidden text-neutral-200"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  id="item-input-qty"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-xs bg-[#121214] border border-[#2a2a2d] rounded-md px-2.5 py-1.5 focus:outline-hidden text-neutral-200"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  id="item-input-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Unit Price $"
                  value={newItemPrice || ""}
                  onChange={(e) => setNewItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-xs bg-[#121214] border border-[#2a2a2d] rounded-md px-2.5 py-1.5 focus:outline-hidden text-neutral-200"
                />
              </div>
              <button
                id="item-add-row-btn"
                type="button"
                onClick={handleAddItem}
                className="sm:col-span-2 bg-[#c5a059] hover:bg-[#b08e4d] text-[#0a0a0b] font-semibold rounded-md py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
            </div>

            {/* List of items added */}
            {items.length === 0 ? (
              <div className="text-center py-5 border border-dashed border-[#2a2a2d] rounded-lg bg-[#121214]">
                <Info className="h-4 w-4 text-neutral-500 mx-auto mb-1" />
                <p className="text-[10px] text-neutral-500 font-light">No individual line items added yet. Click Add Row to log itemized invoices.</p>
              </div>
            ) : (
              <div className="border border-[#2a2a2d] rounded-lg overflow-hidden bg-[#121214] max-h-[140px] overflow-y-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1a1a1c] border-b border-[#2a2a2d] text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
                      <th className="px-3 py-2">Item Name</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total Line</th>
                      <th className="px-3 py-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2a2d] text-[11px] text-neutral-300">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1a1a1c]/45">
                        <td className="px-3 py-2 font-medium text-neutral-200">{item.itemName}</td>
                        <td className="px-3 py-2 text-center text-neutral-400 font-mono">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-neutral-400 font-mono">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right font-bold text-[#c5a059] font-mono">${item.totalCost.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            id={`remove-subitem-${item.id}`}
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-neutral-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#2a2a2d] pt-4">
            
            {/* Amount */}
            <div className="md:col-span-1">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Overall Total ($) <span className="text-[#c5a059] ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="form-amount"
                  type="number"
                  step="0.01"
                  required
                  disabled={items.length > 0}
                  value={amount || ""}
                  onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className={`w-full text-sm bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg pl-9 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059] text-neutral-200 font-medium ${
                    items.length > 0 ? "text-neutral-500 bg-[#121214] border-dashed" : ""
                  }`}
                />
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              </div>
              {items.length > 0 && (
                <span className="text-[9px] text-[#c5a059] block mt-1 font-semibold">
                  Locked: synced to itemized grid lines
                </span>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                Review Notes & Remarks
              </label>
              <input
                id="form-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Receipt verified. Standard corporate rate applied."
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-550 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
              />
            </div>
          </div>
        </form>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-[#1a1a1c] border-t border-[#2a2a2d]">
          <button
            id="cancel-modal-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-300 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="submit-modal-btn"
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-bold text-[#0a0a0b] bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg shadow-sm transition-all focus:ring-1 focus:ring-[#c5a059] cursor-pointer"
          >
            {expenseToEdit ? "Save Changes" : "Record Expense ($)"}
          </button>
        </div>
      </div>
    </div>
  );
};
