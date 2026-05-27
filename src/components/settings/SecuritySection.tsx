import React, { useState } from "react";
import Toggle from "./Toggle";

const SecuritySection: React.FC = () => {
  const [twoFA, setTwoFA] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState("90 days");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24, 10.0.0.0/16");

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Security</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
          <p className="text-xs text-slate-500">Require OTP code from authenticator app on login</p>
        </div>
        <Toggle checked={twoFA} onChange={setTwoFA} />
      </div>
      <div>
        <label className="label">Password Expiry</label>
        <select
          className="input select"
          value={passwordExpiry}
          onChange={(e) => setPasswordExpiry(e.target.value)}
        >
          <option value="30 days">30 days</option>
          <option value="60 days">60 days</option>
          <option value="90 days">90 days</option>
          <option value="Never">Never</option>
        </select>
      </div>
      <div>
        <label className="label">Session Timeout: {sessionTimeout} min</label>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>5 min</span>
          <span>120 min</span>
        </div>
      </div>
      <div>
        <label className="label">IP Whitelist</label>
        <input
          className="input font-mono text-xs"
          placeholder="Comma-separated CIDR ranges"
          value={ipWhitelist}
          onChange={(e) => setIpWhitelist(e.target.value)}
        />
        <p className="text-xs text-slate-500 mt-1">Only requests from these IP ranges will be allowed</p>
      </div>
      <div className="pt-2">
        <p className="text-xs text-slate-500">
          Last password change: <span className="text-slate-300 font-medium">May 15, 2026</span>
        </p>
      </div>
    </div>
  );
};

export default SecuritySection;
