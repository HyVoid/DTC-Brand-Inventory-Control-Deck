/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ConfigRow, RawOrder, RawReturn } from "../types";

export const initialConfig: ConfigRow[] = [
  { market: "UK", leadTimeDays: 30, returnWindow: 30, preorderSafetyFactor: 1.2, allocationRatio: 0.35 },
  { market: "US", leadTimeDays: 45, returnWindow: 30, preorderSafetyFactor: 1.3, allocationRatio: 0.40 },
  { market: "EU", leadTimeDays: 25, returnWindow: 30, preorderSafetyFactor: 1.1, allocationRatio: 0.15 },
  { market: "AUS", leadTimeDays: 40, returnWindow: 30, preorderSafetyFactor: 1.2, allocationRatio: 0.10 }
];

export const initialOrders: RawOrder[] = [
  // May 2026 Cohort Orders
  { orderId: "SP-1001", orderDate: "2026-05-02", market: "UK", sku: "SKU-DRS-001", quantity: 12, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1002", orderDate: "2026-05-03", market: "US", sku: "SKU-DRS-001", quantity: 20, salesType: "Preorder", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1003", orderDate: "2026-05-05", market: "EU", sku: "SKU-DRS-002", quantity: 8, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1004", orderDate: "2026-05-10", market: "UK", sku: "SKU-KNT-012", quantity: 15, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1005", orderDate: "2026-05-12", market: "US", sku: "SKU-SLS-005", quantity: 10, salesType: "Preorder", fulfillmentStatus: "Unfulfilled" }, // Preorder Outstanding
  { orderId: "SP-1006", orderDate: "2026-05-15", market: "AUS", sku: "SKU-OVR-009", quantity: 6, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1007", orderDate: "2026-05-18", market: "UK", sku: "SKU-DRS-002", quantity: 14, salesType: "Preorder", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1008", orderDate: "2026-05-20", market: "US", sku: "SKU-DRS-001", quantity: 25, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1009", orderDate: "2026-05-22", market: "EU", sku: "SKU-KNT-012", quantity: 18, salesType: "Preorder", fulfillmentStatus: "Unfulfilled" }, // Preorder Outstanding
  { orderId: "SP-1010", orderDate: "2026-05-25", market: "UK", sku: "SKU-SLS-005", quantity: 12, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1011", orderDate: "2026-05-28", market: "US", sku: "SKU-OVR-009", quantity: 8, salesType: "Preorder", fulfillmentStatus: "Fulfilled" },

  // June 2026 Cohort Orders
  { orderId: "SP-1012", orderDate: "2026-06-01", market: "UK", sku: "SKU-DRS-001", quantity: 18, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1013", orderDate: "2026-06-03", market: "US", sku: "SKU-DRS-001", quantity: 30, salesType: "Preorder", fulfillmentStatus: "Unfulfilled" }, // Preorder Outstanding
  { orderId: "SP-1014", orderDate: "2026-06-05", market: "EU", sku: "SKU-DRS-002", quantity: 12, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1015", orderDate: "2026-06-07", market: "US", sku: "SKU-KNT-012", quantity: 22, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1016", orderDate: "2026-06-10", market: "AUS", sku: "SKU-SLS-005", quantity: 15, salesType: "Preorder", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1017", orderDate: "2026-06-12", market: "UK", sku: "SKU-OVR-009", quantity: 10, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1018", orderDate: "2026-06-14", market: "US", sku: "SKU-DRS-002", quantity: 16, salesType: "Preorder", fulfillmentStatus: "Unfulfilled" }, // Preorder Outstanding
  { orderId: "SP-1019", orderDate: "2026-06-16", market: "EU", sku: "SKU-KNT-012", quantity: 25, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1020", orderDate: "2026-06-18", market: "UK", sku: "SKU-SLS-005", quantity: 20, salesType: "Preorder", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1021", orderDate: "2026-06-20", market: "US", sku: "SKU-OVR-009", quantity: 15, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1022", orderDate: "2026-06-22", market: "AUS", sku: "SKU-DRS-001", quantity: 8, salesType: "Normal", fulfillmentStatus: "Fulfilled" },
  { orderId: "SP-1023", orderDate: "2026-06-24", market: "EU", sku: "SKU-DRS-002", quantity: 10, salesType: "Preorder", fulfillmentStatus: "Fulfilled" }
];

export const initialReturns: RawReturn[] = [
  // Returns linked to May Orders
  { returnId: "RT-1001", orderId: "SP-1001", returnDate: "2026-05-10", sku: "SKU-DRS-001", returnQty: 3 }, // UK - 8 days (D14)
  { returnId: "RT-1002", orderId: "SP-1002", returnDate: "2026-05-25", sku: "SKU-DRS-001", returnQty: 5 }, // US - 22 days (D30)
  { returnId: "RT-1003", orderId: "SP-1003", returnDate: "2026-06-15", sku: "SKU-DRS-002", returnQty: 2 }, // EU - 41 days (D45)
  { returnId: "RT-1004", orderId: "SP-1004", returnDate: "2026-05-20", sku: "SKU-KNT-012", returnQty: 4 }, // UK - 10 days (D14)
  { returnId: "RT-1005", orderId: "SP-1007", returnDate: "2026-06-05", sku: "SKU-DRS-002", returnQty: 3 }, // UK - 18 days (D30)
  { returnId: "RT-1006", orderId: "SP-1008", returnDate: "2026-05-28", sku: "SKU-DRS-001", returnQty: 2 }, // US - 8 days (D14)

  // Returns linked to June Orders
  { returnId: "RT-1007", orderId: "SP-1012", returnDate: "2026-06-08", sku: "SKU-DRS-001", returnQty: 4 }, // UK - 7 days (D14)
  { returnId: "RT-1008", orderId: "SP-1014", returnDate: "2026-06-28", sku: "SKU-DRS-002", returnQty: 3 }, // EU - 23 days (D30)
  { returnId: "RT-1009", orderId: "SP-1015", returnDate: "2026-06-18", sku: "SKU-KNT-012", returnQty: 5 }, // US - 11 days (D14)
  { returnId: "RT-1010", orderId: "SP-1017", returnDate: "2026-06-22", sku: "SKU-OVR-009", returnQty: 2 }  // UK - 10 days (D14)
];

// Per-SKU planning defaults (stock on hand, MOQ, target stock days, and current sync value for IP)
export interface SkuPlanOverride {
  sku: string;
  name: string;
  targetStockDays: number;
  currentOnHand: number;
  supplierMOQ: number;
  ipLiabilitySync: number; // For reconciliation simulation
}

export const initialSkuOverrides: SkuPlanOverride[] = [
  { sku: "SKU-DRS-001", name: "Linen Summer Dress - Navy", targetStockDays: 60, currentOnHand: 45, supplierMOQ: 100, ipLiabilitySync: 30 },
  { sku: "SKU-DRS-002", name: "Silk Slip Dress - Emerald", targetStockDays: 90, currentOnHand: 25, supplierMOQ: 50, ipLiabilitySync: 16 },
  { sku: "SKU-KNT-012", name: "Crochet Knit Top - Cream", targetStockDays: 60, currentOnHand: 85, supplierMOQ: 150, ipLiabilitySync: 18 }, // Shopify is 18 (unfulfilled SP-1009), Sync is 18. Match!
  { sku: "SKU-SLS-005", name: "Wide Leg Satin Trousers - Sage", targetStockDays: 90, currentOnHand: 15, supplierMOQ: 100, ipLiabilitySync: 10 }, // Shopify is 10 (unfulfilled SP-1005). Sync is 10. Match!
  { sku: "SKU-OVR-009", name: "Oversized Linen Blazer - Flax", targetStockDays: 60, currentOnHand: 40, supplierMOQ: 50, ipLiabilitySync: 5 } // Shopify is 0 (all fulfilled). Sync is 5. Discrepancy!
];
