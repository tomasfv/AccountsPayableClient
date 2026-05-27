import React, { useState } from "react";
import Toggle from "./Toggle";

const ApprovalRulesSection: React.FC = () => {
  const [approvalType, setApprovalType] = useState("Single");
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(2500);
  const [requireNewVendor, setRequireNewVendor] = useState(true);
  const [fallbackApprover, setFallbackApprover] = useState("");

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Approval Rules</h3>
      <div>
        <label className="label">Approval Type</label>
        <select
          className="input select"
          value={approvalType}
          onChange={(e) => setApprovalType(e.target.value)}
        >
          <option value="Single">Single Approval</option>
          <option value="Multi-Level">Multi-Level Approval</option>
        </select>
      </div>
      <div>
        <label className="label">
          Auto-approve invoices under: ${autoApproveThreshold.toLocaleString()}
        </label>
        <input
          type="range"
          min={0}
          max={10000}
          step={500}
          value={autoApproveThreshold}
          onChange={(e) => setAutoApproveThreshold(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>$0</span>
          <span>$10,000</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Require approval for new vendors</p>
          <p className="text-xs text-slate-500">Bills from newly added vendors need explicit approval</p>
        </div>
        <Toggle checked={requireNewVendor} onChange={setRequireNewVendor} />
      </div>
      <div>
        <label className="label">Fallback Approver</label>
        <select
          className="input select"
          value={fallbackApprover}
          onChange={(e) => setFallbackApprover(e.target.value)}
        >
          <option value="">Select a fallback approver…</option>
          <option value="1">Jane Cooper (CFO)</option>
          <option value="2">Michael Roberts (VP Finance)</option>
          <option value="3">Sarah Chen (Accounting Manager)</option>
        </select>
      </div>
    </div>
  );
};

export default ApprovalRulesSection;
