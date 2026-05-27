import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCards,
  createCard,
  updateCard,
  deleteCard,
} from "../../store/slices/cardsSlice";
import type { Card } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface CardForm {
  type: "Debit" | "Credit";
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const emptyForm: CardForm = {
  type: "Debit",
  cardholderName: "",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
};

const currentYear = new Date().getFullYear() % 100;

const ManageCardsModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { items: cards, loading, submitting } = useAppSelector(
    (s) => s.cards,
  );

  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [form, setForm] = useState<CardForm>(emptyForm);

  useEffect(() => {
    if (open) dispatch(fetchCards());
  }, [open, dispatch]);

  if (!open) return null;

  const debitCard = cards.find((c) => c.type === "Debit");
  const creditCard = cards.find((c) => c.type === "Credit");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCard(null);
    setShowForm(false);
  };

  const handleAdd = (type: "Debit" | "Credit") => {
    setForm({ ...emptyForm, type });
    setEditingCard(null);
    setShowForm(true);
  };

  const handleEdit = (card: Card) => {
    setForm({
      type: card.type,
      cardholderName: card.cardholderName,
      cardNumber: "",
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: "",
    });
    setEditingCard(card);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteCard(id));
    if (deleteCard.fulfilled.match(result)) {
      toast.success("Card deleted");
    } else {
      toast.error((result.payload as string) || "Failed to delete card");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cardholderName.trim() || !form.expiryMonth || !form.expiryYear || !form.cvv) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!editingCard && !form.cardNumber.trim()) {
      toast.error("Card number is required");
      return;
    }

    if (editingCard) {
      const result = await dispatch(
        updateCard({
          id: editingCard.id,
          cardholderName: form.cardholderName,
          cardNumber: form.cardNumber || undefined,
          expiryMonth: form.expiryMonth,
          expiryYear: form.expiryYear,
          cvv: form.cvv,
        }),
      );
      if (updateCard.fulfilled.match(result)) {
        toast.success("Card updated");
        resetForm();
        dispatch(fetchCards());
      } else {
        toast.error((result.payload as string) || "Failed to update card");
      }
    } else {
      const result = await dispatch(
        createCard({
          type: form.type,
          cardholderName: form.cardholderName,
          cardNumber: form.cardNumber,
          expiryMonth: form.expiryMonth,
          expiryYear: form.expiryYear,
          cvv: form.cvv,
        }),
      );
      if (createCard.fulfilled.match(result)) {
        toast.success("Card added");
        resetForm();
        dispatch(fetchCards());
      } else {
        toast.error((result.payload as string) || "Failed to add card");
      }
    }
  };

  const cardIcon = (type: "Debit" | "Credit") =>
    type === "Credit" ? (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ) : (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg relative border border-surface-border shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Manage Payment Methods
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            Loading…
          </div>
        ) : showForm ? (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Card Type</label>
              <select
                required
                className="input select"
                value={form.type}
                disabled={!!editingCard}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "Debit" | "Credit",
                  })
                }
              >
                <option value="Debit">Debit Card</option>
                <option value="Credit">Credit Card</option>
              </select>
            </div>
            <div>
              <label className="label">Cardholder Name</label>
              <input
                required
                className="input"
                placeholder="John Doe"
                value={form.cardholderName}
                onChange={(e) =>
                  setForm({ ...form, cardholderName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                Card Number {editingCard ? "(leave blank to keep existing)" : ""}
              </label>
              <input
                required={!editingCard}
                className="input font-mono"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                value={form.cardNumber}
                onChange={(e) =>
                  setForm({ ...form, cardNumber: e.target.value })
                }
              />
              {editingCard && (
                <p className="text-xs text-slate-500 mt-1">
                  Current: **** **** **** {editingCard.lastFourDigits}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">Expiry Month</label>
                <select
                  required
                  className="input select"
                  value={form.expiryMonth}
                  onChange={(e) =>
                    setForm({ ...form, expiryMonth: e.target.value })
                  }
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const m = String(i + 1).padStart(2, "0");
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Expiry Year</label>
                <select
                  required
                  className="input select"
                  value={form.expiryYear}
                  onChange={(e) =>
                    setForm({ ...form, expiryYear: e.target.value })
                  }
                >
                  <option value="">YY</option>
                  {Array.from({ length: 15 }, (_, i) => {
                    const y = String(currentYear + i);
                    return (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="w-24">
                <label className="label">CVV</label>
                <input
                  required
                  className="input font-mono"
                  placeholder="123"
                  maxLength={4}
                  value={form.cvv}
                  onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
              >
                {editingCard ? "Save Changes" : "Add Card"}
              </button>
            </div>
          </form>
        ) : (
          /* ── Card List ── */
          <div className="space-y-4">
            {cards.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No payment methods yet. Add a Debit or Credit card.
              </p>
            ) : (
              cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface border border-surface-border"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-brand-400">{cardIcon(card.type)}</span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {card.type === "Debit"
                          ? "Debit Card"
                          : "Credit Card"}{" "}
                        <span className="text-slate-400 font-mono">
                          **** {card.lastFourDigits}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {card.cardholderName} &middot; Expires{" "}
                        {card.expiryMonth}/{card.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}

            <div className="flex gap-3 pt-2">
              {!debitCard && (
                <button
                  onClick={() => handleAdd("Debit")}
                  className="btn-secondary flex-1 justify-center"
                >
                  + Add Debit Card
                </button>
              )}
              {!creditCard && (
                <button
                  onClick={() => handleAdd("Credit")}
                  className="btn-secondary flex-1 justify-center"
                >
                  + Add Credit Card
                </button>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCardsModal;
