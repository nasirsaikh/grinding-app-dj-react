export const choices = {
  payment_mode: ["cash", "udhaar", "partial"],
  status: ["pending", "grinding_done", "delivered"],
  entry_type: ["credit", "debit"],
  category: [
    "diesel",
    "parts",
    "electricity",
    "labor",
    "payroll",
    "maintenance",
    "packaging",
    "other",
  ],
  stock_type: ["raw", "finished", "byproduct", "packaging"],
  movement_type: ["in", "out"],
};

export const resources = [
  { key: "dashboard", label: "Dashboard", readonly: true, icon: "bi-speedometer2" },
  { key: "customers", label: "Customers", fields: ["name", "mobile", "village", "opening_balance", "notes"], icon: "bi-people" },
  { key: "rate-cards", label: "Rate Cards", fields: ["grain_name", "rate_per_kg", "active"], icon: "bi-card-list" },
  { key: "grinding-transactions", label: "Grinding", fields: ["customer", "grain_name", "initial_weight_kg", "final_weight_kg", "amount_paid", "payment_mode", "transaction_date", "notes", "status", "grinding_done_at", "delivered_at", "delivery_notes"], icon: "bi-gear-wide-connected", badge: true },
  { key: "ledger-entries", label: "Ledger", fields: ["customer", "entry_type", "amount", "entry_date", "reference", "notes", "grinding_transaction"], icon: "bi-journal-text" },
  { key: "expenses", label: "Expenses", fields: ["category", "title", "amount", "expense_date", "vendor", "notes"], icon: "bi-receipt" },
  { key: "stock-items", label: "Stock Items", fields: ["name", "stock_type", "unit", "reorder_level", "opening_stock"], icon: "bi-box-seam" },
  { key: "stock-movements", label: "Stock Movement", fields: ["item", "movement_type", "quantity", "unit_cost", "movement_date", "reference", "notes"], icon: "bi-arrow-left-right" },
];