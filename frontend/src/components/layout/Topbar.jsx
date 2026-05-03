import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
  Badge,
  Select,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";

import {
  Menu,
  Refresh,
  NotificationsNone,
  DarkMode,
  LightMode,
} from "@mui/icons-material";

import { useAppSettings } from "../../AppSettingsProvider";

export default function Topbar({ onToggle, active, loading, onRefresh }) {
  const { mode, toggleTheme, language, setLanguage, t } = useAppSettings();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 52 }}>
        {/* LEFT */}
        <IconButton onClick={onToggle} edge="start">
          <Menu />
        </IconButton>

        <Typography fontSize={13} color="text.secondary" sx={{ ml: 1 }}>
          {t("app_name", "Chakki")} /{" "}
          <Box component="span" color="text.primary" fontWeight={600}>
            {active?.label}
          </Box>
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* RIGHT */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Refresh */}
          <Button
            variant="contained"
            size="small"
            startIcon={<Refresh className={loading ? "spin" : ""} />}
            onClick={onRefresh}
          >
            {t("refresh", "Refresh")}
          </Button>

          {/* Language */}
          <Select
            size="small"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="hi">HI</MenuItem>
          </Select>

          {/* Theme Toggle */}
          <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"}>
            <IconButton onClick={toggleTheme}>
              {mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <IconButton>
            <Badge variant="dot" color="error">
              <NotificationsNone />
            </Badge>
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}