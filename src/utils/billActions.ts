export type BillAction =
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

export function getActions(
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
      return { primary: "VIEW_DETAILS", secondary: ["DOWNLOAD_PDF"] };
  }
}

export const statusColors: Record<string, string> = {
  Draft: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  "Pending Approval":
    "bg-yellow-500/20 text-yellow-400 border border-yellow-500/10",
  Approved: "bg-blue-500/20 text-blue-400 border border-blue-500/10",
  Overdue: "bg-orange-500/20 text-orange-400 border border-orange-500/10",
  Rejected: "bg-red-500/20 text-red-400 border border-red-500/10",
  Cancelled: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Paid: "bg-green-500/20 text-green-400 border border-green-500/10",
};

export const paymentStatusColors: Record<string, string> = {
  "Not Scheduled": "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Scheduled: "bg-purple-500/20 text-purple-400 border border-purple-500/10",
  Processing: "bg-blue-500/20 text-blue-400 border border-blue-500/10",
  Paid: "bg-green-500/20 text-green-400 border border-green-500/10",
  Failed: "bg-red-500/20 text-red-400 border border-red-500/10",
  Cancelled: "bg-slate-500/20 text-slate-400 border border-slate-500/10",
  Refunded: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/10",
};

export const actionLabel: Record<BillAction, string> = {
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
