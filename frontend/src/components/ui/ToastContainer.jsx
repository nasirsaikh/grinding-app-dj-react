import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <>
      {toasts.map((t, index) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={4000}
          onClose={() => onDismiss(t.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: index * 7 }}
        >
          <Alert
            onClose={() => onDismiss(t.id)}
            severity={t.type === "danger" ? "error" : t.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            <strong>{t.title}</strong> {t.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
}