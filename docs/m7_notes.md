# M7 — Sales Deep Dive 6 (21 Aug 2026, ~66 min)
Attendees: Dagna Jurk (operator, demoing current TDS pricing/offer/follow-up screens), Clemens Rodde (lead), Taha, Faisal/Ralf mentioned, Marion mentioned. Focus: pricing & discounts, offer templates, status-based reminders/follow-up, currency, security surcharge, add-ons, tender & express pricing, multi-market.

## Requirements (timestamps)
- [2:10/3:17] Price factors that raise/lower the price; Swiss prices are higher (possible dedicated Swiss session); special-customer overview.
- [5:25/5:55] Special price is the first step; TM discount typed in; today only one discount field exists.
- [6:30/9:09] Loyalty/volume discounts: e.g. 10% on each next order (Marion owns it); 5% per order until 100,000 threshold then it changes — done manually today. Want the system to handle this.
- [10:11/11:44] Discounts entered as a minus value; customer asks e.g. 10% for 3 languages; operator can add additional costs to the customer.
- [12:45/13:17] Volume discount the system automatically handles → implement as a requirement in the new system.
- [13:52/14:56] Project-level discount; discount must be visible on the offer and applied before sending.
- [15:27/16:30] Offer → acceptance: send order confirmation or skip the step; offer can be reopened.
- [17:00/17:30] Send offer by email when the customer has no budget now; master-agreement customer → assign to purchase.
- [18:04/19:45] Offer built from reusable template text components; multiple templates to choose; admin front-end to manage templates per language.
- [20:49/21:57] After sending the offer, status follow-up + special reminder functionality (did they open it, etc.).
- [22:27/24:36] Set offer status: offer / pending payment / no interest → stops the order process and hides it; setting a follow-up auto-creates tasks/reminders.
- [25:07/27:46] CRITICAL: reminders both DATE-based AND ORDER-STATUS-based — when an order is "in sales waiting for me" the operator gets an email; can't watch constantly; important around holidays.
- [28:19/29:53] Delivery mode: if the offered mode is too late, mark it unavailable and adjust; no fixed delivery time until confirmation; after confirmation the customer acknowledges.
- [30:24/30:55] Send order confirmation releases the operator; acceptance of the order = final confirmation.
- [31:26/33:32] Price build-up: special price first; apply CAT/TM discounts after the cut; if no special price and no TM discount, use the language price. Price factors = language combination + specialization + delivery mode (express/first → different price).
- [34:06/36:43] Invoice currency = the currency configured in accounting for that customer; only a few currencies charged (EUR/GBP/USD), not exotic ones; sometimes show approximate value in brackets.
- [37:13/38:45] Security level: confidential orders get an additional security SURCHARGE (not part of the price calculator) → automatic additional cost; only the relevant part shown to the customer.
- [39:16/40:50] Hours come from purchase/supplier; cost minus discount; separate research cost added to normal cost.
- [41:23/43:24] Add-ons: two ways to add; some add-ons are used only for invoicing between sales & purchase (hidden from customer); a tool to sell additional services with special prices, minimal prices, and price-per-unit.
- [44:00/46:14] Mix of special price vs normal calculation — in Germany >half of customers have some special prices; tenders usually agree special prices.
- [46:49/50:56] Tender pricing: hard to add express price on tender fixed per-line prices; charge more per line for express/weekend; system must flag express/weekend to check price; urgent surcharge; some customers always want +25% for express.
- [52:02/53:35] Threshold discounts (reach 100k/50k → extra discount); Zurich example: linguistic editing, very different pricing, time-based vs volume-based jobs, pay suppliers by hours.
- [54:07/55:49] Future: multiple sales divisions/markets in one system; each division's price calculator differs (high Swiss vs lower Germany); configurable on customer/company/project level.
- [56:20/57:59] One system doesn't block different markets; goal is to remove manual work (writing emails); flexible email-offer handling.
- [58:29/59:34] Settings (special prices, accounting) shared; comment tool with many reusable comments to edit/create; payment & budget for next session.
- [61:45/63:25] The new-order entry step; invoicing quality levels; add add-ons specifically; visibility of margin / price / purchase cost / additional.
