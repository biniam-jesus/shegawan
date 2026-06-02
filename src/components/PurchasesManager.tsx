import React, { useState } from "react";
import { 
  Plus, Edit2, Trash2, Search, Filter, Calendar, FileText, CheckCircle, 
  AlertTriangle, Truck, CreditCard, Layers, ArrowRight, CornerDownRight, 
  Send, DollarSign, X, Printer, FileSpreadsheet, Key, ChevronUp, ChevronDown
} from "lucide-react";
import { 
  PurchaseOrder, POItem, GRNEntry, Supplier, UserRole, 
  PurchaseOrderStatus, PurchaseOrderPaidStatus, ExpenseCategory
} from "../types";

interface PurchasesManagerProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  currentRole: UserRole;
  currentDateStr: string;
  onAddPO: (po: PurchaseOrder) => void;
  onEditPO: (po: PurchaseOrder) => void;
  onDeletePO: (id: string) => void;
  onInventoryUpdate: (itemName: string, quantity: number) => void;
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

export const PurchasesManager: React.FC<PurchasesManagerProps> = ({
  purchaseOrders,
  suppliers,
  currentRole,
  currentDateStr,
  onAddPO,
  onEditPO,
  onDeletePO,
  onInventoryUpdate,
}) => {
  // Advanced filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("All");
  const [filterStatus, setFilterStatus] = useState<"All" | PurchaseOrderStatus>("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal and expanding state
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [isGRNModalOpen, setIsGRNModalOpen] = useState(false);
  const [activeGRNPO, setActiveGRNPO] = useState<PurchaseOrder | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentPO, setActivePaymentPO] = useState<PurchaseOrder | null>(null);

  const [expandedPoIds, setExpandedPoIds] = useState<Record<string, boolean>>({});

  // Creating / Editing PO form states
  const [poSupplierId, setPoSupplierId] = useState("");
  const [poCategory, setPoCategory] = useState<ExpenseCategory>("Inventory Purchase");
  const [poNotes, setPoNotes] = useState("");
  const [poPaymentTerms, setPoPaymentTerms] = useState("Net 30");
  const [poItems, setPoItems] = useState<Omit<POItem, "receivedQuantity">[]>([
    { id: "item-1", itemName: "Fresh Atlantic Salmon (lbs)", quantity: 100, unitPrice: 11.50, totalPrice: 1150.00 }
  ]);

  // GRN dialog states (Receiving quantities)
  const [grnReceivedQtys, setGrnReceivedQtys] = useState<Record<string, number>>({});
  const [grnNotes, setGrnNotes] = useState("");

  // Payment dialog states
  const [payAmount, setPayAmount] = useState("");

  // Handler to open PO creations
  const openNewPOModal = () => {
    if (currentRole === "Store Keeper" || currentRole === "Accountant" || currentRole === "Staff") {
      alert(`Permission Denied: Your current role is "${currentRole}". Creating Purchase Orders requires Owner or Manager privileges.`);
      return;
    }
    setEditingPO(null);
    if (suppliers.length > 0) {
      setPoSupplierId(suppliers[0].id);
      setPoPaymentTerms(suppliers[0].paymentTerms);
    } else {
      setPoSupplierId("");
      setPoPaymentTerms("Net 30");
    }
    setPoCategory("Inventory Purchase");
    setPoNotes("");
    setPoItems([{ id: `item-${Date.now()}`, itemName: "", quantity: 1, unitPrice: 0.00, totalPrice: 0.00 }]);
    setIsPOModalOpen(true);
  };

  // Handler to open editing
  const openEditPOModal = (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Store Keeper" || currentRole === "Accountant" || currentRole === "Staff") {
      alert(`Permission Denied: Editing Purchase Orders requires Owner or Manager privileges.`);
      return;
    }
    setEditingPO(po);
    setPoSupplierId(po.supplierId);
    setPoCategory(po.category);
    setPoNotes(po.notes || "");
    setPoPaymentTerms(po.paymentTerms);
    setPoItems(po.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    })));
    setIsPOModalOpen(true);
  };

  // Handle PO Item inputs
  const handleItemChange = (index: number, field: keyof Omit<POItem, "id" | "receivedQuantity">, value: any) => {
    const updated = [...poItems];
    if (field === "itemName") {
      updated[index].itemName = value;
    } else if (field === "quantity") {
      const q = Math.max(1, parseInt(value) || 0);
      updated[index].quantity = q;
      updated[index].totalPrice = q * updated[index].unitPrice;
    } else if (field === "unitPrice") {
      const p = Math.max(0, parseFloat(value) || 0);
      updated[index].unitPrice = p;
      updated[index].totalPrice = updated[index].quantity * p;
    }
    setPoItems(updated);
  };

  const addPOItemRow = () => {
    setPoItems([...poItems, { id: `item-${Date.now()}-${poItems.length}`, itemName: "", quantity: 1, unitPrice: 0.00, totalPrice: 0.00 }]);
  };

  const removePOItemRow = (index: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // Save PO
  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      alert("Please select a registered vendor/supplier.");
      return;
    }
    
    const selectedSupplier = suppliers.find(s => s.id === poSupplierId);
    if (!selectedSupplier) return;

    if (poItems.some(it => !it.itemName.trim())) {
      alert("All item table lines must have a valid item description name.");
      return;
    }

    const compiledItems: POItem[] = poItems.map(it => ({
      id: it.id,
      itemName: it.itemName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
      receivedQuantity: editingPO ? (editingPO.items.find(e => e.id === it.id)?.receivedQuantity || 0) : 0
    }));

    const computedTotal = compiledItems.reduce((acc, it) => acc + it.totalPrice, 0);

    if (editingPO) {
      // Modify
      onEditPO({
        ...editingPO,
        supplierId: poSupplierId,
        supplierName: selectedSupplier.name,
        category: poCategory,
        totalAmount: computedTotal,
        paymentTerms: poPaymentTerms,
        notes: poNotes,
        items: compiledItems,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create PO
      const count = purchaseOrders.length + 1;
      const poNum = `PO-${currentDateStr.replace(/-/g, "")}-${String(count).padStart(3, "0")}`;
      onAddPO({
        id: `po-${Date.now()}`,
        poNumber: poNum,
        purchaseDate: currentDateStr,
        supplierId: poSupplierId,
        supplierName: selectedSupplier.name,
        category: poCategory,
        totalAmount: computedTotal,
        status: "Pending", // Draft default
        paidStatus: "Unpaid",
        paidAmount: 0,
        paymentTerms: poPaymentTerms,
        notes: poNotes,
        createdBy: currentRole,
        items: compiledItems,
        grns: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    setIsPOModalOpen(false);
  };

  // Status flow conversions
  const handleApprovePO = (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Store Keeper" || currentRole === "Accountant" || currentRole === "Staff") {
      alert(`Permission Denied: Approving POs requires Owner or Manager credentials.`);
      return;
    }
    if (window.confirm(`Approve Purchase Order "${po.poNumber}" and transmit order slip to ${po.supplierName}?`)) {
      onEditPO({
        ...po,
        status: "Approved",
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleCancelPO = (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Store Keeper" || currentRole === "Accountant" || currentRole === "Staff") {
      alert(`Permission Denied: Only Owners/Managers can cancel orders.`);
      return;
    }
    if (window.confirm(`Cancel Purchase Order "${po.poNumber}"? This locks the workflow.`)) {
      onEditPO({
        ...po,
        status: "Cancelled",
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleDeletePO = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole !== "Owner" && currentRole !== "Manager") {
      alert(`Permission Denied: Deleting Purchase records is prohibited for ${currentRole} credentials.`);
      return;
    }
    if (window.confirm("Are you sure you want to permanently delete this Purchase Order from the ERP database? This action is irreversible.")) {
      onDeletePO(id);
    }
  };

  // Open Receiving/GRN modal
  const openGRNModal = (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Accountant" || currentRole === "Staff") {
      alert("Permission Denied: Storekeepers, Managers and Owners handle goods delivery entries (GRN) only.");
      return;
    }
    if (po.status !== "Approved") {
      alert(`Cannot issue GRN: Purchase Order must be "Approved" before receiving deliveries. Currently it is ${po.status}.`);
      return;
    }

    setActiveGRNPO(po);
    const initialReceivedVals: Record<string, number> = {};
    po.items.forEach(item => {
      // Default to remaining requested quantity
      const rem = item.quantity - item.receivedQuantity;
      initialReceivedVals[item.id] = Math.max(0, rem);
    });
    setGrnReceivedQtys(initialReceivedVals);
    setGrnNotes("");
    setIsGRNModalOpen(true);
  };

  // Record delivery (GRN) and update stockpile quantities!
  const handleSubmitGRN = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGRNPO) return;

    const newGrnItems: { itemId: string; itemName: string; receivedQtyNow: number }[] = [];
    const updatedPOItems = activeGRNPO.items.map(item => {
      const inputVal = grnReceivedQtys[item.id] || 0;
      const additionalQty = Math.max(0, inputVal);
      
      if (additionalQty > 0) {
        newGrnItems.push({
          itemId: item.id,
          itemName: item.itemName,
          receivedQtyNow: additionalQty
        });
        // Trigger automated stockpile update simulation inside our ERP environment!
        onInventoryUpdate(item.itemName, additionalQty);
      }

      return {
        ...item,
        receivedQuantity: item.receivedQuantity + additionalQty
      };
    });

    if (newGrnItems.length === 0) {
      alert("Please enter at least one item quantity to receive.");
      return;
    }

    // Determine status
    const allReceived = updatedPOItems.every(it => it.receivedQuantity >= it.quantity);
    const status: PurchaseOrderStatus = allReceived ? "Received" : "Approved"; // Keep approved but partially filled

    const newGrnEntry: GRNEntry = {
      id: `grn-${Date.now()}`,
      date: currentDateStr,
      receivedBy: currentRole,
      notes: grnNotes || "Delivered to restaurant loading dock.",
      itemsReceived: newGrnItems
    };

    onEditPO({
      ...activeGRNPO,
      status,
      items: updatedPOItems,
      grns: [...activeGRNPO.grns, newGrnEntry],
      updatedAt: new Date().toISOString()
    });

    setIsGRNModalOpen(false);
  };

  // Open Payment Tracking Modal
  const openPaymentModal = (po: PurchaseOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole === "Store Keeper" || currentRole === "Staff") {
      alert("Permission Denied: Logging payments requires Owner, Manager, or Accountant privileges.");
      return;
    }
    setActivePaymentPO(po);
    const bal = po.totalAmount - po.paidAmount;
    setPayAmount(bal.toFixed(2));
    setIsPaymentModalOpen(true);
  };

  // Submit payment adjustment
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentPO) return;

    const amt = parseFloat(payAmount) || 0;
    if (amt <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const maxDelta = activePaymentPO.totalAmount - activePaymentPO.paidAmount;
    if (amt > maxDelta + 0.01) {
      alert(`Paid amount exceedances: Supplier outstanding balance is $${maxDelta.toFixed(2)}.`);
      return;
    }

    const newPaidAmt = activePaymentPO.paidAmount + amt;
    let paidStatus: PurchaseOrderPaidStatus = "Partial";
    if (newPaidAmt >= activePaymentPO.totalAmount - 0.02) {
      paidStatus = "Paid";
    }

    onEditPO({
      ...activePaymentPO,
      paidAmount: Number(newPaidAmt.toFixed(2)),
      paidStatus,
      updatedAt: new Date().toISOString()
    });

    setIsPaymentModalOpen(false);
  };

  // Toggle row details view
  const togglePoExpansion = (id: string) => {
    setExpandedPoIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Multi-criteria filters
  const filteredPOs = purchaseOrders.filter(po => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const numMatch = po.poNumber.toLowerCase().includes(q);
      const supMatch = po.supplierName.toLowerCase().includes(q);
      const noteMatch = po.notes?.toLowerCase().includes(q) || false;
      const itMatch = po.items.some(i => i.itemName.toLowerCase().includes(q));
      if (!numMatch && !supMatch && !noteMatch && !itMatch) return false;
    }

    if (filterSupplier !== "All" && po.supplierId !== filterSupplier) return false;

    if (filterStatus !== "All" && po.status !== filterStatus) return false;

    if (startDate && po.purchaseDate < startDate) return false;
    if (endDate && po.purchaseDate > endDate) return false;

    return true;
  });

  // Calculate aggregates
  const totalSpendThisMonth = purchaseOrders
    .filter(p => p.purchaseDate.startsWith("2026-06") || p.purchaseDate.startsWith("2026-05"))
    .reduce((acc, p) => acc + p.totalAmount, 0);

  const pendingCount = purchaseOrders.filter(p => p.status === "Pending").length;
  const receivedCount = purchaseOrders.filter(p => p.status === "Received").length;
  const approvedCount = purchaseOrders.filter(p => p.status === "Approved").length;

  const totalOwedAmount = purchaseOrders
    .filter(p => p.paidStatus !== "Paid" && p.status !== "Cancelled")
    .reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);

  // Generate CSV rows
  const handleExportCSV = () => {
    const headers = ["PO Number", "Purchase Date", "Supplier", "Category", "Amount ($)", "Status", "Payment Status", "Items Tally"];
    const rows = filteredPOs.map(po => {
      const lines = po.items.map(it => `${it.itemName} (${it.quantity}x$${it.unitPrice})`).join(" | ");
      return [
        po.poNumber,
        po.purchaseDate,
        `"${po.supplierName.replace(/"/g, '""')}"`,
        po.category,
        po.totalAmount.toFixed(2),
        po.status,
        po.paidStatus,
        `"${lines.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Restaurant_PurchaseOrders_${currentDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-[#e0e0e2] print:text-black">
      
      {/* 4-Column Widgets Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        
        {/* Total Month PO Sum */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Purchasing volume</span>
            <span className="text-xl font-mono font-bold text-[#c5a059] block">
              ${totalSpendThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-400 font-light block">Active May & June billing flows</span>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#c5a059]/10 text-[#c5a059]">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        {/* Outstanding Supplier Bal */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Accounts payable</span>
            <span className="text-xl font-mono font-bold text-red-400 block">
              ${totalOwedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-400 font-light block">Outstanding supplier balance</span>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-950/20 text-red-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Total Pending / Approved Draft POs */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Pending & Transit orders</span>
            <span className="text-xl font-mono font-bold text-amber-500 block">
              {pendingCount + approvedCount} <span className="text-xs font-light text-neutral-500">active POs</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-light block">{pendingCount} hold, {approvedCount} transmitted</span>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-950/20 text-amber-500">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        {/* Goods Completed Delivery */}
        <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">GRN Full deliveries</span>
            <span className="text-xl font-mono font-bold text-emerald-400 block">
              {receivedCount} <span className="text-xs font-light text-neutral-500">received</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-light block">Warehouse ledger matching intact</span>
          </div>
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-950/20 text-emerald-400">
            <Truck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Action panel & filters */}
      <div className="flex flex-col md:flex-row gap-3 items-end md:items-center justify-between border-b border-[#2a2a2d] pb-4 print:hidden">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase font-serif">
            Purchase <span className="text-gold-accent italic font-semibold">Ledger & PO Flow</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            Log procurement orders, verify inbound Goods Received Notes (GRNs), and track payment maturities
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="po-btn-csv-ex"
            type="button"
            onClick={handleExportCSV}
            className="flex-1 md:flex-initial px-3 py-2 text-xs font-semibold text-neutral-350 bg-[#121214] border border-[#2a2a2d] hover:bg-[#1a1a1c] hover:border-[#c5a059]/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-[#c5a059]" /> Excel CSV
          </button>
          
          <button
            id="po-btn-pdf"
            type="button"
            onClick={handlePrintPDF}
            className="flex-1 md:flex-initial px-3 py-2 text-xs font-semibold text-neutral-350 bg-[#121214] border border-[#2a2a2d] hover:bg-[#1a1a1c] hover:border-[#c5a059]/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4 text-[#c5a059]" /> Print PDF
          </button>

          <button
            id="po-btn-add-po"
            type="button"
            onClick={openNewPOModal}
            className="flex-1 md:flex-initial bg-[#c5a059] hover:bg-[#b08e4d] text-dark-bg text-xs font-bold px-4 py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" /> Issue PO
          </button>
        </div>
      </div>

      {/* Multi Criteria Advanced Filter Box */}
      <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl space-y-3 print:hidden">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Ledger filter settings</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Keyword Query */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Search Keywords</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-neutral-500">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                id="po-filter-search"
                type="text"
                placeholder="PO#, items, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg pl-8 pr-3 py-2 text-neutral-200 outline-hidden"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Supplier / Vendor</label>
            <select
              id="po-filter-supplier"
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2 py-2 text-neutral-200"
            >
              <option value="All">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">PO Status</label>
            <select
              id="po-filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2 py-2 text-neutral-200"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Approval</option>
              <option value="Approved">Approved (In Transit)</option>
              <option value="Received">Received (Completed)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Dates From</label>
            <input
              id="po-filter-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-1.5 text-neutral-200"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] uppercase text-neutral-500 mb-1">Dates To</label>
            <input
              id="po-filter-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-2.5 py-1.5 text-neutral-200"
            />
          </div>
        </div>

        {/* Clear Triggers */}
        {(searchQuery || filterSupplier !== "All" || filterStatus !== "All" || startDate || endDate) && (
          <div className="flex justify-end pt-1">
            <button
              id="po-filter-clear-all"
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterSupplier("All");
                setFilterStatus("All");
                setStartDate("");
                setEndDate("");
              }}
              className="text-xs text-[#c5a059] hover:text-[#b08e4d] font-semibold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Primary Purchase Orders List */}
      <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1a1a1c] border-b border-[#2a2a2d] text-neutral-400 font-semibold uppercase tracking-widest text-[10px]">
                <th className="px-4 py-3.5 w-8"></th>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Supplier / Vendor</th>
                <th className="px-4 py-3.5">Payment Terms</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-4 py-3.5">Workflow Status</th>
                <th className="px-4 py-3.5">Settlement (Debt)</th>
                <th className="px-4 py-3.5 text-center">ERP Operations</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2a2a2d] font-mono text-neutral-300">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center bg-[#121214]">
                    <Layers className="h-10 w-10 text-[#c5a059] mx-auto mb-2 animate-pulse" />
                    <p className="text-sm font-light text-neutral-200">No Purchase orders meet criteria</p>
                    <p className="text-xs text-neutral-500 mt-1">Adjust date filters or create a new order using the portal actions.</p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const isExpanded = !!expandedPoIds[po.id];
                  const remainingToPay = po.totalAmount - po.paidAmount;

                  return (
                    <React.Fragment key={po.id}>
                      {/* Standard Row */}
                      <tr 
                        id={`po-row-${po.id}`}
                        onClick={() => togglePoExpansion(po.id)}
                        className="hover:bg-[#1a1a1c]/60 cursor-pointer text-xs leading-normal font-sans text-neutral-300 transition-colors"
                      >
                        {/* Caret */}
                        <td className="px-4 py-3 text-center">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-neutral-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-neutral-500" />
                          )}
                        </td>

                        {/* PO Number */}
                        <td className="px-4 py-3 font-mono font-bold text-[#e0e0e2]">
                          {po.poNumber}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 font-mono text-neutral-400">
                          {po.purchaseDate}
                        </td>

                        {/* Supplier */}
                        <td className="px-4 py-3 font-semibold text-[#e0e0e2]">
                          {po.supplierName}
                        </td>

                        {/* Terms */}
                        <td className="px-4 py-3 font-mono text-neutral-400">
                          {po.paymentTerms}
                        </td>

                        {/* Total price */}
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#c5a059]">
                          ${po.totalAmount.toFixed(2)}
                        </td>

                        {/* Workflow Status badges */}
                        <td className="px-4 py-3 font-sans">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            po.status === "Received" ? "bg-emerald-950 border border-emerald-500/25 text-emerald-400" :
                            po.status === "Approved" ? "bg-sky-950 border border-sky-500/25 text-sky-400" :
                            po.status === "Cancelled" ? "bg-red-950 border border-red-500/25 text-red-400" :
                            "bg-amber-950 border border-amber-500/25 text-amber-500"
                          }`}>
                            {po.status === "Approved" ? "Approved / Sent" : po.status}
                          </span>
                        </td>

                        {/* Accounting status */}
                        <td className="px-4 py-3 font-sans">
                          {po.status === "Cancelled" ? (
                            <span className="text-neutral-500 text-[10px]">Cancelled</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className={`inline-block w-fit px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                po.paidStatus === "Paid" ? "bg-emerald-950 border border-emerald-500/15 text-emerald-300" :
                                po.paidStatus === "Partial" ? "bg-sky-950 border border-sky-500/15 text-sky-300" :
                                "bg-red-950 border border-red-500/15 text-red-300"
                              }`}>
                                {po.paidStatus}
                              </span>
                              {remainingToPay > 0 && (
                                <span className="text-[10px] font-mono text-neutral-400 font-light mt-0.5">
                                  Owed: ${remainingToPay.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* ERP Controls */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            
                            {/* Send / Approve Flow */}
                            {po.status === "Pending" && (
                              <button
                                id={`approve-po-b-${po.id}`}
                                onClick={(e) => handleApprovePO(po, e)}
                                className="px-2 py-1 bg-sky-950 text-sky-400 hover:bg-sky-900 border border-sky-500/20 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors"
                                title="Approve PO & dispatch to vendor email system"
                              >
                                <Send className="h-3 w-3 inline mr-1" /> Approve
                              </button>
                            )}

                            {/* GRN delivery receipt trigger */}
                            {po.status === "Approved" && (
                              <button
                                id={`grn-po-b-${po.id}`}
                                onClick={(e) => openGRNModal(po, e)}
                                className="px-2 py-1 bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/20 text-[10px] font-bold uppercase rounded cursor-pointer transition-colors"
                                title="Verify warehouse delivery (GRN / Partial receipt)"
                              >
                                <Truck className="h-3 w-3 inline mr-1" /> Receive GRN
                              </button>
                            )}

                            {/* Edit & Cancel buttons for owners/managers */}
                            {(currentRole === "Owner" || currentRole === "Manager") && po.status !== "Cancelled" && po.status !== "Received" && (
                              <button
                                id={`edit-po-b-${po.id}`}
                                onClick={(e) => openEditPOModal(po, e)}
                                className="p-1 rounded bg-[#1a1a1c] border border-[#2a2a2d] text-neutral-400 hover:text-[#c5a059] cursor-pointer"
                                title="Edit Purchase Items"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Payment Adjustment */}
                            {po.status !== "Cancelled" && po.paidStatus !== "Paid" && (
                              <button
                                id={`pay-po-b-${po.id}`}
                                onClick={(e) => openPaymentModal(po, e)}
                                className="px-2 py-1 bg-[#1a1a1c] hover:bg-[#222224] text-neutral-300 border border-[#2a2a2d] text-[10px] uppercase font-semibold rounded cursor-pointer"
                                title="Record payment remittance"
                              >
                                <DollarSign className="h-3 w-3 inline mr-0.5 text-[#c5a059]" /> Pay
                              </button>
                            )}

                            {/* Trash delete (Owner only) */}
                            {currentRole === "Owner" && (
                              <button
                                id={`del-po-b-${po.id}`}
                                onClick={(e) => handleDeletePO(po.id, e)}
                                className="p-1 rounded bg-[#1a1a1c] border border-red-950 text-neutral-400 hover:text-red-400 cursor-pointer"
                                title="Delete Order Core"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanding Sub-Itemized Section & Step-by-Step Purchase Flow */}
                      {isExpanded && (
                        <tr className="bg-[#1a1a1c]/25">
                          <td colSpan={9} className="px-5 py-4 border-t border-[#2a2a2d]">
                            <div className="space-y-4 max-w-5xl">
                              
                              {/* Step-by-Step purchase flow graphical display */}
                              <div className="bg-[#121214] p-3 rounded-lg border border-[#2a2a2d] space-y-2">
                                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block font-sans">
                                  Step-by-step transaction track-stage
                                </span>
                                
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 font-sans">
                                  
                                  {/* Step 1: Draft */}
                                  <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
                                    po.status === "Pending" 
                                      ? "bg-amber-950/40 border-amber-500/35 text-amber-300"
                                      : "bg-[#1a1a1c] border-[#222224] text-neutral-400"
                                  }`}>
                                    <span className="h-5 w-5 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center">1</span>
                                    <div>
                                      <p className="font-bold">Draft Pending</p>
                                      <p className="text-[9px] text-neutral-500 leading-tight">PO registered, awaiting manager authorization</p>
                                    </div>
                                  </div>

                                  {/* Step 2: Sent */}
                                  <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
                                    po.status === "Approved"
                                      ? "bg-sky-950/40 border-sky-500/35 text-sky-300"
                                      : po.status === "Received"
                                      ? "bg-neutral-900 border-[#222224] text-neutral-400 line-through"
                                      : "bg-[#1a1a1c] border-[#222224] text-neutral-400"
                                  }`}>
                                    <span className="h-5 w-5 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center">2</span>
                                    <div>
                                      <p className="font-bold">Authorized (Transit)</p>
                                      <p className="text-[9px] text-neutral-500 leading-tight">Dispatched to vendor shipping channels</p>
                                    </div>
                                  </div>

                                  {/* Step 3: GRN Inbound */}
                                  <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
                                    po.status === "Received"
                                      ? "bg-emerald-950/40 border-emerald-500/35 text-emerald-300"
                                      : po.items.some(i => i.receivedQuantity > 0)
                                      ? "bg-sky-950/40 border-sky-500/35 text-sky-400"
                                      : "bg-[#1a1a1c] border-[#222224] text-neutral-400"
                                  }`}>
                                    <span className="h-5 w-5 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center">3</span>
                                    <div>
                                      <p className="font-bold">GRN Inbound Delivery</p>
                                      <p className="text-[9px] text-neutral-500 leading-tight">
                                        {po.items.some(i => i.receivedQuantity > 0) 
                                          ? `Partial receipt logged (${po.items.reduce((sum,it)=>sum+it.receivedQuantity,0)} units received)` 
                                          : "Log quantities received in loading dock"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Step 4: Accounting Settlement */}
                                  <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
                                    po.paidStatus === "Paid"
                                      ? "bg-emerald-950/40 border-emerald-500/35 text-emerald-300"
                                      : "bg-[#1a1a1c] border-[#222224] text-neutral-400"
                                  }`}>
                                    <span className="h-5 w-5 rounded-full bg-neutral-800 text-[10px] font-bold flex items-center justify-center">4</span>
                                    <div>
                                      <p className="font-bold">Invoice Settle</p>
                                      <p className="text-[9px] text-neutral-500 leading-tight">Paid amount tracks balance terms</p>
                                    </div>
                                  </div>

                                </div>
                              </div>

                              {/* Item columns breakdown */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2 bg-[#121214] p-4 rounded-xl border border-[#2a2a2d]">
                                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block font-sans">
                                    Itemized Supply Tallies
                                  </span>
                                  
                                  <table className="min-w-full text-left text-[11px] font-mono">
                                    <thead>
                                      <tr className="border-b border-[#222224] text-neutral-500 uppercase font-bold text-[9px]">
                                        <th className="py-1">Material Name</th>
                                        <th className="py-1 text-center">Ordered</th>
                                        <th className="py-1 text-center">GRN Received</th>
                                        <th className="py-1 text-right">Unit cost</th>
                                        <th className="py-1 text-right">Line Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#222224]/50 text-neutral-300">
                                      {po.items.map(it => {
                                        const pendingRem = it.quantity - it.receivedQuantity;
                                        return (
                                          <tr key={it.id}>
                                            <td className="py-2 font-sans font-medium text-neutral-200">{it.itemName}</td>
                                            <td className="py-2 text-center text-neutral-400 font-bold">{it.quantity}</td>
                                            <td className="py-2 text-center">
                                              <span className={`px-1.5 py-0.5 rounded font-bold ${
                                                it.receivedQuantity >= it.quantity 
                                                  ? "bg-emerald-950 text-emerald-400" 
                                                  : it.receivedQuantity > 0 
                                                  ? "bg-sky-950 text-sky-400" 
                                                  : "bg-neutral-900 text-neutral-550"
                                              }`}>
                                                {it.receivedQuantity} / {it.quantity}
                                              </span>
                                            </td>
                                            <td className="py-2 text-right text-neutral-400">${it.unitPrice.toFixed(2)}</td>
                                            <td className="py-2 text-right text-[#c5a059] font-bold">${it.totalPrice.toFixed(2)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Goods received history notes */}
                                <div className="space-y-2 bg-[#121214] p-4 rounded-xl border border-[#2a2a2d] text-xs">
                                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block font-sans">
                                    Goods Received History (GRN Logs)
                                  </span>
                                  {po.grns.length === 0 ? (
                                    <p className="text-neutral-500 italic text-center font-light py-8">
                                      No GRN entries logged. Outstanding deliveries represent 100% of volume.
                                    </p>
                                  ) : (
                                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                                      {po.grns.map((grn) => (
                                        <div key={grn.id} className="p-2.5 bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg space-y-1">
                                          <div className="flex items-center justify-between font-mono text-[10px] text-[#c5a059]">
                                            <span className="font-bold flex items-center gap-1">
                                              <Truck className="h-3 w-3" /> Delivery confirmed
                                            </span>
                                            <span>{grn.date}</span>
                                          </div>
                                          <p className="text-[10.5px] font-sans text-neutral-300 font-light italic">
                                            "{grn.notes}"
                                          </p>
                                          
                                          {/* Inbound totals tags */}
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {grn.itemsReceived.map((item, idx) => (
                                              <span key={idx} className="bg-neutral-800 border border-neutral-700 text-neutral-400 px-1.5 py-0.5 rounded text-[9px] font-mono">
                                                {item.itemName}: +{item.receivedQtyNow} units
                                              </span>
                                            ))}
                                          </div>
                                          <div className="text-[9px] text-neutral-550 pt-0.5 text-right font-mono font-bold">
                                            Verified by: {grn.receivedBy}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Memo display */}
                                  {po.notes && (
                                    <div className="bg-[#1a1a1c]/60 p-2 border border-[#2a2a2d] rounded-lg mt-3 text-[10.5px] font-light text-neutral-400">
                                      <strong className="text-neutral-400 font-semibold">Internal purchase note:</strong> {po.notes}
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PO DIALOG */}
      {isPOModalOpen && (
        <div id="po-form-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121214] rounded-xl shadow-xl w-full max-w-2xl border border-[#2a2a2d] overflow-hidden text-[#e0e0e2] max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center bg-[#1a1a1c] border-b border-[#2a2a2d] p-4 flex-shrink-0">
              <h3 className="font-serif text-[#e0e0e2] text-md font-semibold tracking-wide uppercase">
                {editingPO ? `Edit Purchase Order - ${editingPO.poNumber}` : "Draft Inbound Purchase Order (PO)"}
              </h3>
              <button
                id="close-po-modal"
                type="button"
                onClick={() => setIsPOModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Supplier selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Select Target Vendor <span className="text-[#c5a059]">*</span>
                  </label>
                  <select
                    id="po-form-supplier"
                    value={poSupplierId}
                    onChange={(e) => {
                      setPoSupplierId(e.target.value);
                      const currentS = suppliers.find(su => su.id === e.target.value);
                      if (currentS) {
                        setPoPaymentTerms(currentS.paymentTerms);
                      }
                    }}
                    required
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 outline-hidden focus:ring-1 focus:ring-[#c5a059]"
                  >
                    <option value="">-- Choose Purveyor --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#121214]">
                        {s.name} (Terms: {s.paymentTerms})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Order Payment Maturity Terms
                  </label>
                  <select
                    id="po-form-terms"
                    value={poPaymentTerms}
                    onChange={(e) => setPoPaymentTerms(e.target.value)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    <option value="Cash / COD" className="bg-[#121214]">Cash on Delivery (COD)</option>
                    <option value="Net 15" className="bg-[#121214]">Net 15 Days</option>
                    <option value="Net 30" className="bg-[#121214]">Net 30 Days</option>
                    <option value="Net 60" className="bg-[#121214]">Net 60 Days</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    ERP Ledger Category Tying
                  </label>
                  <select
                    id="po-form-cat"
                    value={poCategory}
                    onChange={(e) => setPoCategory(e.target.value as any)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#121214]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                    Order Memo notes
                  </label>
                  <input
                    id="po-form-notes"
                    type="text"
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="e.g. Weekly routine supply, verify seal packaging..."
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 outline-hidden"
                  />
                </div>
              </div>

              {/* Items Detail table */}
              <div className="space-y-2 border-t border-[#2a2a2d]/50 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Purchase Order Supply Lines
                  </span>
                  <button
                    id="po-form-add-row"
                    type="button"
                    onClick={addPOItemRow}
                    className="text-[11px] text-[#c5a059] hover:text-[#b08e4d] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Insert Row Line
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {poItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-center bg-[#1a1a1c]/50 p-2 rounded-lg border border-[#2a2a2d]/40">
                      
                      {/* Name input */}
                      <div className="flex-1">
                        <input
                          id={`po-item-name-${index}`}
                          type="text"
                          required
                          placeholder="Item description (e.g. Premium Tomatoes)"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
                          className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded px-2.5 py-1.5 text-neutral-200"
                        />
                      </div>

                      {/* Quantity input */}
                      <div className="w-18">
                        <input
                          id={`po-item-qty-${index}`}
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded px-2 py-1.5 text-center text-neutral-200"
                        />
                      </div>

                      {/* Unit Price input */}
                      <div className="w-24">
                        <input
                          id={`po-item-price-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Price"
                          required
                          value={item.unitPrice || ""}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded px-2 py-1.5 text-right font-mono text-neutral-200"
                        />
                      </div>

                      {/* Total cost calculated preview */}
                      <div className="w-24 text-right pr-1 font-mono text-xs font-semibold text-[#c5a059]">
                        ${item.totalPrice.toFixed(2)}
                      </div>

                      {/* Remove item line click */}
                      <button
                        id={`po-item-del-row-${index}`}
                        type="button"
                        onClick={() => removePOItemRow(index)}
                        disabled={poItems.length === 1}
                        className="p-1 rounded text-neutral-500 hover:text-red-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                      </button>

                    </div>
                  ))}
                </div>

                {/* Sub Total Aggregate panel */}
                <div className="flex justify-end pt-2 border-t border-[#2a2a2d]/40 font-mono text-xs">
                  <span className="text-neutral-400 mr-2 uppercase">Order aggregate total:</span>
                  <span className="font-bold text-[#c5a059] text-sm">
                    ${poItems.reduce((acc, it) => acc + (it.totalPrice || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-[#2a2a2d] flex-shrink-0">
                <button
                  id="btn-po-cancel"
                  type="button"
                  onClick={() => setIsPOModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-350 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-po-submit"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg cursor-pointer"
                >
                  {editingPO ? "Save Order Changes" : "Create draft PO Order"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* GOODS RECEIVED NOTE (GRN) MODAL DIALOG */}
      {isGRNModalOpen && activeGRNPO && (
        <div id="grn-form-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121214] rounded-xl shadow-xl w-full max-w-xl border border-[#2a2a2d] overflow-hidden text-[#e0e0e2]">
            <div className="flex justify-between items-center bg-[#1a1a1c] border-b border-[#2a2a2d] p-4">
              <h3 className="font-serif text-[#e0e0e2] text-md font-semibold tracking-wide uppercase flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#c5a059]" /> Goods Received Note (GRN) - {activeGRNPO.poNumber}
              </h3>
              <button
                id="close-grn-modal"
                type="button"
                onClick={() => setIsGRNModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGRN} className="p-6 space-y-4">
              <div className="bg-[#1a1a1c] p-3 rounded-lg border border-[#2a2a2d] text-xs space-y-1 font-light leading-normal text-neutral-300">
                <p>
                  <strong>Purveyor:</strong> {activeGRNPO.supplierName}
                </p>
                <p className="text-neutral-400">
                  You are confirming the physical arrival and state of materials at the restaurant kitchen loading dock. Received quantities will increment system stock count records.
                </p>
              </div>

              {/* Items tallies to receive */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {activeGRNPO.items.map((item) => {
                  const rem = item.quantity - item.receivedQuantity;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2.5 bg-[#1a1a1c]/50 rounded-lg border border-[#2a2a2d] text-xs">
                      <div className="space-y-1 pr-3">
                        <p className="font-semibold text-neutral-200">{item.itemName}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          Ordered: {item.quantity} | Previously Received: {item.receivedQuantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-450 uppercase font-mono">Arriving Now:</span>
                        <input
                          id={`grn-qty-inp-${item.id}`}
                          type="number"
                          min="0"
                          max={rem}
                          required
                          value={grnReceivedQtys[item.id] ?? 0}
                          onChange={(e) => setGrnReceivedQtys({
                            ...grnReceivedQtys,
                            [item.id]: Math.min(rem, Math.max(0, parseInt(e.target.value) || 0))
                          })}
                          className="w-16 text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded/lg p-1 text-center text-neutral-200 focus:outline-hidden"
                        />
                        <button
                          id={`grn-qty-max-${item.id}`}
                          type="button"
                          onClick={() => setGrnReceivedQtys({
                            ...grnReceivedQtys,
                            [item.id]: rem
                          })}
                          className="text-[9px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded uppercase font-bold"
                        >
                          Max ({rem})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verification notes */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Delivery Condition Notes / Carrier Info
                </label>
                <input
                  id="grn-notes"
                  type="text"
                  value={grnNotes}
                  onChange={(e) => setGrnNotes(e.target.value)}
                  placeholder="e.g. Delivered fresh in refrigerated boxes. Verified cold seal."
                  className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2d]">
                <button
                  id="btn-grn-cancel"
                  type="button"
                  onClick={() => setIsGRNModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-350 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-grn-submit"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg cursor-pointer"
                >
                  Confirm Goods Receipt & Adjust Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT TRANSACTION DIALOG */}
      {isPaymentModalOpen && activePaymentPO && (
        <div id="payment-form-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121214] rounded-xl shadow-xl w-full max-w-md border border-[#2a2a2d] overflow-hidden text-[#e0e0e2]">
            <div className="flex justify-between items-center bg-[#1a1a1c] border-b border-[#2a2a2d] p-4">
              <h3 className="font-serif text-[#e0e0e2] text-md font-semibold tracking-wide uppercase flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#c5a059]" /> Log Supplier Settlement Remittance
              </h3>
              <button
                id="close-pay-modal"
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              <div className="bg-[#1a1a1c] p-3 rounded-lg border border-[#2a2a2d] text-xs space-y-1 text-neutral-350 leading-normal font-light">
                <p>
                  <strong>Purveyor:</strong> {activePaymentPO.supplierName}
                </p>
                <p>
                  <strong>Total Invoice:</strong> ${activePaymentPO.totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>Previously Paid Balance:</strong> ${activePaymentPO.paidAmount.toFixed(2)}
                </p>
                <p className="text-[#c5a059] font-semibold mt-1">
                  Outstanding Accounts Payable: ${(activePaymentPO.totalAmount - activePaymentPO.paidAmount).toFixed(2)}
                </p>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Confirm Remittance Sum ($)
                </label>
                <input
                  id="payment-amt-val"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={activePaymentPO.totalAmount - activePaymentPO.paidAmount}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full text-xs font-mono bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-[#c5a059] focus:outline-hidden font-bold text-center text-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2d]">
                <button
                  id="btn-pay-cancel"
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-350 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  id="btn-pay-submit"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg cursor-pointer"
                >
                  Remit Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
