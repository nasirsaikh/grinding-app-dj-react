import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Badge,
  Divider,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People,
  CardMembership,
  Settings,
  Receipt,
  Inventory2,
  SwapHoriz,
  MenuBook,
} from "@mui/icons-material";
import { resources } from "../../config/resources";

const drawerWidth = 240;

const iconMap = {
  dashboard: <DashboardIcon />,
  customers: <People />,
  "rate-cards": <CardMembership />,
  "grinding-transactions": <Settings />,
  "ledger-entries": <MenuBook />,
  expenses: <Receipt />,
  "stock-items": <Inventory2 />,
  "stock-movements": <SwapHoriz />,
};

export default function Sidebar({ open, active, onSelect, pendingCount }) {
  const groups = [
    { label: "Operations", keys: ["dashboard", "customers", "rate-cards", "grinding-transactions"] },
    { label: "Finance", keys: ["ledger-entries", "expenses"] },
    { label: "Inventory", keys: ["stock-items", "stock-movements"] },
  ];

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: "#13192b",
          color: "#fff",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>CG</Avatar>
        <Box>
          <Typography fontWeight={700}>Chakki Git</Typography>
          <Typography fontSize={11} color="#64748b">Mill Management</Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {groups.map((group) => (
          <Box key={group.label}>
            <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, fontSize: 10, color: "#64748b", letterSpacing: 1 }}>
              {group.label.toUpperCase()}
            </Typography>

            <List dense disablePadding>
              {group.keys.map((key) => {
                const item = resources.find((r) => r.key === key);
                if (!item) return null;

                const selected = active.key === key;

                return (
                  <ListItemButton
                    key={key}
                    selected={selected}
                    onClick={() => onSelect(item)}
                    sx={{
                      mx: 1,
                      borderRadius: 1.5,
                      color: selected ? "#fff" : "#94a3b8",
                      bgcolor: selected ? "rgba(67,97,238,.2)" : "transparent",
                      "&.Mui-selected": { bgcolor: "rgba(67,97,238,.2)" },
                      "&:hover": { bgcolor: "rgba(255,255,255,.06)", color: "#fff" },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
                      {item.badge ? (
                        <Badge badgeContent={pendingCount || 0} color="error">
                          {iconMap[key]}
                        </Badge>
                      ) : (
                        iconMap[key]
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13 }} />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

      <Box sx={{ p: 2, display: "flex", gap: 1.2, alignItems: "center" }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32, fontSize: 12 }}>AK</Avatar>
        <Box>
          <Typography fontSize={12} fontWeight={700}>Akbar Khan</Typography>
          <Typography fontSize={10} color="#64748b">Mill Operator</Typography>
        </Box>
      </Box>
    </Drawer>
  );
}