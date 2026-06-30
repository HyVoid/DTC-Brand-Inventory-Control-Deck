/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { RawOrder, RawReturn, PreorderLiabilityRow, CohortReturnRow, CorrectedDemandRow, POPlannerRow, ReconciliationRow } from "../types";
import { ShoppingBag, RefreshCcw, Landmark, ShieldAlert, BadgePercent, ArrowRight } from "lucide-react";

interface ExecutiveDashboardProps {
  orders: RawOrder[];
  returns: RawReturn[];
  preorderLiability: PreorderLiabilityRow[];
  cohortReturnModel: CohortReturnRow[];
  avgReturnRate: number;
  correctedDemand: CorrectedDemandRow[];
  poPlanner: POPlannerRow[];
  reconciliation: ReconciliationRow[];
  onSelectTab: (tabId: string) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardProps> = ({
  orders,
  returns,
  preorderLiability,
  cohortReturnModel,
  avgReturnRate,
  correctedDemand,
  poPlanner,
  reconciliation,
  onSelectTab,
}) => {
  // 1. KPI Calculations
  const totalSalesQty = orders.reduce((sum, o) => sum + o.quantity, 0);
  const totalOutstandingPreorder = preorderLiability.reduce((sum, r) => sum + r.outstandingLiability, 0);
  const totalCorrectedDemand = correctedDemand.reduce((sum, r) => sum + r.correctedDemandSignal, 0);
  const totalRecommendedPO = poPlanner.reduce((sum, r) => sum + r.recommendedPOQty, 0);

  // Discrepancy checks (gap != 0)
  const discrepancies = reconciliation.filter((r) => r.syncGap !== 0);
  const discrepancyCount = discrepancies.length;

  // Regional breakdown
  const regionalBreakdown = orders.reduce((acc, o) => {
    acc[o.market] = (acc[o.market] || 0) + o.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-fade-up space-y-8">
      {/* Page Title & Context */}
      <div>
        <h1 className="title-premium text-[var(--text-page-title)] font-medium">Control Center</h1>
        <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
          DTC Multi-Warehouse Inventory Reconciliation and Demand Cleansing Control Console.
        </p>
      </div>

      {/* Discrepancy Anomaly Banner (Only shown if discrepencies exist - Semantic red applied strictly for required actions!) */}
      {discrepancyCount > 0 && (
        <div className="bg-[rgba(211,47,47,0.04)] border-l-3 border-[var(--color-negative)] p-4 rounded-[var(--radius-md)] flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[var(--color-negative)] shrink-0 mt-0.5" />
          <div className="grow">
            <h4 className="font-semibold text-[var(--color-negative)] text-sm uppercase tracking-wide">
              Cross-Platform Discrepancies Registered ({discrepancyCount} Alerts)
            </h4>
            <p className="text-xs text-[var(--color-primary)] mt-1">
              Shopify outstanding unfulfilled pre-orders do not match registered Inventory Planner liability lists. Click 
              below to resolve catalog sync and mapping errors.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {discrepancies.map((d) => (
                <span key={d.sku} className="inline-block bg-white text-[10px] font-mono text-[var(--color-negative)] px-2 py-0.5 rounded border border-red-200">
                  {d.sku}: Sync Gap ({d.syncGap})
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onSelectTab("reconciliation")}
            className="text-xs font-bold text-[var(--color-negative)] flex items-center gap-1 hover:underline cursor-pointer"
          >
            Audit List <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Row (Using Garamond display font with neutral direction-indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Raw Sales Volume */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Raw Sales Vol
            </span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="kpi-value-premium text-3xl font-bold">{totalSalesQty}</div>
          <div className="text-[10px] text-[var(--color-muted)] font-medium mt-1">
            Standard Gross units
          </div>
        </div>

        {/* KPI 2: Pre-order Debt */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Pre-order Debt
            </span>
            <Landmark className="w-4 h-4 text-slate-400" />
          </div>
          <div className="kpi-value-premium text-3xl font-bold text-[var(--color-accent)]">
            {totalOutstandingPreorder}
          </div>
          <div className="text-[10px] text-[var(--color-muted)] font-medium mt-1">
            Owed / Unfulfilled units
          </div>
        </div>

        {/* KPI 3: Cohort Return Rate */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Cohort Return Rate
            </span>
            <BadgePercent className="w-4 h-4 text-slate-400" />
          </div>
          <div className="kpi-value-premium text-3xl font-bold">{(avgReturnRate * 100).toFixed(1)}%</div>
          <div className="text-[10px] text-[var(--color-muted)] font-medium mt-1">
            Weighted return lag filter
          </div>
        </div>

        {/* KPI 4: Cleaned Demand Baseline */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Cleaned Demand
            </span>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <div className="kpi-value-premium text-3xl font-bold text-[var(--color-accent)]">{totalCorrectedDemand}</div>
          <div className="text-[10px] text-[var(--color-muted)] font-medium mt-1">
            Real market signal feed
          </div>
        </div>

        {/* KPI 5: Total Global Procurement POs */}
        <div className="bg-[var(--color-surface)] p-5 rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border)] hover:translate-y-[-2px] hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              Procured PO Qty
            </span>
            <RefreshCcw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="kpi-value-premium text-3xl font-bold">{totalRecommendedPO}</div>
          <div className="text-[10px] text-[var(--color-muted)] font-medium mt-1">
            Global factory buy sheet
          </div>
        </div>
      </div>

      {/* SVG Interactive Bento Graphics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bento Card 1: Cleaned Demand vs Preorder Debt per SKU */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="section-title-premium text-[var(--text-section)] font-medium mb-1">
              Clean Demand Signal vs Pre-order Inflation
            </h3>
            <p className="text-xs text-[var(--color-muted)] mb-6">
              Shows how preorder and return distortions inflate raw sales metrics. The solid blue bar represents actual procurement signal.
            </p>
          </div>

          {/* Render Premium Vector bar-chart */}
          <div className="space-y-4">
            {correctedDemand.map((row) => {
              const maxVal = Math.max(...correctedDemand.map((r) => r.rawSalesQty), 1);
              const demandPercent = (row.correctedDemandSignal / maxVal) * 100;
              const rawPercent = (row.rawSalesQty / maxVal) * 100;

              return (
                <div key={row.sku} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono font-bold text-[var(--color-primary)]">{row.sku}</span>
                    <span className="text-slate-500 text-[11px]">
                      Cleaned: <strong className="text-[var(--color-accent)]">{row.correctedDemandSignal}</strong> / Raw:{" "}
                      <strong>{row.rawSalesQty}</strong>
                    </span>
                  </div>

                  {/* Horizontal visual container */}
                  <div className="w-full h-5 bg-slate-100 rounded overflow-hidden relative">
                    {/* Raw bar track */}
                    <div
                      className="absolute top-0 left-0 h-full bg-[#051C2C]/10 transition-all duration-500"
                      style={{ width: `${rawPercent}%` }}
                    />
                    {/* Cleaned bar fill */}
                    <div
                      className="absolute top-0 left-0 h-full bg-[var(--color-accent)] transition-all duration-500"
                      style={{ width: `${demandPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex gap-4 text-[10px] uppercase font-bold text-[var(--color-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[var(--color-accent)] rounded"></span>
              Corrected Demand
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#051C2C]/10 rounded"></span>
              Raw Sales Gap
            </span>
          </div>
        </div>

        {/* Bento Card 2: Regional Sales Distribution (Pie chart alternative using premium vector rings) */}
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="section-title-premium text-[var(--text-section)] font-medium mb-1">
              Regional Sales Split
            </h3>
            <p className="text-xs text-[var(--color-muted)] mb-6">
               régional distribution of standard order volumes (UK, US, EU, AUS). Use configs to match distribution weights.
            </p>
          </div>

          {/* Render Premium Distribution Vector */}
          <div className="grid grid-cols-4 gap-4 py-4 text-center">
            {["UK", "US", "EU", "AUS"].map((m) => {
              const qty = regionalBreakdown[m] || 0;
              const pct = totalSalesQty > 0 ? (qty / totalSalesQty) * 100 : 0;

              return (
                <div key={m} className="space-y-2">
                  <span className="block text-xs font-bold text-[var(--color-primary)]">{m}</span>
                  {/* Concentric indicator */}
                  <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-[#051C2C]/10"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        className="stroke-[var(--color-accent)] transition-all duration-700"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)}
                      />
                    </svg>
                    <div className="absolute font-mono text-xs font-bold text-[var(--color-primary)]">
                      {Math.round(pct)}%
                    </div>
                  </div>
                  <span className="block text-xs font-semibold text-slate-500 font-mono">{qty} units</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Ratios mapped dynamically to localized warehouse allocators.</span>
            <button
              onClick={() => onSelectTab("config")}
              className="text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer"
            >
              Update Allocation Rules
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Logistics Directives (Bento Actions Block) */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-6 border border-[var(--color-border)] shadow-sm">
        <h3 className="section-title-premium text-[var(--text-section)] font-medium mb-1">
          Active Procurement Directives
        </h3>
        <p className="text-xs text-[var(--color-muted)] mb-5">
          Priority operations formulated in real-time from active gaps, preorder liability, and MOQ rounded constraints.
        </p>

        {/* Directives Lists */}
        <div className="space-y-3.5">
          {poPlanner
            .filter((p) => p.recommendedPOQty > 0)
            .map((p) => (
              <div
                key={p.sku}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[var(--radius-md)] bg-[#F5F5F2] border border-[var(--color-border)] transition-all hover:bg-slate-100 gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-[#051C2C] text-white px-2 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-primary)]">
                      Fulfill Pre-order & Safety Gap
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Net gap registered at <strong className="text-[var(--color-primary)] font-mono">{p.netPORequirement} units</strong>. Current warehouse stocks stand at <strong className="font-mono">{p.currentOnHand}</strong> with safety days set to <strong className="font-mono">{p.targetStockDays}</strong>.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-[9px] uppercase font-bold tracking-wider text-slate-500 mb-0.5">
                    Proposed factory order
                  </span>
                  <span className="text-base font-extrabold text-[var(--color-accent)] font-mono">
                    {p.recommendedPOQty} units
                  </span>
                  <span className="block text-[9px] text-slate-400 font-semibold italic">
                    (Rounded to {p.supplierMOQ} MOQ)
                  </span>
                </div>
              </div>
            ))}

          {poPlanner.filter((p) => p.recommendedPOQty > 0).length === 0 && (
            <div className="text-center py-6 text-xs text-[var(--color-muted)] italic">
              All warehouse stocks healthy and within limits. No procurement sheets need release at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
