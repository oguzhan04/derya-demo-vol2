import React from 'react';

export default function ParsingBar({ value, onChange }) {
  const v = value || { docType:'auto', dateFormat:'auto', numberFormat:'auto' };

  const set = (k, val) => onChange?.({ ...v, [k]: val });

  return (
    <div className="w-full rounded-xl border border-slate-200/60 bg-white p-3 lg:p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Document Type */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Document type</label>
          <select
            className="text-sm rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-300 px-3 py-2"
            value={v.docType}
            onChange={e => set('docType', e.target.value)}
          >
            <option value="auto">Auto</option>
            <option value="invoice">Commercial Invoice</option>
            <option value="packing">Packing List</option>
            <option value="bl">Bill of Lading (BL)</option>
            <option value="awb">Air Waybill (AWB)</option>
            <option value="freightInvoice">Freight Invoice</option>
            <option value="customs">Customs</option>
          </select>
        </div>

        {/* Date Format */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Date format</label>
          <select
            className="text-sm rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-300 px-3 py-2"
            value={v.dateFormat}
            onChange={e => set('dateFormat', e.target.value)}
          >
            <option value="auto">Auto</option>
            <option value="DMY">DD/MM/YYYY</option>
            <option value="MDY">MM/DD/YYYY</option>
          </select>
        </div>

        {/* Number Format */}
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">Number format</label>
          <select
            className="text-sm rounded-lg border-slate-300 focus:ring-2 focus:ring-slate-300 px-3 py-2"
            value={v.numberFormat}
            onChange={e => set('numberFormat', e.target.value)}
          >
            <option value="auto">Auto</option>
            <option value="us">1,234.56 (US)</option>
            <option value="eu">1.234,56 (EU)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
