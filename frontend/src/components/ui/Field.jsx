import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { labelize } from "../../utils/format";
import { choices } from "../../config/resources";

export default function Field({ name, value, set, lookups }) {
  const lookupMap = {
    customer: "customers",
    grain_name: "rate-cards",
    employee: "employees",
    item: "stock-items",
    grinding_transaction: "grinding-transactions",
  };

  if (choices[name]) {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={labelize(name)}
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        <MenuItem value="">— select —</MenuItem>
        {choices[name].map((x) => (
          <MenuItem key={x} value={x}>{labelize(x)}</MenuItem>
        ))}
      </TextField>
    );
  }

  if (lookupMap[name]) {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={labelize(name)}
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        <MenuItem value="">— select —</MenuItem>
        {(lookups[lookupMap[name]] || []).map((x) => (
          <MenuItem key={x.id} value={x.id}>
            {x.name || x.grain_name || x.machine_name || x.id}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (name === "active" || name === "paid") {
    return (
      <TextField
        select
        fullWidth
        size="small"
        label={labelize(name)}
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        <MenuItem value="">— select —</MenuItem>
        <MenuItem value="true">Yes</MenuItem>
        <MenuItem value="false">No</MenuItem>
      </TextField>
    );
  }

  const type =
    name.includes("date") || name === "bill_month" || name === "month"
      ? "date"
      : name.includes("_at")
      ? "datetime-local"
      : name.includes("weight") ||
        name.includes("amount") ||
        name.includes("balance") ||
        name.includes("quantity") ||
        name.includes("cost") ||
        name.includes("rate") ||
        name.includes("stock")
      ? "number"
      : "text";

  return (
    <TextField
      fullWidth
      size="small"
      label={labelize(name)}
      type={type}
      value={value}
      onChange={(e) => set(e.target.value)}
      InputLabelProps={type === "date" || type === "datetime-local" ? { shrink: true } : undefined}
      inputProps={type === "number" ? { step: "0.01" } : undefined}
    />
  );
}