import React from "react";

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({
  checked,
  onChange,
}) => (
  <div
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${
      checked ? "bg-brand-600" : "bg-slate-700"
    }`}
  >
    <div
      className={`w-4 h-4 bg-white rounded-full transition-transform ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </div>
);

export default Toggle;
