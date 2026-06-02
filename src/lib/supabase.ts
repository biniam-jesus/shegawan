import { createClient } from "@supabase/supabase-js";
import { Expense, Supplier, PurchaseOrder, RecurringExpense } from "../types";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if client-side environmental configurations are present and valid
export const isSupabaseConfigured = (): boolean => {
  try {
    const isUrlValid = typeof supabaseUrl === "string" && 
      (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"));
    const isKeyValid = typeof supabaseAnonKey === "string" && supabaseAnonKey.trim().length > 10;
    
    return !!(isUrlValid && 
            isKeyValid && 
            supabaseUrl !== "YOUR_SUPABASE_URL" && 
            supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY");
  } catch (e) {
    return false;
  }
};

// Initialise the client if variables exist with extreme defensive safety
export const supabase = (() => {
  if (isSupabaseConfigured()) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch (err) {
      console.error("Critical: Failed to initialize Supabase client safely:", err);
      return null;
    }
  }
  return null;
})();

// ==================== EXPENSES (LEDGER) ====================

export const dbFetchExpenses = async (): Promise<Expense[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expenseDate", { ascending: false });

  if (error) {
    console.error("Error fetching expenses from Supabase:", error);
    throw error;
  }
  return (data || []) as Expense[];
};

export const dbUpsertExpense = async (expense: Expense): Promise<Expense> => {
  if (!supabase) return expense;
  const { data, error } = await supabase
    .from("expenses")
    .upsert(expense)
    .select()
    .single();

  if (error) {
    console.error("Error saving expense to Supabase:", error);
    throw error;
  }
  return data as Expense;
};

export const dbDeleteExpense = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting expense from Supabase:", error);
    throw error;
  }
};

// ==================== SUPPLIERS ====================

export const dbFetchSuppliers = async (): Promise<Supplier[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching suppliers from Supabase:", error);
    throw error;
  }
  return (data || []) as Supplier[];
};

export const dbUpsertSupplier = async (supplier: Supplier): Promise<Supplier> => {
  if (!supabase) return supplier;
  const { data, error } = await supabase
    .from("suppliers")
    .upsert(supplier)
    .select()
    .single();

  if (error) {
    console.error("Error saving supplier to Supabase:", error);
    throw error;
  }
  return data as Supplier;
};

export const dbDeleteSupplier = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting supplier from Supabase:", error);
    throw error;
  }
};

// ==================== PURCHASE ORDERS ====================

export const dbFetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("purchaseDate", { ascending: false });

  if (error) {
    console.error("Error fetching purchase orders from Supabase:", error);
    throw error;
  }
  return (data || []) as PurchaseOrder[];
};

export const dbUpsertPurchaseOrder = async (po: PurchaseOrder): Promise<PurchaseOrder> => {
  if (!supabase) return po;
  const { data, error } = await supabase
    .from("purchase_orders")
    .upsert(po)
    .select()
    .single();

  if (error) {
    console.error("Error saving purchase order to Supabase:", error);
    throw error;
  }
  return data as PurchaseOrder;
};

export const dbDeletePurchaseOrder = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from("purchase_orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting purchase order from Supabase:", error);
    throw error;
  }
};

// ==================== RECURRING SCHEDULES ====================

export const dbFetchRecurringSchedules = async (): Promise<RecurringExpense[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("recurring_expenses")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching recurring schedules from Supabase:", error);
    throw error;
  }
  return (data || []) as RecurringExpense[];
};

export const dbUpsertRecurringSchedule = async (schedule: RecurringExpense): Promise<RecurringExpense> => {
  if (!supabase) return schedule;
  const { data, error } = await supabase
    .from("recurring_expenses")
    .upsert(schedule)
    .select()
    .single();

  if (error) {
    console.error("Error saving recurring schedule to Supabase:", error);
    throw error;
  }
  return data as RecurringExpense;
};

export const dbDeleteRecurringSchedule = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from("recurring_expenses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting recurring schedule from Supabase:", error);
    throw error;
  }
};

// ==================== INVENTORY ====================

export interface DbInventoryRow {
  key: string;
  quantity: number;
}

export const dbFetchInventory = async (): Promise<Record<string, number>> => {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("inventory_stock")
    .select("*");

  if (error) {
    console.error("Error fetching inventory stock from Supabase:", error);
    throw error;
  }

  const stock: Record<string, number> = {};
  if (data) {
    data.forEach((row: DbInventoryRow) => {
      stock[row.key] = row.quantity;
    });
  }
  return stock;
};

export const dbSaveInventoryItem = async (key: string, quantity: number): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from("inventory_stock")
    .upsert({ key, quantity })
    .select();

  if (error) {
    console.error("Error saving inventory item to Supabase:", error);
    throw error;
  }
};

export const dbSaveAllInventory = async (stock: Record<string, number>): Promise<void> => {
  if (!supabase) return;
  const rows = Object.entries(stock).map(([key, quantity]) => ({ key, quantity }));
  const { error } = await supabase
    .from("inventory_stock")
    .upsert(rows);

  if (error) {
    console.error("Error saving batch inventory to Supabase:", error);
    throw error;
  }
};
