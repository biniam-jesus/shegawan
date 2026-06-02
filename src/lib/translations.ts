export type Language = "en" | "am";

export interface TranslationDict {
  // App Header
  appName: string;
  appSubName: string;
  selectLanguage: string;
  roleLabel: string;
  simulatedView: string;
  roleOwner: string;
  roleManager: string;
  roleStoreKeeper: string;
  roleAccountant: string;
  roleStaff: string;
  supabaseStatusConnected: string;
  supabaseStatusError: string;
  supabaseNotConfigured: string;
  branchLabel: string;
  branchShegawan: string;
  branchTeyemshega: string;

  // Navigation Tabs
  tabDashboard: string;
  tabPurchaseOrders: string;
  tabSuppliers: string;
  tabRecurringExpenses: string;
  tabExpenseLedger: string;

  // General Actions
  addExpense: string;
  addSupplier: string;
  createPO: string;
  addSchedule: string;
  edit: string;
  delete: string;
  cancel: string;
  save: string;
  submit: string;
  loading: string;
  search: string;
  filter: string;
  clearFilters: string;
  exportCSV: string;
  print: string;
  refresh: string;
  actions: string;
  status: string;

  // Auth / Login System
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  loginButton: string;
  signupButton: string;
  logoutButton: string;
  noAccount: string;
  haveAccount: string;
  continueOfflineDesc: string;
  continueOfflineButton: string;
  authErrorTitle: string;
  authSuccessTitle: string;
  authStatusConnected: string;
  authStatusOffline: string;
  authRoleRequired: string;
  roleSelectDesc: string;

  // Dashboard Stats
  statsToday: string;
  statsThisWeek: string;
  statsThisMonth: string;
  statsThisYear: string;
  vsYesterday: string;
  vsLastWeek: string;
  vsLastMonth: string;
  vsLastYear: string;
  financialPerformance: string;
  directLedgerBreakdown: string;
  procurementFulfillment: string;
  inventoryWarnings: string;
  totalSpent: string;

  // Ledger / Expenses
  expenseDate: string;
  category: string;
  description: string;
  amount: string;
  paymentMethod: string;
  supplier: string;
  actionsCol: string;
  addExpenseTitle: string;
  editExpenseTitle: string;
  receiptScanner: string;
  scanReceiptDesc: string;
  uploading: string;
  itemsDetails: string;
  notes: string;
  createdBy: string;

  // Suppliers
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms: string;
  suppliersList: string;

  // Purchase Orders
  poNumber: string;
  poDate: string;
  totalAmount: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  paidAmount: string;
  itemsOrdered: string;
  grnLogs: string;
  receiveItems: string;
  approve: string;
  received: string;
  cancelled: string;
  pending: string;
  partial: string;
  paid: string;
  unpaid: string;

  // Recurring Expenses
  frequency: string;
  startDate: string;
  endDate: string;
  lastGenerated: string;
  nextRun: string;
  active: string;
  paused: string;
  completed: string;
  triggerScan: string;
  scanResult: string;

  // Inventory
  inventoryStock: string;
  currentStock: string;
  replenishWarn: string;
  stockLevel: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    appName: "Epicurean",
    appSubName: "Restaurant Enterprise ERP",
    selectLanguage: "Language / ቋንቋ",
    roleLabel: "Security Role",
    simulatedView: "Simulated View Level",
    roleOwner: "Owner (Full Admin)",
    roleManager: "Operational Manager",
    roleStoreKeeper: "Store Keeper",
    roleAccountant: "Accountant (Finance)",
    roleStaff: "Kitchen Staff (Read-Only)",
    supabaseStatusConnected: "SUPABASE: LIVE CONNECTED",
    supabaseStatusError: "SUPABASE: CONNECTION ERROR",
    supabaseNotConfigured: "SUPABASE: LOCAL SANDBOX MODE",
    branchLabel: "Active Restaurant Branch",
    branchShegawan: "Shegawan Branch (ሸጋዋን)",
    branchTeyemshega: "Teyemshega Branch (ጠየምሸጋ)",

    tabDashboard: "Dashboard",
    tabPurchaseOrders: "Purchase Orders",
    tabSuppliers: "Suppliers",
    tabRecurringExpenses: "Recurring",
    tabExpenseLedger: "Expense Ledger",

