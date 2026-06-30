/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ConfigRow } from "../types";
import { Info, AlertTriangle } from "lucide-react";

interface ConfigViewProps {
  config: ConfigRow[];
  onChangeConfig: (newConfig: ConfigRow[]) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ config, onChangeConfig }) => {
  const handleCellChange = (index: number, field: keyof ConfigRow, value: number) => {
    const updated = [...config];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChangeConfig(updated);
  };

  const totalAllocation = config.reduce((sum, c) => sum + c.allocationRatio, 0);
  const isAllocationValid = Math.abs(totalAllocation - 1.0) < 0.0001;

  return (
    <div className="animate-fade-up space-y-6">
      {/* Page header and subtitle with elegant Garamond typography */}
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Global Settings & Rules</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          Configure supply chain metrics, logistical buffers, and localized distribution ratios below.
        </p>
      </div>

      {/* Insight card */}
      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[var(--color-primary)]">Logistical buffer control:</span>
          <p className="text-xs text-[var(--color-primary)] opacity-90 mt-1">
            Editable cells are highlighted in pale yellow to distinguish them from static formulas. Changes propagate
            instantly throughout all connected inventory models and cohort predictions.
          </p>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">Market</th>
                <th className="px-6 py-4 table-header-premium text-right">Standard Lead Time (Days)</th>
                <th className="px-6 py-4 table-header-premium text-right">Return Window (Days)</th>
                <th className="px-6 py-4 table-header-premium text-right">Pre-order Safety Coefficient</th>
                <th className="px-6 py-4 table-header-premium text-right">Regional Allocation Ratio (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {config.map((row, idx) => (
                <tr
                  key={row.market}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                  }`}
                >
                  <td className="px-6 py-4 font-semibold text-[var(--color-primary)]">{row.market}</td>
                  
                  {/* Standard Lead Time */}
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      min="1"
                      className="yellow-input-premium w-28 px-3 py-1 text-right rounded-[var(--radius-sm)] font-medium border-0"
                      value={row.leadTimeDays}
                      onChange={(e) => handleCellChange(idx, "leadTimeDays", parseInt(e.target.value) || 0)}
                    />
                  </td>

                  {/* Return Window */}
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      min="1"
                      className="yellow-input-premium w-28 px-3 py-1 text-right rounded-[var(--radius-sm)] font-medium border-0"
                      value={row.returnWindow}
                      onChange={(e) => handleCellChange(idx, "returnWindow", parseInt(e.target.value) || 0)}
                    />
                  </td>

                  {/* Pre-order Safety Coeff */}
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      className="yellow-input-premium w-28 px-3 py-1 text-right rounded-[var(--radius-sm)] font-medium border-0"
                      value={row.preorderSafetyFactor}
                      onChange={(e) => handleCellChange(idx, "preorderSafetyFactor", parseFloat(e.target.value) || 0)}
                    />
                  </td>

                  {/* Allocation Ratio */}
                  <td className="px-6 py-3 text-right">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      className="yellow-input-premium w-28 px-3 py-1 text-right rounded-[var(--radius-sm)] font-medium border-0"
                      value={Math.round(row.allocationRatio * 100)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleCellChange(idx, "allocationRatio", val / 100);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Validation bar */}
        <div className="bg-[#051C2C]/5 px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-[var(--color-border)] gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-primary)]">
              Global Distribution Sum:
            </span>
            <span
              className={`font-mono text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                isAllocationValid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {Math.round(totalAllocation * 100)}%
            </span>
          </div>

          {!isAllocationValid && (
            <div className="flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Regional allocation values must sum to 100% for proper inventory split.</span>
            </div>
          )}

          {isAllocationValid && (
            <div className="text-emerald-700 text-xs font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All systems fully balanced and aligned.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
