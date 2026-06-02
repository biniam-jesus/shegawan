import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, FileSpreadsheet, Printer, ChevronLeft, ChevronRight, 
  Receipt, ChevronDown, ChevronUp, FileText, DollarSign, Calendar, 
  Activity, Sparkles, Lock, Edit2, ShieldAlert, Library, RefreshCcw, Truck, Leaf, HardHat,
  Database
} from "lucide-react";
import { 
  Expense, ExpenseFilters as FiltersState, UserRole, ExpenseSummary, 
  ExpenseItem, Supplier, PurchaseOrder, RecurringExpense 
} from "./types";
import { RoleToggle } from "./components/RoleToggle";
import { ExpenseCharts } from "./components/ExpenseCharts";
import { ReceiptScanner } from "./components/ReceiptScanner";
import { ExpenseFilters } from "./components/ExpenseFilters";
import { ExpenseModal } from "./components/ExpenseModal";
import { AuthScreen } from "./components/AuthScreen";
import { translations, Language } from "./lib/translations";

// Modularized ERP panels
import { SupplierManager } from "./components/SupplierManager";
import { PurchasesManager } from "./components/PurchasesManager";
import { RecurringExpensesManager } from "./components/RecurringExpensesManager";

// Supabase synchronization suite & helpers
import { SupabaseSuite } from "./components/SupabaseSuite";
import { 
  isSupabaseConfigured,
  supabase,
  dbFetchExpenses,
  dbUpsertExpense,
  dbDeleteExpense,
  dbFetchSuppliers,
  dbUpsertSupplier,
  dbDeleteSupplier,
  dbFetchPurchaseOrders,
  dbUpsertPurchaseOrder,
  dbDeletePurchaseOrder,
  dbFetchRecurringSchedules,
  dbUpsertRecurringSchedule,
  dbDeleteRecurringSchedule,
  dbFetchInventory,
  dbSaveInventoryItem,
  dbSaveAllInventory
} from "./lib/supabase";

// 2026-06-02 is the anchor current date
const CURRENT_DATE_STR = "2026-06-02";

// Helper utilities for recurring scheduler dates parsing
function parseDateString(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function advanceDate(date: Date, frequency: "Daily" | "Weekly" | "Monthly" | "Yearly"): Date {
  const d = new Date(date);
  if (frequency === "Daily") {
    d.setDate(d.getDate() + 1);
  } else if (frequency === "Weekly") {
    d.setDate(d.getDate() + 7);
  } else if (frequency === "Monthly") {
    d.setMonth(d.getMonth() + 1);
  } else if (frequency === "Yearly") {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Default Suppliers Dataset
const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Port Side Seafoods Inc.",
    contactPerson: "Marcus Aurelius",
    phone: "+1 (555) 430-1092",
    email: "shipping@portsideseafood.com",
    address: "Pier 14, Warehousing Bay 3, Seattle WA",
    paymentTerms: "Net 15"
  },
  {
    id: "sup-2",
    name: "Fresh Farms Food Service Inc.",
    contactPerson: "Demeter Fields",
    phone: "+1 (555) 234-9483",
    email: "invoices@freshfarms.org",
    address: "209 Valley Harvest Road, Yakima WA",
    paymentTerms: "Net 30"
  },
  {
    id: "sup-3",
    name: "PowerGrid Electricity Co.",
    contactPerson: "Tesla Watt",
    phone: "+1 (555) 902-1234",
    email: "commercial@powergrid.co",
    address: "10 Main Power Grid Station, Portland OR",
    paymentTerms: "Cash / COD"
  },
  {
    id: "sup-4",
    name: "Metropolis Cleaners Outlet",
    contactPerson: "Diana Prince",
    phone: "+1 (555) 789-3210",
    email: "cleanteam@metropolisoutlet.com",
    address: "80 Metropolis Corporate Blv, Seattle WA",
    paymentTerms: "Net 30"
  },
  {
    id: "sup-5",
    name: "Pro Chef Kitchen Tech LLC",
    contactPerson: "Gordon Ramsey",
    phone: "+1 (555) 304-4052",
    email: "orders@prochefkitchen.com",
    address: "99 Culinary Heights Parkway, San Francisco CA",
    paymentTerms: "Net 30"
  }
];

// Default Purchase Orders Dataset
const DEFAULT_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-20260520-001",
    purchaseDate: "2026-05-20",
    supplierId: "sup-1",
    supplierName: "Port Side Seafoods Inc.",
    category: "Inventory Purchase",
    totalAmount: 1150.00,
    status: "Received", // Delivery completed
    paidStatus: "Paid",
    paidAmount: 1150.00,
    createdBy: "Owner",
    paymentTerms: "Net 15",
    notes: "Direct dock checking. Handled by Head Chef.",
    items: [
      { id: "po1-it1", itemName: "Fresh Pacific Salmon (lbs)", quantity: 50, unitPrice: 15.00, totalPrice: 750.00, receivedQuantity: 50 },
      { id: "po1-it2", itemName: "Atlantic Cod (lbs)", quantity: 40, unitPrice: 10.00, totalPrice: 400.00, receivedQuantity: 40 }
    ],
    grns: [
      {
        id: "po1-grn-1",
        date: "2026-05-22",
        receivedBy: "Store Keeper",
        notes: "Perfect delivery of cod and salmon. All cold-packs intact.",
        itemsReceived: [
          { itemId: "po1-it1", itemName: "Fresh Pacific Salmon (lbs)", receivedQtyNow: 50 },
          { itemId: "po1-it2", itemName: "Atlantic Cod (lbs)", receivedQtyNow: 40 }
        ]
      }
    ],
    createdAt: "2026-05-20T09:00:00Z",
    updatedAt: "2026-05-22T10:30:00Z"
  },
  {
    id: "po-2",
    poNumber: "PO-20260528-001",
    purchaseDate: "2026-05-28",
    supplierId: "sup-2",
    supplierName: "Fresh Farms Food Service Inc.",
    category: "Inventory Purchase",
    totalAmount: 645.00,
    status: "Approved", // In transit / Sent to supplier / awaiting GRN
    paidStatus: "Unpaid",
    paidAmount: 0.00,
    createdBy: "Manager",
    paymentTerms: "Net 30",
    notes: "Pre-scheduled shipment for the weekend busy shift.",
    items: [
      { id: "po2-it1", itemName: "Organic Roma Tomatoes (case)", quantity: 15, unitPrice: 25.00, totalPrice: 375.00, receivedQuantity: 0 },
      { id: "po2-it2", itemName: "Crisp Romaine Lettuce (case)", quantity: 10, unitPrice: 27.00, totalPrice: 270.00, receivedQuantity: 0 }
    ],
    grns: [],
    createdAt: "2026-05-28T14:00:00Z",
    updatedAt: "2026-05-28T14:15:00Z"
  },
  {
    id: "po-3",
    poNumber: "PO-20260601-001",
    purchaseDate: "2026-06-01",
    supplierId: "sup-5",
    supplierName: "Pro Chef Kitchen Tech LLC",
    category: "Equipment",
    totalAmount: 185.00,
    status: "Pending", // Awaiting approval
    paidStatus: "Unpaid",
    paidAmount: 0.00,
    createdBy: "Staff",
    paymentTerms: "Net 30",
    notes: "Kitchen chef knives replacement blades.",
    items: [
      { id: "po3-it1", itemName: "High Carbon Chef Knife 8-inch", quantity: 2, unitPrice: 75.00, totalPrice: 150.00, receivedQuantity: 0 },
      { id: "po3-it2", itemName: "Whetstone Dual Grit File", quantity: 1, unitPrice: 35.00, totalPrice: 35.00, receivedQuantity: 0 }
    ],
    grns: [],
    createdAt: "2026-06-01T16:30:00Z",
    updatedAt: "2026-06-01T16:30:00Z"
  }
];

