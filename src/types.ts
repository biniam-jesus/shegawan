export type PaymentMethod = "Cash" | "Bank" | "Mobile Money";

export type ExpenseCategory =
  | "Rent"
  | "Utilities"
  | "Salaries"
  | "Inventory Purchase"
  | "Transportation"
  | "Maintenance"
  | "Marketing"
  | "Equipment"
  | "Internet"
  | "Cleaning Supplies"
  | "Taxes"
  | "Other";

export interface ExpenseItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface Expense {
  id: string;
  expenseDate: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  supplier: string;
  receiptUrl?: string; // base64 or placeholder URL
  notes?: string;
  createdBy: "Owner" | "Staff" | "Manager" | "Store Keeper" | "Accountant";
  items?: ExpenseItem[]; // For itemized details (Simple Restaurant Owner Version)
  branch?: "Shegawan" | "Teyemshega";
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  searchQuery: string;
  category: ExpenseCategory | "All";
  paymentMethod: PaymentMethod | "All";
  supplier: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export type UserRole = "Owner" | "Manager" | "Store Keeper" | "Accountant" | "Staff";

export interface ExpenseSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

export type PurchaseOrderStatus = "Pending" | "Approved" | "Received" | "Cancelled";
export type PurchaseOrderPaidStatus = "Paid" | "Unpaid" | "Partial";

export interface POItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number; // Tracking partial delivery received qty
}

export interface GRNEntry {
  id: string;
  date: string;
  receivedBy: string;
  notes: string;
  itemsReceived: {
    itemId: string;
    itemName: string;
    receivedQtyNow: number;
  }[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string; // e.g. PO-2026-001
  purchaseDate: string; // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  category: ExpenseCategory;
  totalAmount: number;
  status: PurchaseOrderStatus;
  paidStatus: PurchaseOrderPaidStatus;
  paidAmount: number;
  notes?: string;
  createdBy: string;
  receiptUrl?: string;
  paymentTerms: string;
  items: POItem[];
  grns: GRNEntry[]; // Track Goods Received Notes (partial deliveries log)
  branch?: "Shegawan" | "Teyemshega";
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  startDate: string;
  endDate?: string;
  lastGeneratedDate?: string;
  supplier: string;
  paymentMethod: PaymentMethod;
  status: "Active" | "Paused" | "Completed";
  notes?: string;
  branch?: "Shegawan" | "Teyemshega";
  createdAt: string;
}
