/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RawOrder } from "../types";
import { Trash2, Plus, Upload, Check, AlertCircle } from "lucide-react";

interface OrdersViewProps {
  orders: RawOrder[];
  onChangeOrders: (newOrders: RawOrder[]) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onChangeOrders }) => {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Single Row Input State
  const [newOrderId, setNewOrderId] = useState("");
  const [newOrderDate, setNewOrderDate] = useState("2026-06-25");
  const [newMarket, setNewMarket] = useState("UK");
  const [newSku, setNewSku] = useState("SKU-DRS-001");
  const [newQty, setNewQty] = useState(10);
  const [newSalesType, setNewSalesType] = useState<"Normal" | "Preorder">("Normal");
  const [newStatus, setNewStatus] = useState<"Fulfilled" | "Unfulfilled">("Fulfilled");

  // Batch paste state
  const [batchText, setBatchText] = useState("");
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Pagination logic
  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + rowsPerPage);

  const handleAddRow = () => {
    if (!newOrderId.trim() || !newSku.trim()) {
      alert("Order ID and SKU cannot be blank.");
      return;
    }
    const record: RawOrder = {
      orderId: newOrderId.trim(),
      orderDate: newOrderDate,
      market: newMarket,
      sku: newSku.trim(),
      quantity: Number(newQty) || 1,
      salesType: newSalesType,
      fulfillmentStatus: newStatus,
    };
    onChangeOrders([record, ...orders]);
    setNewOrderId("");
    setNewQty(10);
    setCurrentPage(1);
  };

  const handleDeleteRow = (indexInOrders: number) => {
    const updated = [...orders];
    updated.splice(indexInOrders, 1);
    onChangeOrders(updated);
  };

  const handleBatchParse = () => {
    setBatchError("");
    setBatchSuccess(false);

    if (!batchText.trim()) {
      setBatchError("Paste content cannot be empty.");
      return;
    }

    try {
      const lines = batchText.trim().split("\n");
      const parsedOrders: RawOrder[] = [];

      lines.forEach((line, idx) => {
        // Support tab or comma separators
        const delimiter = line.includes("\t") ? "\t" : ",";
        const parts = line.split(delimiter).map((p) => p.trim());

        // Skip header if it is likely one
        if (idx === 0 && (parts[0].toLowerCase().includes("id") || parts[0].toLowerCase().includes("order"))) {
          return;
        }

        if (parts.length < 5) return; // skip malformed lines

        const orderId = parts[0];
        const orderDate = parts[1];
        const market = parts[2];
        const sku = parts[3];
        const quantity = parseInt(parts[4]) || 1;
        const salesType = parts[5]?.toLowerCase().includes("pre") ? "Preorder" : "Normal";
        const fulfillmentStatus = parts[6]?.toLowerCase().includes("un") ? "Unfulfilled" : "Fulfilled";

        if (orderId && sku) {
          parsedOrders.push({
            orderId,
            orderDate,
            market,
            sku,
            quantity,
            salesType,
            fulfillmentStatus,
          });
        }
      });

      if (parsedOrders.length === 0) {
        throw new Error("No valid order records were found. Please verify the layout.");
      }

      // Replace or prepend? Let's replace the whole list to simulate pasting a new sheet cleanly
      onChangeOrders(parsedOrders);
      setBatchSuccess(true);
      setBatchText("");
      setTimeout(() => {
        setBatchSuccess(false);
        setIsBatchOpen(false);
      }, 1500);
      setCurrentPage(1);
    } catch (err: any) {
      setBatchError(err.message || "Parse error. Please make sure the layout matches the columns.");
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="title-premium text-[var(--text-page-title)] font-medium">Shopify Raw Orders Ledger</h1>
          <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
            Browse, manually append, or paste raw transactional order sheets from external platforms.
          </p>
        </div>
        <button
          onClick={() => setIsBatchOpen(!isBatchOpen)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 transition-all font-semibold uppercase tracking-wider text-xs px-4 py-2 rounded-[var(--radius-sm)] shadow-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Paste Raw TSV/CSV
        </button>
      </div>

      {/* Batch Paste Box */}
      {isBatchOpen && (
        <div className="bg-slate-100 rounded-[var(--radius-lg)] p-5 border border-dashed border-[var(--color-border)] space-y-4">
          <div>
            <h3 className="font-semibold text-[var(--color-primary)] text-sm">Bulk Paste Shopify Order Data</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Supports CSV or tab-separated (TSV) clipboard outputs from Excel. Columns must correspond to:
              <br />
              <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[11px] font-mono mt-1 inline-block">
                Order_ID, Order_Date (YYYY-MM-DD), Market (UK/US/EU/AUS), SKU, Quantity, Sales_Type (Normal/Preorder), Status (Fulfilled/Unfulfilled)
              </code>
            </p>
          </div>

          <textarea
            className="w-full h-36 p-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono text-xs focus:ring-1 focus:ring-[var(--color-accent)]"
            placeholder="SP-1001&#9;2026-05-02&#9;UK&#9;SKU-DRS-001&#9;12&#9;Normal&#9;Fulfilled"
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {batchError && (
                <span className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {batchError}
                </span>
              )}
              {batchSuccess && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Import successful! Calculations updated.
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBatchOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-primary)] hover:bg-slate-200/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchParse}
                className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[var(--color-accent)] text-white rounded-[var(--radius-sm)] hover:bg-[var(--color-accent)]/90 cursor-pointer"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual row insertion form */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-[var(--color-border)] shadow-sm space-y-4">
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">Add Individual Record</h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
          {/* Order ID */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. SP-1031"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newOrderId}
              onChange={(e) => setNewOrderId(e.target.value)}
            />
          </div>

          {/* Order Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Order Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newOrderDate}
              onChange={(e) => setNewOrderDate(e.target.value)}
            />
          </div>

          {/* Market */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Market
            </label>
            <select
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
            >
              <option value="UK">UK</option>
              <option value="US">US</option>
              <option value="EU">EU</option>
              <option value="AUS">AUS</option>
            </select>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              SKU Reference
            </label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)] text-right"
              value={newQty}
              onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Sales Type */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Sales Type
            </label>
            <select
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newSalesType}
              onChange={(e) => setNewSalesType(e.target.value as "Normal" | "Preorder")}
            >
              <option value="Normal">Normal</option>
              <option value="Preorder">Pre-order</option>
            </select>
          </div>

          {/* Fulfillment Status */}
          <div className="flex items-end gap-2">
            <div className="grow">
              <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
                Fulfill Status
              </label>
              <select
                className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as "Fulfilled" | "Unfulfilled")}
              >
                <option value="Fulfilled">Fulfilled</option>
                <option value="Unfulfilled">Unfulfilled</option>
              </select>
            </div>
            <button
              onClick={handleAddRow}
              className="flex items-center justify-center p-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/95 text-white rounded-[var(--radius-sm)] shadow-sm transition-all cursor-pointer h-[34px] shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">Order ID</th>
                <th className="px-6 py-4 table-header-premium">Order Date</th>
                <th className="px-6 py-4 table-header-premium">Market</th>
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Quantity</th>
                <th className="px-6 py-4 table-header-premium">Sales Type</th>
                <th className="px-6 py-4 table-header-premium">Fulfillment Status</th>
                <th className="px-6 py-4 table-header-premium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-xs text-[var(--color-muted)] italic">
                    No raw order records loaded. Use manual adding or paste raw TSV above.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order, index) => {
                  const absoluteIndex = startIndex + index;
                  return (
                    <tr
                      key={`${order.orderId}-${absoluteIndex}`}
                      className={`transition-colors hover:bg-slate-50/50 ${
                        index % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                      }`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-[var(--color-primary)]">{order.orderId}</td>
                      <td className="px-6 py-3.5 text-xs text-[var(--color-primary)]">{order.orderDate}</td>
                      <td className="px-6 py-3.5 font-semibold text-[var(--color-primary)]">{order.market}</td>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-[var(--color-primary)]">{order.sku}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[var(--color-primary)]">{order.quantity}</td>
                      <td className="px-6 py-3.5 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.salesType === "Preorder"
                              ? "bg-blue-100 text-[var(--color-accent)]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {order.salesType === "Preorder" ? "Pre-order" : "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            order.fulfillmentStatus === "Fulfilled"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <button
                          onClick={() => handleDeleteRow(absoluteIndex)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-full transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex justify-between items-center bg-[#051C2C]/5 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-muted)] font-medium">
              Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, orders.length)} of {orders.length} orders
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 text-xs font-semibold bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-primary)] hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Prev
              </button>
              <span className="text-xs font-semibold px-3 py-1 flex items-center text-[var(--color-primary)]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 text-xs font-semibold bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] text-[var(--color-primary)] hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
