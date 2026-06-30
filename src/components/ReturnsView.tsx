/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { RawReturn } from "../types";
import { Trash2, Plus, Upload, Check, AlertCircle } from "lucide-react";

interface ReturnsViewProps {
  returns: RawReturn[];
  onChangeReturns: (newReturns: RawReturn[]) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({ returns, onChangeReturns }) => {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Single Row Input State
  const [newReturnId, setNewReturnId] = useState("");
  const [newOrderId, setNewOrderId] = useState("");
  const [newReturnDate, setNewReturnDate] = useState("2026-06-25");
  const [newSku, setNewSku] = useState("SKU-DRS-001");
  const [newQty, setNewQty] = useState(2);

  // Batch paste state
  const [batchText, setBatchText] = useState("");
  const [batchError, setBatchError] = useState("");
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Pagination logic
  const totalPages = Math.ceil(returns.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentReturns = returns.slice(startIndex, startIndex + rowsPerPage);

  const handleAddRow = () => {
    if (!newReturnId.trim() || !newOrderId.trim() || !newSku.trim()) {
      alert("Return ID, Linked Order ID, and SKU cannot be blank.");
      return;
    }
    const record: RawReturn = {
      returnId: newReturnId.trim(),
      orderId: newOrderId.trim(),
      returnDate: newReturnDate,
      sku: newSku.trim(),
      returnQty: Number(newQty) || 1,
    };
    onChangeReturns([record, ...returns]);
    setNewReturnId("");
    setNewOrderId("");
    setNewQty(2);
    setCurrentPage(1);
  };

  const handleDeleteRow = (indexInReturns: number) => {
    const updated = [...returns];
    updated.splice(indexInReturns, 1);
    onChangeReturns(updated);
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
      const parsedReturns: RawReturn[] = [];

      lines.forEach((line, idx) => {
        // Support tab or comma separators
        const delimiter = line.includes("\t") ? "\t" : ",";
        const parts = line.split(delimiter).map((p) => p.trim());

        // Skip header if it is likely one
        if (idx === 0 && (parts[0].toLowerCase().includes("id") || parts[0].toLowerCase().includes("return"))) {
          return;
        }

        if (parts.length < 5) return; // skip malformed lines

        const returnId = parts[0];
        const orderId = parts[1];
        const returnDate = parts[2];
        const sku = parts[3];
        const returnQty = parseInt(parts[4]) || 1;

        if (returnId && orderId && sku) {
          parsedReturns.push({
            returnId,
            orderId,
            returnDate,
            sku,
            returnQty,
          });
        }
      });

      if (parsedReturns.length === 0) {
        throw new Error("No valid return records were found. Please verify the layout.");
      }

      // Replace or prepend? Replace for batch reload
      onChangeReturns(parsedReturns);
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
          <h1 className="title-premium text-[var(--text-page-title)] font-medium">Shopify Raw Returns Log</h1>
          <p className="text-[var(--text-body)] text-[var(--color-muted)] mt-1">
            Browse, manually log, or bulk paste returns dataset to refresh dynamic cohort return profiles.
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
            <h3 className="font-semibold text-[var(--color-primary)] text-sm">Bulk Paste Return Data</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Supports CSV or tab-separated (TSV) clipboard outputs from Excel. Columns must correspond to:
              <br />
              <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[11px] font-mono mt-1 inline-block">
                Return_ID, Order_ID, Return_Date (YYYY-MM-DD), SKU, Return_Quantity
              </code>
            </p>
          </div>

          <textarea
            className="w-full h-36 p-3 bg-white border border-[var(--color-border)] rounded-[var(--radius-sm)] font-mono text-xs focus:ring-1 focus:ring-[var(--color-accent)]"
            placeholder="RT-1001&#9;SP-1001&#9;2026-05-10&#9;SKU-DRS-001&#9;3"
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
                  <Check className="w-4 h-4" /> Import successful! Return models updated.
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
        <h3 className="font-semibold text-[var(--color-primary)] text-sm">Log Single Return Row</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* Return ID */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Return ID
            </label>
            <input
              type="text"
              placeholder="e.g. RT-1011"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newReturnId}
              onChange={(e) => setNewReturnId(e.target.value)}
            />
          </div>

          {/* Linked Order ID */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Linked Order ID
            </label>
            <input
              type="text"
              placeholder="e.g. SP-1001"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newOrderId}
              onChange={(e) => setNewOrderId(e.target.value)}
            />
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Return Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)]"
              value={newReturnDate}
              onChange={(e) => setNewReturnDate(e.target.value)}
            />
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

          {/* Return Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-1">
              Return Quantity
            </label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-1.5 text-xs bg-[var(--color-input-bg)] border-0 rounded-[var(--radius-sm)] font-medium text-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-accent)] text-right"
              value={newQty}
              onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Trigger button */}
          <div className="flex items-end justify-end">
            <button
              onClick={handleAddRow}
              className="flex items-center justify-center gap-2 w-full py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/95 text-white font-semibold uppercase tracking-wider text-xs rounded-[var(--radius-sm)] shadow-sm transition-all cursor-pointer h-[34px]"
            >
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>
        </div>
      </div>

      {/* Main Returns Table */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--table-header-bg)] border-b-2 border-[var(--table-header-sep)]">
                <th className="px-6 py-4 table-header-premium">Return ID</th>
                <th className="px-6 py-4 table-header-premium">Linked Order ID</th>
                <th className="px-6 py-4 table-header-premium">Return Date</th>
                <th className="px-6 py-4 table-header-premium">SKU Reference</th>
                <th className="px-6 py-4 table-header-premium text-right">Return Qty</th>
                <th className="px-6 py-4 table-header-premium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {currentReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-[var(--color-muted)] italic">
                    No returned stock logged. Use manual logging or paste TSV rows above.
                  </td>
                </tr>
              ) : (
                currentReturns.map((ret, index) => {
                  const absoluteIndex = startIndex + index;
                  return (
                    <tr
                      key={`${ret.returnId}-${absoluteIndex}`}
                      className={`transition-colors hover:bg-slate-50/50 ${
                        index % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[#F5F5F2]/40"
                      }`}
                    >
                      <td className="px-6 py-3.5 font-semibold text-[var(--color-primary)]">{ret.returnId}</td>
                      <td className="px-6 py-3.5 font-semibold text-[var(--color-primary)]">{ret.orderId}</td>
                      <td className="px-6 py-3.5 text-xs text-[var(--color-primary)]">{ret.returnDate}</td>
                      <td className="px-6 py-3.5 font-mono text-xs font-semibold text-[var(--color-primary)]">{ret.sku}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[var(--color-primary)]">{ret.returnQty}</td>
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
              Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, returns.length)} of {returns.length} records
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
