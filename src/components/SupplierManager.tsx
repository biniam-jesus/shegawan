import React, { useState } from "react";
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Layers, Briefcase, FileText, X } from "lucide-react";
import { Supplier, PurchaseOrder, UserRole } from "../types";

interface SupplierManagerProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onAddSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  currentRole: UserRole;
}

export const SupplierManager: React.FC<SupplierManagerProps> = ({
  suppliers,
  purchaseOrders,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  currentRole,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");

  const openAddForm = () => {
    setEditingSupplier(null);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setAddress("");
    setPaymentTerms("Net 30");
    setIsFormOpen(true);
  };

  const openEditForm = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setName(supplier.name);
    setContactPerson(supplier.contactPerson);
    setPhone(supplier.phone);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setPaymentTerms(supplier.paymentTerms);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (currentRole === "Store Keeper") {
      alert("Permission Denied: Store keepers cannot modify suppliers list.");
      return;
    }

    if (editingSupplier) {
      onEditSupplier({
        ...editingSupplier,
        name,
        contactPerson,
        phone,
        email,
        address,
        paymentTerms,
      });
    } else {
      onAddSupplier({
        id: `supplier-${Date.now()}`,
        name,
        contactPerson,
        phone,
        email,
        address,
        paymentTerms,
      });
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (currentRole !== "Owner" && currentRole !== "Manager") {
      alert("Permission Denied: Only Owner or Managers can delete suppliers.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this supplier profile? Immediate purchase order ties will remain static.")) {
      onDeleteSupplier(id);
      if (selectedSupplierId === id) {
        setSelectedSupplierId(null);
      }
    }
  };

  // Calculate history per supplier
  const getSupplierHistory = (supplierName: string) => {
    return purchaseOrders.filter((po) => po.supplierName.toLowerCase() === supplierName.toLowerCase());
  };

  const getSupplierTotalSpend = (supplierName: string) => {
    const orders = getSupplierHistory(supplierName);
    return orders.reduce((sum, po) => sum + po.totalAmount, 0);
  };

  return (
    <div className="space-y-6 text-[#e0e0e2]">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2a2a2d] pb-4">
        <div>
          <h2 className="text-xl font-light tracking-wide uppercase font-serif">
            Supplier <span className="text-gold-accent italic font-semibold">Directory</span>
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-0.5">
            Manage professional restaurant farm purveyors, utilities, and commercial payment terms
          </p>
        </div>

        {currentRole !== "Store Keeper" && (
          <button
            id="btn-add-supplier"
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-1 bg-[#c5a059] hover:bg-[#b08e4d] text-dark-bg text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Vendor Profile
          </button>
        )}
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left list block */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-[#1a1a1c] border-b border-[#2a2a2d] text-neutral-300 text-xs font-semibold tracking-wider uppercase">
              Registered Purveyors ({suppliers.length})
            </div>

            {suppliers.length === 0 ? (
              <div className="p-8 text-center bg-[#121214]">
                <Briefcase className="h-10 w-10 text-neutral-500 mx-auto mb-2" />
                <p className="text-sm font-light text-neutral-300">No suppliers registered</p>
                <p className="text-xs text-neutral-500 mt-1">Add a restaurant vendor using the profile build tool.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2a2d]">
                {suppliers.map((supplier) => {
                  const spend = getSupplierTotalSpend(supplier.name);
                  const ordersCount = getSupplierHistory(supplier.name).length;
                  const isSelected = selectedSupplierId === supplier.id;

                  return (
                    <div
                      key={supplier.id}
                      onClick={() => setSelectedSupplierId(supplier.id)}
                      className={`p-4 transition-colors cursor-pointer hover:bg-[#1a1a1c]/30 flex flex-col md:flex-row justify-between gap-3 ${
                        isSelected ? "bg-[#c5a059]/5 border-l-2 border-[#c5a059]" : ""
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-[#e0e0e2] font-semibold tracking-wide text-base">
                            {supplier.name}
                          </h4>
                          <span className="text-[10px] bg-[#1a1a1c] border border-[#2a2a2d] text-[#c5a059] px-2 py-0.5 rounded">
                            {supplier.paymentTerms}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 font-light">
                          <Layers className="h-3 w-3 text-neutral-500" /> Contact: {supplier.contactPerson}
                        </p>
                        
                        {/* Contacts visual tags */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[11px] text-neutral-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-neutral-600" /> {supplier.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-neutral-600" /> {supplier.email}
                          </span>
                        </div>
                      </div>

                      {/* Spend aggregation controls */}
                      <div className="flex items-end md:items-end flex-row md:flex-col justify-between md:justify-center border-t md:border-t-0 border-[#2a2a2d] md:pt-0 pt-2 shrink-0 h-full">
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest leading-none">Aggregate spend</p>
                          <p className="text-sm font-mono font-bold text-[#c5a059] mt-1">
                            ${spend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">{ordersCount} orders tracked</p>
                        </div>

                        {currentRole !== "Store Keeper" && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              id={`edit-supplier-${supplier.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(supplier);
                              }}
                              className="p-1 rounded bg-[#1a1a1c] border border-[#2a2a2d] hover:text-[#c5a059] hover:border-[#c5a059]/40 cursor-pointer text-neutral-400 transition-colors"
                              title="Edit Supplier"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              id={`delete-supplier-${supplier.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(supplier.id);
                              }}
                              className="p-1 rounded bg-[#1a1a1c] border border-[#2a2a2d] hover:text-red-400 hover:border-red-400/40 cursor-pointer text-neutral-400 transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right side profiling ledger */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Visual profile detail summary card */}
          <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl p-5 shadow-sm space-y-4">
            {selectedSupplierId ? (
              (() => {
                const targetSup = suppliers.find((s) => s.id === selectedSupplierId);
                if (!targetSup) return <p className="text-xs text-neutral-500 text-center py-6">Vendor profile not found</p>;

                const hist = getSupplierHistory(targetSup.name);
                const unpaid = hist.filter((po) => po.paidStatus === "Unpaid");
                const unpaidSum = unpaid.reduce((acc, p) => acc + (p.totalAmount - p.paidAmount), 0);

                return (
                  <div className="space-y-4">
                    <div className="border-b border-[#2a2a2d] pb-3">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">PURVEYOR SUMMARY</span>
                      <h3 className="text-xl font-serif text-[#e0e0e2] font-semibold">{targetSup.name}</h3>
                      <p className="text-xs text-neutral-400 italic mt-1 font-light">Terms: {targetSup.paymentTerms}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-mono">
                      <div className="bg-[#1a1a1c] p-2.5 rounded-lg border border-[#2a2a2d]">
                        <p className="text-[9px] text-neutral-500 uppercase">Settled Orders</p>
                        <p className="text-sm font-bold text-neutral-200 mt-0.5">{hist.filter(p => p.paidStatus === "Paid").length}</p>
                      </div>
                      <div className="bg-[#1a1a1c] p-2.5 rounded-lg border border-red-950/40">
                        <p className="text-[9px] text-red-400 uppercase">Unsettled Bal</p>
                        <p className="text-sm font-bold text-red-500 mt-0.5">${unpaidSum.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-neutral-300">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Corporate Details</span>
                      <div className="space-y-2 bg-[#1a1a1c] p-3 rounded-lg border border-[#2a2a2d] text-[11px] font-light font-mono">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                          <span>{targetSup.address || "No Address Added"}</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                          <span>Contact: {targetSup.contactPerson}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specific order history */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">Recent ERP Purchase Orders</span>
                      {hist.length === 0 ? (
                        <p className="text-[11px] text-neutral-500 italic py-2">No transaction entries found.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {hist.map((po) => (
                            <div key={po.id} className="p-2 bg-[#1a1a1c] hover:bg-[#222224] rounded-lg border border-[#2a2a2d] flex items-center justify-between text-xs transition-all">
                              <div>
                                <p className="font-mono text-[10px] text-neutral-400 font-bold">{po.poNumber}</p>
                                <p className="text-[10px] text-neutral-500 mt-0.5">{po.purchaseDate}</p>
                              </div>
                              <div className="text-right font-mono">
                                <p className="font-bold text-[#c5a059]">${po.totalAmount.toFixed(2)}</p>
                                <span className={`text-[8px] font-bold uppercase px-1 rounded ${
                                  po.status === "Received" ? "bg-emerald-950/70 text-emerald-400" : "bg-amber-950/70 text-amber-400"
                                }`}>
                                  {po.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-10">
                <Layers className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-400 leading-normal font-light">Select a registered supplier from directory rows to view detailed aggregate analytics, unsettled balances, and recent ERP PO tracking.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over or Modal Overlay for Creating/Editing Suppliers */}
      {isFormOpen && (
        <div id="supplier-form-backdrop" className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121214] rounded-xl shadow-xl w-full max-w-lg border border-[#2a2a2d] overflow-hidden text-[#e0e0e2]">
            <div className="flex justify-between items-center bg-[#1a1a1c] border-b border-[#2a2a2d] p-4">
              <h3 className="font-serif text-[#e0e0e2] text-md font-semibold tracking-wide uppercase">
                {editingSupplier ? "Edit Vendor Profile" : "Register New Vendor"}
              </h3>
              <button
                id="close-supplier-modal"
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#222224] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Supplier Name */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-450 uppercase tracking-widest mb-1.5">
                  Purveyor Corporation Name <span className="text-[#c5a059]">*</span>
                </label>
                <input
                  id="supplier-form-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Imperial Beef Suppliers Corp."
                  className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-[#c5a059] focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Contact Person */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-455 uppercase tracking-widest mb-1.5">
                    Primary Contact Name
                  </label>
                  <input
                    id="supplier-form-contact"
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>

                {/* Terms */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-405 uppercase tracking-widest mb-1.5">
                    Payment Terms
                  </label>
                  <select
                    id="supplier-form-terms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200"
                  >
                    <option value="Cash / COD" className="bg-[#121214]">Cash on Delivery (COD)</option>
                    <option value="Net 15" className="bg-[#121214]">Net 15 Days</option>
                    <option value="Net 30" className="bg-[#121214]">Net 30 Days</option>
                    <option value="Net 60" className="bg-[#121214]">Net 60 Days</option>
                    <option value="End of Month" className="bg-[#121214]">End of Month (EOM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-455 uppercase tracking-widest mb-1.5">
                    Telephone Line
                  </label>
                  <input
                    id="supplier-form-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 304-4052"
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-455 uppercase tracking-widest mb-1.5">
                    Email Inbox
                  </label>
                  <input
                    id="supplier-form-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@purveyor.com"
                    className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-semibold text-neutral-455 uppercase tracking-widest mb-1.5">
                  Business Street Address
                </label>
                <input
                  id="supplier-form-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="24 Fresh Docks Way, Warehouse B, Seattle WA"
                  className="w-full text-xs bg-[#1a1a1c] border border-[#2a2a2d] rounded-lg px-3 py-2 text-neutral-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2d]">
                <button
                  id="supplier-form-cancel"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 border border-[#2a2a2d] bg-[#121214] hover:bg-[#1a1a1c] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="supplier-form-save"
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-dark-bg bg-[#c5a059] hover:bg-[#b08e4d] rounded-lg transition-colors cursor-pointer"
                >
                  {editingSupplier ? "Save Corporate Changes" : "Register Purveyor Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
