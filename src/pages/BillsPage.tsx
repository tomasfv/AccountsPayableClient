import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { confirmToast } from "../utils/confirmToast";
import {
  fetchBills,
  createBill,
  approveBill,
  rejectBill,
  updateBill,
  deleteBill,
  schedulePayment,
  reschedulePayment,
  cancelPayment,
  executePayment,
} from "../store/slices/billsSlice";
import type { Bill } from "../store/slices/billsSlice";
import { fetchVendors } from "../store/slices/vendorsSlice";

type BillAction =
  | "SUBMIT"
  | "EDIT"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "VIEW_DETAILS"
  | "DOWNLOAD_PDF"
  | "SCHEDULE"
  | "PAY_NOW"
  | "RESCHEDULE"
  | "CANCEL_PAYMENT"
  | "VIEW_PAYMENT"
  | "CONTACT_VENDOR"
  | "VIEW_RECEIPT"
  | "DOWNLOAD_RECEIPT"
  | "DUPLICATE_BILL"
  | "RESOLVE_PAYMENT"
  | "CHANGE_PAYMENT_METHOD"
  | "REVIEW_REFUND"
  | "VIEW_PAYMENT_HISTORY"
  | "EDIT_RESUBMIT"
  | "VIEW_REJECTION_REASON";

function getActions(
  billStatus: string,
  paymentStatus: string | null,
): { primary: BillAction | null; secondary: BillAction[] } {
  switch (billStatus) {
    case "Draft":
      return {
        primary: "SUBMIT",
        secondary: ["EDIT", "DELETE", "VIEW_DETAILS", "DOWNLOAD_PDF"],
      };
    case "Pending Approval":
      return {
        primary: "APPROVE",
        secondary: ["REJECT", "VIEW_DETAILS", "DOWNLOAD_PDF"],
      };
    case "Approved":
      switch (paymentStatus) {
        case null:
        case "Not Scheduled":
          return {
            primary: "SCHEDULE",
            secondary: ["PAY_NOW", "EDIT", "VIEW_DETAILS", "DOWNLOAD_PDF"],
          };
        case "Scheduled":
          return {
            primary: "PAY_NOW",
            secondary: [
              "RESCHEDULE",
              "CANCEL_PAYMENT",
              "VIEW_DETAILS",
              "DOWNLOAD_PDF",
            ],
          };
        case "Processing":
          return {
            primary: "VIEW_PAYMENT",
            secondary: ["VIEW_DETAILS", "CONTACT_VENDOR", "DOWNLOAD_PDF"],
          };
        case "Failed":
          return {
            primary: "PAY_NOW",
            secondary: [
              "CHANGE_PAYMENT_METHOD",
              "CONTACT_VENDOR",
              "VIEW_DETAILS",
            ],
          };
        case "Refunded":
          return {
            primary: "REVIEW_REFUND",
            secondary: ["VIEW_PAYMENT_HISTORY", "VIEW_DETAILS", "DOWNLOAD_PDF"],
          };
        default:
          return { primary: "VIEW_DETAILS", secondary: ["DOWNLOAD_PDF"] };
      }
    case "Paid":
      return {
        primary: "VIEW_DETAILS",
        secondary: ["DOWNLOAD_PDF"],
      };
    case "Overdue":
      return {
        primary: "RESOLVE_PAYMENT",
        secondary: [
          "PAY_NOW",
          "CONTACT_VENDOR",
          "VIEW_DETAILS",
          "DOWNLOAD_PDF",
        ],
      };
    case "Rejected":
      return {
        primary: "EDIT_RESUBMIT",
        secondary: ["DELETE", "VIEW_DETAILS", "DOWNLOAD_PDF"],
      };
    case "Cancelled":
      return {
        primary: "VIEW_DETAILS",
        secondary: ["DOWNLOAD_PDF"],
      };
    default:
      return { primary: null, secondary: ["VIEW_DETAILS"] };
  }
}

const statusColors: Record<string, string> = {
  Draft: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  "Pending Approval":
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10",
  Approved: "bg-blue-500/20 text-blue-400 border border-blue-500/10",
  Overdue: "bg-orange-500/20 text-orange-400 border border-orange-500/10",
  Rejected: "bg-red-500/20 text-red-400 border border-red-500/10",
  Cancelled: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Paid: "bg-green-500/20 text-green-400 border border-green-500/10",
};

