import React from "react";
import type { Bill } from "../../store/slices/billsSlice";
import { formatDate, formatCurrency } from "../../utils/format";
import { statusColors, paymentStatusColors } from "../../utils/billActions";

interface Props {
  open: boolean;
  bill: Bill;
  onClose: () => void;
}

const ViewDetailsModal: React.FC<Props> = ({ open, bill, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-7xl relative border border-surface-border shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Bill Details</h2>
        <div className="flex gap-6">
          <div className="w-1/2 min-h-[700px] rounded-xl overflow-hidden border border-surface-border bg-black/20">
            {bill.fileUrl ? (
              <embed
                src={bill.fileUrl}
                type="application/pdf"
                className="w-full h-full min-h-[700px]"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full min-h-[700px] text-slate-500 text-sm">
                No PDF attached
              </div>
            )}
          </div>

          <div className="w-1/2 space-y-4">
            <div>
              <label className="label">Vendor</label>
              <p className="text-sm text-white font-medium">
                {bill.vendor?.name || bill.vendorId || "—"}
              </p>
            </div>
            <div>
              <label className="label">Amount (USD)</label>
              <p className="text-sm text-white font-medium">
                {formatCurrency(bill.amount)}
              </p>
            </div>
            <div>
              <label className="label">Invoice Number</label>
              <p className="text-sm text-white font-medium">
                {bill.invoiceNumber || "—"}
              </p>
            </div>
            <div>
              <label className="label">Due Date</label>
              <p className="text-sm text-white font-medium">
                {formatDate(bill.dueDate)}
              </p>
            </div>
            <div>
              <label className="label">Status</label>
              <span
                className={`badge ${statusColors[bill.status] ?? ""}`}
              >
                {bill.status}
              </span>
            </div>
            <div>
              <label className="label">Created By</label>
              <p className="text-sm text-white font-medium">
                {bill.creator?.fullName || "—"}
              </p>
            </div>
            {bill.approver && (
              <div>
                <label className="label">Approved By</label>
                <p className="text-sm text-white font-medium">
                  {bill.approver.fullName}
                </p>
              </div>
            )}

            {bill.payments && bill.payments.length > 0 && (
              <div className="pt-4 border-t border-surface-border space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                  Payment Details
                </h3>
                {(() => {
                  const p = bill.payments![bill.payments!.length - 1];
                  return (
                    <>
                      <div>
                        <label className="label">Payment Status</label>
                        <span
                          className={`badge ${paymentStatusColors[p.status] ?? ""}`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div>
                        <label className="label">Payment Method</label>
                        <p className="text-sm text-white font-medium">
                          {p.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <label className="label">Scheduled Date</label>
                        <p className="text-sm text-white font-medium">
                          {formatDate(p.scheduledDate)}
                        </p>
                      </div>
                      {p.status === "Paid" && (
                        <>
                          <div>
                            <label className="label">Paid Date</label>
                            <p className="text-sm text-white font-medium">
                              {formatDate(p.paidDate!)}
                            </p>
                          </div>
                          {p.transactionReference && (
                            <div>
                              <label className="label">Transaction Reference</label>
                              <p className="text-sm text-white font-medium font-mono">
                                {p.transactionReference}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