    addExpense: "Add Direct Expense",
    addSupplier: "Register New Supplier",
    createPO: "Create Purchase Order",
    addSchedule: "Add Recurrence Schedule",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    save: "Save Changes",
    submit: "Submit",
    loading: "Processing...",
    search: "Search description, supplier, or items...",
    filter: "Filter",
    clearFilters: "Clear All",
    exportCSV: "Export CSV Ledger",
    print: "Print Report",
    refresh: "Trigger Scan",
    actions: "Actions",
    status: "Status",

    loginTitle: "Epicurean ERP Secure Access",
    loginSubtitle: "Sign in with your credentials to sync with cloud databases",
    emailLabel: "Email Address",
    passwordLabel: "Password (min 6 characters)",
    loginButton: "Sign In",
    signupButton: "Create Account",
    logoutButton: "Secure Log Out",
    noAccount: "Need a centralized database?",
    haveAccount: "Already have an account?",
    continueOfflineDesc: "Want to try locally in sandbox mode first?",
    continueOfflineButton: "Continue Sandbox Offline Mode",
    authErrorTitle: "Authentication Error",
    authSuccessTitle: "Authentication Successful",
    authStatusConnected: "Cloud Sync Active",
    authStatusOffline: "Sandbox Sandbox Active",
    authRoleRequired: "Before proceeding, select your functional role:",
    roleSelectDesc: "This dictates your permission level for invoices, POs, and stock controls.",

    statsToday: "Purchased Today",
    statsThisWeek: "This Week's Spends",
    statsThisMonth: "Monthly Invoice Vol",
    statsThisYear: "Annual Operating Cost",
    vsYesterday: "vs. yesterday",
    vsLastWeek: "vs. last week",
    vsLastMonth: "vs. last month",
    vsLastYear: "vs. last year",
    financialPerformance: "Operating Cost Analysis",
    directLedgerBreakdown: "Direct Expense Ledger Categories",
    procurementFulfillment: "Procurement Fulfillment & Receivables",
    inventoryWarnings: "Low Stock Inventory Warnings",
    totalSpent: "Total Ledger Expenditure",

    expenseDate: "Date",
    category: "Expense Category",
    description: "Transaction Description",
    amount: "Amount ($)",
    paymentMethod: "Payment Method",
    supplier: "Partner Supplier",
    actionsCol: "Actions",
    addExpenseTitle: "Log Direct Expense Ledger Entry",
    editExpenseTitle: "Modify Expense Ledger Reference",
    receiptScanner: "Valkyrie Receipt AI & OCR Doc Reader",
    scanReceiptDesc: "Drag-and-drop or select receipt image. Automatically extract values, vendor name, line items, and taxes.",
    uploading: "Uploading and scanning receipt details...",
    itemsDetails: "Parsed Itemized Details List",
    notes: "Internal Operational Memo",
    createdBy: "By User",

    supplierName: "Supplier Name",
    contactPerson: "Account Representative",
    phone: "Direct Phone",
    email: "Corporate Email Address",
    address: "Wholesale Facility Address",
    paymentTerms: "Agreed Payment Terms",
    suppliersList: "Supplier Agency Directory",

    poNumber: "PO Reference",
    poDate: "Issue Date",
    totalAmount: "Gross Amount",
    fulfillmentStatus: "Fulfillment Status",
    paymentStatus: "Invoice Payment Status",
    paidAmount: "Paid Amount ($)",
    itemsOrdered: "Items Ordered & Unit Calculations",
    grnLogs: "Goods Received Notes (GRN) Logs",
    receiveItems: "Accept Shipping Delivery",
    approve: "Approve Order",
    received: "Fulfillment Success",
    cancelled: "Voided",
    pending: "Awaiting Action",
    partial: "Partial Shipping",
    paid: "Fully Remitted",
    unpaid: "Awaiting Remittance",

    frequency: "Generation Interval",
    startDate: "Commencement Date",
    endDate: "Termination Date",
    lastGenerated: "Last Automated Run",
    nextRun: "Next Evaluation Due",
    active: "Active Cycle",
    paused: "Temporarily Paused",
    completed: "Contract Finished",
    triggerScan: "Scan Pending Recurrences",
    scanResult: "No pending recurrences detected for the active system anchor.",