const paymentStatusColors: Record<string, string> = {
  "Not Scheduled": "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Scheduled: "bg-purple-500/20 text-purple-400 border border-purple-500/10",
  Processing: "bg-blue-500/20 text-blue-400 border border-blue-500/10",
  Paid: "bg-green-500/20 text-green-400 border border-green-500/10",
  Failed: "bg-red-500/20 text-red-400 border border-red-500/10",
  Cancelled: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Refunded: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/10",
};

const BillsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: bills, loading } = useAppSelector((s) => s.bills);
  const { items: vendors } = useAppSelector((s) => s.vendors);
  const currentUser = useAppSelector((s) => s.auth.user);

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPayNowModal, setShowPayNowModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    vendorId: "",
    amount: "",
    invoiceNumber: "",
    dueDate: "",
  });
  const [scheduleForm, setScheduleForm] = useState({
    paymentMethod: "ACH" as "ACH" | "Paper Check" | "Card",
    scheduledDate: "",
  });
  const [rescheduleForm, setRescheduleForm] = useState({
    paymentMethod: "ACH" as "ACH" | "Paper Check" | "Card",
    scheduledDate: "",
  });
  const [payNowForm, setPayNowForm] = useState({
    paymentMethod: "ACH" as "ACH" | "Paper Check" | "Card",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    vendorId: "",
    amount: "",
    invoiceNumber: "",
    dueDate: "",
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFilePreview, setEditFilePreview] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetailBill, setSelectedDetailBill] = useState<Bill | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [openMenuBillId, setOpenMenuBillId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );

  useEffect(() => {
    dispatch(fetchBills());
    dispatch(fetchVendors());
  }, [dispatch]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    const result = await dispatch(
      createBill({
        vendorId: createForm.vendorId,
        amount: parseFloat(createForm.amount),
        invoiceNumber: createForm.invoiceNumber || undefined,
        dueDate: createForm.dueDate,
        file: selectedFile || undefined,
      }),
    );
    if (createBill.fulfilled.match(result)) {
      toast.success("Bill created successfully");
      setShowCreateModal(false);
      setCreateForm({
        vendorId: "",
        amount: "",
        invoiceNumber: "",
        dueDate: "",
      });
      if (filePreview) URL.revokeObjectURL(filePreview);
      setSelectedFile(null);
      setFilePreview(null);
      dispatch(fetchBills());
    } else {
      toast.error((result.payload as string) || "Failed to create bill");
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

  const handleOpenEdit = (bill: Bill) => {
    setEditBillId(bill.id);
    setEditForm({
      vendorId: bill.vendorId,
      amount: String(bill.amount),
      invoiceNumber: bill.invoiceNumber || "",
      dueDate: bill.dueDate
        ? new Date(bill.dueDate).toISOString().split("T")[0]
        : "",
    });
    setEditFile(null);
    setEditFilePreview(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBillId) return;
    const result = await dispatch(
      updateBill({
        id: editBillId,
        vendorId: editForm.vendorId,
        amount: parseFloat(editForm.amount),
        invoiceNumber: editForm.invoiceNumber || undefined,
        dueDate: editForm.dueDate,
        file: editFile || undefined,
      }),
    );
    if (updateBill.fulfilled.match(result)) {
      toast.success("Bill updated successfully");
      setShowEditModal(false);
      setEditBillId(null);
      if (editFilePreview) URL.revokeObjectURL(editFilePreview);
      setEditFile(null);
      setEditFilePreview(null);
      await dispatch(fetchBills());
    } else {
      toast.error((result.payload as string) || "Failed to update bill");
    }
  };

  const handleOpenDetails = (bill: Bill) => {
    setSelectedDetailBill(bill);
    setShowDetailsModal(true);
  };

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

  const handleOpenSchedule = (id: string, dueDate: string) => {
    setSelectedBillId(id);
    setScheduleForm({
      paymentMethod: "ACH",
      scheduledDate: dueDate
        ? new Date(dueDate).toISOString().split("T")[0]
        : "",
    });
    setShowScheduleModal(true);
  };

  const handleSchedulePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) return;
    const result = await dispatch(
      schedulePayment({
        id: selectedBillId,
        paymentMethod: scheduleForm.paymentMethod,
        scheduledDate: scheduleForm.scheduledDate,
      }),
    );
    if (schedulePayment.fulfilled.match(result)) {
      toast.success("Payment scheduled successfully");
      setShowScheduleModal(false);
      setSelectedBillId(null);
      await dispatch(fetchBills());
    } else {
      toast.error((result.payload as string) || "Failed to schedule payment");
    }
  };

  const handleReschedulePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) return;
    const result = await dispatch(
      reschedulePayment({
        id: selectedBillId,
        paymentMethod: rescheduleForm.paymentMethod,
        scheduledDate: rescheduleForm.scheduledDate,
      }),
    );
    if (reschedulePayment.fulfilled.match(result)) {
      toast.success("Payment rescheduled successfully");
      setShowRescheduleModal(false);
      setSelectedBillId(null);
      await dispatch(fetchBills());
    } else {
      toast.error((result.payload as string) || "Failed to reschedule payment");
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

  const handlePayNowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) return;
    const result = await dispatch(
      executePayment({
        id: selectedBillId,
        paymentMethod: payNowForm.paymentMethod,
      }),
    );
    if (executePayment.fulfilled.match(result)) {
      toast.success("Payment executed successfully");
      setShowPayNowModal(false);
      setSelectedBillId(null);
      await dispatch(fetchBills());
    } else {
      toast.error((result.payload as string) || "Failed to execute payment");
    }
  };

  const handleNotImplemented = () => {
    toast.error("Feature not yet implemented");
  };

  const handleSecondaryAction = async (
    billId: string,
    action: BillAction,
    bill?: Bill,
  ) => {
    setOpenMenuBillId(null);
    setMenuPos(null);
    switch (action) {
      case "EDIT":
        if (bill) handleOpenEdit(bill);
        break;
      case "DELETE":
        await handleDelete(billId);
        break;
      case "SUBMIT":
        handleNotImplemented();
        break;
      case "REJECT":
        await handleReject(billId);
        break;
      case "PAY_NOW":
        setSelectedBillId(billId);
        setPayNowForm({ paymentMethod: "ACH" });
        setShowPayNowModal(true);
        break;
      case "VIEW_DETAILS":
        if (bill) handleOpenDetails(bill);
        break;
      case "DOWNLOAD_PDF": {
        if (!bill?.fileUrl) {
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
      case "RESCHEDULE":
        setSelectedBillId(billId);
        setRescheduleForm({ paymentMethod: "ACH", scheduledDate: "" });
        setShowRescheduleModal(true);
        break;
      case "CANCEL_PAYMENT": {
        const confirmed = await confirmToast(
          "Are you sure you want to cancel the scheduled payment?",
        );
        if (!confirmed) break;
        const result = await dispatch(cancelPayment(billId));
        if (cancelPayment.fulfilled.match(result)) {
          toast.success("Payment cancelled");
          await dispatch(fetchBills());
        } else {
          toast.error((result.payload as string) || "Failed to cancel payment");
        }
        break;
      }
      case "CONTACT_VENDOR":
      case "DOWNLOAD_RECEIPT":
      case "DUPLICATE_BILL":
      case "CHANGE_PAYMENT_METHOD":
      case "VIEW_PAYMENT_HISTORY":
      case "VIEW_REJECTION_REASON":
        handleNotImplemented();
        break;
    }
  };

  const actionLabel: Record<BillAction, string> = {
    SUBMIT: "Submit for Approval",
    EDIT: "Edit",
    DELETE: "Delete",
    APPROVE: "Approve",
    REJECT: "Reject",
    VIEW_DETAILS: "View Details",
    DOWNLOAD_PDF: "Download PDF",
    SCHEDULE: "Schedule Payment",
    PAY_NOW: "Pay Now",
    RESCHEDULE: "Reschedule",
    CANCEL_PAYMENT: "Cancel Payment",
    VIEW_PAYMENT: "View Payment",
    CONTACT_VENDOR: "Contact Vendor",
    VIEW_RECEIPT: "View Receipt",
    DOWNLOAD_RECEIPT: "Download Receipt",
    DUPLICATE_BILL: "Duplicate Bill",
    RESOLVE_PAYMENT: "Resolve Payment",
    CHANGE_PAYMENT_METHOD: "Change Payment Method",
    REVIEW_REFUND: "Review Refund",
    VIEW_PAYMENT_HISTORY: "View Payment History",
    EDIT_RESUBMIT: "Edit & Resubmit",
    VIEW_REJECTION_REASON: "View Rejection Reason",
  };

  // Action authorizations based on role
  const canApprove =
    currentUser?.role === "Admin" || currentUser?.role === "Approver";
  const canPay = currentUser?.role === "Admin";

  const filteredBills = bills.filter(
    (b) => statusFilter === "All" || b.status === statusFilter,
  );

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
          "Draft",
          "Pending Approval",
          "Approved",
          "Overdue",
          "Rejected",
          "Cancelled",
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
                    No bills found. Create your first bill.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const latestPayment =
                    bill.payments?.[bill.payments.length - 1];
                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-surface-hover transition-colors"
                    >
                      <td className="table-cell font-mono text-xs text-slate-400">
                        {bill.invoiceNumber ?? bill.id.slice(0, 8) + "…"}
                      </td>
                      <td className="table-cell font-semibold text-white">
                        {bill.vendor?.name || "Unknown Vendor"}
                      </td>
                      <td className="table-cell text-slate-300">
                        {formatDate(bill.createdAt)}
                      </td>
                      <td className="table-cell text-slate-300 font-medium">
                        {formatDate(bill.dueDate)}
                      </td>
                      <td className="table-cell">
                        <span
                          className={`badge ${statusColors[bill.status] ?? ""}`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        {latestPayment ? (
                          <span
                            className={`badge ${paymentStatusColors[latestPayment.status] ?? ""}`}
                          >
                            {latestPayment.status} (
                            {latestPayment.paymentMethod})
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="table-cell font-semibold text-white">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const paymentStatus = latestPayment?.status ?? null;
                            const actions = getActions(
                              bill.status,
                              paymentStatus,
                            );

                            const canApproveAction = (a: BillAction) => {
                              if (a === "APPROVE") return canApprove;
                              if (
                                a === "PAY_NOW" ||
                                a === "SCHEDULE" ||
                                a === "RESCHEDULE" ||
                                a === "RESOLVE_PAYMENT"
                              )
                                return canPay;
                              return true;
                            };

                            return (
                              <>
                                {actions.primary &&
                                  canApproveAction(actions.primary) && (
                                    <button
                                      id={`action-${actions.primary.toLowerCase()}-${bill.id}`}
                                      onClick={() => {
                                        switch (actions.primary) {
                                          case "APPROVE":
                                            handleApprove(bill.id);
                                            break;
                                          case "SCHEDULE":
                                            handleOpenSchedule(
                                              bill.id,
                                              bill.dueDate,
                                            );
                                            break;
                                          case "PAY_NOW":
                                          case "RESOLVE_PAYMENT":
                                            handleExecutePayment(bill.id);
                                            break;
                                          case "VIEW_RECEIPT":
                                            handleNotImplemented();
                                            break;
                                          case "EDIT_RESUBMIT":
                                            handleOpenEdit(bill);
                                            break;
                                          default:
                                            if (actions.primary) {
                                              handleSecondaryAction(
                                                bill.id,
                                                actions.primary,
                                                bill,
                                              );
                                            }
                                        }
                                      }}
                                      className={`btn-secondary !px-2.5 !py-1 !text-xs cursor-pointer ${
                                        actions.primary === "APPROVE"
                                          ? "!bg-yellow-600/10 !text-yellow-400 hover:!bg-yellow-600/20"
                                          : actions.primary === "SCHEDULE"
                                            ? "!bg-purple-600/10 !text-purple-400 hover:!bg-purple-600/20"
                                            : actions.primary === "PAY_NOW" ||
                                                actions.primary ===
                                                  "RESOLVE_PAYMENT"
                                              ? "!bg-green-600/10 !text-green-400 hover:!bg-green-600/20"
                                              : actions.primary ===
                                                  "EDIT_RESUBMIT"
                                                ? "!bg-blue-600/10 !text-blue-400 hover:!bg-blue-600/20"
                                                : "!bg-brand-600/10 !text-brand-400 hover:!bg-brand-600/20"
                                      }`}
                                    >
                                      {actionLabel[actions.primary]}
                                    </button>
                                  )}

                                {actions.secondary.length > 0 && (
                                  <div className="relative">
                                    <button
                                      id={`action-more-${bill.id}`}
                                      onClick={(e) => {
                                        if (openMenuBillId === bill.id) {
                                          setOpenMenuBillId(null);
                                          setMenuPos(null);
                                        } else {
                                          const rect =
                                            e.currentTarget.getBoundingClientRect();
                                          setMenuPos({
                                            top: rect.bottom + 4,
                                            right:
                                              window.innerWidth - rect.right,
                                          });
                                          setOpenMenuBillId(bill.id);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors cursor-pointer"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle cx="12" cy="5" r="1.5" />
                                        <circle cx="12" cy="12" r="1.5" />
                                        <circle cx="12" cy="19" r="1.5" />
                                      </svg>
                                    </button>

                                    {openMenuBillId === bill.id && menuPos && (
                                      <>
                                        <div
                                          className="fixed inset-0 z-40"
                                          onClick={() => {
                                            setOpenMenuBillId(null);
                                            setMenuPos(null);
                                          }}
                                        />
                                        <div
                                          className="fixed z-50 w-44 py-1 bg-surface-card border border-surface-border rounded-lg shadow-2xl"
                                          style={{
                                            top: menuPos.top,
                                            right: menuPos.right,
                                          }}
                                        >
                                          {actions.secondary.map((action) => (
                                            <button
                                              key={action}
                                              id={`action-${action.toLowerCase()}-${bill.id}`}
                                              onClick={() =>
                                                handleSecondaryAction(
                                                  bill.id,
                                                  action,
                                                  bill,
                                                )
                                              }
                                              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-surface-hover hover:text-white transition-colors"
                                            >
                                              {actionLabel[action]}
                                            </button>
                                          ))}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-7xl relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Create New Invoice / Bill
            </h2>
            <form onSubmit={handleCreateBill}>
              <div className="flex gap-6">
                {/* Left: PDF Upload / Preview */}
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("File exceeds 10MB limit");
                              return;
                            }
                            setSelectedFile(file);
                            setFilePreview(URL.createObjectURL(file));
                          }
                        }}
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
                        onClick={() => {
                          if (filePreview) URL.revokeObjectURL(filePreview);
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Form */}
                <div className="w-1/2 space-y-4">
                  <div>
                    <label className="label">Vendor</label>
                    <select
                      required
                      className="input select"
                      value={createForm.vendorId}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          vendorId: e.target.value,
                        })
                      }
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
                      value={createForm.amount}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Invoice Number</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="INV-2026-XXXX"
                      value={createForm.invoiceNumber}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          invoiceNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={createForm.dueDate}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <button
                      type="button"
                      onClick={() => {
                        if (filePreview) URL.revokeObjectURL(filePreview);
                        setSelectedFile(null);
                        setFilePreview(null);
                        setShowCreateModal(false);
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
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Schedule Payment
            </h2>
            <form onSubmit={handleSchedulePayment} className="space-y-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  required
                  className="input select"
                  value={scheduleForm.paymentMethod}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      paymentMethod: e.target.value as
                        | "ACH"
                        | "Paper Check"
                        | "Card",
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
                  value={scheduleForm.scheduledDate}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      scheduledDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
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
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Reschedule Payment
            </h2>
            <form onSubmit={handleReschedulePayment} className="space-y-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  required
                  className="input select"
                  value={rescheduleForm.paymentMethod}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      paymentMethod: e.target.value as
                        | "ACH"
                        | "Paper Check"
                        | "Card",
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
                  value={rescheduleForm.scheduledDate}
                  onChange={(e) =>
                    setRescheduleForm({
                      ...rescheduleForm,
                      scheduledDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Now Modal */}
      {showPayNowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Pay Now</h2>
            <form onSubmit={handlePayNowSubmit} className="space-y-4">
              <div>
                <label className="label">Payment Method</label>
                <select
                  required
                  className="input select"
                  value={payNowForm.paymentMethod}
                  onChange={(e) =>
                    setPayNowForm({
                      ...payNowForm,
                      paymentMethod: e.target.value as
                        | "ACH"
                        | "Paper Check"
                        | "Card",
                    })
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
                  onClick={() => setShowPayNowModal(false)}
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
      )}

      {/* Edit Bill Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-7xl relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              Edit Invoice / Bill
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div className="flex gap-6">
                {/* Left: PDF Upload / Preview */}
                <div className="w-1/2 min-h-[700px]">
                  {!editFilePreview && !editFile ? (
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("File exceeds 10MB limit");
                              return;
                            }
                            setEditFile(file);
                            setEditFilePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full min-h-[700px] rounded-xl overflow-hidden border border-surface-border bg-black/20">
                      <embed
                        src={editFilePreview || ""}
                        type="application/pdf"
                        className="w-full h-full min-h-[700px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editFilePreview)
                            URL.revokeObjectURL(editFilePreview);
                          setEditFile(null);
                          setEditFilePreview(null);
                        }}
                        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium transition-colors"
                      >
                        Remove file
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Form */}
                <div className="w-1/2 space-y-4">
                  <div>
                    <label className="label">Vendor</label>
                    <select
                      required
                      className="input select"
                      value={editForm.vendorId}
                      onChange={(e) =>
                        setEditForm({ ...editForm, vendorId: e.target.value })
                      }
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
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, amount: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Invoice Number</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="INV-2026-XXXX"
                      value={editForm.invoiceNumber}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          invoiceNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Due Date</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={editForm.dueDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border">
                    <button
                      type="button"
                      onClick={() => {
                        if (editFilePreview)
                          URL.revokeObjectURL(editFilePreview);
                        setEditFile(null);
                        setEditFilePreview(null);
                        setShowEditModal(false);
                        setEditBillId(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedDetailBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-7xl relative border border-surface-border shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Bill Details</h2>
            <div className="flex gap-6">
              {/* Left: PDF Viewer */}
              <div className="w-1/2 min-h-[700px] rounded-xl overflow-hidden border border-surface-border bg-black/20">
                {selectedDetailBill.fileUrl ? (
                  <embed
                    src={selectedDetailBill.fileUrl}
                    type="application/pdf"
                    className="w-full h-full min-h-[700px]"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full min-h-[700px] text-slate-500 text-sm">
                    No PDF attached
                  </div>
                )}
              </div>

              {/* Right: Read-only Details */}
              <div className="w-1/2 space-y-4">
                <div>
                  <label className="label">Vendor</label>
                  <p className="text-sm text-white font-medium">
                    {selectedDetailBill.vendor?.name ||
                      selectedDetailBill.vendorId ||
                      "—"}
                  </p>
                </div>
                <div>
                  <label className="label">Amount (USD)</label>
                  <p className="text-sm text-white font-medium">
                    {formatCurrency(selectedDetailBill.amount)}
                  </p>
                </div>
                <div>
                  <label className="label">Invoice Number</label>
                  <p className="text-sm text-white font-medium">
                    {selectedDetailBill.invoiceNumber || "—"}
                  </p>
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <p className="text-sm text-white font-medium">
                    {formatDate(selectedDetailBill.dueDate)}
                  </p>
                </div>
                <div>
                  <label className="label">Status</label>
                  <span
                    className={`badge ${statusColors[selectedDetailBill.status] ?? ""}`}
                  >
                    {selectedDetailBill.status}
                  </span>
                </div>
                <div>
                  <label className="label">Created By</label>
                  <p className="text-sm text-white font-medium">
                    {selectedDetailBill.creator?.fullName || "—"}
                  </p>
                </div>
                {selectedDetailBill.approver && (
                  <div>
                    <label className="label">Approved By</label>
                    <p className="text-sm text-white font-medium">
                      {selectedDetailBill.approver.fullName}
                    </p>
                  </div>
                )}

                {/* Payment Details */}
                {selectedDetailBill.payments &&
                  selectedDetailBill.payments.length > 0 && (
                    <div className="pt-4 border-t border-surface-border space-y-4">
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
                        Payment Details
                      </h3>
                      {(() => {
                        const p =
                          selectedDetailBill.payments![
                            selectedDetailBill.payments!.length - 1
                          ];
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
                                    <label className="label">
                                      Transaction Reference
                                    </label>
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
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedDetailBill(null);
                    }}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
