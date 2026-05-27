import React, { useState } from "react";

const integrations = [
  {
    name: "QuickBooks",
    description: "Sync bills and payments with QuickBooks Online",
    color: "green",
  },
  {
    name: "Xero",
    description: "Connect your Xero account for seamless reconciliation",
    color: "blue",
  },
  {
    name: "Bank Account (Plaid)",
    description: "Link your business bank account via Plaid",
    color: "purple",
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  green: { bg: "bg-green-500/20", text: "text-green-400" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
};

const IntegrationsSection: React.FC = () => {
  const [connStatus, setConnStatus] = useState(() => {
    const arr = integrations.map(() => false);
    arr[0] = true;
    arr[2] = true;
    return arr;
  });

  const toggleConnection = (idx: number) => {
    const next = [...connStatus];
    next[idx] = !next[idx];
    setConnStatus(next);
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Integrations</h3>
      {integrations.map((int, idx) => (
        <div
          key={int.name}
          className="flex items-center justify-between p-4 rounded-xl bg-surface border border-surface-border"
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${colorMap[int.color].bg}`}>
              <svg
                className={`w-6 h-6 ${colorMap[int.color].text}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{int.name}</p>
              <p className="text-xs text-slate-500">{int.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold ${
                connStatus[idx] ? "text-green-400" : "text-slate-500"
              }`}
            >
              {connStatus[idx] ? "Connected" : "Not Connected"}
            </span>
            <button
              onClick={() => toggleConnection(idx)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                connStatus[idx]
                  ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "border-brand-500/30 text-brand-400 hover:bg-brand-500/10"
              }`}
            >
              {connStatus[idx] ? "Disconnect" : "Connect"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IntegrationsSection;
