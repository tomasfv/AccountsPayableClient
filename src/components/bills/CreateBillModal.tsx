import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../hooks/redux";
import { createBill, fetchBills } from "../../store/slices/billsSlice";
import type { Vendor } from "../../types";

interface Props {
  open: boolean;
  vendors: Vendor[];
  onClose: () => void;
}

const CreateBillModal: React.FC<Props> = ({ open, vendors, onClose }) => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    vendorId: "",
    amount: "",
    invoiceNumber: "",
    dueDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    const result = await dispatch(
      createBill({
        vendorId: form.vendorId,
        amount: parseFloat(form.amount),
        invoiceNumber: form.invoiceNumber || undefined,
        dueDate: form.dueDate,
        file: file || undefined,
      }),
    );
    if (createBill.fulfilled.match(result)) {
      toast.success("Bill created successfully");
      if (filePreview) URL.revokeObjectURL(filePreview);
      setForm({ vendorId: "", amount: "", invoiceNumber: "", dueDate: "" });
      setFile(null);
      setFilePreview(null);
      dispatch(fetchBills());
      onClose();
    } else {
      toast.error((result.payload as string) || "Failed to create bill");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit");
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
  };

  const handleRemoveFile = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-7xl relative border border-surface-border shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">
          Create New Invoice / Bill
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-6">
            <div className="w-1/2 min-h-[700px]">
              {!filePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-full min-h-[700px] rounded-xl border-2 border-dashed border-surface-border bg-surface-hover/30 cursor-pointer hover:border-brand-500/50 transition-colors">
                  <svg
                    className="w-10 h-10 text-slate-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-slate-400 font-medium">
                    Drop PDF here or click to browse
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    PDF files up to 10MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative w-full min-h-[700px] rounded-xl overflow-hidden border border-surface-border bg-black/20">
                  <embed
                    src={filePreview}
                    type="application/pdf"
                    className="w-full h-full min-h-[700px]"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            <div className="w-1/2 space-y-4">
              <div>
                <label className="label">Vendor</label>
                <select
                  required
                  className="input select"
                  value={form.vendorId}
                  onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Invoice Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="INV-2026-XXXX"
                  value={form.invoiceNumber}
                  onChange={(e) =>
                    setForm({ ...form, invoiceNumber: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => {
                    if (filePreview) URL.revokeObjectURL(filePreview);
                    setFile(null);
                    setFilePreview(null);
                    onClose();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Bill
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBillModal;
