# Eliminate Pre-Order Distortion and Return Timing Bias in DTC Inventory Planning

![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform: Browser + Excel](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-green.svg)
![Tool Type: Inventory Decision Support](https://img.shields.io/badge/Tool-Inventory%20Decision%20Support-orange.svg)

**A free, no-install inventory governance framework that reconstructs true demand signals for high-return, high-preorder DTC brands using Excel and browser-based interfaces.**

> **No signup. No installation. Free.**
>
> 🌐 **Open in Browser** → *HTML Live Demo (Coming Soon)*
>
> 📥 **Download Excel** → *GitHub Release / Gumroad Download (Coming Soon)*

---

## Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Operational control center showing corrected demand signals, preorder liabilities, cohort return curves, and multi-market replenishment recommendations.*

### Excel Version

<!-- screenshot: excel version -->

*Excel decision workbook displaying demand cleansing calculations, purchasing recommendations, and global warehouse allocation outputs.*

---

## What It Helps You Track

* True customer demand after removing preorder inflation and expected return distortion.
* Outstanding preorder fulfillment liabilities that should not be treated as future demand.
* Actual return behavior by order cohort rather than misleading calendar-period return rates.
* Recommended purchase quantities adjusted for lead time, inventory position, and supplier MOQ constraints.
* Optimal inventory allocation across UK, US, EU, and AUS fulfillment networks.
* Data inconsistencies between Shopify, Inventory Planner, purchasing records, and operational inventory.

---

# Why I Built This

Many DTC fashion brands with strong growth trajectories eventually encounter a paradox: revenue grows, but inventory quality deteriorates.

The root problem is rarely forecasting algorithms themselves. Instead, the underlying demand signal becomes corrupted before forecasting even begins.

I repeatedly observed three analytical failures:

* **Pre-orders were counted twice**: once when customers ordered, and again when planners replenished inventory.
* **Returns were analyzed using calendar months**, producing systematically incorrect return assumptions.
* **Inventory planning systems consumed raw transactional data**, assuming that all sales represented fulfilled and permanent demand.

For example, consider a SKU that sold 2,000 units during a preorder launch:

| Metric                  | Traditional View |
| ----------------------- | ---------------- |
| Reported Sales          | 2,000            |
| Forecast Demand         | 2,000            |
| Purchase Recommendation | 2,000            |

However, after reconstruction:

| Metric                         | Corrected View |
| ------------------------------ | -------------- |
| Total Preorders                | 2,000          |
| Outstanding Preorder Liability | 700            |
| Expected Returns               | 320            |
| True Demand Signal             | 980            |

The difference is not academic.

The first approach generates excess inventory, markdowns, and warehouse congestion. The second produces a purchasing decision aligned with actual market consumption.

This workbook is therefore not a reporting dashboard.

It is a productized analytical framework that transforms noisy operational events into decision-grade demand signals that inventory planners can actually trust.

---

## Common DTC Inventory Problems This Solves

| Problem                     | Without This Tool                                             | With This Tool                                             |
| --------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Preorder demand inflation   | Future demand is double-counted, causing over-purchasing      | Outstanding preorder liabilities are isolated and excluded |
| Monthly return analysis     | Return rates fluctuate unpredictably due to timing distortion | Cohort return behavior reveals actual return patterns      |
| Multi-market replenishment  | Inventory allocation relies on manual judgment                | Allocation is calculated using historical demand ratios    |
| Inventory Planner imports   | Forecasting models consume noisy transaction history          | Clean demand signals feed forecasting engines              |
| Purchase order generation   | Buyers manually estimate replenishment quantities             | Purchasing recommendations are calculated automatically    |
| Cross-system reconciliation | Data inconsistencies remain undetected                        | Reconciliation exceptions are flagged automatically        |

---

## Who This Is For

This framework is designed for:

* DTC fashion brands operating multiple Shopify storefronts.
* Businesses with significant preorder activity.
* Brands experiencing elevated return rates.
* Inventory planners using Inventory Planner, ERP systems, or spreadsheet-based purchasing workflows.
* Operations teams managing multiple fulfillment locations internationally.

This framework is **not designed for**:

* Enterprise ERP replacement projects.
* Manufacturing MRP systems.
* Traditional wholesale inventory environments with minimal returns.

No spreadsheet expertise is required. Open the browser version or Excel workbook and begin analyzing inventory decisions immediately.

---

## About

I build lightweight operational decision-support tools for situations where there are simply too many moving parts to reliably hold in your head.

The question I repeatedly ask is:

> **"What information needs to exist in one place so the next decision can be made confidently?"**

This inventory governance framework is one example of that approach: converting messy operational reality into structured decision support without requiring organizations to replace their existing systems.

---

## Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

---

### Workbook Architecture

| Layer         | Worksheet           | Purpose                            |
| ------------- | ------------------- | ---------------------------------- |
| Configuration | Config              | Global operational parameters      |
| Raw Input     | Raw_Orders          | Shopify order import               |
| Raw Input     | Raw_Returns         | Return transaction import          |
| Calculation   | Preorder_Liability  | Outstanding preorder obligations   |
| Calculation   | Cohort_Return_Model | Cohort-based return modeling       |
| Calculation   | Corrected_Demand    | Demand signal reconstruction       |
| Decision      | PO_Planner          | Purchase recommendation engine     |
| Decision      | Location_Allocator  | International inventory allocation |
| Validation    | Reconciliation      | Cross-system auditing              |
| Executive     | Executive_Dashboard | Operational decision monitoring    |

```text
Shopify Orders
         │
Shopify Returns
         │
Inventory Planner Export
         │
         ▼
Raw Input Layer
         │
         ▼
Demand Cleansing Engine
 ├── Preorder Liability
 ├── Cohort Returns
 └── Corrected Demand
         │
         ▼
Purchase Planning
         │
         ▼
Global Allocation
         │
         ▼
System Reconciliation
         │
         ▼
Executive Dashboard
```

---

### Three Traps That Catch Even Experienced Inventory Teams

#### Trap 1: Treating Preorders as Fulfilled Demand

A purchasing decision is made based on reported sales.

The unnoticed error is that unfulfilled preorder obligations remain embedded within demand history.

| Scenario              | Traditional | Corrected |
| --------------------- | ----------- | --------- |
| Total Orders          | 2,000       | 2,000     |
| Unfulfilled Preorders | Ignored     | 700       |
| Purchase Signal       | 2,000       | 1,300     |

The recommendation changes dramatically because preorder liabilities represent existing obligations, not new market demand.

The corrected approach isolates outstanding liabilities before forecasting.

<details>
<summary>Formula Logic</summary>

```excel
=LET(
SKU_List,A2#,
Preorder_Sold,
SUMIFS(
Raw_Orders[Quantity],
Raw_Orders[SKU],
SKU_List,
Raw_Orders[Sales_Type],
"Preorder"
),
Preorder_Fulfilled,
SUMIFS(
Raw_Orders[Quantity],
Raw_Orders[SKU],
SKU_List,
Raw_Orders[Sales_Type],
"Preorder",
Raw_Orders[Fulfillment_Status],
"Fulfilled"
),
Preorder_Sold-Preorder_Fulfilled
)
```

</details>

---

#### Trap 2: Measuring Returns Using Calendar Months

A buyer assumes March return rate equals:

```text
March Returns / March Sales
```

However, March returns often originate from January and February purchases.

| Method          | Return Rate |
| --------------- | ----------- |
| Calendar Month  | 28%         |
| Cohort Analysis | 16%         |

The decision error creates systematic under-ordering.

The corrected method tracks return behavior relative to purchase timing.

<details>
<summary>Formula Logic</summary>

```excel
=MAP(
Cohort_Month,
LAMBDA(
m,
SUMIFS(
Raw_Returns[Return_Qty],
...
)
)
)
```

</details>

---

#### Trap 3: Ignoring Expected Inventory Recovery

Purchasing decisions frequently assume all sold inventory disappears permanently.

The unnoticed assumption ignores predictable return recovery.

| Metric | Traditional | Corrected |
|---|---|
| Sales | 5,000 | 5,000 |
| Expected Returns | 0 | 850 |
| Purchase Need | 5,000 | 4,150 |

Expected returns represent future inventory supply.

Ignoring them inflates procurement budgets unnecessarily.

<details>
<summary>Formula Logic</summary>

```excel
=ROUND(
Raw_Sales
-Preorder_Liability
-Expected_Returns,
0
)
```

</details>

---

### Example Scenario

A premium womenswear brand operates Shopify stores across UK, US, EU, and Australia.

Weekly operational data:

| Metric                 | Value        |
| ---------------------- | ------------ |
| Gross Sales            | 18,200 units |
| Preorders              | 4,100 units  |
| Outstanding Preorders  | 1,250 units  |
| Historical Return Rate | 22%          |
| On-Hand Inventory      | 8,400 units  |
| Supplier MOQ           | 500 units    |

The workbook reconstructs demand:

```text
Gross Sales:
18,200

Less Outstanding Preorders:
-1,250

Less Expected Returns:
-4,004

Corrected Demand:
12,946
```

Purchasing requirements:

```text
Target Inventory:
16,500

Current Inventory:
8,400

Add Preorder Liability:
1,250

Net Requirement:
9,350
```

After MOQ rounding and allocation:

| Market | Allocation |
| ------ | ---------- |
| UK     | 2,800      |
| US     | 3,600      |
| EU     | 2,100      |
| AUS    | 850        |

Operational implication:

Without correction, procurement exceeds actual need by more than 5,000 units.

---

### Formula Reference

<details>
<summary>Preorder Liability</summary>

* `UNIQUE()`
* `SORT()`
* `SUMIFS()`
* `LET()`

Purpose:
Calculate outstanding preorder obligations.

</details>

<details>
<summary>Cohort Returns</summary>

* `MAP()`
* `LAMBDA()`
* `SUMIFS()`
* `TEXT()`
* `EDATE()`

Purpose:
Construct return behavior cohorts.

</details>

<details>
<summary>Demand Reconstruction</summary>

* `LET()`
* `XLOOKUP()`
* `AVERAGE()`
* `ROUND()`

Purpose:
Generate corrected demand signals.

</details>

<details>
<summary>Purchase Planning</summary>

* `MROUND()`
* `IF()`
* `XLOOKUP()`

Purpose:
Generate procurement recommendations.

</details>

---

### Validation Rules

| Field              | Rule                        | Error Behavior      |
| ------------------ | --------------------------- | ------------------- |
| Order_ID           | Must be unique              | Duplicate alert     |
| Return_ID          | Must be unique              | Duplicate alert     |
| Quantity           | Greater than zero           | Validation failure  |
| Return_Qty         | Cannot exceed sold quantity | Warning             |
| Market             | Must exist in Config        | Error               |
| MOQ                | Greater than zero           | Calculation blocked |
| Allocation Ratio   | Sum must equal 100%         | Allocation disabled |
| Lead Time          | Must be positive integer    | Warning             |
| Fulfillment Status | Controlled vocabulary only  | Error               |
| Sales Type         | Normal or Preorder only     | Error               |

</details>

---

## Other Tools in This Series

* **Project Labor Cost Allocation Console** — project profitability and labor cost attribution.
* **Multifamily Acquisition Model** — value-add real estate acquisition underwriting.
* **Marketing Attribution Audit Console** — paid media and attribution reliability analysis.
* **Inventory Replenishment Planning System** — multi-location purchasing optimization.
* **Cross-Entity Logistics Control Tower** — operational logistics visibility and reconciliation.

More tools available via GitHub profile and release library.

---

## License

This project is licensed under the **Apache License 2.0**.

See the `LICENSE` file for details.
