import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [mode, setMode] = useState(localStorage.getItem("themeMode") || "light");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("language", language);

    fetch(`/api/ui-translations/?lang=${language}`)
      .then((res) => res.json())
      .then((data) => setTranslations(data))
      .catch(() => setTranslations({}));
  }, [language]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#2e7d32" },
          success: { main: "#2e7d32" },
        },
        shape: {
          borderRadius: 10,
        },
      }),
    [mode]
  );

  const t = (key, fallback = "") => translations[key] || fallback || key;

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AppSettingsContext.Provider
      value={{
        mode,
        language,
        setLanguage,
        toggleTheme,
        t,
      }}
    >
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}