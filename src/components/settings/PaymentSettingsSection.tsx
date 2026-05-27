import React, { useState } from "react";
import Toggle from "./Toggle";

const PaymentSettingsSection: React.FC = () => {
  const [defaultMethod, setDefaultMethod] = useState("ACH");
  const [terms, setTerms] = useState("Net 30");
  const [cutoffTime, setCutoffTime] = useState("14:00");
  const [autoPay, setAutoPay] = useState(false);
  const [payDay, setPayDay] = useState("15");
  const [payDayType, setPayDayType] = useState("Due Date");

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Payment Settings</h3>
      <div>
        <label className="label">Default Payment Method</label>
        <select
          className="input select"
          value={defaultMethod}
          onChange={(e) => setDefaultMethod(e.target.value)}
        >
          <option value="ACH">ACH (Direct Deposit)</option>
          <option value="Card">Credit Card</option>
          <option value="Paper Check">Paper Check</option>
        </select>
      </div>
      <div>
        <label className="label">Payment Terms</label>
        <select className="input select" value={terms} onChange={(e) => setTerms(e.target.value)}>
          <option value="Net 15">Net 15</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
          <option value="Net 90">Net 90</option>
        </select>
      </div>
      <div>
        <label className="label">Payment Cutoff Time</label>
        <input
          type="time"
          className="input"
          value={cutoffTime}
          onChange={(e) => setCutoffTime(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-1">Payments submitted after this time process next business day</p>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Auto-pay for recurring bills</p>
          <p className="text-xs text-slate-500">Automatically process payments for recurring invoices</p>
        </div>
        <Toggle checked={autoPay} onChange={setAutoPay} />
      </div>
      <div>
        <label className="label">Default Payment Date</label>
        <div className="flex gap-3">
          <select
            className="input select flex-1"
            value={payDayType}
            onChange={(e) => setPayDayType(e.target.value)}
          >
            <option value="Due Date">Due Date</option>
            <option value="Day of Month">Day of Month</option>
          </select>
          {payDayType === "Day of Month" && (
            <input
              type="number"
              min={1}
              max={28}
              className="input w-20"
              value={payDay}
              onChange={(e) => setPayDay(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettingsSection;
