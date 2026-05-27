import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { confirmToast } from "../utils/confirmToast";
import {
  fetchBills,
  approveBill,
  rejectBill,
  deleteBill,
  cancelPayment,
  executePayment,
} from "../store/slices/billsSlice";
import type { Bill } from "../types";
import { fetchVendors } from "../store/slices/vendorsSlice";
import type { BillAction } from "../utils/billActions";
import BillsTableRow from "../components/bills/BillsTableRow";
import CreateBillModal from "../components/bills/CreateBillModal";
import EditBillModal from "../components/bills/EditBillModal";
import ViewDetailsModal from "../components/bills/ViewDetailsModal";
import SchedulePaymentModal from "../components/bills/SchedulePaymentModal";
import ReschedulePaymentModal from "../components/bills/ReschedulePaymentModal";
import PayNowModal from "../components/bills/PayNowModal";

const BillsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: bills, loading } = useAppSelector((s) => s.bills);
  const { items: vendors } = useAppSelector((s) => s.vendors);
  const currentUser = useAppSelector((s) => s.auth.user);

  // Modal visibility
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPayNowModal, setShowPayNowModal] = useState(false);

  // Modal data
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedDetailBill, setSelectedDetailBill] = useState<Bill | null>(
    null,
  );
  const [editTargetBill, setEditTargetBill] = useState<Bill | null>(null);
  const [scheduleDueDate, setScheduleDueDate] = useState("");

  // Filter & menu state
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [openMenuBillId, setOpenMenuBillId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );

  const canApprove =
    currentUser?.role === "Admin" || currentUser?.role === "Approver";
  const canPay = currentUser?.role === "Admin";

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchVendors());
  }, [dispatch]);

  const filteredBills = bills.filter((b) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Overdue") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(b.dueDate + "T00:00:00") < today;
    }
    return b.status === statusFilter;
  });

  // --- Action handlers ---
  const handleApprove = async (id: string) => {
    if (await confirmToast("Are you sure you want to approve this bill?")) {
      const result = await dispatch(approveBill(id));
      if (approveBill.fulfilled.match(result)) {
        toast.success("Bill approved successfully");
        await dispatch(fetchBills());
      } else {
        toast.error((result.payload as string) || "Failed to approve bill");
      }
    }
  };

  const handleReject = async (id: string) => {
    if (await confirmToast("Are you sure you want to reject this bill?")) {
      const result = await dispatch(rejectBill(id));
      if (rejectBill.fulfilled.match(result)) {
        toast.success("Bill rejected successfully");
        await dispatch(fetchBills());
      } else {
        toast.error((result.payload as string) || "Failed to reject bill");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirmToast("Delete this bill permanently?")) {
      const result = await dispatch(deleteBill(id));
      if (deleteBill.fulfilled.match(result)) {
        toast.success("Bill deleted successfully");
        await dispatch(fetchBills());
      } else {
        toast.error((result.payload as string) || "Failed to delete bill");
      }
    }
  };

  const handleExecutePayment = async (id: string, paymentMethod?: string) => {
    if (
      await confirmToast("Are you sure you want to execute this payment now?")
    ) {
      const result = await dispatch(executePayment({ id, paymentMethod }));
      if (executePayment.fulfilled.match(result)) {
        toast.success("Payment executed successfully");
        await dispatch(fetchBills());
      } else {
        toast.error((result.payload as string) || "Failed to execute payment");
      }
    }
  };

  const handleCancelPayment = async (id: string) => {
    if (
      await confirmToast(
        "Are you sure you want to cancel the scheduled payment?",
      )
    ) {
      const result = await dispatch(cancelPayment(id));
      if (cancelPayment.fulfilled.match(result)) {
        toast.success("Payment cancelled");
        await dispatch(fetchBills());
      } else {
        toast.error((result.payload as string) || "Failed to cancel payment");
      }
    }
  };

  // Unified action dispatcher from BillsTableRow
  const handleAction = (action: BillAction, bill: Bill, fromMenu: boolean) => {
    switch (action) {
      case "APPROVE":
        handleApprove(bill.id);
        break;
      case "REJECT":
        handleReject(bill.id);
        break;
      case "DELETE":
        handleDelete(bill.id);
        break;
      case "VIEW_DETAILS":
        setSelectedDetailBill(bill);
        setShowDetailsModal(true);
        break;
      case "EDIT":
      case "EDIT_RESUBMIT":
        setEditTargetBill(bill);
        setShowEditModal(true);
        break;
      case "SCHEDULE":
        setSelectedBillId(bill.id);
        setScheduleDueDate(bill.dueDate);
        setShowScheduleModal(true);
        break;
      case "PAY_NOW":
        if (fromMenu) {
          // Secondary PAY_NOW opens modal for payment method selection
          setSelectedBillId(bill.id);
          setShowPayNowModal(true);
        } else {
          // Primary PAY_NOW executes directly
          handleExecutePayment(bill.id);
        }
        break;
      case "RESOLVE_PAYMENT":
        handleExecutePayment(bill.id);
        break;
      case "RESCHEDULE":
        setSelectedBillId(bill.id);
        setShowRescheduleModal(true);
        break;
      case "CANCEL_PAYMENT":
        handleCancelPayment(bill.id);
        break;
      case "DOWNLOAD_PDF": {
        if (!bill.fileUrl) {
          toast.error("No PDF file submitted to this bill");
          break;
        }
        const a = document.createElement("a");
        a.href = bill.fileUrl;
        a.download = bill.fileUrl.split("/").pop() || "bill.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Downloading PDF...");
        break;
      }
      default:
        toast.error("Feature not yet implemented");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bills</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {filteredBills.length} bills showing
          </p>
        </div>
        <button
          id="create-bill-btn"
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Bill
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-4">
        {[
          "All",
          "Pending Approval",
          "Approved",
          "Overdue",
          "Rejected",
          "Paid",
        ].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
              statusFilter === f
                ? "bg-brand-600/20 text-brand-400 border-brand-500/20"
                : "text-slate-400 border-transparent hover:bg-surface-hover hover:text-slate-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading && bills.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-400">
            Loading…
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                {[
                  "Invoice / ID",
                  "Vendor",
                  "Created",
                  "Due Date",
                  "Status",
                  "Payment Status",
                  "Amount",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="table-header">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-500">
                    No bills found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <BillsTableRow
                    key={bill.id}
                    bill={bill}
                    canApprove={canApprove}
                    canPay={canPay}
                    isMenuOpen={openMenuBillId === bill.id}
                    menuPos={menuPos}
                    onToggleMenu={(id, btn) => {
                      const rect = btn.getBoundingClientRect();
                      setMenuPos({
                        top: rect.bottom + 4,
                        right: window.innerWidth - rect.right,
                      });
                      setOpenMenuBillId(id);
                    }}
                    onCloseMenu={() => {
                      setOpenMenuBillId(null);
                      setMenuPos(null);
                    }}
                    onAction={handleAction}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <CreateBillModal
        open={showCreateModal}
        vendors={vendors}
        onClose={() => setShowCreateModal(false)}
      />

      {editTargetBill && (
        <EditBillModal
          open={showEditModal}
          bill={editTargetBill}
          vendors={vendors}
          onClose={() => {
            setShowEditModal(false);
            setEditTargetBill(null);
          }}
        />
      )}

      {selectedDetailBill && (
        <ViewDetailsModal
          open={showDetailsModal}
          bill={selectedDetailBill}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDetailBill(null);
          }}
        />
      )}

      {selectedBillId && (
        <>
          <SchedulePaymentModal
            open={showScheduleModal}
            billId={selectedBillId}
            dueDate={scheduleDueDate}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedBillId(null);
            }}
          />
          <ReschedulePaymentModal
            open={showRescheduleModal}
            billId={selectedBillId}
            onClose={() => {
              setShowRescheduleModal(false);
              setSelectedBillId(null);
            }}
          />
          <PayNowModal
            open={showPayNowModal}
            billId={selectedBillId}
            onClose={() => {
              setShowPayNowModal(false);
              setSelectedBillId(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default BillsPage;
