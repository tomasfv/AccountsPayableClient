import React, { useState } from "react";

const CompanySection: React.FC = () => {
  const [name, setName] = useState("Acme Corp");
  const [taxId, setTaxId] = useState("XX-XXXXXXX");
  const [address, setAddress] = useState("123 Innovation Drive, Suite 400");
  const [city, setCity] = useState("San Francisco");
  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("94105");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [website, setWebsite] = useState("https://acmecorp.com");

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-white">Company</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Company Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Tax ID / EIN</label>
          <input className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="label">Address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" value={state} onChange={(e) => setState(e.target.value)} />
        </div>
        <div>
          <label className="label">ZIP Code</label>
          <input className="input" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>
        <div>
          <label className="label">Website</label>
          <input className="input" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Company Logo</label>
        <div className="flex items-center justify-center h-32 rounded-xl border-2 border-dashed border-surface-border bg-surface-hover/30 cursor-pointer hover:border-brand-500/50 transition-colors">
          <p className="text-sm text-slate-500">Drop logo here or click to upload</p>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;
