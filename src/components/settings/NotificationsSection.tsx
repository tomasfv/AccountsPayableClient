import React, { useState } from "react";
import Toggle from "./Toggle";

const NotificationsSection: React.FC = () => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [billApproved, setBillApproved] = useState(true);
  const [billRejected, setBillRejected] = useState(false);
  const [billOverdue, setBillOverdue] = useState(true);
  const [paymentExecuted, setPaymentExecuted] = useState(true);
  const [paymentFailed, setPaymentFailed] = useState(true);
  const [digest, setDigest] = useState("Real-time");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");

  const emailToggles: { label: string; val: boolean; set: (v: boolean) => void }[] = [
    { label: "Bill approved", val: billApproved, set: setBillApproved },
    { label: "Bill rejected", val: billRejected, set: setBillRejected },
    { label: "Bill overdue", val: billOverdue, set: setBillOverdue },
    { label: "Payment executed", val: paymentExecuted, set: setPaymentExecuted },
    { label: "Payment failed", val: paymentFailed, set: setPaymentFailed },
  ];

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Notifications</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Email Notifications</p>
          <p className="text-xs text-slate-500">Receive email alerts for bill and payment events</p>
        </div>
        <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
      </div>
      {emailEnabled && (
        <div className="space-y-3 pl-4 border-l border-surface-border">
          {emailToggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between">
              <p className="text-sm text-slate-300">{t.label}</p>
              <Toggle checked={t.val} onChange={t.set} />
            </div>
          ))}
          <div>
            <label className="label">Digest Frequency</label>
            <select
              className="input select"
              value={digest}
              onChange={(e) => setDigest(e.target.value)}
            >
              <option value="Real-time">Real-time</option>
              <option value="Daily">Daily Digest</option>
              <option value="Weekly">Weekly Digest</option>
            </select>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-surface-border">
        <div>
          <p className="text-sm font-medium text-white">SMS Notifications</p>
          <p className="text-xs text-slate-500">Get critical alerts via text message</p>
        </div>
        <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
      </div>
      {smsEnabled && (
        <div>
          <label className="label">Phone Number</label>
          <input
            className="input"
            placeholder="+1 (555) 000-0000"
            value={smsPhone}
            onChange={(e) => setSmsPhone(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;
