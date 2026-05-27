import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../hooks/redux";
import { executePayment, fetchBills } from "../../store/slices/billsSlice";

interface Props {
  open: boolean;
  billId: string;
  onClose: () => void;
}

const PayNowModal: React.FC<Props> = ({ open, billId, onClose }) => {
  const dispatch = useAppDispatch();
  const [paymentMethod, setPaymentMethod] = useState<
    "ACH" | "Paper Check" | "Card"
  >("ACH");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      executePayment({
        id: billId,
        paymentMethod,
      }),
    );
    if (executePayment.fulfilled.match(result)) {
      toast.success("Payment executed successfully");
      await dispatch(fetchBills());
      onClose();
    } else {
      toast.error((result.payload as string) || "Failed to execute payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Pay Now</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Payment Method</label>
            <select
              required
              className="input select"
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as "ACH" | "Paper Check" | "Card",
                )
              }
            >
              <option value="ACH">ACH (Direct Deposit)</option>
              <option value="Card">Credit Card</option>
              <option value="Paper Check">Paper Check</option>
            </select>
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
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayNowModal;
