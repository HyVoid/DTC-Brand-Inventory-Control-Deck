/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigRow, RawOrder, RawReturn, PreorderLiabilityRow, CohortReturnRow, CorrectedDemandRow, POPlannerRow, LocationAllocationRow, ReconciliationRow } from "../types";
import { SkuPlanOverride } from "../data/mockData";

// Helper to calculate days between two dates
export function getDaysBetween(date1Str: string, date2Str: string): number {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function performSpreadsheetCalculations(
  config: ConfigRow[],
  orders: RawOrder[],
  returns: RawReturn[],
  skuOverrides: SkuPlanOverride[]
) {
  // 1. Unique SKU List
  const allOrderSkus = Array.from(new Set(orders.map((o) => o.sku)));
  const allOverrideSkus = skuOverrides.map((s) => s.sku);
  const skus = Array.from(new Set([...allOverrideSkus, ...allOrderSkus])).sort();

  // 2. Preorder Liability Calculations
  const preorderLiability: PreorderLiabilityRow[] = skus.map((sku) => {
    const skuOrders = orders.filter((o) => o.sku === sku && o.salesType === "Preorder");
    const totalPreorderSold = skuOrders.reduce((sum, o) => sum + o.quantity, 0);
    const preorderFulfilled = skuOrders
      .filter((o) => o.fulfillmentStatus === "Fulfilled")
      .reduce((sum, o) => sum + o.quantity, 0);
    const outstandingLiability = totalPreorderSold - preorderFulfilled;

    return {
      sku,
      totalPreorderSold,
      preorderFulfilled,
      outstandingLiability,
    };
  });

  // Helper mapping orderId to order record for return linking
  const orderMap = new Map<string, RawOrder>();
  orders.forEach((o) => orderMap.set(o.orderId, o));

  // 3. Cohort Return Model Calculations
  // Get all unique YYYY-MM cohort months from order dates
  const cohortMonths = Array.from(
    new Set(orders.map((o) => o.orderDate.substring(0, 7)))
  ).sort();

  const cohortReturnModel: CohortReturnRow[] = cohortMonths.map((cohortMonth) => {
    // Orders in this cohort month
    const cohortOrders = orders.filter((o) => o.orderDate.substring(0, 7) === cohortMonth);
    const cohortSalesQty = cohortOrders.reduce((sum, o) => sum + o.quantity, 0);

    // Filter returns linked to orders in this cohort
    const cohortReturns = returns.filter((ret) => {
      const order = orderMap.get(ret.orderId);
      return order && order.orderDate.substring(0, 7) === cohortMonth;
    });

    let returnsD14 = 0;
    let returnsD30 = 0;
    let returnsD45 = 0;

    cohortReturns.forEach((ret) => {
      const order = orderMap.get(ret.orderId)!;
      const days = getDaysBetween(order.orderDate, ret.returnDate);

      // Check return timing window from order placement date
      if (days <= 14) {
        returnsD14 += ret.returnQty;
      } else if (days <= 30) {
        returnsD30 += ret.returnQty;
      } else if (days <= 45) {
        returnsD45 += ret.returnQty;
      }
    });

    const totalReturns = returnsD14 + returnsD30 + returnsD45;
    const ultimateReturnRate = cohortSalesQty > 0 ? totalReturns / cohortSalesQty : 0;

    return {
      cohortMonth,
      cohortSalesQty,
      returnsD14,
      returnsD30,
      returnsD45,
      ultimateReturnRate,
    };
  });

  // Calculate Average Ultimate Return Rate across all cohorts
  const avgReturnRate =
    cohortReturnModel.length > 0
      ? cohortReturnModel.reduce((sum, c) => sum + c.ultimateReturnRate, 0) / cohortReturnModel.length
      : 0.20; // Default fallback to 20% if zero orders/cohorts

  // 4. Corrected Demand Signal Calculations
  const correctedDemand: CorrectedDemandRow[] = skus.map((sku) => {
    const rawSalesQty = orders.filter((o) => o.sku === sku).reduce((sum, o) => sum + o.quantity, 0);
    const pLiability = preorderLiability.find((p) => p.sku === sku);
    const preorderDistortion = pLiability ? pLiability.outstandingLiability : 0;

    const expectedReturnQty = rawSalesQty * avgReturnRate;
    const correctedDemandSignal = Math.max(0, Math.round(rawSalesQty - preorderDistortion - expectedReturnQty));

    return {
      sku,
      rawSalesQty,
      preorderDistortion,
      expectedReturnQty: Math.round(expectedReturnQty),
      correctedDemandSignal,
    };
  });

  // 5. PO Planner calculations
  // Determine date range of orders in days
  let salesDays = 30; // fallback standard
  if (orders.length > 0) {
    const dates = orders.map((o) => new Date(o.orderDate).getTime());
    const minTime = Math.min(...dates);
    const maxTime = Math.max(...dates);
    const diffDays = Math.ceil((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1;
    salesDays = Math.max(1, diffDays);
  }

  const poPlanner: POPlannerRow[] = skus.map((sku) => {
    const demandRow = correctedDemand.find((d) => d.sku === sku);
    const signal = demandRow ? demandRow.correctedDemandSignal : 0;
    const dailyDemandRate = signal / salesDays;

    const override = skuOverrides.find((o) => o.sku === sku);
    const targetStockDays = override ? override.targetStockDays : 60;
    const currentOnHand = override ? override.currentOnHand : 0;
    const supplierMOQ = override ? override.supplierMOQ : 100;

    const pLiability = preorderLiability.find((p) => p.sku === sku);
    const outstandingLiability = pLiability ? pLiability.outstandingLiability : 0;

    // Formula: Net_PO_Requirement = (Daily_Demand_Rate * Target_Stock_Days) - Current_On_Hand + Outstanding_Liability
    const netPORequirement = Math.round(dailyDemandRate * targetStockDays - currentOnHand + outstandingLiability);

    // MROUND equivalents: If requirements are <= 0, order 0. Else round up to the next MOQ increment
    let recommendedPOQty = 0;
    if (netPORequirement > 0) {
      recommendedPOQty = Math.ceil(netPORequirement / supplierMOQ) * supplierMOQ;
    }

    return {
      sku,
      dailyDemandRate: parseFloat(dailyDemandRate.toFixed(2)),
      targetStockDays,
      currentOnHand,
      netPORequirement,
      supplierMOQ,
      recommendedPOQty,
    };
  });

  // 6. Location Allocator Calculations
  const allocationRatioMap = new Map<string, number>();
  config.forEach((c) => allocationRatioMap.set(c.market, c.allocationRatio));

  const ukRatio = allocationRatioMap.get("UK") || 0.25;
  const usRatio = allocationRatioMap.get("US") || 0.25;
  const euRatio = allocationRatioMap.get("EU") || 0.25;
  const ausRatio = allocationRatioMap.get("AUS") || 0.25;

  const locationAllocation: LocationAllocationRow[] = skus.map((sku) => {
    const poRow = poPlanner.find((p) => p.sku === sku);
    const totalPOToAllocate = poRow ? poRow.recommendedPOQty : 0;

    const ukAllocation = Math.round(totalPOToAllocate * ukRatio);
    const usAllocation = Math.round(totalPOToAllocate * usRatio);
    const euAllocation = Math.round(totalPOToAllocate * euRatio);
    const ausAllocation = Math.round(totalPOToAllocate * ausRatio);

    return {
      sku,
      totalPOToAllocate,
      ukAllocation,
      usAllocation,
      euAllocation,
      ausAllocation,
    };
  });

  // 7. Reconciliation Calculations
  const reconciliation: ReconciliationRow[] = skus.map((sku) => {
    const pLiability = preorderLiability.find((p) => p.sku === sku);
    const shopifyUnfulfilled = pLiability ? pLiability.outstandingLiability : 0;

    const override = skuOverrides.find((o) => o.sku === sku);
    const ipLiabilitySync = override ? override.ipLiabilitySync : 0;

    const syncGap = shopifyUnfulfilled - ipLiabilitySync;
    const reconciliationStatus = syncGap === 0 ? "PASS" : "INVESTIGATE";

    return {
      sku,
      shopifyUnfulfilled,
      ipLiabilitySync,
      syncGap,
      reconciliationStatus,
    };
  });

  return {
    skus,
    preorderLiability,
    cohortReturnModel,
    avgReturnRate,
    correctedDemand,
    poPlanner,
    locationAllocation,
    reconciliation,
    salesDays
  };
}
