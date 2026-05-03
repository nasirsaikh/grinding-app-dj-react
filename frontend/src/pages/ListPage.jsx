import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  AddCircle,
  Save,
  Delete,
  Settings,
  LocalShipping,
  Inbox,
  Close,
} from "@mui/icons-material";

import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import { labelize } from "../utils/format";
import GrindingFormModal from "../components/ui/GrindingFormModal";

export default function ListPage({
  resource,
  rows,
  loading,
  error,
  onSave,
  onDelete,
  onOpenMarkDone,
  onOpenDeliver,
  lookups,
  form,
  setForm,
}) {
  const [openAdd, setOpenAdd] = useState(false);

  const columns = useMemo(
    () => (rows[0] ? Object.keys(rows[0]).slice(0, 8) : []),
    [rows]
  );

  const isGrinding = resource.key === "grinding-transactions";

  const handleNormalSave = async () => {
    await onSave(form);
    setOpenAdd(false);
  };

  const handleGrindingSave = async (payload) => {
    await onSave(payload);
    setOpenAdd(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <Paper variant="outlined">
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography fontWeight={700} fontSize={14}>
            {resource.label} Records
          </Typography>

          {loading && (
            <Typography fontSize={12} color="primary">
              Loading...
            </Typography>
          )}

          <Chip sx={{ ml: "auto" }} size="small" label={`${rows.length} records`} />

          <Button variant="contained" size="small" startIcon={<AddCircle />} onClick={() => setOpenAdd(true)}>
            Add {resource.label}
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c} sx={{ fontSize: 11, fontWeight: 700 }}>
                    {labelize(c)}
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontSize: 11, fontWeight: 700 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  {columns.map((c) => (
                    <TableCell key={c}>
                      {c === "status" ? (
                        <StatusBadge status={r[c]} />
                      ) : (
                        String(r[c] ?? "")
                      )}
                    </TableCell>
                  ))}

                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {isGrinding && r.status === "pending" && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() => onOpenMarkDone(r)}
                        sx={{ mr: 1 }}
                      >
                        Done
                      </Button>
                    )}

                    {isGrinding && r.status === "grinding_done" && (
                      <Button
                        size="small"
                        color="success"
                        variant="outlined"
                        startIcon={<LocalShipping />}
                        onClick={() => onOpenDeliver(r)}
                        sx={{ mr: 1 }}
                      >
                        Deliver
                      </Button>
                    )}

                    <IconButton color="error" size="small" onClick={() => onDelete(r)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 5, color: "text.secondary" }}
                  >
                    <Inbox sx={{ display: "block", mx: "auto", mb: 1, opacity: 0.5 }} />
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isGrinding ? (
        <GrindingFormModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onSave={handleGrindingSave}
          form={form}
          setForm={setForm}
          lookups={lookups}
        />
      ) : (
        <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="md">
          <DialogTitle>
            Add {resource.label}
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              {resource.fields.map((f) => (
                <Grid item xs={12} sm={6} md={4} key={f}>
                  <Field
                    name={f}
                    value={form[f] ?? ""}
                    set={(v) => setForm({ ...form, [f]: v })}
                    lookups={lookups}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button color="inherit" startIcon={<Close />} onClick={() => setOpenAdd(false)}>
              Cancel
            </Button>

            <Button variant="contained" startIcon={<Save />} onClick={handleNormalSave}>
              Save {resource.label}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}