# M6 — Sales Deep Dive 5 (20 Aug 2026, ~62 min)
Attendees: Clemens Rodde (24technology, lead), Dagna Jurk (operator, real examples), Saqib/Zakib, Taha; Jaskarn/Dagna pricing screen. Focus: invoicing & accounting + hourly/time-based pricing + project (workspace) hierarchy + price-calculation model.

## Requirements (timestamps)
- [1:41/3:14] Accounting: specific fields drive which invoice is produced; if everything is entered correctly the invoice goes through automatically. (auto-invoice)
- [3:46/5:53] Single invoice created automatically and sent together with the delivery. Flow: purchase sends delivery + proofreader hours → arrives in sales → operator delivers order → invoice auto-created & sent.
- [6:23] If the auto-invoice is missed, operator goes to the order and creates the invoice manually. (manual fallback)
- [7:26/8:31] Some invoices must be sent out together (collective) — needs a rule; special cases.
- [9:37/10:09] Special cases under delivery options + billing address; additional costs from internal comments (we want to charge more).
- [11:09/12:47] Hourly/time-based orders: sum cost across orders; minimum one-hour charge (one excluded customer); calculate accordingly.
- [13:21] Validation step before the customer invoice is created (review before sending).
- [13:53/14:23] Responsibility question: who owns real cost / paying suppliers / ensuring the invoice is correct — sales vs fulfillment.
- [16:01/18:10] Different operators do order vs delivery; the delivery-responsible person can adjust the logged hours (e.g. translator did 1h20); amount covers all.
- [22:27/24:04] Standard hourly rate per proofreader (~€75/hour), depends on delivery mode; approx time may be quoted but final = actual time.
- [25:12/27:18] Business rule: for time-based tops, do NOT give an estimate on the offer document (too risky — source quality can double the time); general delivery rates used to calculate customer price.
- [29:03/30:33] Time-spent screen shows purchase cost + additional/add-on cost; e.g. +€10.
- [31:35/32:39] Need a step to set the FINAL price for the customer at the end of fulfillment (DTP/PDF/extra costs unknown up front → decided at the end).
- [33:11/34:16] Additional costs for DTP / PDF brochure decided at fulfillment; proofreader time unknown at start.
- [34:50/36:23] Project level: separate target-language orders + a DTP order are all part of the project; invoice the whole project → one invoice per project.
- [36:53/38:30] Must finish all jobs before the delivery/invoice; flexibility to set orders to delivery after the project is finished.
- [39:01/39:33] Choose a project name and invoice just a subset (e.g. these five orders); be sure only the right ones are included.
- [40:38/41:40] Customer-facing order-entry flow: "give me a price for this" → order it → one request becomes multiple orders (IT, FR, EN) + DTP + additional costs.
- [42:41/43:41] Today order fulfillment shows a flat list of orders; future = tree structure / grouping by project.
- [43:41/44:12] Pooling was just a group of orders; the new "project" is a new business object that replaces pooling.
- [44:47/48:28] Max Planck magazine example: a "customer project" (higher object) with quarterly orders coming in beneath it as translation projects → workspace hierarchy: Customer project → Translation project → Orders (3 levels). Important for Atlas.
- [49:00/50:35] This new model may eventually replace the DT model; core principle for order entry.
- [52:46/53:19] Price calculation topic: estimate price before + price calculation after fulfillment; two types — factor-based and special prices.
- [54:24/55:29] Chance to introduce a new, simpler pricing model; delivery modes factor into price.
- [56:00/56:31] Option to keep prices the same across countries, or small adjustments by product type / delivery.
- [59:39/60:42] Special price: when all order types are the same, define ONE price by delivery/source/target to reduce number of rows; translations are per line/word; avoid generating thousands of rules.
