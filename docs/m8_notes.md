# M8 — Sales Deep Dive 8 (25 Aug 2026, ~33 min)
Attendees: Clemens Rodde (lead), Dagna Jurk (operator), Rana Taha Tariq (presenting). Focus: feedback on the Offer Builder prototype, ending in a structural direction for the whole order-entry flow.

## Headline
The Offer Builder shouldn't be its own destination. Instead of separate Offer Builder / Offers / Translation Orders tabs, have ONE Translation Projects list; clicking a project enters a guided workflow whose view adapts to the stage (offer-building early → fulfilment later). Split the builder into two steps.

## Requirements added (REQ-70 … REQ-76, all M8, with timestamps)
- REQ-70 [22:24] Guided Translation Project workflow — one list, no separate tabs; view adapts per stage; filter open-in-order-entry vs open-in-fulfilment.
- REQ-71 [13:30] Two-step offer flow — (1) order data + files/volume/CAT review, (2) offer step (prices, discount, add-ons, alternates) via a "next step" button.
- REQ-72 [2:35] Consolidated, editable order header — one box: customer→auto company, customer/company/project block, Product dropdown (changeable), delivery mode + concrete deadline, specialization; de-dupe the language pair.
- REQ-73 [5:16] Single files·volume·CAT table — per source file, a column per language pair with CAT %, and a totals row (merge the current two tables).
- REQ-74 [8:53] Show price per language combination + clear total (fix the €1,000-for-one-or-three ambiguity).
- REQ-75 [12:41] Alternate offers project-level (all languages) and collapsible by default.
- REQ-76 [19:30] Post-send acknowledgement tracking — list of sent offers awaiting acknowledgement + mark received (complements REQ-64 reminders).

## Existing requirements revisited (cross-referenced to M8)
REQ-01 (translation project), REQ-02 (project list/view), REQ-07 (offer on project), REQ-08 (alternate offers), REQ-11 (offer lifecycle/states), REQ-13 (delivery deadline), REQ-19 (CAT analysis), REQ-24 (order-entry vs fulfilment), REQ-64 (reminders).

## Other topics (not offer-builder; noted, not added as requirements)
- Swiss/UBS invoicing complexity: manual flows interfacing with Ariba & Cooper; future automate via APIs; business areas / cost centers; Atlas + billing logic.
- Customer-portal perspective still missing: overview of current vs future customer interfaces; bring in Johannes (customer PO) & Marion; consolidate/retire unused customer portals; review UBS/Swisscom/PwC + API/Beebox channels; create test orders per portal.
- New customer/company creation flow still to be shown.
- TDS performance incident (purchase/sales slow) — possibly TCM unreachable from TDS; logged as incident.

No screenshots: M8 is feedback on this prototype (no TDS screens), and the Stream player does not decode video in the cloud sandbox.