// Default Recurring Billing Schedules
const DEFAULT_RECURRING_SCHEDULES: RecurringExpense[] = [
  {
    id: "recur-1",
    description: "Gigabit Commercial Fiber Cable Connection",
    amount: 145.00,
    category: "Internet",
    frequency: "Monthly",
    startDate: "2026-04-01",
    lastGeneratedDate: "2026-05-01", // Next monthly generation is on 2026-06-01 (due!)
    supplier: "Pro Chef Kitchen Tech LLC",
    paymentMethod: "Bank",
    status: "Active",
    notes: "High throughput broadband line under routine monthly fee.",
    createdAt: "2026-04-01T08:00:00Z"
  },
  {
    id: "recur-2",
    description: "Heavy Exhaust Fan Hood Degreasing Cleaner Service",
    amount: 220.00,
    category: "Maintenance",
    frequency: "Weekly",
    startDate: "2026-05-20",
    lastGeneratedDate: "2026-05-27", // Next is 23-06-03 (not due yet on June 2nd current date)
    supplier: "Metropolis Cleaners Outlet",
    paymentMethod: "Cash",
    status: "Active",
    notes: "Grease trap safety requirement.",
    createdAt: "2026-05-20T10:00:00Z"
  },
  {
    id: "recur-3",
    description: "Local Food Blogger Advertising Fee",
    amount: 15.10,
    category: "Marketing",
    frequency: "Daily",
    startDate: "2026-05-31",
    lastGeneratedDate: "2026-05-31", // Needs daily run for June 1st & June 2nd!
    supplier: "Fresh Farms Food Service Inc.",
    paymentMethod: "Mobile Money",
    status: "Active",
    notes: "Sponsors Summer Dining specials.",
    createdAt: "2026-05-31T09:00:00Z"
  }
];

// Initial Stockpile Inventory Level
const DEFAULT_INVENTORY_STOCK: Record<string, number> = {
  "Fresh Pacific Salmon (lbs)": 140,
  "Atlantic Cod (lbs)": 90,
  "Organic Roma Tomatoes (case)": 35,
  "Crisp Romaine Lettuce (case)": 28,
  "High Carbon Chef Knife 8-inch": 5,
  "Whetstone Dual Grit File": 3
};

// Original default ledger transactions
const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    expenseDate: "2026-06-02",
    category: "Inventory Purchase",
    description: "Weekly Seafood Delivery (Cod & Salmon)",
    amount: 540.00,
    paymentMethod: "Cash",
    supplier: "Port Side Seafoods Inc.",
    notes: "Direct kitchen dock delivery. Handled by Head Chef.",
    createdBy: "Owner",
    items: [
      { id: "e1-it1", itemName: "Fresh Pacific Salmon (lbs)", quantity: 30, unitPrice: 12.00, totalCost: 360.00 },
      { id: "e1-it2", itemName: "Atlantic Cod (lbs)", quantity: 20, unitPrice: 9.00, totalCost: 180.00 }
    ],
    createdAt: "2026-06-02T08:30:00Z",
    updatedAt: "2026-06-02T08:30:00Z"
  },
  {
    id: "exp-2",
    expenseDate: "2026-06-01",
    category: "Rent",
    description: "June 2026 Restaurant Building Lease",
    amount: 3200.00,
    paymentMethod: "Bank",
    supplier: "Metro Commercial Properties",
    notes: "Standard monthly lease invoice. Direct debit set.",
    createdBy: "Owner",
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-01T09:00:00Z"
  },
  {
    id: "exp-3",
    expenseDate: "2026-05-28",
    category: "Utilities",
    description: "Kitchen Power & Thermal Grid Billing",
    amount: 412.50,
    paymentMethod: "Cash",
    supplier: "PowerGrid Utilities Co.",
    notes: "High power utilization due to exhaust system maintenance.",
    createdBy: "Staff",
    items: [
      { id: "e3-it1", itemName: "Electrical Energy Charges (KWh)", quantity: 1, unitPrice: 310.00, totalCost: 310.00 },
      { id: "e3-it2", itemName: "Water thermal usage", quantity: 1, unitPrice: 102.50, totalCost: 102.50 }
    ],
    createdAt: "2026-05-28T14:20:00Z",
    updatedAt: "2026-05-28T14:20:00Z"
  },
  {
    id: "exp-4",
    expenseDate: "2026-05-26",
    category: "Salaries",
    description: "Part-time Floor Staff Salaries (Week 21)",
    amount: 1450.00,
    paymentMethod: "Bank",
    supplier: "Floor Staff Roster Pool",
    notes: "Covers standard server hours. Approved by shift manager.",
    createdBy: "Owner",
    createdAt: "2026-05-26T17:00:00Z",
    updatedAt: "2026-05-26T17:00:00Z"
  },
  {
    id: "exp-5",
    expenseDate: "2026-05-24",
    category: "Equipment",
    description: "Kitchen Chef Knives Replacement & Sharpeners",
    amount: 185.00,
    paymentMethod: "Mobile Money",
    supplier: "Pro Chef Kitchen Tech LLC",
    notes: "Required for prep-line optimization. High-carbon steel blades.",
    createdBy: "Staff",
    items: [
      { id: "e5-it1", itemName: "Chef Knife 8-inch", quantity: 2, unitPrice: 75.00, totalCost: 150.00 },
      { id: "e5-it2", itemName: "Whetstone dual grit", quantity: 1, unitPrice: 35.00, totalCost: 35.00 }
    ],
    createdAt: "2026-05-24T11:15:00Z",
    updatedAt: "2026-05-24T11:15:00Z"
  }
];

