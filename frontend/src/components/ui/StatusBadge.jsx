import React from "react";
import { Chip } from "@mui/material";

export default function StatusBadge({ status }) {
  const map = {
    pending: { color: "warning", label: "Pending" },
    grinding_done: { color: "primary", label: "Grinding Done" },
    delivered: { color: "success", label: "Delivered" },
  };

  const s = map[status] || { color: "default", label: status || "Unknown" };

  return <Chip size="small" color={s.color} label={s.label} />;
}