import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { schedulePayment, fetchBills } from "../../store/slices/billsSlice";
import { fetchCards } from "../../store/slices/cardsSlice";

interface Props {
  open: boolean;
  billId: string;
  dueDate: string;
  onClose: () => void;
}

const SchedulePaymentModal: React.FC<Props> = ({
  open,
  billId,
  dueDate,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const cards = useAppSelector((s) => s.cards.items);
  const [form, setForm] = useState({
    paymentMethod: "ACH" as "ACH" | "Paper Check" | "Card",
    scheduledDate: dueDate
      ? new Date(dueDate).toISOString().split("T")[0]
      : "",
  });

  useEffect(() => {
    if (open) dispatch(fetchCards());
  }, [open, dispatch]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.paymentMethod === "ACH" && !cards.find((c) => c.type === "Debit")) {
      toast.error("Please add a Debit Card first in Manage Cards");
      return;
    }
    if (form.paymentMethod === "Card" && !cards.find((c) => c.type === "Credit")) {
      toast.error("Please add a Credit Card first in Manage Cards");
      return;
    }
    const result = await dispatch(
      schedulePayment({
        id: billId,
        paymentMethod: form.paymentMethod,
        scheduledDate: form.scheduledDate,
      }),
    );
    if (schedulePayment.fulfilled.match(result)) {
      toast.success("Payment scheduled successfully");
      await dispatch(fetchBills());
      onClose();
    } else {
      toast.error((result.payload as string) || "Failed to schedule payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Schedule Payment
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Payment Method</label>
            <select
              required
              className="input select"
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  paymentMethod: e.target.value as "ACH" | "Paper Check" | "Card",
                })
              }
            >
              <option value="ACH">ACH (Direct Deposit)</option>
              <option value="Card">Credit Card</option>
              <option value="Paper Check">Paper Check</option>
            </select>
          </div>
          <div>
            <label className="label">Payment Date</label>
            <input
              type="date"
              required
              className="input"
              value={form.scheduledDate}
              onChange={(e) =>
                setForm({ ...form, scheduledDate: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePaymentModal;
