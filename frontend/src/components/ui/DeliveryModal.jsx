import React from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Grid,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "bootstrap/dist/css/bootstrap.min.css";

const num = (v) => Number(v || 0);

export default function DeliveryModal({ value, onChange, onClose, onSubmit }) {
  if (!value) return null;

  const update = (patch) => onChange({ ...value, ...patch });

  const grindingCharge = num(value.grinding_charge);
  const oldUdhaar = num(value.old_udhaar);

  const advancePaid = num(value.amount_paid);
  const deliveryPaid = num(value.delivery_paid);

  const oldUdhaarPaid = num(value.old_udhaar_paid);
  const hasBuyback = Boolean(value.has_buyback);
  const actualWeight = num(value.final_weight_kg || value.initial_weight_kg);
  const buybackAmount = hasBuyback? num(value.buyback_weight) * num(value.buyback_rate) : 0;
  const remainingCurrent = Math.max(grindingCharge - advancePaid - deliveryPaid - buybackAmount, 0);
  const remainingOldUdhaar = Math.max(oldUdhaar - oldUdhaarPaid, 0);
  const finalUdhaar = remainingOldUdhaar + remainingCurrent;
  const balancePayment = Math.max(grindingCharge - advancePaid - buybackAmount,0);

  const handleSubmit = () => {
    const payload = {
      delivered_at: value.delivered_at || dayjs().toISOString(),
      amount_paid: deliveryPaid,
      old_udhaar_paid: oldUdhaarPaid,
      has_buyback: hasBuyback,
      buyback_weight: hasBuyback ? num(value.buyback_weight) : 0,
      buyback_rate: hasBuyback ? num(value.buyback_rate) : 0,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={Boolean(value)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Deliver Order</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h5" fontWeight={700}>
              Final Bill
            </Typography>

            <Chip
              label={`₹${grindingCharge.toFixed(2)}`}
              color="success"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, flexWrap: "wrap" }}>
            <Card variant="outlined" sx={{ flex: "1 1 180px", textAlign: "center" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Grinding Charge
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  ₹{grindingCharge.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: "1 1 180px", textAlign: "center" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Advance Paid
                </Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">
                  ₹{advancePaid.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            {oldUdhaar > 0 ? (
              <Card variant="outlined" sx={{ flex: "1 1 180px", textAlign: "center" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Old Udhaar
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="warning.main">
                    ₹{oldUdhaar.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Card variant="outlined" sx={{ flex: "1 1 180px", textAlign: "center" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Udhaar
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main">
                    No udhaar
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Card variant="outlined" sx={{ flex: "1 1 180px", textAlign: "center" }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Buyback Value
                </Typography>
                <Typography variant="h6" fontWeight={800}>
                  ₹{buybackAmount.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            

            <Card
              variant="outlined"
              sx={{
                flex: "1 1 180px",
                textAlign: "center",
                borderColor: finalUdhaar > 0 ? "warning.main" : "success.main",
                borderWidth: 2,
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Final Udhaar
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={900}
                  color={finalUdhaar > 0 ? "warning.main" : "success.main"}
                >
                  ₹{finalUdhaar.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Divider />

          <div className="row g-2">
            <div className="col-12 col-md-6">
            
              <DateTimePicker
                label="Delivery Date / Time"
                value={value.delivered_at ? dayjs(value.delivered_at) : dayjs()}
                onChange={(date) =>
                  update({ delivered_at: date ? date.toISOString() : null })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </div>

            <div className="col-12 col-md-6">
              <TextField
                label="Amount Paid Now"
                type="number"
                fullWidth
                size="small"
                value={value.delivery_paid || ""}
                onChange={(e) => update({ delivery_paid: Math.min(Number(e.target.value || 0), balancePayment)})}
                inputProps={{ step: "0.01", min: 0, max: balancePayment}}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(value.full_payment)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      update({
                        full_payment: checked,
                        delivery_paid: checked ? balancePayment : value.delivery_paid,
                      });
                    }}
                  />
                }
                label={`Full Payment (₹${balancePayment.toFixed(2)})`}
              />

            </div>

            {oldUdhaar > 0 ? (
              <div className="col-12 col-md-6">
                <TextField
                  label="Old Udhaar Paid"
                  helperText="Payment against previous udhaar"
                  type="number"
                  fullWidth
                  size="small"
                  value={value.old_udhaar_paid || ""}
                  onChange={(e) => update({ old_udhaar_paid: e.target.value })}
                  inputProps={{ step: "0.01", min: 0}}
                />
              </div>
            ) : (
              <div className="col-12 col-md-12">
                <Alert severity="success">No udhaar</Alert>
              </div>
            )}


            <div className="col-12 col-md-12">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasBuyback}
                    onChange={(e) =>
                      update({
                        has_buyback: e.target.checked,
                        buyback_weight: "",
                        buyback_rate: "",
                      })
                    }
                  />
                }
                label="Apply Buy Back"
              />
            </div>
            
            {hasBuyback && (
              <div>
                <div className="row">
                  <div className="col-12 col-md-6">
                  <TextField
                      label="Buyback KG"
                      type="number"
                      fullWidth
                      size="small"
                      value={value.buyback_weight || ""}
                      onChange={(e) => update({buyback_weight: Math.min(Number(e.target.value || 0), actualWeight)})}
                      inputProps={{
                        step: "0.01",
                        min: 0,
                        max: actualWeight,
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <TextField
                      label="Buyback Rate Per KG"
                      type="number"
                      fullWidth
                      size="small"
                      value={value.buyback_rate || ""}
                      onChange={(e) => update({buyback_rate: Math.min(Number(e.target.value || 0), value.buyback_per_kg)})}
                      inputProps={{ step: "0.01", min: 0,max: value.buyback_per_kg }}
                    />
                  </div>
                </div>
              <Divider/>
              <div className="col-md-12">
                {hasBuyback && num(value.buyback_weight) > actualWeight ? (
                  <Alert severity="error">
                    Actual weight is {actualWeight} kg. You cannot enter more than that.
                  </Alert>
                ) : null}
              </div>

              </div>

            )}
          </div>

          {finalUdhaar > 0 ? (
            <Alert severity="warning">
              ₹{finalUdhaar.toFixed(2)} will remain as udhaar.
            </Alert>
          ) : (
            <Alert severity="success">
              Payment complete. No udhaar.
            </Alert>
          )}

        {advancePaid + deliveryPaid + buybackAmount > grindingCharge && (
          <Alert severity="warning">
            ₹{finalUdhaar.toFixed(2)} will remain as udhaar.
          </Alert>
        )}

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>

        <Button onClick={handleSubmit} variant="contained" color="success">
          Deliver
        </Button>
      </DialogActions>
    </Dialog>
  );
}