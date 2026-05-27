import React from "react";
import type { Section } from "./types";

interface Props {
  sections: { id: Section; icon: React.ReactNode }[];
  activeSection: Section;
  onSelect: (s: Section) => void;
}

const SettingsSidebar: React.FC<Props> = ({ sections, activeSection, onSelect }) => (
  <nav className="w-56 shrink-0 space-y-1">
    {sections.map((s) => (
      <button
        key={s.id}
        onClick={() => onSelect(s.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
          activeSection === s.id
            ? "bg-brand-600/20 text-brand-400 border border-brand-500/20"
            : "text-slate-400 hover:text-white hover:bg-surface-hover border border-transparent"
        }`}
      >
        {s.icon}
        {s.id}
      </button>
    ))}
  </nav>
);

export default SettingsSidebar;