export default function App() {
  // Sync core states with local storage
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem("restaurant_erp_expenses");
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("restaurant_erp_suppliers");
    return saved ? JSON.parse(saved) : DEFAULT_SUPPLIERS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("restaurant_erp_purchase_orders");
    return saved ? JSON.parse(saved) : DEFAULT_PURCHASE_ORDERS;
  });

  const [recurringSchedules, setRecurringSchedules] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem("restaurant_erp_recurring");
    return saved ? JSON.parse(saved) : DEFAULT_RECURRING_SCHEDULES;
  });

  const [branch, setBranch] = useState<"Shegawan" | "Teyemshega">(() => {
    const saved = localStorage.getItem("restaurant_erp_active_branch");
    return (saved === "Shegawan" || saved === "Teyemshega") ? saved : "Shegawan";
  });

  const handleBranchChange = (nextBranch: "Shegawan" | "Teyemshega") => {
    setBranch(nextBranch);
    localStorage.setItem("restaurant_erp_active_branch", nextBranch);
  };

  const [inventoryStock, setInventoryStock] = useState<Record<string, Record<string, number>>>(() => {
    const saved = localStorage.getItem("restaurant_erp_inventory_v2");
    if (saved) return JSON.parse(saved);
    
    // Migration fallback
    const oldSaved = localStorage.getItem("restaurant_erp_inventory");
    const parsedOld = oldSaved ? JSON.parse(oldSaved) : DEFAULT_INVENTORY_STOCK;
    return {
      "Shegawan": parsedOld,
      "Teyemshega": { ...DEFAULT_INVENTORY_STOCK } // clone defaults
    };
  });

  // 1. Language preference "en" | "am"
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("restaurant_erp_language");
    return (saved === "en" || saved === "am") ? saved : "en";
  });

  const handleLanguageToggle = () => {
    const nextLang = language === "en" ? "am" : "en";
    setLanguage(nextLang);
    localStorage.setItem("restaurant_erp_language", nextLang);
  };

  // 2. Auth Session states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Sync session and handle auth events
  useEffect(() => {
    const isConfig = isSupabaseConfigured();
    
    if (isConfig && supabase) {
      // Get active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const savedRole = localStorage.getItem("erp_sandbox_role") as UserRole;
          if (savedRole) {
            setCurrentRole(savedRole);
          } else {
            setCurrentRole((session.user.user_metadata?.role as UserRole) || "Owner");
          }
        } else {
          // Check if sandbox simulated user is saved
          const savedSandboxUser = localStorage.getItem("erp_sandbox_user");
          const savedSandboxRole = localStorage.getItem("erp_sandbox_role");
          if (savedSandboxUser) {
            setCurrentUser(JSON.parse(savedSandboxUser));
            setCurrentRole((savedSandboxRole as UserRole) || "Owner");
          }
        }
        setAuthChecking(false);
      });

      // Listen for changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(session.user);
          const metaRole = session.user.user_metadata?.role as UserRole;
          if (metaRole) {
            setCurrentRole(metaRole);
            localStorage.setItem("erp_sandbox_role", metaRole);
          }
        } else {
          // If signed out, clean up
          const savedSandboxUser = localStorage.getItem("erp_sandbox_user");
          if (!savedSandboxUser) {
            setCurrentUser(null);
          }
        }
        setAuthChecking(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Offline/sandbox mode: load cached sandbox user if exists
      const savedSandboxUser = localStorage.getItem("erp_sandbox_user");
      const savedSandboxRole = localStorage.getItem("erp_sandbox_role");
      if (savedSandboxUser) {
        setCurrentUser(JSON.parse(savedSandboxUser));
        setCurrentRole((savedSandboxRole as UserRole) || "Owner");
      }
      setAuthChecking(false);
    }
  }, []);

  const handleAuthSuccess = (sessionUser: any, selectedRole: UserRole) => {
    setCurrentUser(sessionUser);
    setCurrentRole(selectedRole);
    localStorage.setItem("erp_sandbox_role", selectedRole);
    
    // Trigger Sync immediately upon authentication
    handleSupabaseSync();
  };

  const handleLogout = async () => {
    const isConfig = isSupabaseConfigured();
    if (isConfig && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signout failed, clearing session locally:", err);
      }
    }
    
    // Clear all simulation / actual sessions
    setCurrentUser(null);
    localStorage.removeItem("erp_sandbox_user");
    localStorage.removeItem("erp_sandbox_role");
  };

  const [currentRole, setCurrentRole] = useState<UserRole>("Owner");
  const [activeTab, setActiveTab] = useState<"Dashboard" | "Purchase Orders" | "Suppliers" | "Recurring Expenses" | "Expense Ledger">("Dashboard");
  const [generatedCountSinceBoot, setGeneratedCountSinceBoot] = useState(0);

  // Filters State for standard Ledger List
  const [ledgerFilters, setLedgerFilters] = useState<FiltersState>({
    searchQuery: "",
    category: "All",
    paymentMethod: "All",
    supplier: "",
    startDate: "",
    endDate: "",
  });

  // Expense listing pagination items
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Expansion mapping toggles
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  // Form & Modals managers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [scannedData, setScannedData] = useState<any | null>(null);

  // Supabase Sync States
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseLive, setSupabaseLive] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);

  // Synchronised Supabase Load Logic
  const handleSupabaseSync = async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseLive(false);
      return;
    }
    setSupabaseSyncing(true);
    setSupabaseError(null);
    try {
      const dbExpenses = await dbFetchExpenses();
      const dbSuppliers = await dbFetchSuppliers();
      const dbPurchaseOrders = await dbFetchPurchaseOrders();
      const dbSchedules = await dbFetchRecurringSchedules();
      const dbInventory = await dbFetchInventory();

      if (dbExpenses.length === 0 && dbSuppliers.length === 0) {
        console.log("Supabase connected but found empty tables. Starting data seeding...");
        // Seeding tables to form an out-of-the-box live experience
        for (const s of DEFAULT_SUPPLIERS) {
          await dbUpsertSupplier(s);
        }
        for (const e of DEFAULT_EXPENSES) {
          await dbUpsertExpense(e);
        }
        for (const po of DEFAULT_PURCHASE_ORDERS) {
          await dbUpsertPurchaseOrder(po);
        }
        for (const s of DEFAULT_RECURRING_SCHEDULES) {
          await dbUpsertRecurringSchedule(s);
        }
        
        const nestedSeed = {
          "Shegawan": { ...DEFAULT_INVENTORY_STOCK },
          "Teyemshega": { ...DEFAULT_INVENTORY_STOCK }
        };
        const flatSeedForDb: Record<string, number> = {};
        Object.entries(nestedSeed).forEach(([br, items]) => {
          Object.entries(items).forEach(([itemName, qty]) => {
            flatSeedForDb[`${br}:${itemName}`] = qty;
          });
        });
        await dbSaveAllInventory(flatSeedForDb);

        setExpenses(DEFAULT_EXPENSES);
        setSuppliers(DEFAULT_SUPPLIERS);
        setPurchaseOrders(DEFAULT_PURCHASE_ORDERS);
        setRecurringSchedules(DEFAULT_RECURRING_SCHEDULES);
        setInventoryStock(nestedSeed);
      } else {
        if (dbExpenses.length > 0) setExpenses(dbExpenses);
        if (dbSuppliers.length > 0) setSuppliers(dbSuppliers);
        if (dbPurchaseOrders.length > 0) setPurchaseOrders(dbPurchaseOrders);
        if (dbSchedules.length > 0) setRecurringSchedules(dbSchedules);
        if (Object.keys(dbInventory).length > 0) {
          const hasPrefixedKeys = Object.keys(dbInventory).some(k => k.includes(":"));
          if (hasPrefixedKeys) {
            const nested: Record<string, Record<string, number>> = {
              "Shegawan": { ...DEFAULT_INVENTORY_STOCK },
              "Teyemshega": { ...DEFAULT_INVENTORY_STOCK }
            };
            Object.entries(dbInventory).forEach(([key, qty]) => {
              const colonIdx = key.indexOf(":");
              if (colonIdx > -1) {
                const br = key.slice(0, colonIdx);
                const itemName = key.slice(colonIdx + 1);
                if (br === "Shegawan" || br === "Teyemshega") {
                  nested[br][itemName] = qty;
                }
              }
            });
            setInventoryStock(nested);
          } else {
            if (dbInventory.Shegawan || dbInventory.Teyemshega) {
              setInventoryStock(dbInventory as any);
            } else {
              setInventoryStock({
                "Shegawan": dbInventory,
                "Teyemshega": { ...DEFAULT_INVENTORY_STOCK }
              });
            }
          }
        }
      }
      setSupabaseLive(true);
    } catch (err: any) {
      console.error("Supabase live sync error:", err);
      setSupabaseError(err?.message || "Please execute the database schema inside your project SQL editor first.");
      setSupabaseLive(false);
    } finally {
      setSupabaseSyncing(false);
    }
  };

  useEffect(() => {
    handleSupabaseSync();
  }, []);

  // Sync state variables to LocalStorage automatically
  useEffect(() => {
    localStorage.setItem("restaurant_erp_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("restaurant_erp_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("restaurant_erp_purchase_orders", JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem("restaurant_erp_recurring", JSON.stringify(recurringSchedules));
  }, [recurringSchedules]);

  useEffect(() => {
    localStorage.setItem("restaurant_erp_inventory_v2", JSON.stringify(inventoryStock));
  }, [inventoryStock]);

  // Offline Automatic Recurrence task evaluation
  const autoGenerateRecurrences = () => {
    let compileCount = 0;
    const addedExpenses: Expense[] = [];

    const updatedSchedules = recurringSchedules.map(schedule => {
      if (schedule.status !== "Active") return schedule;

      let currentSchedule = { ...schedule };
      let lastGen = currentSchedule.lastGeneratedDate || currentSchedule.startDate;
      let nextRun = parseDateString(lastGen);

      // Advance immediately if we have a valid lastGeneratedDate to avoid re-generating the same day
      if (currentSchedule.lastGeneratedDate) {
        nextRun = advanceDate(nextRun, currentSchedule.frequency);
      }

      let runDateStr = formatDateString(nextRun);

      while (runDateStr <= CURRENT_DATE_STR && (!schedule.endDate || runDateStr <= schedule.endDate)) {
        // Construct new direct expense record matching this schedule setup
        const newExp: Expense = {
          id: `exp-auto-${Date.now()}-${Math.random()}`,
          expenseDate: runDateStr,
          category: currentSchedule.category,
          description: `Subscription: ${currentSchedule.description}`,
          amount: currentSchedule.amount,
          paymentMethod: currentSchedule.paymentMethod,
          supplier: currentSchedule.supplier,
          branch: currentSchedule.branch || "Shegawan",
          notes: `System-generated recurring contract charge (Schedule profile reference: ${currentSchedule.id}).`,
          createdBy: "Owner",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        addedExpenses.push(newExp);
        currentSchedule.lastGeneratedDate = runDateStr;
        compileCount++;

        // Advance to check next occurrence
        nextRun = advanceDate(nextRun, currentSchedule.frequency);
        runDateStr = formatDateString(nextRun);
      }

      return currentSchedule;
    });

    if (compileCount > 0) {
      setExpenses(prev => [...addedExpenses, ...prev]);
      setRecurringSchedules(updatedSchedules);
      setGeneratedCountSinceBoot(prev => prev + compileCount);

      if (supabaseLive) {
        // Save added auto expenses and update schedules
        addedExpenses.forEach(exp => {
          dbUpsertExpense(exp).catch(err => console.error("Db Auto save fail:", err));
        });
        updatedSchedules.forEach(sc => {
          dbUpsertRecurringSchedule(sc).catch(err => console.error("Db Auto schedule sync fail:", err));
        });
      }
    }
  };

  // Run auto recurrence assessment on component mounting
  useEffect(() => {
    autoGenerateRecurrences();
  }, [supabaseLive]); // Re-check if supabase shifts to live connection

  // Handler to manually check schedules via CTA Button
  const handleTriggerManualSchedulesScan = () => {
    const priorCount = generatedCountSinceBoot;
    autoGenerateRecurrences();
    if (generatedCountSinceBoot === priorCount) {
      alert("No pending recurring expenses detected! Your ledgers are fully aligned up to June 2, 2026.");
    }
  };

  // Trigger manual consumption of simulated stockpile
  const handleSimulateConsumption = (itemName: string, amountToDeduct: number) => {
    let nextLevel = 0;
    setInventoryStock(prev => {
      const branchStock = prev[branch] || {};
      const current = branchStock[itemName] || 0;
      nextLevel = Math.max(0, current - amountToDeduct);
      return {
        ...prev,
        [branch]: {
          ...branchStock,
          [itemName]: nextLevel
        }
      };
    });

    if (supabaseLive) {
      setTimeout(() => {
        dbSaveInventoryItem(`${branch}:${itemName}`, nextLevel).catch(err => console.error("Db Inventory save fail:", err));
      }, 50);
    }
  };

  // Dynamic Stockpile Increment upon GRN submission
  const handleInventoryIncrementFromGRN = (itemName: string, count: number) => {
    setInventoryStock(prev => {
      const branchStock = prev[branch] || {};
      const current = branchStock[itemName] || 0;
      return {
        ...prev,
        [branch]: {
          ...branchStock,
          [itemName]: current + count
        }
      };
    });
  };

  // Switch tabs beautifully
  const handleTabSelect = (tab: any) => {
    setActiveTab(tab);
  };

  // Role Switching helper
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
  };

  // Direct Ledger OCR callback
  const handleScanReceiptComplete = (parsed: any) => {
    setScannedData(parsed);
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  // Open clean ledger save drawer
  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setScannedData(null);
    setIsModalOpen(true);
  };

  // Direct Ledger save handler
  const handleSaveExpense = (fields: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (expenseToEdit) {
      if (currentRole !== "Owner" && currentRole !== "Manager") {
        alert("Permission Denied: Recording or modifying expenditures requires management privileges.");
        return;
      }
      const updatedItem: Expense = {
        ...expenseToEdit,
        ...fields,
        branch: expenseToEdit.branch || branch,
        updatedAt: new Date().toISOString(),
      };
      const updated = expenses.map((exp) => exp.id === expenseToEdit.id ? updatedItem : exp);
      setExpenses(updated);
      
      if (supabaseLive) {
        dbUpsertExpense(updatedItem).catch(err => console.error("Db save edit fail:", err));
      }
      setExpenseToEdit(null);
    } else {
      const newExp: Expense = {
        ...fields,
        id: `exp-${Date.now()}`,
        branch,
        createdBy: currentRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExpenses([newExp, ...expenses]);
      
      if (supabaseLive) {
        dbUpsertExpense(newExp).catch(err => console.error("Db save create fail:", err));
      }
    }
    setIsModalOpen(false);
    setScannedData(null);
  };

  // Direct Ledger item deletion
  const handleDeleteExpense = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRole !== "Owner") {
      alert("Permission Denied: Only users with 'Owner' roles can clear ledger lines.");
      return;
    }
    if (window.confirm("Delete this expense row?")) {
      setExpenses(expenses.filter((exp) => exp.id !== id));
      
      if (supabaseLive) {
        dbDeleteExpense(id).catch(err => console.error("Db delete row fail:", err));
      }
    }
  };

  const handleClearFilters = () => {
    setLedgerFilters({
      searchQuery: "",
      category: "All",
      paymentMethod: "All",
      supplier: "",
      startDate: "",
      endDate: "",
    });
  };

  // Filter evaluation logic for original ledger
  const filteredExpenses = expenses.filter((exp) => {
    // Branch filter: untagged records default to Shegawan
    const recordBranch = exp.branch || "Shegawan";
    if (recordBranch !== branch) return false;

    if (ledgerFilters.searchQuery.trim()) {
      const q = ledgerFilters.searchQuery.toLowerCase();
      const matchDesc = exp.description.toLowerCase().includes(q);
      const matchSupplier = exp.supplier.toLowerCase().includes(q);
      const matchNotes = exp.notes?.toLowerCase().includes(q) || false;
      const matchItems = exp.items?.some((it) => it.itemName.toLowerCase().includes(q)) || false;

      if (!matchDesc && !matchSupplier && !matchNotes && !matchItems) {
        return false;
      }
    }
    if (ledgerFilters.category !== "All" && exp.category !== ledgerFilters.category) return false;
    if (ledgerFilters.paymentMethod !== "All" && exp.paymentMethod !== ledgerFilters.paymentMethod) return false;
    if (ledgerFilters.supplier && exp.supplier !== ledgerFilters.supplier) return false;
    if (ledgerFilters.startDate && exp.expenseDate < ledgerFilters.startDate) return false;
    if (ledgerFilters.endDate && exp.expenseDate > ledgerFilters.endDate) return false;

    return true;
  });

  // Calculate direct core sums
  const calculateSummaries = (): ExpenseSummary => {
    let todaySum = 0;
    let weekSum = 0;
    let monthSum = 0;
    let yearSum = 0;

    const todayVal = new Date(CURRENT_DATE_STR);

    expenses.forEach((e) => {
      // Branch filter
      const recordBranch = e.branch || "Shegawan";
      if (recordBranch !== branch) return;

      const d = e.expenseDate;
      const expDateVal = new Date(d);

      if (d === CURRENT_DATE_STR) todaySum += e.amount;

      const diff = todayVal.getTime() - expDateVal.getTime();
      const diffDays = diff / (1000 * 60 * 60 * 24);
      if (diffDays >= 0 && diffDays <= 7) {
        weekSum += e.amount;
      }

      if (d.startsWith("2026-06") || d.startsWith("2026-05")) {
        // May & June total
        monthSum += e.amount;
      }

      if (d.startsWith("2026")) {
        yearSum += e.amount;
      }
    });

    return { today: todaySum, thisWeek: weekSum, thisMonth: monthSum, thisYear: yearSum };
  };

  const summaryData = calculateSummaries();

  // Pagination elements
  const totalItems = filteredExpenses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (ledgerCurrentPage - 1) * itemsPerPage,
    ledgerCurrentPage * itemsPerPage
  );

  const toggleRowExpansion = (id: string) => {
    setExpandedRowIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // CSV print trigger for ledger
  const handleExportCSV = () => {
    const headers = ["ID", "Date", "Supplier", "Category", "Description", "Amount", "Payment Method", "Items Details", "Created By"];
    const rows = filteredExpenses.map((exp) => {
      const itemsListStr = exp.items
        ? exp.items.map((it) => `${it.itemName} (${it.quantity}x$${it.unitPrice})`).join(" | ")
        : "None";
      return [
        exp.id,
        exp.expenseDate,
        `"${exp.supplier.replace(/"/g, '""')}"`,
        exp.category,
        `"${exp.description.replace(/"/g, '""')}"`,
        exp.amount.toFixed(2),
        exp.paymentMethod,
        `"${itemsListStr.replace(/"/g, '""')}"`,
        exp.createdBy,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DirectExpenses_Ledger_${CURRENT_DATE_STR}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const currentPurchaseOrders = purchaseOrders.filter((po) => (po.branch || "Shegawan") === branch);
  const currentRecurringSchedules = recurringSchedules.filter((r) => (r.branch || "Shegawan") === branch);

  // Unique supplier list for chips filter
  const uniqueSuppliers = Array.from(
    new Set(filteredExpenses.map((e) => e.supplier).filter(Boolean))
  ).slice(0, 5);

  const t = translations[language];

  if (authChecking) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-gold-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-wider text-neutral-400 animate-pulse">
            {language === "am" ? "የኤፒኩሪያን ERP መተግበሪያ በመጫን ላይ..." : "INITIALIZING EPICUREAN ERP SYSTEMS..."}
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen 
        language={language} 
        onLanguageToggle={handleLanguageToggle} 
        onAuthSuccess={handleAuthSuccess} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e0e0e2] pb-12 font-sans overflow-x-hidden print:bg-white print:text-black">
      
      {/* Dynamic Role Switch Header */}
      <RoleToggle 
        currentRole={currentRole} 
        onRoleChange={handleRoleChange} 
        language={language}
        onLanguageToggle={handleLanguageToggle}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeBranch={branch}
        onBranchChange={handleBranchChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Module Guard Header Alert depending on Role constraints */}
        {currentRole !== "Owner" && currentRole !== "Manager" && (
          <div className="bg-[#1a1c1a]/45 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-start gap-3.5 print:hidden">
            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">
                {t.simulatedView}: {currentRole}
              </p>
              <p className="text-[11px] font-light text-neutral-400 mt-0.5">
                {currentRole === "Store Keeper" && (
                  language === "am" 
                    ? "በተቀባይ መጋዘን ደረጃ የ GRN መጫኛ ኖቶችን ለማስገባት ብቻ ፍቃድ አልዎት። PO ወይም የአቅራቢ ኮንታክቶችን መፍጠር የተከለከለ ነው።" 
                    : "You have write access only for receiving GRN shipments at the loading dock. Creating POs or editing supplier contacts is locked."
                )}
                {currentRole === "Accountant" && (
                  language === "am" 
                    ? "የኪሳራ ክፍያዎችን እና የክፍያ ደረሰኞችን ለማስገባት ብቻ ፍቃድ አልዎት። የPO ዝርዝሮችን ማሻሻል የተከለከለ ነው።" 
                    : "You possess write authority solely for submitting payment remittances. Inventory PO changes are restricted."
                )}
                {currentRole === "Staff" && (
                  language === "am" 
                    ? "የወጥ ቤት ሠራተኛ እይታ፡ ሁሉንም የወጪ ዘገባዎች ለማንበብ ብቻ የተገደበ ፍቃድ፣ ደረሰኝ ምስል መጫን ይፈቀዳል።" 
                    : "Kitchen preparation staff view: Read-only access to procurement details, receipt uploading is allowed."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Tab Selection Navigation Interface Segment */}
        <div className="border-b border-[#2a2a2d] pb-px flex items-center justify-between mb-2 overflow-x-auto gap-4 scrollbar-thin print:hidden">
          <div className="flex space-x-1.5 whitespace-nowrap">
            {[
              { id: "Dashboard", label: t.tabDashboard },
              { id: "Purchase Orders", label: t.tabPurchaseOrders },
              { id: "Suppliers", label: t.tabSuppliers },
              { id: "Recurring Expenses", label: t.tabRecurringExpenses },
              { id: "Expense Ledger", label: t.tabExpenseLedger }
            ].map(tab => {
              const matched = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-select-${tab.id.replace(/\s+/g, "-")}`}
                  type="button"
                  onClick={() => handleTabSelect(tab.id as any)}
                  className={`px-4 py-3 text-xs tracking-wider uppercase font-semibold cursor-pointer border-b-2 transition-all duration-300 ${
                    matched 
                      ? "border-[#c5a059] text-[#c5a059] bg-[#1a1a1c]/30" 
                      : "border-transparent text-neutral-450 hover:text-neutral-250 hover:bg-[#121214]/40"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] whitespace-nowrap print:hidden select-none">
            {isSupabaseConfigured() ? (
              <button
                id="btn-trigger-supabase-suite-modal"
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                  supabaseLive 
                    ? "bg-green-950/20 text-green-400 border-green-500/25 hover:bg-green-950/45" 
                    : "bg-red-950/15 text-red-400 border-red-500/20 hover:bg-red-950/40"
                }`}
              >
                <Database className="h-3 w-3" />
                {supabaseLive ? t.supabaseStatusConnected : t.supabaseStatusError}
              </button>
            ) : (
              <button
                id="btn-trigger-supabase-suite-modal"
                type="button"
                onClick={() => setIsSupabaseModalOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[9.5px] font-bold text-neutral-400 bg-[#161618] border border-[#232325] hover:text-white hover:border-[#c5a059]/45 transition-colors cursor-pointer"
              >
                <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full" />
                {t.supabaseNotConfigured}
              </button>
            )}
            
            <span className="text-neutral-500 hidden md:block select-none font-mono py-1">
              SYSTEM ANCHOR DATE: <strong className="text-neutral-350">{CURRENT_DATE_STR}</strong>
            </span>
          </div>
        </div>

        {/* ==================== SCREEN RENDERING SWITCHBOARD ==================== */}

        {/* TAB 1: DASHBOARD HUB */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            
            {/* Visual Charts Component rendering */}
            <div className="print:hidden">
              <ExpenseCharts expenses={expenses.filter(e => (e.branch || "Shegawan") === branch)} summary={summaryData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Stockpile Inventory track list */}
              <div className="lg:col-span-2 bg-[#121214] border border-[#2a2a2d] p-5 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#222224] pb-3">
                  <div>
                    <h3 className="font-serif text-[#e0e0e2] text-sm uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      <Truck className="h-4.5 w-4.5 text-[#c5a059]" /> {language === "am" ? "የዕቃ መጋዘን እና የግዢዎች ማመሳሰያ" : "Live Stockpile & Purchasing Sync"}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-light mt-0.5">
                      {language === "am" ? "የገቡ የዕቃ ማረጋገጫዎች (GRN) ይህንን መጠን አውቶማቲካሊ ያሻሽሉታል።" : "Inbound Goods Received Notes (GRN) automatically update these quantities."}
                    </p>
                  </div>
                  <span className="bg-[#121214] border border-[#2a2a2d] text-neutral-450 px-2 py-0.5 text-[9px] font-mono rounded-lg">
                    {language === "am" ? "ገባሪ መጋዘን ዝርዝር" : "Active Branch Stockpile"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.entries(inventoryStock[branch] || {}).map(([item, qty]) => {
                    const currentQty = qty as number;
                    const isLow = currentQty <= 10;
                    // Find if any purchase order is approved (in transit) for this item to offer assistance info
                    const incomingCount = purchaseOrders
                      .filter(po => (po.branch || "Shegawan") === branch && po.status === "Approved")
                      .reduce((acc, po) => {
                        const matchedIt = po.items.find(i => i.itemName.toLowerCase() === item.toLowerCase());
                        if (matchedIt) {
                          return acc + (matchedIt.quantity - matchedIt.receivedQuantity);
                        }
                        return acc;
                      }, 0);

                    return (
                      <div 
                        key={item} 
                        className={`p-3 rounded-lg border flex flex-col justify-between ${
                          isLow 
                            ? "bg-red-950/20 border-red-500/25 text-red-300" 
                            : "bg-[#1a1a1c]/60 border-[#2a2a2d] text-neutral-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs truncate max-w-[170px] text-neutral-100" title={item}>
                              {item}
                            </p>
                            {incomingCount > 0 ? (
                              <span className="text-[9px] text-[#c5a059] block mt-0.5 font-mono">
                                +{incomingCount} in route (PO approved)
                              </span>
                            ) : (
                              <span className="text-[9px] text-neutral-500 block mt-0.5">No active PO transit</span>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <span className="text-lg font-bold font-mono block">
                              {currentQty}
                            </span>
                            <span className="text-[9px] text-neutral-500 block font-light">units on hand</span>
                          </div>
                        </div>

                        {/* Interactive manual stock simulation drawer */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2d]/40 mt-3">
                          <span className={`text-[9.5px] uppercase font-bold flex items-center gap-1 ${isLow ? "text-red-400" : "text-[#c5a059]"}`}>
                            {isLow ? "⚠️ Stock Alert: Low" : "✓ In Stock"}
                          </span>

                          <button
                            id={`consume-${item.replace(/\s+/g, "-")}`}
                            type="button"
                            onClick={() => handleSimulateConsumption(item, 5)}
                            className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors"
                            title="Simulate service depletion of material stockpile"
                          >
                            Consume -5
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Module Integration Guidelines Context card */}
              <div className="space-y-5">
                <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl p-5 shadow-sm text-[#e0e0e2]">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5 font-serif">
                    Epicurean ERP Architecture
                  </span>
                  <h3 className="font-light text-sm text-neutral-200 border-b border-[#222224] pb-2 mb-3 tracking-wide uppercase">
                    Procurement Compliance Checklist 🛡️
                  </h3>

                  <ul className="space-y-3 text-xs text-neutral-400 font-light leading-normal">
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#c5a059] mt-0.5 font-bold">1.</span>
                      <div>
                        <strong className="text-neutral-200 block">Supplier Register Tying</strong>
                        Each purchase item matches an approved supplier profile for rigorous vendor reporting.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#c5a059] mt-0.5 font-bold">2.</span>
                      <div>
                        <strong className="text-neutral-200 block">GRN Inbound Stock Increment</strong>
                        Authorized delivery verification updates stock metrics automatically upon full or partial shipment checks.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-[#c5a059] mt-0.5 font-bold">3.</span>
                      <div>
                        <strong className="text-neutral-200 block">Schedules Auto-Check</strong>
                        Every day/monthly lease interval triggers automatic direct ledger uploads without user intervention.
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Simulated quick dashboard metric for recurring scheduled tasks */}
                <div className="bg-[#121214] border border-[#2a2a2d] p-4.5 rounded-xl flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Automated Bill Cycles</span>
                    <span className="text-lg font-mono font-bold text-neutral-100 block">
                      {currentRecurringSchedules.length} active schedules
                    </span>
                    <button
                      id="db-btn-trigger-generation-man"
                      type="button"
                      onClick={handleTriggerManualSchedulesScan}
                      className="text-[10px] text-[#c5a059] hover:text-[#b08e4d] font-bold underline cursor-pointer text-left block"
                    >
                      Scan & Generate Missed Runs
                    </button>
                  </div>
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-yellow-950/25 text-[#c5a059]">
                    <RefreshCcw className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PURCHASE ORDERS MANAGER */}
        {activeTab === "Purchase Orders" && (
          <PurchasesManager
            purchaseOrders={currentPurchaseOrders}
            suppliers={suppliers}
            currentRole={currentRole}
            currentDateStr={CURRENT_DATE_STR}
            onAddPO={(po) => {
              const poWithBranch = { ...po, branch };
              setPurchaseOrders([poWithBranch, ...purchaseOrders]);
              if (supabaseLive) {
                dbUpsertPurchaseOrder(poWithBranch).catch((e) => console.error("Db PO save failed:", e));
              }
            }}
            onEditPO={(updatedPO) => {
              const poWithBranch = { ...updatedPO, branch: updatedPO.branch || branch };
              setPurchaseOrders(purchaseOrders.map(p => p.id === updatedPO.id ? poWithBranch : p));
              if (supabaseLive) {
                dbUpsertPurchaseOrder(poWithBranch).catch((e) => console.error("Db PO edit failed:", e));
              }
            }}
            onDeletePO={(id) => {
              setPurchaseOrders(purchaseOrders.filter(p => p.id !== id));
              if (supabaseLive) {
                dbDeletePurchaseOrder(id).catch((e) => console.error("Db PO delete failed:", e));
              }
            }}
            onInventoryUpdate={(itemName, count) => {
              handleInventoryIncrementFromGRN(itemName, count);
              if (supabaseLive) {
                const currentQty = (inventoryStock[branch] || {})[itemName] || 0;
                const finalQty = currentQty + count;
                dbSaveInventoryItem(`${branch}:${itemName}`, finalQty).catch(err => console.error("Db Inventory increment failed:", err));
              }
            }}
          />
        )}

        {/* TAB 3: SUPPLIERS ACCOUNT MANAGEMENT */}
        {activeTab === "Suppliers" && (
          <SupplierManager
            suppliers={suppliers}
            purchaseOrders={currentPurchaseOrders}
            currentRole={currentRole}
            onAddSupplier={(s) => {
              setSuppliers([s, ...suppliers]);
              if (supabaseLive) {
                dbUpsertSupplier(s).catch((e) => console.error("Db Supplier save failed:", e));
              }
            }}
            onEditSupplier={(updatedS) => {
              setSuppliers(suppliers.map(s => s.id === updatedS.id ? updatedS : s));
              if (supabaseLive) {
                dbUpsertSupplier(updatedS).catch((e) => console.error("Db Supplier edit failed:", e));
              }
            }}
            onDeleteSupplier={(id) => {
              setSuppliers(suppliers.filter(s => s.id !== id));
              if (supabaseLive) {
                dbDeleteSupplier(id).catch((e) => console.error("Db Supplier delete failed:", e));
              }
            }}
          />
        )}

        {/* TAB 4: RECURRING EXPENSES RULES MANAGER */}
        {activeTab === "Recurring Expenses" && (
          <RecurringExpensesManager
            schedules={currentRecurringSchedules}
            currentRole={currentRole}
            currentDateStr={CURRENT_DATE_STR}
            onAddSchedule={(sc) => {
              const scWithBranch = { ...sc, branch };
              setRecurringSchedules([scWithBranch, ...recurringSchedules]);
              if (supabaseLive) {
                dbUpsertRecurringSchedule(scWithBranch).catch((e) => console.error("Db Rec save failed:", e));
              }
              // Immediately check if this new schedule has runs due today
              setTimeout(() => {
                autoGenerateRecurrences();
              }, 100);
            }}
            onDeleteSchedule={(id) => {
              setRecurringSchedules(recurringSchedules.filter(s => s.id !== id));
              if (supabaseLive) {
                dbDeleteRecurringSchedule(id).catch((e) => console.error("Db Rec delete failed:", e));
              }
            }}
            onToggleScheduleStatus={(id) => {
              const refreshed = recurringSchedules.map(s => {
                if (s.id === id) {
                  return { ...s, status: s.status === "Active" ? "Paused" : "Active" as const };
                }
                return s;
              });
              setRecurringSchedules(refreshed);
              
              const changed = refreshed.find(s => s.id === id);
              if (supabaseLive && changed) {
                dbUpsertRecurringSchedule(changed).catch((e) => console.error("Db Rec toggle failed:", e));
              }
            }}
            onTriggerAutoGeneration={handleTriggerManualSchedulesScan}
            generatedCountSinceBoot={generatedCountSinceBoot}
          />
        )}

        {/* TAB 5: DIRECT EXPENSE LEDGER */}
        {activeTab === "Expense Ledger" && (
          <div className="space-y-6">

            {/* Sub Header for original ledger view */}
            <div className="flex flex-col sm:flex-row items-baseline sm:items-center justify-between border-b border-[#2a2a2d] pb-4 gap-2">
              <div>
                <h2 className="text-xl font-light tracking-wide uppercase font-serif">
                  Direct Ledger <span className="text-[#c5a059] italic font-semibold">& OCR Invoices</span>
                </h2>
                <p className="text-xs text-neutral-400 font-light mt-0.5">
                  Browse immediate restaurant operational costs, scan raw receipts, and adjust metadata
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentRole === "Owner" && (
                  <>
                    <button
                      id="ledger-btn-csv"
                      type="button"
                      onClick={handleExportCSV}
                      className="px-3 py-2 text-xs font-semibold text-neutral-350 bg-[#121214] border border-[#2a2a2d] hover:bg-[#1a1a1c] hover:border-[#c5a059]/45 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-[#c5a059]" /> Export CSV
                    </button>
                    <button
                      id="ledger-btn-pdf"
                      type="button"
                      onClick={handlePrintPDF}
                      className="px-3 py-2 text-xs font-semibold text-neutral-350 bg-[#121214] border border-[#2a2a2d] hover:bg-[#1a1a1c] hover:border-[#c5a059]/45 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="h-4 w-4 text-[#c5a059]" /> Print PDF
                    </button>
                  </>
                )}

                <button
                  id="ledger-btn-add-record"
                  type="button"
                  onClick={handleOpenAddModal}
                  className="bg-[#c5a059] hover:bg-[#b08e4d] text-[#0a0a0b] font-bold px-4 py-2 rounded-lg text-xs tracking-wide shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Log Direct Expense
                </button>
              </div>
            </div>

            {/* Split layout: Direct list vs. receipt scanner tool */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Expense Ledger Records Left Column list */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Advanced filter triggers */}
                <ExpenseFilters
                  filters={ledgerFilters}
                  onFilterChange={setLedgerFilters}
                  onClearFilters={handleClearFilters}
                  suppliersList={uniqueSuppliers}
                />

                {/* Records Table ledger presentation */}
                <div className="bg-[#121214] rounded-xl border border-[#2a2a2d] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#1a1a1c] border-b border-[#2a2a2d] text-neutral-450 font-semibold uppercase tracking-widest text-[10px]">
                          <th className="px-4 py-3 w-8"></th>
                          <th className="px-4 py-3">Remittance Date</th>
                          <th className="px-4 py-3">Payee / Supplier</th>
                          <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                          <th className="px-4 py-3 hidden md:table-cell">Method</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-center w-24">Ops</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[#2a2a2d] text-neutral-300 font-mono">
                        {paginatedExpenses.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-12 text-center bg-[#121214]">
                              <Receipt className="h-8 w-8 text-[#c5a059] mx-auto mb-2 animate-pulse" />
                              <p className="text-sm font-light text-neutral-200">No operational expenditures meet active criteria</p>
                              <p className="text-xs text-neutral-500 mt-1">Adjust direct search words filters or record fresh ledger items.</p>
                            </td>
                          </tr>
                        ) : (
                          paginatedExpenses.map((exp) => {
                            const hasItems = exp.items && exp.items.length > 0;
                            const isExpanded = !!expandedRowIds[exp.id];

                            return (
                              <React.Fragment key={exp.id}>
                                <tr
                                  id={`expense-row-${exp.id}`}
                                  className="hover:bg-[#1a1a1c]/60 cursor-pointer group leading-normal transition-colors text-xs text-neutral-300 font-sans"
                                  onClick={() => toggleRowExpansion(exp.id)}
                                >
                                  {/* Expand trigger */}
                                  <td className="px-4 py-3 text-center">
                                    {hasItems ? (
                                      isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-neutral-500" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-neutral-500" />
                                      )
                                    ) : (
                                      <span className="h-1.5 w-1.5 bg-[#2a2a2d] rounded-full inline-block" />
                                    )}
                                  </td>

                                  {/* Date */}
                                  <td className="px-4 py-3 font-mono text-neutral-400">
                                    {exp.expenseDate}
                                  </td>

                                  {/* Supplier Detail */}
                                  <td className="px-4 py-3 font-medium">
                                    <span className="block text-neutral-200 font-semibold truncate group-hover:text-[#c5a059]">
                                      {exp.supplier}
                                    </span>
                                    {exp.description && (
                                      <span className="block text-[10px] text-neutral-550 truncate mt-0.5">
                                        {exp.description}
                                      </span>
                                    )}
                                  </td>

                                  {/* Category */}
                                  <td className="px-4 py-3 hidden sm:table-cell">
                                    <span className="inline-block bg-[#1a1a1c] border border-[#2a2a2d] px-2 py-0.5 text-[10px] rounded text-neutral-350">
                                      {exp.category}
                                    </span>
                                  </td>

                                  {/* Payment method */}
                                  <td className="px-4 py-3 hidden md:table-cell text-neutral-400 font-mono">
                                    {exp.paymentMethod}
                                  </td>

                                  {/* Cost */}
                                  <td className="px-4 py-3 text-end font-bold text-[#c5a059] font-mono whitespace-nowrap">
                                    ${exp.amount.toFixed(2)}
                                  </td>

                                  {/* Controls */}
                                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-center gap-1">
                                      {(currentRole === "Owner" || currentRole === "Manager") && (
                                        <button
                                          id={`edit-ledger-row-${exp.id}`}
                                          type="button"
                                          onClick={() => {
                                            setExpenseToEdit(exp);
                                            setScannedData(null);
                                            setIsModalOpen(true);
                                          }}
                                          className="p-1 rounded bg-[#1a1a1c] border border-[#2a2a2d] text-neutral-400 hover:text-white cursor-pointer"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                        </button>
                                      )}

                                      {currentRole === "Owner" && (
                                        <button
                                          id={`del-ledger-row-${exp.id}`}
                                          type="button"
                                          onClick={(e) => handleDeleteExpense(exp.id, e)}
                                          className="p-1 rounded bg-[#1a1a1c] border border-red-950 text-neutral-400 hover:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {/* Sub Item Rows list when detail expanded */}
                                {isExpanded && hasItems && (
                                  <tr className="bg-[#1a1a1c]/35">
                                    <td colSpan={7} className="px-4 py-3.5 border-t border-[#2a2a2d]">
                                      <div className="p-4 bg-[#121214] border border-[#2a2a2d] rounded-xl shadow-xs space-y-3.5 max-w-2xl font-mono text-[10.5px]">
                                        <div className="flex items-center justify-between border-b border-[#222224] pb-1.5">
                                          <span className="font-sans font-bold uppercase tracking-widest text-[9.5px] text-[#c5a059] flex items-center gap-1.5">
                                            <FileText className="h-3.5 w-3.5 text-[#c5a059]" /> Registered Itemization supply
                                          </span>
                                          <span className="text-[10px] text-neutral-500">Payee: {exp.supplier}</span>
                                        </div>

                                        <table className="min-w-full text-left">
                                          <thead>
                                            <tr className="text-neutral-550 border-b border-[#222224] font-bold uppercase text-[9px]">
                                              <th className="py-1">Supply Row Name</th>
                                              <th className="py-1 text-center">Qty</th>
                                              <th className="py-1 text-right">Unit Price</th>
                                              <th className="py-1 text-right">Total Line</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-[#222224]/50 text-neutral-300">
                                            {exp.items?.map((item) => (
                                              <tr key={item.id}>
                                                <td className="py-2 text-neutral-250 font-sans font-medium">{item.itemName}</td>
                                                <td className="py-2 text-center text-neutral-450">{item.quantity}</td>
                                                <td className="py-2 text-right text-neutral-450">${item.unitPrice.toFixed(2)}</td>
                                                <td className="py-2 text-right text-[#c5a059] font-bold">${item.totalCost.toFixed(2)}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>

                                        {exp.notes && (
                                          <div className="bg-[#1a1a1c]/60 p-2.5 rounded border border-[#2a2a2d]/50 text-[10px] font-sans text-neutral-400 font-light italic">
                                            <strong className="text-neutral-400 font-semibold font-sans">Kitchen review note:</strong> "{exp.notes}"
                                          </div>
                                        )}
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

                  {/* Table Pagination Footer block */}
                  {totalPages > 1 && (
                    <div className="p-4 bg-[#1a1a1c] border-t border-[#2a2a2d] text-xs flex items-center justify-between text-neutral-400 print:hidden font-mono">
                      <span>
                        Page <strong>{ledgerCurrentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} records matching)
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          id="ledger-prev-page"
                          type="button"
                          disabled={ledgerCurrentPage === 1}
                          onClick={() => setLedgerCurrentPage(ledgerCurrentPage - 1)}
                          className="p-1 bg-[#121214] border border-[#2a2a2d] rounded hover:bg-[#1a1a1c] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-neutral-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          id="ledger-next-page"
                          type="button"
                          disabled={ledgerCurrentPage === totalPages}
                          onClick={() => setLedgerCurrentPage(ledgerCurrentPage + 1)}
                          className="p-1 bg-[#121214] border border-[#2a2a2d] rounded hover:bg-[#1a1a1c] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed text-neutral-200"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Receipt OCR Upload Panel Right Component */}
              <div className="space-y-6">
                <ReceiptScanner onScanComplete={handleScanReceiptComplete} />

                {/* Specification card */}
                <div className="bg-[#121214] border border-[#2a2a2d] rounded-xl p-5 shadow-sm text-[#e0e0e2]">
                  <span className="text-[10px] font-bold text-[#c5a059] uppercase tracking-widest block mb-0.5">
                    Module 7 ERP Specifications
                  </span>
                  <h3 className="font-light text-xs text-neutral-400 border-b border-[#222224] pb-2 mb-3 uppercase tracking-wider">
                    Automatic Ledger Rule Validation
                  </h3>
                  <div className="space-y-3.5 text-[11px] text-neutral-400 leading-relaxed font-light">
                    <p>
                      Direct ledger items represent instant cash / bank card outlays recorded on the spot. For scheduled agreements, lease structures, and recurring bills, please use the <strong className="text-neutral-300">Recurring Contracts</strong> panel to configure automated date rules.
                    </p>
                    <p>
                      Any itemized material delivered into the main inventory kitchen stock is cataloged safely under the <strong className="text-neutral-300">Purchase Orders (POs)</strong> segment.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* RENDER EDIT / CREATE DIRECT EXPENSE MODAL */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpenseToEdit(null);
          setScannedData(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
        scannedData={scannedData}
      />

      {/* RENDER SUPABASE DIAGNOSTICS & SYNC MODULE SUITE MODAL */}
      <SupabaseSuite
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        supabaseLive={supabaseLive}
        supabaseError={supabaseError}
        supabaseSyncing={supabaseSyncing}
        onRetrySync={handleSupabaseSync}
        localBackupStats={{
          expensesCount: expenses.length,
          suppliersCount: suppliers.length,
          posCount: purchaseOrders.length,
          schedulesCount: recurringSchedules.length
        }}
      />

    </div>
  );
}
