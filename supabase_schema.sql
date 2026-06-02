-- ==========================================
-- EPICUREAN RESTAURANT ERP - SUPABASE SCHEMA
-- ==========================================
-- Copy and paste this script into your Supabase SQL Editor
-- to instantly configure the backend database.

-- 1. EXTENSIONS
-- Required if using uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TABLE: SUPPLIERS
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "contactPerson" TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    "paymentTerms" TEXT
);

-- 3. CREATE TABLE: PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    "poNumber" TEXT NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "supplierId" TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    "supplierName" TEXT NOT NULL,
    category TEXT NOT NULL,
    "totalAmount" NUMERIC NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL,
    "paidStatus" TEXT NOT NULL,
    "paidAmount" NUMERIC NOT NULL DEFAULT 0.00,
    notes TEXT,
    "createdBy" TEXT NOT NULL,
    "receiptUrl" TEXT,
    "paymentTerms" TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    grns JSONB NOT NULL DEFAULT '[]'::jsonb,
    branch TEXT DEFAULT 'Shegawan',
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- 4. CREATE TABLE: RECURRING EXPENSES
CREATE TABLE IF NOT EXISTS recurring_expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "lastGeneratedDate" TEXT,
    supplier TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    branch TEXT DEFAULT 'Shegawan',
    "createdAt" TEXT NOT NULL
);

-- 5. CREATE TABLE: GENERAL EXPENSES (DIRECT LEDGER)
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    "expenseDate" TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0.00,
    "paymentMethod" TEXT NOT NULL,
    supplier TEXT NOT NULL,
    "receiptUrl" TEXT,
    notes TEXT,
    "createdBy" TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    branch TEXT DEFAULT 'Shegawan',
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT NOT NULL
);

-- 6. CREATE TABLE: LIVE INVENTORY STOCKPILE
CREATE TABLE IF NOT EXISTS inventory_stock (
    key TEXT PRIMARY KEY,
    quantity NUMERIC NOT NULL DEFAULT 0
);

-- ========================================================
-- ROW-LEVEL SECURITY & POLICIES (OPTIONAL)
-- ========================================================
-- By default, for ease of demo, we enable RLS but allow 
-- select/insert/update/delete for authenticated + anonymous keys.
-- You can specify precise user access control depending on your requirements.

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;

-- Suppliers Policies
DROP POLICY IF EXISTS "Allow public select suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public delete suppliers" ON suppliers;
CREATE POLICY "Allow public select suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert suppliers" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update suppliers" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete suppliers" ON suppliers FOR DELETE USING (true);

-- Purchase Orders Policies
DROP POLICY IF EXISTS "Allow public select purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public insert purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public update purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public delete purchase_orders" ON purchase_orders;
CREATE POLICY "Allow public select purchase_orders" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert purchase_orders" ON purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update purchase_orders" ON purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete purchase_orders" ON purchase_orders FOR DELETE USING (true);

-- Recurring Expenses Policies
DROP POLICY IF EXISTS "Allow public select recurring_expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Allow public insert recurring_expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Allow public update recurring_expenses" ON recurring_expenses;
DROP POLICY IF EXISTS "Allow public delete recurring_expenses" ON recurring_expenses;
CREATE POLICY "Allow public select recurring_expenses" ON recurring_expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert recurring_expenses" ON recurring_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update recurring_expenses" ON recurring_expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete recurring_expenses" ON recurring_expenses FOR DELETE USING (true);

-- Expenses Policies
DROP POLICY IF EXISTS "Allow public select expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public insert expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public update expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public delete expenses" ON expenses;
CREATE POLICY "Allow public select expenses" ON expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert expenses" ON expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update expenses" ON expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete expenses" ON expenses FOR DELETE USING (true);

-- Inventory Stock Policies
DROP POLICY IF EXISTS "Allow public select inventory_stock" ON inventory_stock;
DROP POLICY IF EXISTS "Allow public insert inventory_stock" ON inventory_stock;
DROP POLICY IF EXISTS "Allow public update inventory_stock" ON inventory_stock;
DROP POLICY IF EXISTS "Allow public delete inventory_stock" ON inventory_stock;
CREATE POLICY "Allow public select inventory_stock" ON inventory_stock FOR SELECT USING (true);
CREATE POLICY "Allow public insert inventory_stock" ON inventory_stock FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update inventory_stock" ON inventory_stock FOR UPDATE USING (true);
CREATE POLICY "Allow public delete inventory_stock" ON inventory_stock FOR DELETE USING (true);

-- ========================================================
-- INJECT DEFAULT DATA FOR BOOTSTRAP DEMO
-- ========================================================

INSERT INTO suppliers (id, name, "contactPerson", phone, email, address, "paymentTerms") VALUES
('sup-1', 'Port Side Seafoods Inc.', 'Marcus Aurelius', '+1 (555) 430-1092', 'shipping@portsideseafood.com', 'Pier 14, Warehousing Bay 3, Seattle WA', 'Net 15'),
('sup-2', 'Fresh Farms Food Service Inc.', 'Demeter Fields', '+1 (555) 234-9483', 'invoices@freshfarms.org', '209 Valley Harvest Road, Yakima WA', 'Net 30'),
('sup-3', 'PowerGrid Electricity Co.', 'Tesla Watt', '+1 (555) 902-1234', 'commercial@powergrid.co', '10 Main Power Grid Station, Portland OR', 'Cash / COD'),
('sup-4', 'Metropolis Cleaners Outlet', 'Diana Prince', '+1 (555) 789-3210', 'cleanteam@metropolisoutlet.com', '80 Metropolis Corporate Blv, Seattle WA', 'Net 30'),
('sup-5', 'Pro Chef Kitchen Tech LLC', 'Gordon Ramsey', '+1 (555) 304-4052', 'orders@prochefkitchen.com', '99 Culinary Heights Parkway, San Francisco CA', 'Net 30')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory_stock (key, quantity) VALUES
-- Shegawan Branch Keys
('Shegawan:Fresh Pacific Salmon (lbs)', 140),
('Shegawan:Atlantic Cod (lbs)', 90),
('Shegawan:Organic Roma Tomatoes (case)', 35),
('Shegawan:Crisp Romaine Lettuce (case)', 28),
('Shegawan:High Carbon Chef Knife 8-inch', 5),
('Shegawan:Whetstone Dual Grit File', 3),
-- Teyemshega Branch Keys
('Teyemshega:Fresh Pacific Salmon (lbs)', 140),
('Teyemshega:Atlantic Cod (lbs)', 90),
('Teyemshega:Organic Roma Tomatoes (case)', 35),
('Teyemshega:Crisp Romaine Lettuce (case)', 28),
('Teyemshega:High Carbon Chef Knife 8-inch', 5),
('Teyemshega:Whetstone Dual Grit File', 3)
ON CONFLICT (key) DO NOTHING;
