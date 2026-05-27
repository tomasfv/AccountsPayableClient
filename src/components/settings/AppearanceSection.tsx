import React, { useState } from "react";
import Toggle from "./Toggle";

const accentColors = [
  { name: "blue", class: "bg-blue-500" },
  { name: "purple", class: "bg-purple-500" },
  { name: "green", class: "bg-green-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "pink", class: "bg-pink-500" },
];

const AppearanceSection: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [density, setDensity] = useState("Comfortable");
  const [language, setLanguage] = useState("English");
  const [accent, setAccent] = useState("blue");

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Appearance</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">Dark Mode</p>
          <p className="text-xs text-slate-500">Use dark theme across the application</p>
        </div>
        <Toggle checked={darkMode} onChange={setDarkMode} />
      </div>
      <div>
        <label className="label">Density</label>
        <select className="input select" value={density} onChange={(e) => setDensity(e.target.value)}>
          <option value="Compact">Compact</option>
          <option value="Comfortable">Comfortable</option>
        </select>
      </div>
      <div>
        <label className="label">Language</label>
        <select className="input select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
      </div>
      <div>
        <label className="label">Accent Color</label>
        <div className="flex gap-3">
          {accentColors.map((c) => (
            <button
              key={c.name}
              onClick={() => setAccent(c.name)}
              className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                accent === c.name
                  ? "ring-2 ring-white ring-offset-2 ring-offset-surface-card"
                  : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSection;
