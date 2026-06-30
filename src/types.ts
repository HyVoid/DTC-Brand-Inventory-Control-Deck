/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConfigRow {
  market: string;
  leadTimeDays: number;
  returnWindow: number;
  preorderSafetyFactor: number;
  allocationRatio: number; // as decimal, e.g. 0.35 for 35%
}

export interface RawOrder {
  orderId: string;
  orderDate: string; // YYYY-MM-DD
  market: string; // UK, US, EU, AUS
  sku: string;
  quantity: number;
  salesType: "Normal" | "Preorder";
  fulfillmentStatus: "Fulfilled" | "Unfulfilled";
}

export interface RawReturn {
  returnId: string;
  orderId: string;
  returnDate: string; // YYYY-MM-DD
  sku: string;
  returnQty: number;
}

export interface PreorderLiabilityRow {
  sku: string;
  totalPreorderSold: number;
  preorderFulfilled: number;
  outstandingLiability: number;
}

export interface CohortReturnRow {
  cohortMonth: string; // YYYY-MM
  cohortSalesQty: number;
  returnsD14: number;
  returnsD30: number;
  returnsD45: number;
  ultimateReturnRate: number;
}

export interface CorrectedDemandRow {
  sku: string;
  rawSalesQty: number;
  preorderDistortion: number;
  expectedReturnQty: number;
  correctedDemandSignal: number;
}

export interface POPlannerRow {
  sku: string;
  dailyDemandRate: number;
  targetStockDays: number;
  currentOnHand: number;
  netPORequirement: number;
  supplierMOQ: number;
  recommendedPOQty: number;
}

export interface LocationAllocationRow {
  sku: string;
  totalPOToAllocate: number;
  ukAllocation: number;
  usAllocation: number;
  euAllocation: number;
  ausAllocation: number;
}

export interface ReconciliationRow {
  sku: string;
  shopifyUnfulfilled: number;
  ipLiabilitySync: number;
  syncGap: number;
  reconciliationStatus: "PASS" | "INVESTIGATE";
}
