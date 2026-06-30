/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ConfigRow, RawOrder, RawReturn } from "./types";
import {
  initialConfig,
  initialOrders,
  initialReturns,
  initialSkuOverrides,
  SkuPlanOverride,
} from "./data/mockData";
import { performSpreadsheetCalculations } from "./utils/calculations";

// Views
import { ExecutiveDashboardView } from "./components/ExecutiveDashboardView";
import { ConfigView } from "./components/ConfigView";
import { OrdersView } from "./components/OrdersView";
import { ReturnsView } from "./components/ReturnsView";
import {
  PreorderLiabilityTable,
  CohortReturnModelTable,
  CorrectedDemandTable,
  POPlannerTable,
  LocationAllocatorTable,
  ReconciliationTable,
} from "./components/CalculatedTablesView";

// Icons
import {
  Download,
  Upload,
  RotateCcw,
  Clock,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  CornerUpLeft,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  Truck,
  FileCheck2,
} from "lucide-react";

export default function App() {
  // ── 1. Spreadsheet Core States ──
  const [config, setConfig] = useState<ConfigRow[]>(() => {
    const saved = localStorage.getItem("dtc_inventory_config");
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [orders, setOrders] = useState<RawOrder[]>(() => {
    const saved = localStorage.getItem("dtc_inventory_orders");
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [returns, setReturns] = useState<RawReturn[]>(() => {
    const saved = localStorage.getItem("dtc_inventory_returns");
    return saved ? JSON.parse(saved) : initialReturns;
  });

  const [skuOverrides, setSkuOverrides] = useState<SkuPlanOverride[]>(() => {
    const saved = localStorage.getItem("dtc_inventory_sku_overrides");
    return saved ? JSON.parse(saved) : initialSkuOverrides;
  });

  const [lastSaved, setLastSaved] = useState<string>(() => {
    const saved = localStorage.getItem("dtc_inventory_last_saved");
    return saved || new Date().toLocaleTimeString();
  });

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // ── 2. Auto-save triggers ──
  useEffect(() => {
    localStorage.setItem("dtc_inventory_config", JSON.stringify(config));
    localStorage.setItem("dtc_inventory_orders", JSON.stringify(orders));
    localStorage.setItem("dtc_inventory_returns", JSON.stringify(returns));
    localStorage.setItem("dtc_inventory_sku_overrides", JSON.stringify(skuOverrides));
    
    const timeNow = new Date().toLocaleTimeString();
    localStorage.setItem("dtc_inventory_last_saved", timeNow);
    setLastSaved(timeNow);
  }, [config, orders, returns, skuOverrides]);

  // ── 3. Dynamic computations ──
  const {
    preorderLiability,
    cohortReturnModel,
    avgReturnRate,
    correctedDemand,
    poPlanner,
    locationAllocation,
    reconciliation,
    salesDays,
  } = performSpreadsheetCalculations(config, orders, returns, skuOverrides);

  // ── 4. Backup & utilities handlers ──
  const handleExportBackup = () => {
    const backupData = {
      config,
      orders,
      returns,
      skuOverrides,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `DTC_Inventory_Backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.config && parsed.orders && parsed.returns && parsed.skuOverrides) {
            setConfig(parsed.config);
            setOrders(parsed.orders);
            setReturns(parsed.returns);
            setSkuOverrides(parsed.skuOverrides);
            alert("Backup imported successfully! Control console refreshed.");
          } else {
            alert("Import failed: JSON file structure is missing key databases.");
          }
        } catch (error) {
          alert("Import failed: Invalid JSON format.");
        }
      };
    }
  };

  const handleResetData = () => {
    setConfig(initialConfig);
    setOrders(initialOrders);
    setReturns(initialReturns);
    setSkuOverrides(initialSkuOverrides);
    setShowResetConfirm(false);
  };

  // ── 5. View router ──
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <ExecutiveDashboardView
            orders={orders}
            returns={returns}
            preorderLiability={preorderLiability}
            cohortReturnModel={cohortReturnModel}
            avgReturnRate={avgReturnRate}
            correctedDemand={correctedDemand}
            poPlanner={poPlanner}
            reconciliation={reconciliation}
            onSelectTab={setActiveTab}
          />
        );
      case "config":
        return <ConfigView config={config} onChangeConfig={setConfig} />;
      case "orders":
        return <OrdersView orders={orders} onChangeOrders={setOrders} />;
      case "returns":
        return <ReturnsView returns={returns} onChangeReturns={setReturns} />;
      case "liability":
        return <PreorderLiabilityTable data={preorderLiability} />;
      case "cohort":
        return <CohortReturnModelTable data={cohortReturnModel} avgRate={avgReturnRate} />;
      case "demand":
        return <CorrectedDemandTable data={correctedDemand} avgRate={avgReturnRate} />;
      case "planner":
        return (
          <POPlannerTable
            data={poPlanner}
            salesDays={salesDays}
            skuPlanOverrides={skuOverrides}
            onChangeOverrides={setSkuOverrides}
          />
        );
      case "allocator":
        return <LocationAllocatorTable data={locationAllocation} />;
      case "reconciliation":
        return (
          <ReconciliationTable
            data={reconciliation}
            skuPlanOverrides={skuOverrides}
            onChangeOverrides={setSkuOverrides}
          />
        );
      default:
        return null;
    }
  };

  // Nav tab definitions with corresponding sheet icon labels
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "config", label: "Config", icon: Settings },
    { id: "orders", label: "Raw Orders", icon: ShoppingCart },
    { id: "returns", label: "Raw Returns", icon: CornerUpLeft },
    { id: "liability", label: "Liability", icon: DollarSign },
    { id: "cohort", label: "Cohort Model", icon: TrendingUp },
    { id: "demand", label: "Corrected Demand", icon: FileSpreadsheet },
    { id: "planner", label: "PO Planner", icon: CheckCircle },
    { id: "allocator", label: "Allocator", icon: Truck },
    { id: "reconciliation", label: "Recon Audit", icon: FileCheck2 },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-body-text)]">
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#051C2C]/40 backdrop-blur-md">
          <div className="bg-white rounded-[var(--radius-lg)] shadow-lg max-w-md w-full p-6 border border-[var(--color-border)] animate-fade-up">
            <h3 className="section-title-premium text-lg font-bold text-[var(--color-primary)]">Reset Console State?</h3>
            <p className="text-xs text-[var(--color-muted)] mt-2">
              This action resets all customized configurations, warehouse quantities, pasted order sheets, and returns back to standard pre-seeded defaults.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-slate-100 text-[var(--color-primary)] hover:bg-slate-200/60 rounded-[var(--radius-sm)] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-negative)] hover:bg-[var(--color-negative)]/90 text-white rounded-[var(--radius-sm)] transition-all cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 56px Sticky Horiz Navigation Bar ── */}
      <header className="sticky top-0 z-40 h-[56px] bg-white border-b border-[var(--nav-border)] shadow-nav">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity in Bold Typography theme style */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-[#051C2C] flex items-center justify-center rounded">
              <div className="w-4 h-4 bg-[#2251FF] rotate-45"></div>
            </div>
            <span className="font-bold text-[#051C2C] tracking-tight text-sm uppercase hidden md:inline-block">
              DTC Inventory Control Deck
            </span>
          </div>

          {/* Right: Tab selectors */}
          <nav className="flex items-center h-full overflow-x-auto select-none no-scrollbar gap-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 h-full font-sans text-xs uppercase font-semibold tracking-[0.04em] transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                    isActive
                      ? "text-[var(--color-primary)] border-[var(--color-accent)] bg-blue-50/10"
                      : "text-[var(--nav-text-inactive)] border-transparent hover:text-[var(--color-primary)]"
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[var(--color-accent)]" : "text-slate-400"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Secondary Control / Auto-save Status Utility Bar ── */}
      <section className="bg-white border-b border-[var(--nav-border)] py-2 text-xs">
        <div className="max-w-[1400px] mx-auto px-10 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Last Saved Tracker */}
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span>Auto-saving enabled.</span>
            <span className="font-semibold text-[var(--color-primary)] font-mono">Last saved: {lastSaved}</span>
          </div>

          {/* Core Utilities Buttons */}
          <div className="flex items-center gap-3">
            {/* Export */}
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-all cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1 rounded-[var(--radius-sm)]"
            >
              <Download className="w-3.5 h-3.5" />
              Export Backup
            </button>

            {/* Import */}
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-all cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1 rounded-[var(--radius-sm)]">
              <Upload className="w-3.5 h-3.5" />
              Import Backup
              <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
            </label>

            {/* Reset */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-all cursor-pointer bg-slate-50 border border-rose-100 px-3 py-1 rounded-[var(--radius-sm)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data
            </button>
          </div>
        </div>
      </section>

      {/* ── Primary Container Layout (1400px Max-Width, 40px Side Padding) ── */}
      <main className="max-w-[1400px] mx-auto px-10 py-10">
        <div className="bg-transparent">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
