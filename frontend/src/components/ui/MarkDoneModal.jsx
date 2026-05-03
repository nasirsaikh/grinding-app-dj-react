import React from "react";
import dayjs from "dayjs";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

export default function MarkDoneModal({ value, onChange, onClose, onSubmit }) {
  if (!value) return null;

  return (
    <Dialog open={Boolean(value)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mark Grinding Done</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DateTimePicker
            label="Completed Date / Time"
            value={value.grinding_done_at ? dayjs(value.grinding_done_at) : dayjs()}
            onChange={(date) =>
              onChange({
                ...value,
                grinding_done_at: date ? date.toISOString() : null,
              })
            }
            slotProps={{ textField: { fullWidth: true } }}
          />

          <TextField
            label="Final Weight KG"
            type="number"
            fullWidth
            value={value.final_weight_kg || ""}
            onChange={(e) =>
              onChange({ ...value, final_weight_kg: e.target.value })
            }
            inputProps={{ step: "0.01" }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onSubmit} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}