    inventoryStock: "Inventory Storage Room Tracker",
    currentStock: "Current Available Stock",
    replenishWarn: "Needs Replenishment",
    stockLevel: "Real-Time Stockpile Level",
  },
  am: {
    appName: "ኤፒኩሪያን",
    appSubName: "የሬስቶራንት ኢንተርፕራይዝ የሥራ መሪ (ERP)",
    selectLanguage: "ቋንቋ / Language",
    roleLabel: "የደህንነት ሚና",
    simulatedView: "የሚታየው የፍቃድ ደረጃ",
    roleOwner: "ባለቤት (ሙሉ አስተዳዳሪ)",
    roleManager: "ሥራ አስኪያጅ (ኦፕሬሽንስ)",
    roleStoreKeeper: "መጋዘን ጠባቂ (ዕቃ ሹም)",
    roleAccountant: "የሒሳብ ባለሙያ (ፋይናንስ)",
    roleStaff: "የኩሽና ሠራተኛ (ንባብ ብቻ)",
    supabaseStatusConnected: "ሱፓቤዝ፡ ቀጥታ ተገናኝቷል",
    supabaseStatusError: "ሱፓቤዝ፡ የግንኙነት ስህተት",
    supabaseNotConfigured: "ሱፓቤዝ፡ ከመስመር ውጪ (የሙከራ ሁነታ)",
    branchLabel: "ገባሪ የሬስቶራንት ቅርንጫፍ",
    branchShegawan: "ሸጋዋን ቅርንጫፍ (Shegawan)",
    branchTeyemshega: "ጠየምሸጋ ቅርንጫፍ (Teyemshega)",

    tabDashboard: "ዳሽቦርድ ማጠቃለያ",
    tabPurchaseOrders: "የግዢ ትዕዛዞች",
    tabSuppliers: "አቅራቢዎች",
    tabRecurringExpenses: "ተደጋጋሚ ወጪዎች",
    tabExpenseLedger: "የወጪ መዝገብ Ledger",

    addExpense: "ቀጥታ ወጪ መዝግብ",
    addSupplier: "አዲስ አቅራቢ መዝግብ",
    createPO: "የግዢ ትዕዛዝ ፍጠር",
    addSchedule: "ተደጋጋሚ መርሃ-ግብር ጨምር",
    edit: "አሻሽል",
    delete: "ሰርዝ",
    cancel: "ሰርዝ",
    save: "ለውጦችን አስቀምጥ",
    submit: "አስገባ",
    loading: "በማቀነባበር ላይ...",
    search: "መግለጫ፣ አቅራቢ ወይም ዕቃዎች ፈልግ...",
    filter: "አጣራ",
    clearFilters: "ሁሉንም አጽዳ",
    exportCSV: "የወጪ መዝገብ (CSV) አውርድ",
    print: "ሪፖርት አትም",
    refresh: "የተደጋጋሚ ቅኝት",
    actions: "ተግባራት",
    status: "ደረጃ",

    loginTitle: "የኤፒኩሪያን ERP ደህንነቱ የተጠበቀ መዳረሻ",
    loginSubtitle: "ከደመና ዳታቤዝ ጋር ለማመሳሰል ምስክርነቶችዎን ያስገቡ",
    emailLabel: "የኢሜይል አድራሻ",
    passwordLabel: "የይለፍ ቃል (ቢያንስ 6 ቁምፊዎች)",
    loginButton: "ይግቡ",
    signupButton: "አዲስ አካውንት ፍጠሩ",
    logoutButton: "በደህና ውጡ",
    noAccount: "ማዕከላዊ የደመና ዳታቤዝ ይፈልጋሉ?",
    haveAccount: "ቀድሞውኑ አካውንት አለዎት?",
    continueOfflineDesc: "ቅድሚያ ያለ ስምምነት በሙከራ ማስመሪያ መሥራት ይፈልጋሉ?",
    continueOfflineButton: "ያለክፍያ በሙከራ ሁነታ ቀጥል",
    authErrorTitle: "የመግቢያ ስህተት",
    authSuccessTitle: "መግባት ተሳክቷል",
    authStatusConnected: "የደመና ማመሳሰል ገባሪ ነው",
    authStatusOffline: "የአካባቢ ሙከራ ሁነታ ገባሪ ነው",
    authRoleRequired: "ከመቀጠልዎ በፊት የሥራ ድርሻዎን (ሚና) ይምረጡ፡",
    roleSelectDesc: "ይህ በደረሰኞች፣ በግዢ ትዕዛዞች እና በክምችት ቁጥጥሮች ላይ ያለዎትን የፍቃድ ደረጃ ይወስናል።",

    statsToday: "ዛሬ የተገዛ",
    statsThisWeek: "የዚህ ሳምንት ወጪ",
    statsThisMonth: "የወር ደረሰኞች ድምር",
    statsThisYear: "የዓመት የሥራ ማስኬጃ ወጪ",
    vsYesterday: "ከትንላንት አንጻር",
    vsLastWeek: "ከባለፈው ሳምንት አንጻር",
    vsLastMonth: "ከባለፈው ወር አንጻር",
    vsLastYear: "ከአምናው አንጻር",
    financialPerformance: "የሥራ ማስኬጃ ወጪዎች ትንተና",
    directLedgerBreakdown: "የቀጥታ ወጪ መዝገብ ምድቦች",
    procurementFulfillment: "የግዥ አቅርቦት እና ተቀባይነት ማረጋገጫ",
    inventoryWarnings: "የክምችት መጠን ማስጠንቀቂያ (ያለቀባቸው እቃዎች)",
    totalSpent: "ጠቅላላ የወጪ መዝገብ ወጪ",

    expenseDate: "ቀን",
    category: "የወጪ ምድብ",
    description: "የግብይት መግለጫ",
    amount: "መጠን ($ or Birr)",
    paymentMethod: "የክፍያ ሁኔታ",
    supplier: "አጋር አቅራቢ",
    actionsCol: "ድርጊቶች",
    addExpenseTitle: "ቀጥታ የወጪ መዝገብ ግቤት መዝግብ",
    editExpenseTitle: "የወጪ መዝገብ ማጣቀሻን ያሻሽሉ",
    receiptScanner: "ቫልኪሪ Receipt AI እና የሰነድ አንባቢ",
    scanReceiptDesc: "የደረሰኝ ምስል ይጎትቱ ወይም ይምረጡ። ዋጋዎችን፣ የአቅራቢ ስሞችን፣ የዕቃዎች ዝርዝር እና ታክስን በራስ-ሰር ያወጣል።",
    uploading: "የደረሰኝ ዝርዝሮችን በመጫን እና በመቃኘት ላይ...",
    itemsDetails: "የዕቃዎች ዝርዝር መግለጫ",
    notes: "የውስጥ የሥራ ማስታወሻ",
    createdBy: "በተጠቃሚው",

    supplierName: "የአቅራቢው ስም",
    contactPerson: "የአካውንት ተወካይ (ተጠሪ)",
    phone: "ቀጥታ ስልክ",
    email: "የድርጅት ኢሜይል አድራሻ",
    address: "የጅምላ ዕቃዎች መጋዘን አድራሻ",
    paymentTerms: "የተስማሙ የክፍያ ውሎች",
    suppliersList: "የአቅራቢዎች ወኪል ማውጫ",

    poNumber: "የግዢ ትዕዛዝ ኮድ (PO)",
    poDate: "የተሰጠበት ቀን",
    totalAmount: "አጠቃላይ መጠን",
    fulfillmentStatus: "የአቅርቦት ሁኔታ",
    paymentStatus: "የደረሰኝ የክፍያ ሁኔታ",
    paidAmount: "የተከፈለ መጠን ($)",
    itemsOrdered: "የታዘዙ ዕቃዎች እና ስሌቶች",
    grnLogs: "የዕቃዎች ገቢ ደረሰኝ (GRN) ታሪክ",
    receiveItems: "የተላከውን ዕቃ ተረከብ",
    approve: "ትዕዛዙን አጽድቅ",
    received: "አቅርቦት ተሳክቷል",
    cancelled: "የተሰረዘ",
    pending: "እርምጃ የሚጠብቅ",
    partial: "ከፊል አቅርቦት",
    paid: "ሙሉ በሙሉ የተከፈለ",
    unpaid: "ክፍያ የሚጠብቅ",

    frequency: "የማመንጫ የጊዜ ልዩነት",
    startDate: "የመጀመሪያ ቀን",
    endDate: "የማብቂያ ቀን",
    lastGenerated: "የመጨረሻው አውቶማቲክ አሂድ",
    nextRun: "የሚቀጥለው ግምገማ ቀን",
    active: "ገባሪ ዑደት",
    paused: "ለጊዜው የቆመ",
    completed: "ውል ተጠናቋል",
    triggerScan: "ያልተከፈሉ ተደጋጋሚዎችን ፈልግ",
    scanResult: "ገቢር ለሆነው የስርዓት መልህቅ ምንም አስቀድሞ የሚጠበቁ ተደጋጋሚዎች አልተገኙም።",

    inventoryStock: "የመጋዘን ክምችት ቁጥጥር",
    currentStock: "በአሁኑ ጊዜ የሚገኝ ክምችት",
    replenishWarn: "አዲስ ክምችት ያስፈልገዋል (ድጋሚ መግዛት)",
    stockLevel: "የአሁኑ የእቃዎች ክምችት ሁኔታ",
  }
};
