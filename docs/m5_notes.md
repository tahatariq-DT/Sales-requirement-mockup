# M5 — Sales req demo (walkthrough, 21 Aug 2026)
Presenter: Faisal (DigitalTolk) demoing the prototype; Clemens Rodde (24technology) + others (Ellen, Muhammed) adding details.
Recording: taha_tariq personal OneDrive. Duration ~51 min.

## Nature
Walkthrough of the existing prototype requirements + additional details/clarifications. Confirms structure (groups, details drawer, change log, screenshots, timestamps). Faisal reads requirement titles; Clemens clarifies domain. Requirement list "is going to grow" (2 more meetings to add).

## New / clarified requirements (with timestamps)
- [8:29] Translation project = high-level view. UBS sends 1 doc → 4 languages = 4 orders under one project; project view shows the project + its files/orders and which part of the process each is in. "Refined form of order pools." (refines REQ-01)
- [9:29] Naming: translation order today → translation project / service project in future. (REQ-06 terminology)
- [10:31] Project lists all language pairs within it; each order shows its workflow; order-fulfillment feedback + DTP step feed back in. (refines REQ-01)
- [13:06] Two intake paths: (a) offer builder (select client, source lang, targets); (b) offer-first then converted to order.
- [14:40] Email intake: scan emails and look up order details from the email. (email → offer)
- [15:10] Offer builder is a step BEFORE order entry: create one offer or alternate offers, play with prices/discounts, communicate with customer, one becomes final → accepted.
- [16:46] Offer options gated by volume (e.g. >6000 lines/words some delivery modes crossed out). Vendor price vs our price comparison.
- [18:56/19:28] Operator need not create offers manually — default rules generate suitable offers automatically; operator just reviews them. (refines REQ-08)
- [21:03] Multi-language visibility + auto-delivery mode: system offers only realistic/available delivery modes (fit check).
- [21:34] Alternate offers in one email; customer clicks a link to accept ("only €100 more expensive"); on accept auto-goes to fulfillment (add trigger).
- [21:50] Set REAL deadline on acceptance with a fit check — offer goes out earlier than project start; today TDS keeps a single order open and commits dates too early; need real deadline set at acceptance.
- [23:14] Multi-channel self-service portal + repetra; customer uploads files there instead of emailing. (future)
- [24:48] Connect to Atlas for real supplier costs; show margin bar; sometimes offer client a different price than pricing algorithm → manual price override; supplier price per language pair.
- [26:53/27:25] Analysis table before offering to compute discounts (CAT matches); normally not full cut for robot/MT — give only half, etc. (CAT discount business rules)
- [28:28] Move translation-processing config (translation management maintenance) to the order-fulfillment system; migrate it.
- [28:xx] Supported source file formats.
- [29:01] XML + ITS rules: customer sends XML + an ITS file specifying which parts to translate / not translate.
- [29:31] Volume counting correct, format-based rules.
- [31:04] Log/handle 100% matches; converting files into XLIFF and handling errors.
- [32:12] File cleaning (high-level), EDML special format, cost impact of file handling.
- [34:13] Customer portal: customer can select project; if normal customer portal, customer selects.
- [34:47] Project carries TM, glossary, style guides, comments. (REQ-05)
- [35:18] Naming brainstorm: project vs template vs workspace; templates for orders.
- [35:49] Project-level delivery comments: comments revamped; per project/order/language; auto-match & suggest comments; operator can edit; priority property.
- [37:28/38:30] Add-ons requiring multiple delivery checks; special orders flagged in the order list so operators take care.
- [39:02/39:33] Buffer time: purchase deadline ≠ final deadline; need buffer; set globally in project settings so every SM order applies.
- [40:39] Clear lifecycle boundaries between systems (sales / fulfillment / accounting).
- [41:39] CAT discount: 50% in sales and purchase (accounting rule).
- [42:11–47:59] Invoicing & accounting (high level): VAT/RAT + currency handling; master agreement; two invoice types (portal clients vs predefined); single vs collective invoices (per person vs collectively for many orders); system-scannable invoices; credit note / reissue for corrections; Atlas payment/accounting integration.
- [47:59] Dedicated session needed for Swiss big-customer use cases; big-company portals vs normal.
- [50:06] Coordinate with customer squad (Jare) already collecting requirements.
