import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
} from "@mui/material";
import {
  People,
  Settings,
  Inventory2,
  Payments,
  Warning,
  Receipt,
  Layers,
  TrendingUp,
  LocalShipping,
} from "@mui/icons-material";
import StatusBadge from "../ui/StatusBadge";
import { labelize } from "../../utils/format";

const kpiDef = [
  { key: "total_customers", label: "Total Customers", icon: <People />, color: "#4361ee" },
  { key: "pending_grinding", label: "Pending Grinding", icon: <Settings />, color: "#f59e0b" },
  { key: "ready_to_deliver", label: "Ready to Deliver", icon: <Inventory2 />, color: "#10b981" },
  { key: "todays_collection", label: "Today's Collection", icon: <Payments />, color: "#8b5cf6" },
  { key: "udhaar_balance", label: "Udhaar Balance", icon: <Warning />, color: "#ef4444" },
  { key: "total_expenses", label: "Total Expenses", icon: <Receipt />, color: "#06b6d4" },
  { key: "stock_items", label: "Stock Items", icon: <Layers />, color: "#64748b" },
  { key: "monthly_revenue", label: "Monthly Revenue", icon: <TrendingUp />, color: "#0ea5e9" },
];

export default function Dashboard({ data, pendingRows, onMarkDone, onDeliver }) {
  const entries = Object.entries(data || {});

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {entries.map(([k, v], i) => {
          const def = kpiDef.find((d) => d.key === k) || kpiDef[i % kpiDef.length];
          return (
            <Grid item xs={12} sm={6} md={3} key={k}>
              <Paper variant="outlined" sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box sx={{width: 44,height: 44,borderRadius: 2,bgcolor: `${def.color}18`,color: def.color,display: "flex",alignItems: "center",justifyContent: "center",}}>
                  {def.icon}
                </Box>

                <Box>
                  <Typography fontSize={20} fontWeight={800}>
                    {typeof v === "number" && v > 999 ? v.toLocaleString() : String(v)}
                  </Typography>
                  <Typography fontSize={12} color="text.secondary">
                    {def.label || labelize(k)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Paper variant="outlined">
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
          <Typography fontWeight={700}>Pending & In-Progress Orders</Typography>
          <Chip size="small" color="warning" label={`${pendingRows.length} active`} />
        </Box>
  
          <Table size="small">
            <TableHead>
              <TableRow>
                {["#", "Customer", "Grain", "Init. Kg", "Charge","Advanced","Balance","Status", "Date", "Actions"].map((h) => (
                  <TableCell key={h} className="bg-primary-subtle fw-bold">
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {pendingRows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>{r.customer_name || r.customer}</TableCell>
                  <TableCell>{r.grain_label}</TableCell>
                  <TableCell>{r.initial_weight_kg} kg</TableCell>
                  <TableCell>{r.grinding_charge}</TableCell>
                  <TableCell>{r.amount_paid}</TableCell>
                  <TableCell>{r.grinding_charge-r.amount_paid}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>{r.transaction_date || "—"}</TableCell>
                  <TableCell>
                    {r.status === "pending" && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() => onMarkDone(r)}
                      >
                        Mark Done
                      </Button>
                    )}

                    {r.status === "grinding_done" && (
                      <Button
                        size="small"
                        color="success"
                        variant="outlined"
                        startIcon={<LocalShipping />}
                        onClick={() => onDeliver(r)}
                      >
                        Deliver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
    </Box>
  );
}