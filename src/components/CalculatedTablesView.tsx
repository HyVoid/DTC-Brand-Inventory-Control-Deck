/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  PreorderLiabilityRow,
  CohortReturnRow,
  CorrectedDemandRow,
  POPlannerRow,
  LocationAllocationRow,
  ReconciliationRow
} from "../types";
import { SkuPlanOverride } from "../data/mockData";
import { Info, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

// ============================================================================
// 1. PREORDER LIABILITY TABLE
// ============================================================================
interface PreorderLiabilityTableProps {
  data: PreorderLiabilityRow[];
}

export const PreorderLiabilityTable: React.FC<PreorderLiabilityTableProps> = ({ data }) => {
  const maxLiability = Math.max(...data.map((r) => r.outstandingLiability), 1);

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Pre-order Liability Calculation</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          Outstanding, unfulfilled pre-order liability per SKU. Used to prevent double-counting of sales signals.
        </p>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Pre-order Deduction Rule:</span>
          Outstanding pre-orders represent stock already sold and owed to customers. This quantity must be subtracted 
          from available inventory and treated as a distinct demand factor in procurement planning.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Total Pre-order Sold</th>
                <th className="px-6 py-4 table-header-premium text-right">Pre-order Fulfilled</th>
                <th className="px-6 py-4 table-header-premium text-right" style={{ width: "40%" }}>Outstanding Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, idx) => {
                const percentage = (row.outstandingLiability / maxLiability) * 100;
                return (
                  <tr
                    key={row.sku}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--color-primary)]">{row.sku}</td>
                    <td className="px-6 py-4 text-right font-medium text-[var(--color-primary)]">{row.totalPreorderSold}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{row.preorderFulfilled}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[var(--color-primary)]">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-mono text-xs">{row.outstandingLiability}</span>
                        {/* Inline Data Bar: Brand color fill with track in 10% opacity */}
                        <div className="w-32 h-2.5 bg-[#051C2C]/10 rounded-full overflow-hidden shrink-0 hidden sm:block">
                          <div
                            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. COHORT RETURN MODEL TABLE
// ============================================================================
interface CohortReturnModelTableProps {
  data: CohortReturnRow[];
  avgRate: number;
}

export const CohortReturnModelTable: React.FC<CohortReturnModelTableProps> = ({ data, avgRate }) => {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="title-premium text-[var(--text-page-title)] font-medium">Cohort Return Analysis</h1>
          <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
            Tracking returns based on order creation month (cohort). Essential to capture actual return lag.
          </p>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-2 shadow-sm text-right">
          <span className="block text-[10px] uppercase tracking-wider font-semibold text-[var(--color-muted)]">
            Avg Cohort Return Rate
          </span>
          <span className="kpi-value-premium text-2xl font-bold text-[var(--color-accent)]">
            {(avgRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Why Cohorts Matter:</span>
          Conventional return accounting (monthly returns / monthly sales) is highly distorted due to transit and return
          lag. By linking returns directly to the order month cohort and tracking windows (D14, D30, D45), we isolate
          the actual product performance.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">Cohort Month</th>
                <th className="px-6 py-4 table-header-premium text-right">Cohort Sales Qty</th>
                <th className="px-6 py-4 table-header-premium text-right">Returned ≤ 14 Days</th>
                <th className="px-6 py-4 table-header-premium text-right">Returned 15–30 Days</th>
                <th className="px-6 py-4 table-header-premium text-right">Returned 31–45 Days</th>
                <th className="px-6 py-4 table-header-premium text-right">Ultimate Return Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[var(--color-muted)] italic">
                    No order/return logs to calculate cohort months.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row.cohortMonth}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[var(--color-primary)]">
                      {row.cohortMonth}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[var(--color-primary)]">
                      {row.cohortSalesQty}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.returnsD14}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.returnsD30}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{row.returnsD45}</td>
                    <td className="px-6 py-4 text-right font-bold text-[var(--color-primary)]">
                      {(row.ultimateReturnRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. CORRECTED DEMAND SIGNAL TABLE
// ============================================================================
interface CorrectedDemandTableProps {
  data: CorrectedDemandRow[];
  avgRate: number;
}

export const CorrectedDemandTable: React.FC<CorrectedDemandTableProps> = ({ data, avgRate }) => {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Cleaned Demand Signal Feed</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          Cleaned demand signals pushed directly to external platforms (like Inventory Planner). Filters out return buffers and unfulfilled pre-orders.
        </p>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Cleansing Logic:</span>
          <span className="font-mono text-blue-700 block mb-1">
            Corrected_Demand_Signal = Raw_Sales_Qty - Preorder_Liability - (Raw_Sales_Qty * Avg_Cohort_Return_Rate)
          </span>
          This formula strips out pending preorder liability and subtracts projected returns (which will go back into stock) 
          to feed the cleanest possible demand signal back to forecasting engines, preventing over-purchasing.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Raw Sales Qty</th>
                <th className="px-6 py-4 table-header-premium text-right">Pre-order Distortion</th>
                <th className="px-6 py-4 table-header-premium text-right">Projected Returned Qty</th>
                <th className="px-6 py-4 table-header-premium text-right font-bold text-[var(--color-accent)]">Corrected Demand Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, idx) => (
                <tr
                  key={row.sku}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--color-primary)]">{row.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-[var(--color-primary)]">{row.rawSalesQty}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-500">{row.preorderDistortion}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-500">
                    {row.expectedReturnQty} <span className="text-[10px] text-slate-400">({(avgRate * 100).toFixed(0)}%)</span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[var(--color-accent)] font-mono text-sm">
                    {row.correctedDemandSignal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. PO PLANNER TABLE
// ============================================================================
interface POPlannerTableProps {
  data: POPlannerRow[];
  salesDays: number;
  skuPlanOverrides: SkuPlanOverride[];
  onChangeOverrides: (updated: SkuPlanOverride[]) => void;
}

export const POPlannerTable: React.FC<POPlannerTableProps> = ({
  data,
  salesDays,
  skuPlanOverrides,
  onChangeOverrides,
}) => {
  const maxQty = Math.max(...data.map((r) => r.recommendedPOQty), 1);

  const handleOverrideChange = (sku: string, field: keyof SkuPlanOverride, value: number) => {
    const updated = skuPlanOverrides.map((item) => {
      if (item.sku === sku) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });
    onChangeOverrides(updated);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="title-premium text-[var(--text-page-title)] font-medium">Procurement PO Planner</h1>
          <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
            Calculate dynamic supply gaps and convert them into standard MOQ-rounded purchase order proposals.
          </p>
        </div>
        <div className="bg-[#051C2C]/5 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs text-[var(--color-primary)] font-mono font-semibold shrink-0">
          Global Sales Period: {salesDays} Days
        </div>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Procurement Logic:</span>
          <span className="font-mono text-blue-700 block mb-1">
            Net_Requirement = (Daily_Demand_Rate * Target_Stock_Days) - Current_On_Hand + Preorder_Liability
          </span>
          The planner adds preorder liabilities as strict stock-outs to prevent missing client expectations, calculates 
          the supply gap, and automatically rounds up to standard factory MOQ multiples for immediate PO release.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Daily Velocity</th>
                <th className="px-6 py-4 table-header-premium text-right">Target Days</th>
                <th className="px-6 py-4 table-header-premium text-right">Current On Hand</th>
                <th className="px-6 py-4 table-header-premium text-right font-semibold text-[var(--color-primary)]">Net Gap</th>
                <th className="px-6 py-4 table-header-premium text-right">Factory MOQ</th>
                <th className="px-6 py-4 table-header-premium text-right" style={{ width: "30%" }}>Recommended PO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, idx) => {
                const percentage = (row.recommendedPOQty / maxQty) * 100;
                return (
                  <tr
                    key={row.sku}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                    }`}
                  >
                    <td className="px-6 py-3 font-mono text-xs font-semibold text-[var(--color-primary)]">{row.sku}</td>
                    
                    {/* Daily Velocity */}
                    <td className="px-6 py-3 text-right font-mono text-xs font-semibold text-slate-600">
                      {row.dailyDemandRate}
                    </td>

                    {/* Target Stock Days (Editable) */}
                    <td className="px-6 py-2 text-right">
                      <input
                        type="number"
                        min="1"
                        className="yellow-input-premium w-20 px-2.5 py-1 text-right rounded-[var(--radius-sm)] border-0 text-xs font-bold"
                        value={row.targetStockDays}
                        onChange={(e) => handleOverrideChange(row.sku, "targetStockDays", parseInt(e.target.value) || 0)}
                      />
                    </td>

                    {/* Current On Hand (Editable) */}
                    <td className="px-6 py-2 text-right">
                      <input
                        type="number"
                        min="0"
                        className="yellow-input-premium w-20 px-2.5 py-1 text-right rounded-[var(--radius-sm)] border-0 text-xs font-bold"
                        value={row.currentOnHand}
                        onChange={(e) => handleOverrideChange(row.sku, "currentOnHand", parseInt(e.target.value) || 0)}
                      />
                    </td>

                    {/* Net Gap */}
                    <td className="px-6 py-3 text-right font-semibold text-[var(--color-primary)] font-mono text-xs">
                      {row.netPORequirement}
                    </td>

                    {/* Supplier MOQ (Editable) */}
                    <td className="px-6 py-2 text-right">
                      <input
                        type="number"
                        min="1"
                        className="yellow-input-premium w-20 px-2.5 py-1 text-right rounded-[var(--radius-sm)] border-0 text-xs font-bold"
                        value={row.supplierMOQ}
                        onChange={(e) => handleOverrideChange(row.sku, "supplierMOQ", parseInt(e.target.value) || 0)}
                      />
                    </td>

                    {/* Recommended PO Qty (Visual bar) */}
                    <td className="px-6 py-3 text-right font-bold text-[var(--color-accent)]">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-mono text-sm">{row.recommendedPOQty}</span>
                        <div className="w-24 h-2.5 bg-[#051C2C]/10 rounded-full overflow-hidden shrink-0 hidden sm:block">
                          <div
                            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. LOCATION ALLOCATOR TABLE
// ============================================================================
interface LocationAllocatorTableProps {
  data: LocationAllocationRow[];
}

export const LocationAllocatorTable: React.FC<LocationAllocatorTableProps> = ({ data }) => {
  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Local Allocation Dispatcher</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          Automatically divide procurement requirements based on regional market ratios defined in settings.
        </p>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Global Fulfillment Routing:</span>
          Regional divisions sum directly to the total proposed PO. These split quantities form the localized dispatch and pack lists used directly by factory shipping crews.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Total PO Qty</th>
                <th className="px-6 py-4 table-header-premium text-right font-semibold text-[var(--color-primary)]">UK Warehouse</th>
                <th className="px-6 py-4 table-header-premium text-right font-semibold text-[var(--color-primary)]">US Warehouse</th>
                <th className="px-6 py-4 table-header-premium text-right font-semibold text-[var(--color-primary)]">EU Warehouse</th>
                <th className="px-6 py-4 table-header-premium text-right font-semibold text-[var(--color-primary)]">AUS Warehouse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, idx) => (
                <tr
                  key={row.sku}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--color-primary)]">{row.sku}</td>
                  <td className="px-6 py-4 text-right font-bold text-[var(--color-accent)] font-mono text-xs">
                    {row.totalPOToAllocate}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 font-mono text-xs">{row.ukAllocation}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 font-mono text-xs">{row.usAllocation}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 font-mono text-xs">{row.euAllocation}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 font-mono text-xs">{row.ausAllocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 6. RECONCILIATION TABLE
// ============================================================================
interface ReconciliationTableProps {
  data: ReconciliationRow[];
  skuPlanOverrides: SkuPlanOverride[];
  onChangeOverrides: (updated: SkuPlanOverride[]) => void;
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  data,
  skuPlanOverrides,
  onChangeOverrides,
}) => {
  const handleIPSyncChange = (sku: string, val: number) => {
    const updated = skuPlanOverrides.map((item) => {
      if (item.sku === sku) {
        return {
          ...item,
          ipLiabilitySync: val,
        };
      }
      return item;
    });
    onChangeOverrides(updated);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Cross-Platform Sync Audit</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          Hook and audit raw outstanding pre-orders between Shopify and Inventory Planner (IP). Spot latency issues instantly.
        </p>
      </div>

      <div className="insight-block-premium p-4 rounded-[var(--radius-md)] flex items-start gap-3">
        <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--color-primary)]">
          <span className="font-semibold block mb-1">Data Pipeline Audit:</span>
          Shopify ledger unfulfilled liabilities are cross-checked with the quantities synchronized inside IP. 
          Discrepancies (Gaps) represent catalog mapping lag, interface sync errors, or manual cancellations that need fast manual intervention.
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Shopify Unfulfilled Ledger</th>
                <th className="px-6 py-4 table-header-premium text-right">IP Registered Liability</th>
                <th className="px-6 py-4 table-header-premium text-right">Synchronize Gap</th>
                <th className="px-6 py-4 table-header-premium text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, idx) => (
                <tr
                  key={row.sku}
                  className={`transition-colors hover:bg-slate-50/50 ${
                    idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                  }`}
                >
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-[var(--color-primary)]">{row.sku}</td>
                  <td className="px-6 py-4 text-right font-medium text-[var(--color-primary)] font-mono text-xs">
                    {row.shopifyUnfulfilled}
                  </td>
                  
                  {/* IP synced value (Editable to simulate discrepancy) */}
                  <td className="px-6 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      className="yellow-input-premium w-24 px-2.5 py-1 text-right rounded-[var(--radius-sm)] border-0 text-xs font-bold font-mono"
                      value={row.ipLiabilitySync}
                      onChange={(e) => handleIPSyncChange(row.sku, parseInt(e.target.value) || 0)}
                    />
                  </td>

                  {/* Sync Gap */}
                  <td
                    className={`px-6 py-4 text-right font-bold font-mono text-xs ${
                      row.syncGap !== 0 ? "text-[var(--color-negative)]" : "text-slate-500"
                    }`}
                  >
                    {row.syncGap}
                  </td>

                  {/* Audit Badge Status */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        row.reconciliationStatus === "PASS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {row.reconciliationStatus === "PASS" ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Balanced
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Investigate
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
