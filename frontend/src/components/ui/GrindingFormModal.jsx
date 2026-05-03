import React, { useEffect } from "react";
import dayjs from "dayjs";
import {
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  ListItem,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Stack,
  Autocomplete,
  Alert,
} from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";

const num = (v) => Number(v || 0);

export default function GrindingFormModal({
  open,
  onClose,
  onSave,
  form,
  setForm,
  lookups,
}) {
  const customers = lookups?.customers || [];
  const rateCards = lookups?.["rate-cards"] || lookups?.rateCards || [];

  const selectedCustomer =
    customers.find((c) => Number(c.id) === Number(form.customer)) || null;

  const selectedRateCard =
    rateCards.find((r) => Number(r.id) === Number(form.grain_name)) || null;

  const initialWeight = num(form.initial_weight_kg);
  const rate = num(selectedRateCard?.rate_per_kg || form.rate_per_kg);
  const grindingCharge = initialWeight * rate;

  const update = (patch) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  useEffect(() => {
    if (!open) return;

    setForm((prev) => ({
      ...prev,
      amount_paid: prev.amount_paid ?? 0,
      payment_mode: prev.payment_mode || "cash",
      status: prev.status || "pending",
      transaction_date: prev.transaction_date || dayjs().format("YYYY-MM-DD"),
    }));
  }, [open, setForm]);

  const handleCustomerChange = (_, customer) => {
    update({
      customer: customer?.id || "",
    });
  };

  const handleGrainChange = (_, grain) => {
    update({
      grain_name: grain?.id || "",
      rate_per_kg: grain?.rate_per_kg || "",
    });
  };

  const handleWeightChange = (weight) => {
    update({
      initial_weight_kg: weight,
      final_weight_kg: weight,
    });
  };

  const handleStatusChange = (status) => {
    const patch = { status };

    if (status === "pending") {
      patch.grinding_done_at = null;
      patch.delivered_at = null;
    }

    if (status === "grinding_done") {
      patch.grinding_done_at = form.grinding_done_at || dayjs().toISOString();
      patch.delivered_at = null;
    }

    if (status === "delivered") {
      patch.grinding_done_at = form.grinding_done_at || dayjs().toISOString();
      patch.delivered_at = form.delivered_at || dayjs().toISOString();
    }

    update(patch);
  };

  const handleSubmit = () => {
    const payload = {
      customer: form.customer,
      grain_name: form.grain_name,
      initial_weight_kg: form.initial_weight_kg,
      final_weight_kg: form.initial_weight_kg,
      rate_per_kg: form.rate_per_kg || selectedRateCard?.rate_per_kg,
      amount_paid: form.amount_paid || 0,
      payment_mode: form.payment_mode || "cash",
      status: form.status || "pending",
      transaction_date: form.transaction_date || dayjs().format("YYYY-MM-DD"),
      grinding_done_at:
        form.status === "grinding_done" || form.status === "delivered" ? form.grinding_done_at || dayjs().toISOString() : null,
      delivered_at:
        form.status === "delivered" ? form.delivered_at || dayjs().toISOString() : null,
      notes: form.notes || "",
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add Grinding Transaction</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {/* <Alert severity="info">
            Select customer, select grain, enter initial weight. Final weight is
            same as initial weight while creating.
          </Alert> */}

          <div className="row g-2">
            <div className="col-12 col-md-6 mb-2">
              <Autocomplete
                options={customers}
                value={selectedCustomer}
                onChange={handleCustomerChange}
                getOptionLabel={(option) =>
                  `${option.name || ""}${option.mobile ? ` - ${option.mobile}` : ""}`
                }
                isOptionEqualToValue={(option, value) =>
                  Number(option.id) === Number(value.id)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Search Customer" required />
                )}
              />
            </div>

            <div className="col-12 col-md-6 mb-2">
              <Autocomplete
                options={rateCards}
                value={selectedRateCard}
                onChange={handleGrainChange}
                getOptionLabel={(option) =>
                  `${option.grain_name || ""} - ₹${option.rate_per_kg}/kg`
                }
                isOptionEqualToValue={(option, value) =>
                  Number(option.id) === Number(value.id)
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Grain" required />
                )}
              />
            </div>

            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Initial Weight KG"
                type="number"
                required
                fullWidth
                value={form.initial_weight_kg || ""}
                onChange={(e) => handleWeightChange(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </div>

            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Final Weight KG"
                type="number"
                fullWidth
                disabled
                value={form.initial_weight_kg || ""}
                helperText="Same as initial weight"
              />
            </div>

            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Amount Paid"
                type="number"
                fullWidth
                value={form.amount_paid ?? 0}
                onChange={(e) => update({ amount_paid: Math.min(Number(e.target.value || 0), grindingCharge)})}
                inputProps={{ step: "0.01", min: 0,max: grindingCharge }}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </div>

            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Payment Mode"
                select
                fullWidth
                value={form.payment_mode || "cash"}
                onChange={(e) => update({ payment_mode: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="udhaar">Udhaar</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
              </TextField>
            </div>

            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Status"
                select
                fullWidth
                value={form.status || "pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="grinding_done">Grinding Done</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </TextField>
            </div>

            <div className="col-12 col-md-6 mb-2">
              <DatePicker
                label="Transaction Date"
                value={
                  form.transaction_date ? dayjs(form.transaction_date) : dayjs()
                }
                onChange={(date) =>
                  update({
                    transaction_date: date
                      ? date.format("YYYY-MM-DD")
                      : dayjs().format("YYYY-MM-DD"),
                  })
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </div>

            {form.status === "grinding_done" && (
              <div className="col-12 col-md-6 mb-2">
                <DateTimePicker
                  label="Grinding Done Date / Time"
                  value={
                    form.grinding_done_at
                      ? dayjs(form.grinding_done_at)
                      : dayjs()
                  }
                  onChange={(date) =>
                    update({
                      grinding_done_at: date ? date.toISOString() : null,
                    })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </div>
            )}

            {form.status === "delivered" && (
              <>
                <div className="col-12 col-md-6 mb-2">
                  <DateTimePicker
                    label="Grinding Done Date / Time"
                    value={
                      form.grinding_done_at
                        ? dayjs(form.grinding_done_at)
                        : dayjs()
                    }
                    onChange={(date) =>
                      update({
                        grinding_done_at: date ? date.toISOString() : null,
                      })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>

                <div className="col-12 col-md-6 mb-2">
                  <DateTimePicker
                    label="Delivery Date / Time"
                    value={
                      form.delivered_at ? dayjs(form.delivered_at) : dayjs()
                    }
                    onChange={(date) =>
                      update({
                        delivered_at: date ? date.toISOString() : null,
                      })
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </div>
              </>
            )}

            <div className="col-12 col-md-12 mb-2">
              <TextField
                label="Notes"
                multiline
                minRows={2}
                fullWidth
                value={form.notes || ""}
                onChange={(e) => update({ notes: e.target.value })}
              />
            </div>
          </div>


        <Card variant="outlined" sx={{ textAlign: "center" }}>
          <CardContent>
            <Typography fontSize={12} color="text.secondary" fontWeight={500}>
              Grinding Charge
            </Typography>

            <Typography variant="h5" fontWeight={800} color="primary" sx={{ my: 1 }}>
              Total <span className="badge bg-warning">₹{grindingCharge.toFixed(2)}</span> Paid <span className="badge bg-success">₹{form.amount_paid}</span> = Balance <span className="badge bg-danger">₹{(grindingCharge.toFixed(2))-(form.amount_paid)}</span>
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              {initialWeight || 0} KG × ₹{rate || 0}/KG - 
            </Typography>
          </CardContent>
        </Card>

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button variant="contained" onClick={handleSubmit}>
          Save Grinding
        </Button>
      </DialogActions>
    </Dialog>
  );
}