import React from "react";
import type { Bill } from "../../store/slices/billsSlice";
import { formatDate, formatCurrency } from "../../utils/format";
import {
  getActions,
  statusColors,
  paymentStatusColors,
  actionLabel,
  type BillAction,
} from "../../utils/billActions";

interface Props {
  bill: Bill;
  canApprove: boolean;
  canPay: boolean;
  isMenuOpen: boolean;
  menuPos: { top: number; right: number } | null;
  onToggleMenu: (billId: string, button: HTMLElement) => void;
  onCloseMenu: () => void;
  onAction: (action: BillAction, bill: Bill, fromMenu: boolean) => void;
}

const primaryButtonStyle = (action: BillAction): string => {
  if (action === "APPROVE")
    return "!bg-yellow-600/10 !text-yellow-400 hover:!bg-yellow-600/20";
  if (action === "SCHEDULE")
    return "!bg-purple-600/10 !text-purple-400 hover:!bg-purple-600/20";
  if (action === "PAY_NOW" || action === "RESOLVE_PAYMENT")
    return "!bg-green-600/10 !text-green-400 hover:!bg-green-600/20";
  if (action === "EDIT_RESUBMIT")
    return "!bg-blue-600/10 !text-blue-400 hover:!bg-blue-600/20";
  return "!bg-brand-600/10 !text-brand-400 hover:!bg-brand-600/20";
};

const canApproveAction = (
  a: BillAction,
  canApprove: boolean,
  canPay: boolean,
) => {
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

const BillsTableRow: React.FC<Props> = ({
  bill,
  canApprove,
  canPay,
  isMenuOpen,
  menuPos,
  onToggleMenu,
  onCloseMenu,
  onAction,
}) => {
  const latestPayment = bill.payments?.[bill.payments.length - 1];
  const paymentStatus = latestPayment?.status ?? null;
  const actions = getActions(bill.status, paymentStatus);
  const effectivePrimary: BillAction =
    actions.primary && canApproveAction(actions.primary, canApprove, canPay)
      ? actions.primary
      : "VIEW_DETAILS";

  return (
    <tr className="hover:bg-surface-hover transition-colors">
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
        <span className={`badge ${statusColors[bill.status] ?? ""}`}>
          {bill.status}
        </span>
      </td>
      <td className="table-cell">
        {latestPayment ? (
          <span
            className={`badge ${paymentStatusColors[latestPayment.status] ?? ""}`}
          >
            {latestPayment.status} ({latestPayment.paymentMethod})
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
          <button
            id={`action-${effectivePrimary.toLowerCase()}-${bill.id}`}
            onClick={() => onAction(effectivePrimary, bill, false)}
            className={`btn-secondary !px-2.5 !py-1 !text-xs cursor-pointer ${primaryButtonStyle(effectivePrimary)}`}
          >
            {actionLabel[effectivePrimary]}
          </button>

          {actions.secondary.length > 0 && (
            <div className="relative">
              <button
                id={`action-more-${bill.id}`}
                onClick={(e) => {
                  if (isMenuOpen) {
                    onCloseMenu();
                  } else {
                    onToggleMenu(bill.id, e.currentTarget);
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

              {isMenuOpen && menuPos && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={onCloseMenu}
                  />
                  <div
                    className="fixed z-50 w-44 py-1 bg-surface-card border border-surface-border rounded-lg shadow-2xl"
                    style={{ top: menuPos.top, right: menuPos.right }}
                  >
                    {actions.secondary.map((action) => (
                      <button
                        key={action}
                        id={`action-${action.toLowerCase()}-${bill.id}`}
                        onClick={() => {
                          onCloseMenu();
                          onAction(action, bill, true);
                        }}
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
        </div>
      </td>
    </tr>
  );
};

export default BillsTableRow;
