const {useState, useMemo, useEffect} = React;

/* ============================ DATA: MEETINGS ============================ */
const MEETINGS = {
  M1: {id:"M1", tag:"Sales Deepdive", color:"bg-blue-100 text-blue-700 border-blue-200",
       attendees:"Clemens Rodde, Dagna Jurk, Rana Taha Tariq"},
  M2: {id:"M2", tag:"Sales Deep Dive 2", color:"bg-violet-100 text-violet-700 border-violet-200",
       attendees:"Clemens Rodde, Dagna Jurk, Rana Taha Tariq"},
  M3: {id:"M3", tag:"Sales Deep Dive 3", color:"bg-amber-100 text-amber-700 border-amber-200",
       attendees:"Clemens Rodde, Dagna Jurk, Rana Taha Tariq"},
  M4: {id:"M4", tag:"Sales Deep Dive 4", color:"bg-teal-100 text-teal-700 border-teal-200",
       attendees:"Clemens Rodde, Dagna Jurk, Rana Taha Tariq, Muhammad Saqib Ali"},
  M5: {id:"M5", tag:"Sales req demo", color:"bg-rose-100 text-rose-700 border-rose-200",
       attendees:"Faisal, Clemens Rodde, Rana Taha Tariq"},
  M6: {id:"M6", tag:"Sales Deep Dive 5", color:"bg-cyan-100 text-cyan-700 border-cyan-200",
       attendees:"Clemens Rodde, Dagna Jurk, Rana Taha Tariq, Muhammad Saqib Ali"},
  M7: {id:"M7", tag:"Sales Deep Dive 6", color:"bg-lime-100 text-lime-700 border-lime-200",
       attendees:"Dagna Jurk, Clemens Rodde, Rana Taha Tariq"},
};

/* ============================ DATA: REQUIREMENTS ============================
   Each requirement is traceable to a meeting + speaker, links to a screen,
   and documents how it's implemented in this prototype.
   quote = faithful paraphrase of what was said (transcripts were rough).      */
const REQS = [
  {id:"REQ-01", title:"Translation Project (1 source → many target languages)", cat:"Projects", screen:"orders",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"An order in the future is a translation project with one source and multiple target languages.",
   need:"An order becomes a 'translation project' that wraps one source and multiple target languages, with one order per target language beneath it. Orders can still be worked individually, but the project is the grouping unit.",
   impl:"The Translation Orders screen has a Project view showing each project with its language badges (e.g. DE-DE → EN-GB, FR-FR, IT-IT) and its child orders, plus an Order view for the flat list. The Offer Builder quotes across all target languages at once."},
  {id:"REQ-02", title:"Project view toggle (replaces pooling)", cat:"Projects", screen:"orders",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"You can toggle the project view and see project boxes with the orders — this replaces the pooling.",
   need:"Replace the current POOL grouping with an explicit project grouping; operators can switch between a grouped project view and a flat order view.",
   impl:"A 'Project view / Order view' toggle at the top of Translation Orders switches between grouped project cards (with their child orders) and the flat order table."},
  {id:"REQ-03", title:"Projects linked to company hierarchy", cat:"Templates", screen:"templates",
   meeting:"M1", speaker:"Dagna Jurk",
   quote:"It's linked to the company — you can add customers from different company hierarchies into the project.",
   need:"A project/template belongs to a company (not a person) and can include customers across the company hierarchy (parent/sub-companies), never cross-company.",
   impl:"Templates screen shows each project template bound to a company, with the linked customers and company hierarchy chips."},
  {id:"REQ-04", title:"Customer can select a project on their order", cat:"Projects", screen:"builder",
   meeting:"M1", speaker:"Rana Taha Tariq",
   quote:"If the customer selects the correct project they see the discount — they'd do it themselves.",
   need:"Where a company has projects, the customer (or operator) selects the project on the order so the right TM/discount/price and references apply automatically.",
   impl:"The Offer Builder has a Project/Template selector; picking one applies the project's discount and references and shows the incentive to the customer."},
  {id:"REQ-05", title:"Project carries TM, glossaries, style guides, comments", cat:"Templates", screen:"templates",
   meeting:"M1", speaker:"Dagna Jurk",
   quote:"The translation memory is different, and the additional documents like style guides or glossaries are different per project.",
   need:"Each project holds its own translation memory, glossaries, style guides and comment set — the reason a wrong project produces wrong analysis and price.",
   impl:"Template detail lists References (TM, glossary, style guide) and links to the project's comment set."},
  {id:"REQ-06", title:"Terminology: 'Project' vs 'Template'", cat:"Projects", screen:"requirements",
   meeting:"M1", speaker:"Clemens Rodde",
   quote:"'Project' is ambiguous — in other systems this type is sometimes called a template.",
   need:"Decide naming before labelling the UI, since it touches nearly every screen.",
   impl:"Prototype uses 'Project (Template)' in labels as a placeholder pending the naming decision."},
  {id:"REQ-07", title:"Offer attached to the Translation Project", cat:"Offers", screen:"builder",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"The offer always connects to the translation project, not to the sub-orders for the languages.",
   need:"An offer is a first-class entity on the project (statuses: draft, sent, accepted, withdrawn), covering all its target-language orders.",
   impl:"The Offer Builder produces one offer for the whole project; the Offers list tracks status per project."},
  {id:"REQ-08", title:"Alternate offers (delivery / product / language variants)", cat:"Offers", screen:"builder",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"I have to create it again and again for two delivery times or different products — extremely time consuming.",
   need:"Generate several offer variants side-by-side without re-uploading — different delivery times, product tiers, or language scopes.",
   impl:"Offer Builder shows a Variants panel where you add/toggle alternates; each recomputes price and margin. Selected variants are the ones sent."},
  {id:"REQ-09", title:"Multi-language visibility hint on offers", cat:"Offers", screen:"builder",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"If it covers three languages but shows only French for €4000 with no hint, the wrong offer gets sent.",
   need:"When an offer spans multiple target languages, that must be visible so the wrong single-language offer isn't sent.",
   impl:"The Offer Builder header and each variant show all target-language badges and a 'covers N languages' hint."},
  {id:"REQ-10", title:"Auto delivery-mode availability (volume × language)", cat:"Offers", screen:"builder",
   meeting:"M2", speaker:"Rana Taha Tariq",
   quote:"The system should show which modes are realistic — cross out Express if the volume is too high.",
   need:"Compute realistic delivery modes from volume and language pair; disable impossible ones with a reason.",
   impl:"Delivery-mode selector disables modes the volume can't support (crossed out with a tooltip reason), driven by configurable thresholds."},
  {id:"REQ-11", title:"Offer status lifecycle", cat:"Offers", screen:"offers",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"The project has states — offering, then accepted, then it becomes an order and goes to fulfilment.",
   need:"Track offers through Draft → Sent → Accepted (→ handed to fulfilment) / Withdrawn / Expired.",
   impl:"Offers list shows status pills and a state timeline; accepting simulates the handoff to fulfilment."},
  {id:"REQ-12", title:"Offer acceptance via link or portal edit", cat:"Offers", screen:"offers",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"The customer accepts by clicking a link in the email, or jumps into the portal to change things.",
   need:"Customer accepts an offer from an emailed link, or opens it in the portal to tweak parameters first.",
   impl:"Offers detail has an 'Accept (simulate)' action and a customer-portal preview of the acceptance page."},
  {id:"REQ-13", title:"Set real deadline on acceptance + fit warning", cat:"Offers", screen:"offers",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"When confirmed I set the actual delivery date; if it doesn't fit the mode the system should warn me.",
   need:"On acceptance the operator sets the actual deadline; the system checks it still fits the delivery mode and warns otherwise.",
   impl:"Acceptance dialog includes a deadline picker with a live 'fits the delivery mode' check and warning state."},
  {id:"REQ-14", title:"Discount tools + scenarios (low / high)", cat:"Pricing", screen:"builder",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"We want low-discount and high-discount scenarios you can pick with one click — not a calculator by hand.",
   need:"Percentage discount, first-CAT-match discount, or set a target price; plus one-click standard scenarios.",
   impl:"Offer Builder has a discount slider, quick scenario buttons, and a target-price field; price and margin recompute live."},
  {id:"REQ-15", title:"Show margin + enforce minimum", cat:"Pricing", screen:"builder",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"I need to see the margin — right now I can't, and there's a minimum I must respect.",
   need:"Always display margin during quoting and warn when a discount drops below the minimum margin.",
   impl:"A live margin meter turns amber/red when the selected variant falls under the configurable minimum margin."},
  {id:"REQ-16", title:"Connect Atlas for real supplier costs", cat:"Pricing", screen:"builder",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"Connect Atlas so it's the real supplier costs, not an imaginary purchase price — then margin is always right.",
   need:"Feed real supplier/purchase costs from Atlas so margin reflects reality rather than an estimate.",
   impl:"Cost line is labelled 'from Atlas (mock)' to mark the integration point feeding the margin calculation."},
  {id:"REQ-17", title:"Add-ons at customer/project level, auto-applied", cat:"Pricing", screen:"builder",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"Certification, translation statements, minimum price — set it at project level so it's applied automatically.",
   need:"Configure add-ons (certification stamp, apostille, minimum price, DTP) per customer/project and auto-apply on matching orders; hide internal cost from self-service customers.",
   impl:"Offer Builder Add-ons section reuses the portal's existing add-ons (Certification Stamp, Apostille) plus project-level auto-add-ons that apply on load."},
  {id:"REQ-18", title:"Complex / special pricing (per language, contract)", cat:"Pricing", screen:"requirements",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"Special prices per language and product, hourly proofreading, contract prices — a separate session.",
   need:"Support contract-specific and per-language/product special prices and hourly rates. Parked for a dedicated pricing session.",
   impl:"Tracked as Planned; the Offer Builder rate table is the extension point."},
  {id:"REQ-19", title:"CAT analysis before offering", cat:"Projects", screen:"builder",
   meeting:"M1", speaker:"Dagna Jurk",
   quote:"I upload the file and run the analysis to get the words and the matches before I can offer.",
   need:"Run CAT analysis to get volume and match discounts before an offer can be built.",
   impl:"Offer Builder has a 'Run CAT analysis (mock)' step that reveals per-language word counts and match discounts."},
  {id:"REQ-20", title:"Project-level delivery comments per target language", cat:"Comments", screen:"comments",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"The special delivery comment should live on the project, per language — not as a general comment.",
   need:"Store delivery/instruction comments at project level, scoped per target language.",
   impl:"Comments Library groups comments by project and target language with scope badges."},
  {id:"REQ-21", title:"Auto-match & suggest best comments", cat:"Comments", screen:"comments",
   meeting:"M2", speaker:"Rana Taha Tariq",
   quote:"It auto-matches the order and language combination and suggests the best three comments to confirm.",
   need:"Automatically match candidate comments to an order by project + language and surface the best suggestions for confirmation.",
   impl:"Comments Library has an auto-match panel that, given a mock order, ranks and suggests the top comments to confirm."},
  {id:"REQ-22", title:"Override / add / delete + special exclusions", cat:"Comments", screen:"comments",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"Only translate the black text, don't translate the headline, only the yellow-highlighted — needs to be flexible.",
   need:"Operators can override/add/delete comments and capture special exclusions per order.",
   impl:"Comment rows support edit/override/delete, and a set of quick exclusion chips (only black text, skip headline, only highlighted)."},
  {id:"REQ-23", title:"Multi-channel: self-service portal + operator admin", cat:"Channels", screen:"offers",
   meeting:"M2", speaker:"Rana Taha Tariq",
   quote:"Customers should self-serve valid options in the portal; only ~20% order via website, the rest by email.",
   need:"Same offer/pricing engine across the customer self-service portal and the operator admin.",
   impl:"Offers detail includes a 'Customer portal preview' toggle showing the customer-facing view (no internal cost/margin) vs the operator view."},
  {id:"REQ-24", title:"Order-entry & fulfilment as separate modules", cat:"Architecture", screen:"dashboard",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"Order entry and its offer logic is a separate module from order fulfilment; when finished it's sent to fulfilment.",
   need:"Sales (order entry) is a distinct module; a completed sales order is handed to the existing fulfilment module.",
   impl:"This whole Sales tab is the order-entry module; the Dashboard shows the handoff into the existing Translations (fulfilment) area."},
  {id:"REQ-25", title:"Priority / special-care workflow", cat:"Workflow", screen:"templates",
   meeting:"M1", speaker:"Dagna Jurk",
   quote:"Super-prio orders need a double delivery check — two people check before delivery.",
   need:"High-priority orders trigger special-care workflows (e.g. sequential double delivery check), driven from the project.",
   impl:"Template workflow builder includes a priority flag and an example double-delivery-check step chain."},
  {id:"REQ-26", title:"Buffer time (customer vs purchase deadline)", cat:"Workflow", screen:"builder",
   meeting:"M1", speaker:"Dagna Jurk",
   quote:"Customer delivery is 8:00 but purchase is 7:45 — 15 minutes buffer for manual work.",
   need:"Maintain a buffer between the customer-facing delivery time and the internal purchase deadline, varying by mode.",
   impl:"Offer Builder shows a computed buffer line (customer time vs internal deadline) per selected delivery mode."},
  {id:"REQ-27", title:"Quality / TM-update settings (prep step)", cat:"Workflow", screen:"templates",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"Economy shouldn't write into the translation memory — handle it in the preparation step, not the offer.",
   need:"Configure TM-update behaviour per company/project (e.g. economy excluded), applied in the preparation step.",
   impl:"Template settings expose a per-tier 'write to TM' toggle noted as applied during preparation, not offering."},
  {id:"REQ-28", title:"Workflow templates at project level, auto-applied", cat:"Workflow", screen:"templates",
   meeting:"M2", speaker:"Clemens Rodde",
   quote:"Configure the workflow on the project, save it, and it's applied automatically to fulfilment.",
   need:"Reusable workflow templates on the project that auto-apply (extra delivery steps, return-to-customer-system steps).",
   impl:"Template detail includes an ordered, reorderable workflow-step builder saved on the project."},
  {id:"REQ-29", title:"Start an offer from scratch (client + language pairs)", cat:"Channels", screen:"builder",
   meeting:"M2", speaker:"Dagna Jurk",
   quote:"Only about 20% order via the website — most just send an email asking for an offer.",
   need:"Operators must be able to begin an offer without an existing order: pick or type the client (many come by email, sometimes brand-new) and add one or more source→target language pairs.",
   impl:"The Offer Builder opens with a 'Client & languages' section — a client field (choose an existing client or type a new name) plus a source language and add/remove target-language pairs that drive the CAT analysis and pricing."},

  {id:"REQ-30", title:"Supported source file formats", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"We have a list in Confluence of supported and not-supported formats — this needs to be fulfilled in the new system.",
   need:"Define and enforce the accepted source formats (Word, Excel, PowerPoint, TXT, XML, InDesign IDML/EDML, subtitles, SDLXLIFF…), reusing the existing supported/not-supported list.",
   impl:"Files & Analysis lists the supported formats as chips, flagging the ones that need extra handling / a higher rate."},
  {id:"REQ-31", title:"XML + ITS rules (translatable parts)", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Clemens Rodde",
   quote:"For XML we use ITS rules to say which parts should and shouldn't be translated; upload the XML and the ITS together.",
   need:"Support ITS rule files that mark translatable vs non-translatable XML content; allow uploading XML + ITS together (some arrive via API) and auto-extract.",
   impl:"Files & Analysis shows an ITS-rules row (XML file + attached ITS file) with an 'auto-extract' action (mock)."},
  {id:"REQ-32", title:"Volume counting (words / lines / characters)", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"We count words, lines and characters; PowerPoint, PDF and Excel are more work, so they have a higher rate.",
   need:"Count volume by words/lines/characters and apply higher rates to harder formats (PPT/PDF/Excel).",
   impl:"A counting table maps each format to its billing unit and a complexity rate multiplier."},
  {id:"REQ-33", title:"Format-surcharge transparency to the customer", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Rana Taha Tariq",
   quote:"If a customer sends a PDF and doesn't see why it costs more, they'll be confused — there should be a hint.",
   need:"Make format-based surcharges/line counts visible to the customer (a hint on the order/invoice) and steer them from PDF toward Word/EDML.",
   impl:"The counting section carries a customer-facing hint about format surcharges and a 'prefer Word/EDML' nudge."},
  {id:"REQ-34", title:"CAT analysis + company-level CAT options", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"These are the discounts for 100% matches and repetitions; I decide how much the customer gets.",
   need:"Show CAT analysis (100% matches, repetitions, fuzzy) with configurable per-company discount options, keeping the match % separate from the discount given to the customer.",
   impl:"A CAT panel lists match categories with editable customer-discount % and company-level defaults."},
  {id:"REQ-35", title:"No inter-module CAT accounting — transparent margin", cat:"Architecture", screen:"files",
   meeting:"M3", speaker:"Clemens Rodde",
   quote:"Going forward there's no accounting between sales and purchase — it's fully transparent margin.",
   need:"Drop the old 50/50 CAT sharing between sales and purchase; pass order-level CAT data to fulfilment and keep margin transparent.",
   impl:"The CAT panel notes that order-level analysis flows to fulfilment with no inter-module split (documented, mock)."},
  {id:"REQ-36", title:"Lock 100% matches / manual recount", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"I want to lock the 100% matches so the order only sends the non-locked lines.",
   need:"Let the operator lock 100% matches so only non-locked lines go to fulfilment, and manually recount/re-price when needed.",
   impl:"A 'lock 100% matches' toggle on the CAT panel strikes out the locked lines in the 'to fulfilment' column."},
  {id:"REQ-37", title:"XLIFF errors & warnings handling", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"The XLIFF errors — hidden references and 'confetti' — cost a lot of time; I fix the source and re-check.",
   need:"Surface and link the XLIFF check reports (errors/warnings + classification), let the operator fix hidden tags/references in the source and re-run — the biggest manual time sink, raised as a high-priority feature request.",
   impl:"An XLIFF check panel lists errors/warnings with severity and an 'open in XLIFF viewer' deep link (mock)."},
  {id:"REQ-38", title:"DTP for IDML / EDML", cat:"Files", screen:"files",
   meeting:"M3", speaker:"Dagna Jurk",
   quote:"EDML files mostly require DTP work — the customer needs a layout after translation.",
   need:"Handle desktop-publishing (layout) for IDML/EDML after translation as a distinct step/cost.",
   impl:"Flagged on the formats list and tied to the project add-ons (DTP / Layout)."},

  {id:"REQ-39", title:"Special / customer prices (pair × type × product × mode)", cat:"Pricing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"Special prices are set per language, per order type, per delivery mode — and per billing unit.",
   need:"Store contract/special prices keyed by language pair, order type/product and delivery mode, with a billing unit (line/word/hour) per product.",
   impl:"A Special prices table lists each rule with its language pair, order type, product, delivery mode, unit and rate."},
  {id:"REQ-40", title:"Wildcards + bulk import for price matrices", cat:"Pricing", screen:"invoicing",
   meeting:"M4", speaker:"Clemens Rodde",
   quote:"You can't use wildcards — you set every combination by hand; we get huge Excel exports to import.",
   need:"Support wildcards and bulk import (Excel) so operators don't enter thousands of language combinations by hand.",
   impl:"The Special prices section has 'Import from Excel' and a wildcard rule (e.g. * → EN-*) as entry points (mock)."},
  {id:"REQ-41", title:"Accountings at company / parent level", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Clemens Rodde",
   quote:"Accountings are created on company level; the customer can only choose one, not create it.",
   need:"Model 'accountings' (billing entities) at company/parent-company level incl. departments; customers select one, operators create them.",
   impl:"An Accounting card shows the billing entity at company level with its selectable configuration."},
  {id:"REQ-42", title:"VAT & currency handling", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"A non-EU customer pays no VAT; an EU customer with a VAT ID is net — it changes the price calculation.",
   need:"Handle VAT by customer location / VAT ID (non-EU no VAT; EU reverse-charge net) and set currency per accounting.",
   impl:"The accounting card shows currency and VAT status (with the net/gross implication)."},
  {id:"REQ-43", title:"Master agreement — skip the offer", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"With a master agreement we don't need an offer — just proceed and send a confirmation.",
   need:"A master-agreement flag lets qualifying orders skip the offer and go straight to purchase — while still supporting customers who want an offer first.",
   impl:"The accounting card carries a 'master agreement / no offer needed' badge that branches the order flow (mock)."},
  {id:"REQ-44", title:"Payment terms & payment modes", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"Standard is 14 days, but some need 30 or even 60; and we have pay-by-invoice or an external provider.",
   need:"Configurable payment terms (14/30/60 days) and payment modes (pay-by-invoice, external provider) with a default per accounting.",
   impl:"The accounting card shows the payment term and payment mode."},
  {id:"REQ-45", title:"Invoice profiles & e-invoicing (X-Bill / XRechnung)", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"Some customers' systems scan invoices — we need to provide an X-Bill / e-invoice profile.",
   need:"Support invoice profiles including structured e-invoicing (X-Bill / XRechnung / ZUGFeRD) for customers whose systems ingest invoices automatically.",
   impl:"The accounting card lists an invoice profile with the e-invoice format (planned integration)."},
  {id:"REQ-46", title:"Single vs collective (monthly) invoices", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"You can have a single invoice per order, or all the orders flowing into one monthly invoice.",
   need:"Support per-order (single) invoices vs collective/monthly combined invoices.",
   impl:"An invoicing-mode toggle (single / collective monthly) on the accounting."},
  {id:"REQ-47", title:"Specific / required fields + grouping split", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"We split the collective invoice by person or project — PO number, cost center, project, person as fields.",
   need:"Configurable specific/required fields (PO number, cost center, project, person) and grouping to split collective invoices by person/project/department.",
   impl:"A specific-fields row with required flags and a note that collective invoices group by person/project."},
  {id:"REQ-48", title:"Billing recipients (who receives the invoice)", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"I need to choose who gets the invoice and which billing e-mail address it goes to.",
   need:"Configure billing address and one or more invoice-recipient email addresses, separate from the order contact.",
   impl:"The accounting card lists the billing recipients (mock)."},
  {id:"REQ-49", title:"Auto-invoice on delivery + credit-note reissue", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"The invoice is created automatically on delivery; to change the company we cancel it and issue a credit note.",
   need:"Auto-generate the invoice on delivery; changing company/accounting cancels the invoice and issues a credit note before reissuing.",
   impl:"An invoice-generation panel shows the auto-on-delivery flow and the cancel → credit-note → reissue path (mock)."},
  {id:"REQ-50", title:"Orders with no upfront price (hourly)", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Dagna Jurk",
   quote:"For hourly orders we disable the automatic invoice, get the hours from purchase, then bill.",
   need:"For orders priced later (hourly, e.g. proofreading), disable the auto-invoice, pull actual hours from purchase, then generate the final invoice.",
   impl:"The invoice-generation panel has a 'price on completion (hourly)' mode that waits for purchase hours (mock)."},
  {id:"REQ-51", title:"Atlas payment data + portal/operator maintenance", cat:"Invoicing", screen:"invoicing",
   meeting:"M4", speaker:"Muhammad Saqib Ali",
   quote:"The finance/payment data sits in Atlas right now — we need to add these options and integrate.",
   need:"Payment/accounting data lives in Atlas (DT world); integrate so customers maintain payment modes via the portal, or operators maintain on their behalf.",
   impl:"The accounting card notes 'source: Atlas (mock)' and a portal-vs-operator maintenance note (planned integration)."},

  /* ===== From M5 · Sales req demo (walkthrough, Faisal + Clemens) ===== */
  {id:"REQ-52", title:"Email intake → draft offer from an email", cat:"Channels", screen:"builder",
   meeting:"M5", speaker:"Clemens Rodde",
   quote:"We scan the emails and try to look up the order details from the emails.",
   need:"When a customer emails a request, the system scans the email and pre-fills a draft offer (client, language pairs, volume) so the operator doesn't retype it.",
   impl:"Planned — the Offer Builder would gain an 'from email' entry point that parses an incoming message into a draft offer."},
  {id:"REQ-53", title:"Auto-generated default offers (operator reviews)", cat:"Offers", screen:"builder",
   meeting:"M5", speaker:"Clemens Rodde",
   quote:"He doesn't have to create the offers because you have default rules behind that make suitable offers — he just sees them.",
   need:"Default rules automatically generate the suitable offer(s) for a request; the operator reviews and adjusts rather than building each offer from scratch.",
   impl:"Planned — the builder would propose default offer variants from rules, which the operator can tweak."},
  {id:"REQ-54", title:"Manual price override vs the algorithm", cat:"Pricing", screen:"builder",
   meeting:"M5", speaker:"Clemens Rodde",
   quote:"Sometimes we want to offer our clients another price than what our pricing algorithm gives.",
   need:"Operators can override the algorithm price with a manually agreed price, while still seeing the algorithm price and the margin impact.",
   impl:"Planned — an editable final-price field alongside the computed price, with margin recalculated live."},
  {id:"REQ-55", title:"Customer file upload via self-service portal", cat:"Channels", screen:"files",
   meeting:"M5", speaker:"Clemens Rodde",
   quote:"You can upload it there and not send it by e-mail — a multi-channel self-service portal.",
   need:"Customers upload source files through a self-service portal instead of emailing, feeding the same intake pipeline.",
   impl:"Planned — a portal upload channel that lands files into the order/offer intake (mocked in Files & Analysis)."},

  /* ===== From M6 · Sales Deep Dive 5 (invoicing, hourly pricing, hierarchy) ===== */
  {id:"REQ-56", title:"Customer project (workspace) — top of the hierarchy", cat:"Projects", screen:"orders",
   meeting:"M6", speaker:"Clemens Rodde",
   quote:"There is a customer project, Max Planck magazine, and the quarterly orders come in under it as translation projects.",
   need:"A three-level hierarchy: Customer project (workspace) → Translation project → Orders. The customer project groups recurring translation projects (e.g. a quarterly magazine) and is the object Atlas cares about.",
   impl:"Planned — the project drawer would sit under a higher 'customer project' grouping; prototype currently models the middle (translation project) and orders."},
  {id:"REQ-57", title:"Project tree / grouping in the fulfilment list", cat:"Architecture", screen:"orders",
   meeting:"M6", speaker:"Clemens Rodde",
   quote:"Today order fulfilment is a flat list; in future a tree structure grouping orders by project — this replaces pooling as a new business object.",
   need:"Order fulfilment lists orders grouped in a project tree (not a flat list); the project is a new business object that supersedes order pooling.",
   impl:"Prototype's Order view already nests project-bound orders under a translation-project parent; fulfilment would mirror this tree."},
  {id:"REQ-58", title:"Set final customer price at end of fulfilment", cat:"Invoicing", screen:"invoicing",
   meeting:"M6", speaker:"Dagna Jurk",
   quote:"We know there will be additional cost because of DTP or PDF, but we only decide the final price at the end.",
   need:"Some costs (DTP, PDF layout, proofreading hours) are unknown up front; a step at the end of fulfilment sets the final customer price before invoicing.",
   impl:"Planned — a 'finalise price' step on the order/project before the invoice is generated."},
  {id:"REQ-59", title:"Adjust logged hours at the delivery step", cat:"Invoicing", screen:"invoicing",
   meeting:"M6", speaker:"Dagna Jurk",
   quote:"The person responsible for the delivery can say the translator did one hour twenty, and the amount is for both of them.",
   need:"At delivery, the responsible operator can adjust the hours logged (across translation + proofreading) that feed the customer price, even if a different operator created the order.",
   impl:"Planned — an editable hours field on the delivery step of a time-based order."},
  {id:"REQ-60", title:"No time estimate on the offer for time-based jobs", cat:"Pricing", screen:"builder",
   meeting:"M6", speaker:"Dagna Jurk",
   quote:"For these time-based tops we don't give an estimation on the offer document — it's too risky.",
   need:"For hourly/time-based work (e.g. proofreading), the offer must not commit to an estimated time; only general rates are shown and the final count is the actual time.",
   impl:"Planned — a business rule that suppresses a time estimate for time-based products on the offer."},
  {id:"REQ-61", title:"Invoice validation step before sending", cat:"Invoicing", screen:"invoicing",
   meeting:"M6", speaker:"Dagna Jurk",
   quote:"There should be some kind of validation step before I create the invoice for the customer.",
   need:"Before an invoice goes to the customer, an operator validates it (amounts, hours, additional costs) — with clear ownership of correctness between sales and fulfilment.",
   impl:"Planned — a review/approve gate on the invoice with a validation checklist."},
  {id:"REQ-62", title:"Factor-based price calculation", cat:"Pricing", screen:"invoicing",
   meeting:"M6", speaker:"Clemens Rodde",
   quote:"The price factors are the language combination, the specialization, and the delivery mode.",
   need:"Beyond special/contract prices, a factor-based model computes price from language combination × specialization × delivery mode (express/first raise it); estimate before and recalculate after fulfilment.",
   impl:"Planned — a factor-based pricing engine complementing the special-price table (REQ-39)."},

  /* ===== From M7 · Sales Deep Dive 6 (pricing, discounts, follow-up, templates) ===== */
  {id:"REQ-63", title:"Automatic volume / loyalty & threshold discounts", cat:"Pricing", screen:"builder",
   meeting:"M7", speaker:"Dagna Jurk",
   quote:"They get 5% for each order, and if they reach 100,000 we change it — today we just write the discount by hand.",
   need:"The system automatically applies volume/loyalty discounts and threshold rules (e.g. X% per order, a different rate after a spend threshold, a project discount) instead of manual entry.",
   impl:"Planned — discount rules configured per customer/project and auto-applied in the builder, shown on the offer."},
  {id:"REQ-64", title:"Follow-up reminders — date & order-status based", cat:"Workflow", screen:"offers",
   meeting:"M7", speaker:"Clemens Rodde",
   quote:"Not only date-based reminders — as soon as it's in sales waiting for me, I'd like an email: your order is waiting.",
   need:"Reminders driven by both a date and the order/offer status (e.g. sent, pending payment, waiting in sales, no interest → stop & hide); the operator gets email alerts rather than watching constantly — critical around holidays.",
   impl:"Planned — a follow-up engine on offers with status transitions and email/task reminders."},
  {id:"REQ-65", title:"Offer letter templates (reusable, admin-managed)", cat:"Offers", screen:"templates",
   meeting:"M7", speaker:"Dagna Jurk",
   quote:"You have template text components you reuse to create the offer, and different templates you can choose, per language.",
   need:"Offers are composed from reusable text components/templates, chosen per language and managed in an admin front-end.",
   impl:"Mock — the Projects/Templates screen would host offer letter templates and their reusable components."},
  {id:"REQ-66", title:"Security surcharge for confidential orders", cat:"Pricing", screen:"builder",
   meeting:"M7", speaker:"Dagna Jurk",
   quote:"For confidential orders it's not part of the price calculator — it's an additional surcharge for security.",
   need:"Confidential/high-security orders carry an automatic security surcharge added as an additional cost (outside the base price calculator); only the relevant part is shown to the customer.",
   impl:"Planned — a security add-on that injects a surcharge line when an order is flagged confidential."},
  {id:"REQ-67", title:"Internal vs customer-facing add-ons", cat:"Pricing", screen:"builder",
   meeting:"M7", speaker:"Dagna Jurk",
   quote:"Some add-ons are half used for invoicing between sales and purchase that we don't show to the customer.",
   need:"Add-ons split into customer-facing services (with special / minimal / per-unit prices) and internal ones used only for sales↔purchase invoicing and hidden from the customer.",
   impl:"Planned — an add-on catalogue with a visibility flag (customer vs internal) and per-unit/minimal pricing."},
  {id:"REQ-68", title:"Express / weekend / urgent surcharges (incl. on tenders)", cat:"Pricing", screen:"builder",
   meeting:"M7", speaker:"Dagna Jurk",
   quote:"As soon as it's express or weekend delivery I have to charge extra — some customers always want 25% extra for express.",
   need:"Express, weekend and urgent deliveries add a surcharge (e.g. +25%), applied even when a tender fixes per-line prices; the system flags when a delivery mode requires the surcharge check.",
   impl:"Planned — surcharge rules tied to delivery mode/weekend that layer on top of tender/special prices."},
  {id:"REQ-69", title:"Multi-market pricing (division-level calculators)", cat:"Pricing", screen:"invoicing",
   meeting:"M7", speaker:"Clemens Rodde",
   quote:"Switzerland is a high-price market and Germany lower — the price calculator has to handle each division.",
   need:"With all markets in one system, each sales division/market uses its own price calculator (e.g. high Swiss vs lower German rates), configurable at customer / company / project level.",
   impl:"Planned — market-scoped pricing configuration resolved per customer/company/project."},
];

const CATS = ["Projects","Offers","Pricing","Comments","Channels","Workflow","Architecture","Files","Invoicing"];
const STATUS_OF = (r)=> ["REQ-06","REQ-18","REQ-45","REQ-51","REQ-52","REQ-53","REQ-54","REQ-55","REQ-56","REQ-58","REQ-59","REQ-60","REQ-61","REQ-62","REQ-63","REQ-64","REQ-66","REQ-67","REQ-68","REQ-69"].includes(r.id) ? "Planned"
  : ["REQ-16","REQ-27","REQ-28","REQ-25","REQ-31","REQ-33","REQ-35","REQ-36","REQ-37","REQ-38","REQ-40","REQ-42","REQ-43","REQ-46","REQ-47","REQ-48","REQ-49","REQ-50","REQ-57","REQ-65"].includes(r.id) ? "Mock / partial"
  : "Built (mock)";
const statusClass = (st)=> st==="Built (mock)" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : st==="Planned" ? "bg-zinc-100 text-zinc-500 border-zinc-200"
  : st==="Dropped" ? "bg-zinc-100 text-zinc-400 border-zinc-200 line-through"
  : "bg-amber-50 text-amber-700 border-amber-200";
const imgFor = (id)=> ((typeof window!=="undefined" && window.REQ_IMAGES) || {})[id];

/* ---- Multiple reference screenshots per requirement ----
   Curated from the real TDS screens captured in the deep-dive recordings.
   Each entry is an ordered list of {k: frame-key in window.SHOTS, cap: caption}. */
const REQ_SHOTS = {
  "REQ-01":[{k:"orderform",cap:"Order entry form — the order/offer detail (Auftragsdetails)"},{k:"orderDetails",cap:"Same order with its workflow & pricing block"}],
  "REQ-05":[{k:"projectTM",cap:"Background TMs held by the project"},{k:"catOptions",cap:"TM / CAT options applied to an order"}],
  "REQ-13":[{k:"delivery",cap:"Delivery documents & delivery-date fields"},{k:"orderDetails",cap:"Order detail where the deadline is committed"}],
  "REQ-17":[{k:"docsPrices",cap:"Document prices & add-ons on the order"}],
  "REQ-19":[{k:"counting",cap:"Volume counting + CAT analysis result"},{k:"catOptions",cap:"CAT / TM match options"}],
  "REQ-20":[{k:"comments",cap:"Comment templates library"}],
  "REQ-21":[{k:"comments",cap:"Comment templates that can be auto-matched"}],
  "REQ-22":[{k:"comments",cap:"Editable comment templates (override / exclude)"}],
  "REQ-25":[{k:"orderDetails",cap:"Order detail with special-care flags"},{k:"delivery",cap:"Delivery step where extra checks apply"}],
  "REQ-27":[{k:"catOptions",cap:"TM options for the order"},{k:"projectTM",cap:"Project-level TMs the behaviour is configured against"}],
  "REQ-30":[{k:"formats",cap:"Supported & unsupported source file formats"}],
  "REQ-31":[{k:"its",cap:"ITS rules file alongside the XML source"},{k:"formats",cap:"XML / ITS in the supported-formats list"}],
  "REQ-32":[{k:"counting",cap:"Volume counting by words / lines / characters"}],
  "REQ-34":[{k:"catOptions",cap:"CAT match / discount options"},{k:"counting",cap:"Match analysis these options drive"}],
  "REQ-37":[{k:"xliff",cap:"XLIFF conversion error classification"}],
  "REQ-39":[{k:"specialPrices",cap:"Special price rows per language pair"},{k:"docsPrices",cap:"Document / add-on prices"}],
  "REQ-40":[{k:"specialPrices",cap:"Special-price matrix (wildcards / import target)"}],
  "REQ-41":[{k:"accounting",cap:"Accounting fields on the customer / company"}],
  "REQ-42":[{k:"accounting",cap:"VAT & currency on the accounting"},{k:"einvoice",cap:"Payment / e-invoice settings"}],
  "REQ-43":[{k:"masterAgr",cap:"Master-agreement order assigned to purchase"}],
  "REQ-44":[{k:"einvoice",cap:"Payment model / terms selector"}],
  "REQ-45":[{k:"einvoice",cap:"Payment / e-invoice profile"},{k:"specificFields",cap:"Specific fields an e-invoice needs"}],
  "REQ-46":[{k:"invoices",cap:"Invoices & credit notes"},{k:"specificFields",cap:"Specific fields for collective invoicing"}],
  "REQ-47":[{k:"specificFields",cap:"Required / specific fields & grouping"},{k:"invoices",cap:"How they split the invoices"}],
  "REQ-48":[{k:"accounting",cap:"Billing recipient & address on the accounting"},{k:"masterAgr",cap:"Agreement that fixes the recipient"}],
  "REQ-49":[{k:"invoices",cap:"Invoices & credit notes (cancel → reissue)"},{k:"delivery",cap:"Delivery documents that trigger the invoice"}],
  "REQ-50":[{k:"invoices",cap:"Invoice produced after completion"}],
};
const SHOTS_SRC = ()=> (typeof window!=="undefined" && window.SHOTS) || {};
/* Returns an ordered array of {src, cap} for a requirement: curated multi-set first,
   else the single legacy screenshot, else empty. */
const imgsFor = (id)=>{
  const set = REQ_SHOTS[id];
  if(set){ const S=SHOTS_SRC(); return set.map(s=>({src:S[s.k], cap:s.cap})).filter(x=>x.src); }
  const single = imgFor(id);
  return single ? [{src:single, cap:null}] : [];
};
const shotCount = (id)=> imgsFor(id).length;

/* ---- Broad epic groups (themes) ---- */
const EPICS=[
  {key:"intake", title:"1 · Order intake & entry", desc:"Creating and listing standalone translation orders, and starting an offer from a client + language pairs.",
   ids:["REQ-01","REQ-02","REQ-04","REQ-29","REQ-52","REQ-55"]},
  {key:"quoting", title:"2 · Quoting & offers", desc:"Building offers with alternates and delivery options, and the accept-to-order lifecycle across channels.",
   ids:["REQ-07","REQ-08","REQ-09","REQ-10","REQ-11","REQ-12","REQ-13","REQ-23","REQ-53","REQ-64","REQ-65"]},
  {key:"pricing", title:"3 · Pricing, discounts & margin", desc:"Rates, special/contract prices, discounts, add-ons and real-cost margin.",
   ids:["REQ-14","REQ-15","REQ-16","REQ-17","REQ-18","REQ-39","REQ-40","REQ-54","REQ-60","REQ-62","REQ-63","REQ-66","REQ-67","REQ-68","REQ-69"]},
  {key:"analysis", title:"4 · Files, analysis & quality prep", desc:"Source formats, CAT analysis, counting, TM handling and XLIFF fixing before offering or handoff.",
   ids:["REQ-19","REQ-27","REQ-30","REQ-31","REQ-32","REQ-33","REQ-34","REQ-36","REQ-37","REQ-38"]},
  {key:"projects", title:"5 · Projects, templates & instructions", desc:"Reusable project templates, references, comments/instructions, priority and workflow.",
   ids:["REQ-03","REQ-05","REQ-06","REQ-20","REQ-21","REQ-22","REQ-25","REQ-26","REQ-28","REQ-56"]},
  {key:"invoicing", title:"6 · Invoicing & accounting", desc:"Accountings, VAT, payment terms, invoice profiles, grouping and credit notes.",
   ids:["REQ-41","REQ-42","REQ-43","REQ-44","REQ-45","REQ-46","REQ-47","REQ-48","REQ-49","REQ-50","REQ-51","REQ-58","REQ-59","REQ-61"]},
  {key:"platform", title:"7 · Platform & architecture", desc:"How order entry and fulfilment relate as modules and how data flows between them.",
   ids:["REQ-24","REQ-35","REQ-57"]},
];
const GROUP_OF={}; EPICS.forEach(e=>e.ids.forEach(id=>{GROUP_OF[id]=e;}));
const groupOf=(id)=>GROUP_OF[id];

/* ---- User stories per requirement ---- */
const STORIES={
 "REQ-01":"As a sales operator, I want an order to be a translation project spanning one source and multiple target languages, so that related work is grouped, quoted and priced together.",
 "REQ-02":"As a sales operator, I want to toggle between a grouped project view and a flat order list, so that I can see the work either way (replacing the old pool grouping).",
 "REQ-03":"As a sales operator, I want projects linked to a company and its hierarchy, so that the right references apply across all of that company's customers.",
 "REQ-04":"As a customer, I want to pick my project when ordering, so that I automatically get the correct references and discount.",
 "REQ-05":"As a sales operator, I want each project to carry its own TM, glossaries and style guides, so that analysis and pricing are correct.",
 "REQ-06":"As a product owner, I want an agreed name for 'project' vs 'template', so that the UI is unambiguous.",
 "REQ-07":"As a sales operator, I want the offer to live on the translation project, so that one offer covers all its target languages.",
 "REQ-08":"As a sales operator, I want to send alternate offers side by side, so that the customer can choose delivery/product/price without me rebuilding the offer.",
 "REQ-09":"As a sales operator, I want multi-language offers to clearly show all languages, so that I never accidentally send a single-language offer.",
 "REQ-10":"As a sales operator, I want the system to offer only realistic delivery modes for the volume and language pair, so that I don't promise impossible turnarounds.",
 "REQ-11":"As a sales operator, I want offers to move through clear states (draft → sent → accepted), so that I always know where each one stands.",
 "REQ-12":"As a customer, I want to accept an offer from a link or tweak it in the portal, so that confirming is quick.",
 "REQ-13":"As a sales operator, I want to set the real deadline on acceptance with a fit-check, so that I don't commit to a date the delivery mode can't meet.",
 "REQ-14":"As a sales operator, I want quick discount tools and low/high scenarios, so that I can negotiate without a calculator.",
 "REQ-15":"As a sales operator, I want to see margin live while quoting, so that I never drop below the minimum.",
 "REQ-16":"As a sales operator, I want margin based on real supplier costs from Atlas, so that the figure I see is accurate.",
 "REQ-17":"As a sales operator, I want add-ons configured at project level and auto-applied, so that certification/DTP/minimum-price are never missed.",
 "REQ-18":"As a sales operator, I want contract and per-language/product special prices, so that agreed rates apply automatically.",
 "REQ-19":"As a sales operator, I want to run CAT analysis before quoting, so that volume and match discounts are correct.",
 "REQ-20":"As a project manager, I want delivery comments stored per project and language, so that instructions stay consistent.",
 "REQ-21":"As a sales operator, I want the system to suggest the best-matching comments for an order, so that I confirm rather than retype.",
 "REQ-22":"As a sales operator, I want to override, add or exclude comments (e.g. only highlighted text), so that special cases are handled.",
 "REQ-23":"As a customer, I want to self-serve valid options in the portal (and operators to do the same in admin), so that both channels use one engine.",
 "REQ-24":"As an engineer, I want order entry and fulfilment as separate modules with a clean handoff, so that each keeps the right business logic.",
 "REQ-25":"As a project manager, I want priority orders to trigger special-care workflows (e.g. double delivery check), so that prestige jobs are safeguarded.",
 "REQ-26":"As a sales operator, I want a buffer between the customer and internal deadlines, so that there's time for manual work before delivery.",
 "REQ-27":"As a project manager, I want TM-update behaviour configurable per company/project in the prep step, so that e.g. economy jobs don't pollute the TM.",
 "REQ-28":"As a project manager, I want reusable workflow templates on the project, so that the right steps auto-apply to fulfilment.",
 "REQ-29":"As a sales operator, I want to start an offer from just a client name and language pairs, so that I can quote email requests without an existing order.",
 "REQ-30":"As a sales operator, I want the accepted source formats enforced, so that I only take on files we can actually process.",
 "REQ-31":"As a sales operator, I want XML handled with ITS rules (uploaded or via API), so that only translatable parts are counted and translated.",
 "REQ-32":"As a sales operator, I want volume counted correctly by words/lines/characters with format-based rates, so that pricing reflects the real effort.",
 "REQ-33":"As a customer, I want to see why a format costs more, so that pricing feels transparent (and I'm nudged toward Word/EDML).",
 "REQ-34":"As a sales operator, I want CAT match/discount options configurable per company, so that agreed CAT terms apply automatically.",
 "REQ-35":"As finance, I want no inter-module CAT accounting and a transparent margin instead, so that sales and purchase figures stay clear.",
 "REQ-36":"As a sales operator, I want to lock 100% matches, so that only the lines needing work go to fulfilment.",
 "REQ-37":"As a sales operator, I want XLIFF errors surfaced and linked with classification, so that I can fix the source quickly instead of hunting across tools.",
 "REQ-38":"As a project manager, I want DTP handled for IDML/EDML, so that layout is delivered correctly after translation.",
 "REQ-39":"As a sales operator, I want special prices keyed by pair/type/product/mode with a billing unit, so that contract pricing is applied automatically.",
 "REQ-40":"As a sales operator, I want wildcards and Excel import for price matrices, so that I don't enter thousands of combinations by hand.",
 "REQ-41":"As finance, I want accountings defined at company/parent level (incl. departments), so that billing entities are reused correctly.",
 "REQ-42":"As finance, I want VAT and currency handled per accounting, so that invoices are compliant (EU net, non-EU no VAT).",
 "REQ-43":"As a sales operator, I want a master-agreement flag that can skip the offer, so that trusted customers' orders go straight to purchase.",
 "REQ-44":"As finance, I want configurable payment terms and modes with a default, so that each customer is billed on agreed terms.",
 "REQ-45":"As finance, I want e-invoice profiles (X-Bill / XRechnung), so that customers whose systems scan invoices can ingest ours.",
 "REQ-46":"As finance, I want single or collective monthly invoices, so that billing matches the customer's preference.",
 "REQ-47":"As finance, I want configurable required/specific fields and grouping, so that collective invoices split correctly by person or project.",
 "REQ-48":"As finance, I want to control who receives the invoice and at which address, so that it reaches the right place.",
 "REQ-49":"As finance, I want invoices auto-generated on delivery with a cancel → credit-note → reissue path, so that corrections are clean.",
 "REQ-50":"As finance, I want hourly orders to bill after completion using purchase hours, so that the final price is accurate.",
 "REQ-51":"As finance, I want payment/accounting data integrated with Atlas and maintainable via portal or operator, so that there's a single source of truth.",
 "REQ-52":"As a sales operator, I want an incoming email parsed into a draft offer, so that I can quote an email request without retyping the details.",
 "REQ-53":"As a sales operator, I want default rules to generate the suitable offers automatically, so that I review and adjust instead of building each offer from scratch.",
 "REQ-54":"As a sales operator, I want to override the algorithm price with an agreed price, so that I can honour a negotiated rate while still seeing the margin impact.",
 "REQ-55":"As a customer, I want to upload my source files in the portal, so that I don't have to send them by email.",
 "REQ-56":"As a sales operator, I want a customer project (workspace) above translation projects, so that recurring work (e.g. a quarterly magazine) is grouped in one hierarchy.",
 "REQ-57":"As an operator, I want fulfilment orders shown in a project tree, so that grouped project work replaces the flat pooled list.",
 "REQ-58":"As finance, I want to set the final customer price at the end of fulfilment, so that late-known costs (DTP, PDF, hours) are billed accurately.",
 "REQ-59":"As a delivery operator, I want to adjust the logged hours at delivery, so that the customer price reflects the actual time spent across steps.",
 "REQ-60":"As a sales operator, I want no time estimate shown on the offer for time-based jobs, so that I don't commit to a duration that source quality could blow past.",
 "REQ-61":"As finance, I want a validation step before the invoice is sent, so that amounts and costs are checked with clear ownership.",
 "REQ-62":"As a sales operator, I want price computed from language, specialization and delivery-mode factors, so that pricing is consistent beyond fixed special prices.",
 "REQ-63":"As a sales operator, I want volume/loyalty and threshold discounts applied automatically, so that agreed discounts aren't entered by hand each time.",
 "REQ-64":"As a sales operator, I want follow-up reminders driven by date and order status with email alerts, so that offers waiting on me are never forgotten (especially around holidays).",
 "REQ-65":"As a sales operator, I want reusable, admin-managed offer letter templates per language, so that I compose offers from consistent components.",
 "REQ-66":"As a sales operator, I want a security surcharge auto-added for confidential orders, so that the extra handling is always charged.",
 "REQ-67":"As a sales operator, I want add-ons split into customer-facing and internal, so that sales↔purchase invoicing items stay hidden from the customer.",
 "REQ-68":"As a sales operator, I want express/weekend/urgent surcharges applied (even on tender prices), so that rush work is priced correctly.",
 "REQ-69":"As finance, I want each market/division to use its own price calculator, so that Swiss and German pricing can differ within one system.",
};
const storyOf=(id)=>STORIES[id]||"";

/* ---- Meeting recordings + timestamp where each requirement is discussed ---- */
const MEETING_URLS={
  M1:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deepdive%2D20260812%5F123451%2DMeeting%20Recording%2Emp4",
  M2:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deep%20Dive%202%2D20260813%5F120248%2DBesprechungsaufzeichnung%2Emp4",
  M3:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deep%20Dive%203%2D20260817%5F143517%2DMeeting%20Recording%2Emp4",
  M4:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deep%20Dive%204%2D20260818%5F143201%2DMeeting%20Recording%2Emp4",
  M5:"https://dtolk-my.sharepoint.com/personal/taha_tariq_digitaltolk_com/_layouts/15/stream.aspx?id=%2Fpersonal%2Ftaha%5Ftariq%5Fdigitaltolk%5Fcom%2FDocuments%2FInspelningar%2FSales%20req%20demo%2D20260821%5F200653%2DMeeting%20Recording%2Emp4",
  M6:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deep%20dive%205%2D20260820%5F123458%2DMeeting%20Recording%2Emp4",
  M7:"https://dtolk-my.sharepoint.com/personal/c_rodde_24technology_de/_layouts/15/stream.aspx?id=%2Fpersonal%2Fc%5Frodde%5F24technology%5Fde%2FDocuments%2FInspelningar%2FSales%20Deep%20Dive%206%2D20260821%5F181804%2DMeeting%20Recording%2Emp4",
};
const REQ_TS={
  "REQ-01":1044,"REQ-02":3960,"REQ-03":2015,"REQ-04":1435,"REQ-05":1004,"REQ-06":1740,
  "REQ-07":3662,"REQ-08":807,"REQ-09":1130,"REQ-10":1342,"REQ-11":885,"REQ-12":1878,"REQ-13":2905,
  "REQ-14":2438,"REQ-15":2190,"REQ-16":2400,"REQ-17":2530,"REQ-18":3128,"REQ-19":1135,
  "REQ-20":4037,"REQ-21":4037,"REQ-22":4037,"REQ-23":1700,"REQ-24":3945,"REQ-25":2379,"REQ-26":489,
  "REQ-27":3237,"REQ-28":3419,"REQ-29":1754,
  "REQ-30":204,"REQ-31":573,"REQ-32":1804,"REQ-33":1404,"REQ-34":1936,"REQ-35":2487,"REQ-36":2833,"REQ-37":3098,"REQ-38":4270,
  "REQ-39":339,"REQ-40":573,"REQ-41":1508,"REQ-42":868,"REQ-43":982,"REQ-44":1154,"REQ-45":1280,"REQ-46":1403,"REQ-47":2246,"REQ-48":2810,"REQ-49":3391,"REQ-50":3475,"REQ-51":1894,
  "REQ-52":880,"REQ-53":1168,"REQ-54":1518,"REQ-55":1456,
  "REQ-56":2846,"REQ-57":2561,"REQ-58":1895,"REQ-59":1090,"REQ-60":1638,"REQ-61":801,"REQ-62":3199,
  "REQ-63":765,"REQ-64":1507,"REQ-65":1084,"REQ-66":2233,"REQ-67":2483,"REQ-68":2809,"REQ-69":3247,
};
/* ---- Existing requirements that were revisited in later meetings ---- */
const ALSO_IN={
  "REQ-01":[{m:"M5",sec:509},{m:"M6",sec:2561}],
  "REQ-02":[{m:"M5",sec:754}],
  "REQ-05":[{m:"M5",sec:2087}],
  "REQ-08":[{m:"M5",sec:1168}],
  "REQ-11":[{m:"M7",sec:1347}],
  "REQ-13":[{m:"M5",sec:1294}],
  "REQ-16":[{m:"M5",sec:1488}],
  "REQ-17":[{m:"M7",sec:2483}],
  "REQ-18":[{m:"M7",sec:1525}],
  "REQ-19":[{m:"M5",sec:1645}],
  "REQ-20":[{m:"M5",sec:2149}],
  "REQ-24":[{m:"M5",sec:2440},{m:"M6",sec:863}],
  "REQ-26":[{m:"M5",sec:2373}],
  "REQ-31":[{m:"M5",sec:1741}],
  "REQ-42":[{m:"M7",sec:2046}],
  "REQ-43":[{m:"M7",sec:1050}],
  "REQ-46":[{m:"M6",sec:446}],
  "REQ-49":[{m:"M6",sec:226}],
  "REQ-50":[{m:"M6",sec:1347}],
};
const alsoIn=(id)=>ALSO_IN[id]||[];
const mmss=(s)=>{ if(s==null) return ""; const m=Math.floor(s/60), ss=s%60; return m+":"+String(ss).padStart(2,"0"); };
const meetingLink=(mkey, sec)=>{
  const base=MEETING_URLS[mkey]; if(!base) return null;
  let navp=""; try{ navp=encodeURIComponent(btoa(JSON.stringify({playbackOptions:{startTimeInSeconds: sec||0}}))); }catch(e){ navp=""; }
  return base + (navp ? ("&nav="+navp) : "");
};

/* ============================ MOCK DOMAIN DATA ============================ */
const PROJECTS = [
  {id:"TP-2041", customer:"Zürich Insurance", company:"Zürich Group", source:"DE-DE",
   targets:["EN-GB","FR-FR","IT-IT"], words:4230, product:"Business", status:"Offering",
   template:"Zürich – Insurance DE base",
   orders:[
     {lang:"EN-GB", status:"In translation", type:"MT + PE + PR", vol:"1,780 words", operator:"RT", delivery:"48 hours"},
     {lang:"FR-FR", status:"Preparing", type:"MT + PE + PR", vol:"1,460 words", operator:"—", delivery:"48 hours"},
     {lang:"IT-IT", status:"Proofreading", type:"MT + PE + PR", vol:"990 words", operator:"AB", delivery:"24 hours"},
   ]},
  {id:"TP-2040", customer:"Max Planck Institute", company:"Max Planck", source:"DE-DE",
   targets:["EN-US"], words:1180, product:"First", status:"Offer sent",
   template:"MPI – Research magazine",
   orders:[{lang:"EN-US", status:"Pending", type:"HT + PR", vol:"1,180 words", operator:"RT", delivery:"3–5 days"}]},
  {id:"TP-2039", customer:"Toyota Nordic", company:"Toyota Agency AB", source:"EN-GB",
   targets:["DE-DE","SV-SE"], words:860, product:"Business", status:"Accepted",
   template:"Toyota – Technical",
   orders:[
     {lang:"DE-DE", status:"Ready for delivery", type:"MT + PE + PR", vol:"430 words", operator:"RT", delivery:"48 hours"},
     {lang:"SV-SE", status:"Delivered", type:"MT + PE + PR", vol:"430 words", operator:"RT", delivery:"48 hours"},
   ]},
  {id:"TP-2038", customer:"UBS", company:"UBS Group", source:"DE-DE",
   targets:["FR-FR"], words:15400, product:"First", status:"Draft",
   template:"UBS – Legal",
   orders:[{lang:"FR-FR", status:"Draft", type:"HT + PR", vol:"15,400 words", operator:"—", delivery:"3–5 days"}]},
  {id:"TP-2037", customer:"Swisscom", company:"Swisscom AG", source:"DE-DE",
   targets:["IT-IT","FR-FR"], words:520, product:"Economy", status:"Offering",
   template:"—",
   orders:[
     {lang:"IT-IT", status:"Preparing", type:"MT + PE", vol:"260 words", operator:"—", delivery:"48 hours"},
     {lang:"FR-FR", status:"Preparing", type:"MT + PE", vol:"260 words", operator:"—", delivery:"48 hours"},
   ]},
];

const ORDERS = [
  {id:"SAL-4207", customer:"Zürich Insurance", cust:"Customer 83087", operator:"—", project:"—",
   source:"DE-DE", target:"EN-GB", type:"MT + PE + PR", vol:"213 words", status:"Offering", product:"Business", delivery:"48 hours"},
  {id:"SAL-4205", customer:"Toyota Nordic", cust:"Customer 44120", operator:"RT", project:"—",
   source:"EN-GB", target:"DE-DE", type:"MT + PE + PR", vol:"860 words", status:"Accepted", product:"Business", delivery:"48 hours"},
  {id:"SAL-4203", customer:"Swisscom", cust:"Customer 77841", operator:"—", project:"—",
   source:"DE-DE", target:"IT-IT", type:"MT + PE", vol:"520 words", status:"Offering", product:"Economy", delivery:"3–5 days"},
  {id:"SAL-4202", customer:"Helvetia", cust:"Customer 66210", operator:"AB", project:"—",
   source:"DE-DE", target:"FR-FR", type:"MT + PE + PR", vol:"340 words", status:"Draft", product:"Business", delivery:"48 hours"},
];

const OFFERS = [
  {id:"OF-5521", project:"TP-2040", customer:"Max Planck Institute", langs:["EN-US"], total:"€1,940",
   status:"Sent", sentOn:"16 Aug", variants:2},
  {id:"OF-5519", project:"TP-2041", customer:"Zürich Insurance", langs:["EN-GB","FR-FR","IT-IT"], total:"€3,980",
   status:"Draft", sentOn:"—", variants:3},
  {id:"OF-5515", project:"TP-2039", customer:"Toyota Nordic", langs:["DE-DE","SV-SE"], total:"€1,120",
   status:"Accepted", sentOn:"12 Aug", variants:1},
  {id:"OF-5510", project:"TP-2037", customer:"Swisscom", langs:["IT-IT","FR-FR"], total:"€610",
   status:"Expired", sentOn:"04 Aug", variants:2},
];

const TEMPLATES = [
  {id:"TPL-01", name:"Zürich – Insurance DE base", company:"Zürich Group",
   customers:["Zürich Insurance","Zürich Life","Zürich Re"], tm:"zurich_de_core", glossary:"zurich_terms_v4",
   styleguide:"Zürich CI 2026", addons:["Certification stamp"], priority:false, tmWrite:{Economy:false,Business:true,First:true},
   workflow:["Preparation","Human Translation","Proofreading","Delivery"]},
  {id:"TPL-02", name:"MPI – Research magazine", company:"Max Planck",
   customers:["Max Planck Institute"], tm:"mpi_research", glossary:"mpi_science", styleguide:"MPI Magazine",
   addons:["DTP / Layout","Author feedback loop"], priority:true, tmWrite:{Economy:false,Business:true,First:true},
   workflow:["Preparation","Human Translation","Author feedback","Layout / DTP","Proofread","Delivery (double check)"]},
  {id:"TPL-03", name:"UBS – Legal", company:"UBS Group",
   customers:["UBS"], tm:"ubs_legal", glossary:"ubs_legal_terms", styleguide:"UBS Legal",
   addons:["Certification stamp"], priority:true, tmWrite:{Economy:false,Business:false,First:true},
   workflow:["Preparation","Human Translation","Proofreading","Delivery (double check)"]},
];

/* ============================ UI PRIMITIVES ============================ */
const cx = (...a)=>a.filter(Boolean).join(" ");

function Badge({children, className}){
  return <span className={cx("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
    className||"bg-zinc-100 text-zinc-700 border-zinc-200")}>{children}</span>;
}
function Dot({className}){ return <span className={cx("inline-block h-2 w-2 rounded-full", className)}></span>; }

function StatusPill({status}){
  const map={
    "Draft":["bg-zinc-100 text-zinc-600 border-zinc-200","bg-zinc-400"],
    "Offering":["bg-blue-50 text-blue-700 border-blue-200","bg-blue-500"],
    "Offer sent":["bg-amber-50 text-amber-700 border-amber-200","bg-amber-500"],
    "Sent":["bg-amber-50 text-amber-700 border-amber-200","bg-amber-500"],
    "Accepted":["bg-emerald-50 text-emerald-700 border-emerald-200","bg-emerald-500"],
    "Expired":["bg-rose-50 text-rose-700 border-rose-200","bg-rose-500"],
    "Pending":["bg-amber-50 text-amber-700 border-amber-200","bg-amber-500"],
    "Preparing":["bg-blue-50 text-blue-700 border-blue-200","bg-blue-500"],
    "In translation":["bg-indigo-50 text-indigo-700 border-indigo-200","bg-indigo-500"],
    "Proofreading":["bg-violet-50 text-violet-700 border-violet-200","bg-violet-500"],
    "Ready for delivery":["bg-teal-50 text-teal-700 border-teal-200","bg-teal-500"],
    "Delivered":["bg-emerald-50 text-emerald-700 border-emerald-200","bg-emerald-500"],
    "In progress":["bg-blue-50 text-blue-700 border-blue-200","bg-blue-500"],
  };
  const [c,d]=map[status]||map["Draft"];
  return <Badge className={c}><Dot className={d}/>{status}</Badge>;
}

function Button({children, variant="primary", size="md", className, ...p}){
  const base="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const sizes={sm:"h-8 px-3 text-xs", md:"h-9 px-4 text-sm", lg:"h-10 px-5 text-sm"};
  const variants={
    primary:"bg-zinc-900 text-white hover:bg-zinc-800",
    outline:"border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
    ghost:"text-zinc-600 hover:bg-zinc-100",
    subtle:"bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
  };
  return <button className={cx(base, sizes[size], variants[variant], className)} {...p}>{children}</button>;
}

function Card({children, className, ...p}){
  return <div className={cx("rounded-xl border border-zinc-200 bg-white", className)} {...p}>{children}</div>;
}
function LangBadge({code}){
  return <span className="inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-700 border border-zinc-200">{code}</span>;
}

/* RefChip: click to open the docs panel for a requirement */
function RefChip({reqId, onOpen}){
  const r = REQS.find(x=>x.id===reqId);
  if(!r) return null;
  const m = MEETINGS[r.meeting];
  return (
    <button onClick={()=>onOpen(reqId)} title={"Why this exists — "+r.id+" · "+m.tag}
      className="group inline-flex items-center gap-1 rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 hover:border-zinc-900 hover:text-zinc-900">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
      {reqId}
    </button>
  );
}

/* ============================ SIDEBAR ============================ */
const SALES_NAV = [
  {key:"dashboard", label:"Sales Dashboard", icon:"grid"},
  {key:"orders", label:"Translation Orders", icon:"layers"},
  {key:"builder", label:"Offer Builder", icon:"tag"},
  {key:"offers", label:"Offers", icon:"send"},
  {key:"templates", label:"Projects / Templates", icon:"folder"},
  {key:"comments", label:"Comments Library", icon:"chat"},
  {key:"files", label:"Files & Analysis", icon:"file"},
  {key:"invoicing", label:"Invoicing & Pricing", icon:"receipt"},
  {key:"requirements", label:"Requirements", icon:"list"},
];
function Icon({name, className}){
  const p={width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round",className};
  const paths={
    grid:<React.Fragment><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></React.Fragment>,
    layers:<React.Fragment><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></React.Fragment>,
    tag:<React.Fragment><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"/><circle cx="7" cy="7" r="1"/></React.Fragment>,
    send:<React.Fragment><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></React.Fragment>,
    folder:<React.Fragment><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></React.Fragment>,
    chat:<React.Fragment><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></React.Fragment>,
    file:<React.Fragment><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></React.Fragment>,
    receipt:<React.Fragment><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></React.Fragment>,
    list:<React.Fragment><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></React.Fragment>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

function Sidebar({route, setRoute}){
  const dim="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-400 cursor-default";
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white h-full flex flex-col">
      <div className="px-4 h-14 flex items-center gap-2 border-b border-zinc-100">
        <div className="font-extrabold tracking-tight text-lg">Digital<span className="text-zinc-400">Tolk</span></div>
        <span className="ml-1 rounded-md bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-500 border border-zinc-200">Sweden</span>
      </div>
      <div className="px-3 py-3 overflow-y-auto flex-1">
        <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">Main</div>
        {["Dashboard","Interpretations","Translations"].map(x=>
          <div key={x} className={dim}><span className="h-1.5 w-1.5 rounded-full bg-zinc-300"/>{x}</div>)}
        <div className="mt-4 mb-1 px-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Sales</span>
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">NEW</span>
        </div>
        {SALES_NAV.map(n=>{
          const active = route===n.key;
          return (
            <button key={n.key} onClick={()=>setRoute(n.key)}
              className={cx("w-full flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm mb-0.5 text-left",
                active?"bg-zinc-900 text-white":"text-zinc-700 hover:bg-zinc-100")}>
              <Icon name={n.icon} className={active?"text-white":"text-zinc-400"}/>{n.label}
            </button>
          );
        })}
        <div className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Organization</div>
        {["Customers","Companies","Suppliers"].map(x=>
          <div key={x} className={dim}><span className="h-1.5 w-1.5 rounded-full bg-zinc-300"/>{x}</div>)}
      </div>
      <div className="px-4 py-3 border-t border-zinc-100 text-[11px] text-zinc-400">
        Prototype · order-entry module
      </div>
    </aside>
  );
}

/* ============================ TOPBAR ============================ */
function TopBar({title, crumb, right}){
  return (
    <div className="h-14 shrink-0 border-b border-zinc-200 bg-white/80 backdrop-blur flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">Sales</span>
        <span className="text-zinc-300">/</span>
        <span className="font-semibold text-zinc-800">{title}</span>
        {crumb && <React.Fragment><span className="text-zinc-300">/</span><span className="text-zinc-500">{crumb}</span></React.Fragment>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

/* ============================ SCREEN: DASHBOARD ============================ */
function Stat({label, value, sub, accent}){
  return (
    <Card className="p-4">
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className={cx("text-2xl font-bold", accent||"text-zinc-900")}>{value}</div>
      <div className="text-[11px] text-zinc-400 mt-1">{sub}</div>
    </Card>
  );
}
function Dashboard({setRoute, openDoc}){
  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500">August 2026</div>
          <h1 className="text-2xl font-bold">Sales — order entry</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
            Separate module from fulfilment <RefChip reqId="REQ-24" onOpen={openDoc}/>
          </div>
        </div>
        <Button onClick={()=>setRoute("builder")}>+ Create Order</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Open offers" value="12" sub="4 awaiting acceptance"/>
        <Stat label="Draft projects" value="5" sub="2 need CAT analysis"/>
        <Stat label="Accepted → fulfilment" value="8" sub="this week" accent="text-emerald-600"/>
        <Stat label="Avg. margin" value="47%" sub="min threshold 40%" accent="text-zinc-900"/>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="font-semibold text-sm">Recent translation orders</div>
            <Button variant="ghost" size="sm" onClick={()=>setRoute("orders")}>View all →</Button>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100">
              <tr><th className="px-4 py-2 font-medium">Order</th><th className="px-4 py-2 font-medium">Language</th>
              <th className="px-4 py-2 font-medium">Volume</th><th className="px-4 py-2 font-medium">Status</th></tr>
            </thead>
            <tbody>
              {ORDERS.slice(0,4).map(o=>(
                <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer" onClick={()=>setRoute("orders")}>
                  <td className="px-4 py-2.5"><div className="font-medium">{o.id}</div><div className="text-xs text-zinc-500">{o.customer}</div></td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-1"><LangBadge code={o.source}/><span className="text-zinc-300">→</span><LangBadge code={o.target}/></div></td>
                  <td className="px-4 py-2.5 text-zinc-600">{o.vol}</td>
                  <td className="px-4 py-2.5"><StatusPill status={o.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-4">
          <div className="font-semibold text-sm mb-3">Handoff to fulfilment</div>
          <p className="text-xs text-zinc-500 leading-relaxed">When an offer is accepted, the sales order is handed to the existing <b>Translations</b> (fulfilment) module — a separate list of orders with its workflow, suppliers and delivery.</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">Sales</Badge>
            <span className="text-zinc-400">→</span>
            <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">Fulfilment</Badge>
            <RefChip reqId="REQ-24" onOpen={openDoc}/>
          </div>
          <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-100 p-3 text-xs text-zinc-500">
            One operator UI, one order list — the screen shown depends on the order's state (offering vs workflow).
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ SCREEN: ORDERS ============================ */
function WorkflowChips({type}){
  const parts = type.split("+").map(s=>s.trim());
  const steps = ["PRE"].concat(parts).concat(["DO"]);
  return (
    <div className="flex items-center gap-1">
      {steps.map((s,i)=>(
        <span key={i} className={cx("rounded px-1.5 py-0.5 text-[10px] font-medium border",
          (i===0||i===steps.length-1)?"bg-zinc-50 text-zinc-400 border-zinc-200":"bg-zinc-100 text-zinc-600 border-zinc-200")}>{s}</span>
      ))}
    </div>
  );
}

function Orders({setRoute, openDoc, openProject, openOrder}){
  const [view,setView]=useState("project");
  const [tab,setTab]=useState("All");
  const matchTab = (op)=> tab==="All" ? true : tab==="My orders" ? op==="RT" : op==="—";
  const standalone = ORDERS.filter(o=> matchTab(o.operator));
  const projGroups = PROJECTS.map(p=>({p, orders: projectOrders(p).filter(o=> matchTab(o.operator))}))
                             .filter(g=> g.orders.length>0);
  return (
    <div className="p-6 space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">Translation Orders <RefChip reqId="REQ-01" onOpen={openDoc}/></h1>
          <p className="text-sm text-zinc-500">One source → many target languages grouped as a project, or the flat order list — inspired by the TMS translation orders view.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-white">
            <button onClick={()=>setView("project")} className={cx("px-3 py-1 text-xs rounded-md", view==="project"?"bg-zinc-900 text-white":"text-zinc-600")}>Project view</button>
            <button onClick={()=>setView("order")} className={cx("px-3 py-1 text-xs rounded-md", view==="order"?"bg-zinc-900 text-white":"text-zinc-600")}>Order view</button>
          </div>
          <RefChip reqId="REQ-02" onOpen={openDoc}/>
          <Button size="sm" onClick={()=>setRoute("builder")}>+ Create Order</Button>
        </div>
      </div>

      {view==="project" ? (
        <div className="grid grid-cols-2 gap-4">
          {PROJECTS.map(p=>(
            <Card key={p.id} onClick={()=>openProject(p.id)} className="p-4 hover:shadow-sm hover:border-zinc-300 transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.id}</div>
                  <div className="text-sm text-zinc-500">{p.customer} · <span className="text-zinc-400">{p.company}</span></div>
                </div>
                <StatusPill status={p.status}/>
              </div>
              <div className="mt-3 flex items-center gap-1 flex-wrap">
                <LangBadge code={p.source}/><span className="text-zinc-300 text-xs">→</span>
                {p.targets.map(t=><LangBadge key={t} code={t}/>)}
                {p.targets.length>1 && <span className="ml-1 text-[10px] text-zinc-400">covers {p.targets.length} languages</span>}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-zinc-400">Volume</div><div className="font-medium">{p.words.toLocaleString()} w</div></div>
                <div><div className="text-zinc-400">Product</div><div className="font-medium">{p.product}</div></div>
                <div><div className="text-zinc-400">Targets</div><div className="font-medium">{p.targets.length} lang</div></div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="text-xs text-zinc-500">Template: <span className="text-zinc-700">{p.template}</span></div>
                <Button size="sm" variant="outline" onClick={(e)=>{e.stopPropagation(); setRoute("builder");}}>Open offer builder</Button>
              </div>
              <div className="mt-2"><span className="text-[10px] text-zinc-400">child orders:</span> {p.targets.map(t=>(
                <span key={t} className="ml-1 text-[10px] text-zinc-500">{p.id}-{t}</span>))}</div>
            </Card>
          ))}
        </div>
      ):(
        <React.Fragment>
        <div className="flex items-center gap-1">
          {["All","My orders","Unassigned"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={cx("rounded-lg px-3 py-1.5 text-xs", tab===t?"bg-zinc-900 text-white":"text-zinc-600 hover:bg-zinc-100")}>{t}</button>
          ))}
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-200 bg-zinc-50/60">
              <tr>
                <th className="px-4 py-2.5 font-medium">Order ID</th>
                <th className="px-4 py-2.5 font-medium">Operator</th>
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium">Language</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Volume</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Workflow</th>
              </tr>
            </thead>
            <tbody>
              {projGroups.map(({p,orders})=>(
                <React.Fragment key={p.id}>
                  {/* parent project row */}
                  <tr className="bg-zinc-50/70 border-b border-zinc-100 hover:bg-zinc-100/70 cursor-pointer" onClick={()=>openProject(p.id)}>
                    <td className="px-4 py-2.5" colSpan={2}>
                      <div className="flex items-center gap-2">
                        <svg className="text-zinc-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>
                        <div className="font-semibold">{p.id}</div>
                        <Badge className="bg-zinc-900 text-white border-zinc-900">Translation project</Badge>
                        <span className="text-xs text-zinc-500">{p.customer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400">{orders.length} order(s)</td>
                    <td className="px-4 py-2.5"><div className="flex items-center gap-0.5 flex-wrap"><LangBadge code={p.source}/><span className="text-zinc-300">→</span>{p.targets.map(t=><LangBadge key={t} code={t}/>)}</div></td>
                    <td className="px-4 py-2.5 text-zinc-500 text-xs">{p.product}</td>
                    <td className="px-4 py-2.5 text-zinc-600 text-xs">{p.words.toLocaleString()} w</td>
                    <td className="px-4 py-2.5"><StatusPill status={p.status}/></td>
                    <td className="px-4 py-2.5 text-right"><span className="text-[11px] text-zinc-400 inline-flex items-center gap-1">Open project<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></span></td>
                  </tr>
                  {/* child order rows */}
                  {orders.map(o=>(
                    <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer" onClick={()=>openOrder(o)}>
                      <td className="pl-10 pr-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-300">└</span>
                          <div><div className="font-medium">{o.id}</div><div className="text-xs text-zinc-400">under {p.id}</div></div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">{o.operator==="—" ? <span className="text-zinc-300">—</span> : <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-[10px] font-medium">{o.operator}</span>}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs">{p.id}</td>
                      <td className="px-4 py-2.5"><LangBadge code={o.source}/> <span className="text-zinc-300">→</span> <LangBadge code={o.target}/></td>
                      <td className="px-4 py-2.5 text-zinc-600">{o.type}</td>
                      <td className="px-4 py-2.5 text-zinc-600">{o.vol}</td>
                      <td className="px-4 py-2.5"><StatusPill status={o.status}/></td>
                      <td className="px-4 py-2.5"><WorkflowChips type={o.type}/></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* standalone group */}
              {standalone.length>0 && (
                <tr className="bg-white border-b border-zinc-100">
                  <td colSpan={8} className="px-4 pt-4 pb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Standalone orders <span className="font-normal normal-case text-zinc-400">· not part of a translation project</span></span>
                  </td>
                </tr>
              )}
              {standalone.map(o=>(
                <tr key={o.id} className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer" onClick={()=>openOrder(o)}>
                  <td className="px-4 py-2.5"><div className="font-medium">{o.id}</div><div className="text-xs text-zinc-500">{o.customer} · {o.cust}</div></td>
                  <td className="px-4 py-2.5">{o.operator==="—" ? <span className="text-zinc-300">—</span> : <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white text-[10px] font-medium">{o.operator}</span>}</td>
                  <td className="px-4 py-2.5"><span className="text-[10px] text-zinc-400 rounded border border-zinc-200 px-1.5 py-0.5">Standalone</span></td>
                  <td className="px-4 py-2.5"><LangBadge code={o.source}/> <span className="text-zinc-300">→</span> <LangBadge code={o.target}/></td>
                  <td className="px-4 py-2.5 text-zinc-600">{o.type}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{o.vol}</td>
                  <td className="px-4 py-2.5"><StatusPill status={o.status}/></td>
                  <td className="px-4 py-2.5"><WorkflowChips type={o.type}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        </React.Fragment>
      )}
      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">Order view lists standalone orders flat and groups project-bound orders under their translation-project parent; Project view shows the project cards. <RefChip reqId="REQ-02" onOpen={openDoc}/></div>
    </div>
  );
}

/* ============================ SCREEN: OFFER BUILDER ============================ */
const RATES={Economy:0.12, Business:0.18, First:0.25};
const DELIVERY=[
  {key:"Express", mult:1.6, maxWords:150},
  {key:"24 hours", mult:1.35, maxWords:1500},
  {key:"48 hours", mult:1.15, maxWords:6000},
  {key:"3–5 days", mult:1.0, maxWords:Infinity},
];
const COST_RATE=0.085;
const MIN_MARGIN=40;
const LANGS=["DE-DE","EN-GB","EN-US","FR-FR","IT-IT","SV-SE","ES-ES","NL-NL","DA-DK","NB-NO"];
const CUSTOMERS=["Zürich Insurance","Max Planck Institute","Toyota Nordic","UBS","Swisscom","Helvetia"];
const WORDS_BY_LANG={"DE-DE":1000,"EN-GB":1780,"EN-US":1180,"FR-FR":1460,"IT-IT":990,"SV-SE":760,"ES-ES":1320,"NL-NL":880,"DA-DK":640,"NB-NO":700};
const MATCH_BY_LANG={"DE-DE":20,"EN-GB":18,"EN-US":15,"FR-FR":12,"IT-IT":22,"SV-SE":9,"ES-ES":14,"NL-NL":11,"DA-DK":8,"NB-NO":10};

function OfferBuilder({openDoc}){
  const [client,setClient]=useState("Zürich Insurance");
  const [source,setSource]=useState("DE-DE");
  const [targets,setTargets]=useState(["EN-GB","FR-FR","IT-IT"]);
  const [addLang,setAddLang]=useState("");
  const [analyzed,setAnalyzed]=useState(false);
  const [product,setProduct]=useState("Business");
  const [delivery,setDelivery]=useState("48 hours");
  const [discount,setDiscount]=useState(0);
  const [addons,setAddons]=useState({cert:false, apostille:false});
  const perLang = useMemo(()=>targets.map(t=>({t, words: WORDS_BY_LANG[t]||800, match: MATCH_BY_LANG[t]||10})),[targets]);
  const words = perLang.reduce((s,l)=>s+l.words,0);
  const addTarget=()=>{ if(addLang){ setTargets(ts=>ts.concat([addLang])); setAddLang(""); setAnalyzed(false); } };
  const removeTarget=(t)=>{ setTargets(ts=>ts.filter(x=>x!==t)); setAnalyzed(false); };
  const modeObj = DELIVERY.find(d=>d.key===delivery)||DELIVERY[3];
  const addonCost = (addons.cert?45:0)+(addons.apostille?60:0);
  const base = words*RATES[product]*modeObj.mult + addonCost;
  const price = Math.max(0, base*(1-discount/100));
  const cost = words*COST_RATE + addonCost*0.5;
  const margin = price>0 ? Math.round((price-cost)/price*100) : 0;
  const marginColor = margin<MIN_MARGIN? "text-rose-600" : margin<MIN_MARGIN+10? "text-amber-600":"text-emerald-600";

  const [variants,setVariants]=useState([
    {id:1, label:"Business · 48h", product:"Business", delivery:"48 hours", on:true},
    {id:2, label:"First · 24h (faster)", product:"First", delivery:"24 hours", on:true},
    {id:3, label:"Economy · 3–5 days (cheaper)", product:"Economy", delivery:"3–5 days", on:false},
  ]);
  const variantPrice=(v)=>{
    const m=DELIVERY.find(d=>d.key===v.delivery)||DELIVERY[3];
    return Math.round(words*RATES[v.product]*m.mult);
  };
  const toggleVar=(id)=>setVariants(vs=>vs.map(v=>v.id===id?{...v,on:!v.on}:v));

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">Offer Builder <RefChip reqId="REQ-07" onOpen={openDoc}/></h1>
          <div className="text-sm text-zinc-500 flex items-center gap-2 flex-wrap">
            New offer · <span className="text-zinc-700 font-medium">{client||"New client"}</span> ·
            <LangBadge code={source}/> →
            {targets.map(t=><LangBadge key={t} code={t}/>)}
            {targets.length>1 && <span className="text-[11px] text-zinc-400">covers {targets.length} languages</span>}
            <RefChip reqId="REQ-09" onOpen={openDoc}/>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">Save draft</Button>
          <Button size="md">Send offer</Button>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="font-semibold text-sm mb-3 flex items-center gap-2">Client &amp; languages <RefChip reqId="REQ-29" onOpen={openDoc}/></div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1.5">Client</div>
            <input list="client-list" value={client} onChange={e=>setClient(e.target.value)} placeholder="Select or type a client name…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm"/>
            <datalist id="client-list">{CUSTOMERS.map(c=><option key={c} value={c}/>)}</datalist>
            <div className="mt-1 text-[10px] text-zinc-400">Pick an existing client or type a new name from their email.</div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1.5">Source language</div>
            <select value={source} onChange={e=>setSource(e.target.value)} className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-sm bg-white">
              {LANGS.map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-1.5">Add target language</div>
            <div className="flex gap-2">
              <select value={addLang} onChange={e=>setAddLang(e.target.value)} className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm bg-white">
                <option value="">Choose…</option>
                {LANGS.filter(l=>l!==source&&!targets.includes(l)).map(l=><option key={l}>{l}</option>)}
              </select>
              <Button size="sm" variant="outline" onClick={addTarget}>Add</Button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xs font-medium text-zinc-500 mb-1.5">Language pairs</div>
          <div className="flex flex-wrap gap-1.5">
            {targets.length===0 && <span className="text-xs text-zinc-400">No target languages yet — add at least one.</span>}
            {targets.map(t=>(
              <span key={t} className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs">
                <LangBadge code={source}/><span className="text-zinc-300">→</span><LangBadge code={t}/>
                <button onClick={()=>removeTarget(t)} className="ml-0.5 text-zinc-400 hover:text-rose-600" title="Remove">×</button>
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm flex items-center gap-2">CAT analysis <RefChip reqId="REQ-19" onOpen={openDoc}/></div>
              {!analyzed && <Button size="sm" onClick={()=>setAnalyzed(true)}>Run CAT analysis</Button>}
            </div>
            {analyzed ? (
              <table className="w-full text-sm mt-3">
                <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                  <tr><th className="py-1 font-medium">Target</th><th className="py-1 font-medium">Words</th><th className="py-1 font-medium">CAT match discount</th></tr>
                </thead>
                <tbody>
                  {perLang.map(l=>(
                    <tr key={l.t} className="border-b border-zinc-50">
                      <td className="py-1.5"><LangBadge code={l.t}/></td>
                      <td className="py-1.5">{l.words.toLocaleString()}</td>
                      <td className="py-1.5 text-emerald-600">−{l.match}%</td>
                    </tr>
                  ))}
                  <tr><td className="py-1.5 font-medium">Total</td><td className="py-1.5 font-medium">{words.toLocaleString()}</td><td/></tr>
                </tbody>
              </table>
            ):(
              <div className="mt-3 rounded-lg border border-dashed border-zinc-200 p-4 text-center text-xs text-zinc-400">Upload source files &amp; run analysis to get per-language volume and match discounts.</div>
            )}
          </Card>

          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-zinc-500 mb-2">Product (specialization)</div>
                <div className="flex gap-2">
                  {Object.keys(RATES).map(pr=>(
                    <button key={pr} onClick={()=>setProduct(pr)}
                      className={cx("flex-1 rounded-lg border px-2 py-2 text-xs", product===pr?"border-zinc-900 bg-zinc-900 text-white":"border-zinc-200 hover:bg-zinc-50")}>
                      {pr}<div className={cx("text-[10px]", product===pr?"text-zinc-300":"text-zinc-400")}>€{RATES[pr]}/w</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-500 mb-2 flex items-center gap-1.5">Delivery mode <RefChip reqId="REQ-10" onOpen={openDoc}/></div>
                <div className="space-y-1">
                  {DELIVERY.map(d=>{
                    const avail = words<=d.maxWords;
                    return (
                      <button key={d.key} disabled={!avail} onClick={()=>avail&&setDelivery(d.key)}
                        title={avail?"":"Volume too high for "+d.key}
                        className={cx("w-full flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs",
                          !avail?"border-zinc-100 text-zinc-300 line-through cursor-not-allowed bg-zinc-50":
                          delivery===d.key?"border-zinc-900 bg-zinc-50":"border-zinc-200 hover:bg-zinc-50")}>
                        <span>{d.key}</span>
                        <span className={avail?"text-zinc-400":"text-zinc-300"}>{avail?"×"+d.mult:"n/a"}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1">Buffer: customer 08:00 → internal 07:45 <RefChip reqId="REQ-26" onOpen={openDoc}/></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">Add-ons <RefChip reqId="REQ-17" onOpen={openDoc}/></div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={addons.cert} onChange={e=>setAddons(a=>({...a,cert:e.target.checked}))}/>
                Certification stamp <span className="ml-auto text-xs text-zinc-400">+€45</span></label>
              <label className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 cursor-pointer">
                <input type="checkbox" checked={addons.apostille} onChange={e=>setAddons(a=>({...a,apostille:e.target.checked}))}/>
                Apostille <span className="ml-auto text-xs text-zinc-400">+€60</span></label>
            </div>
            <div className="mt-2 text-[11px] text-zinc-400">Project-level add-ons auto-apply for this customer/template.</div>
          </Card>

          <Card className="p-4">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">Alternate offers (variants) <RefChip reqId="REQ-08" onOpen={openDoc}/></div>
            <div className="space-y-2">
              {variants.map(v=>(
                <div key={v.id} className={cx("flex items-center justify-between rounded-lg border px-3 py-2", v.on?"border-zinc-300 bg-white":"border-zinc-100 bg-zinc-50")}>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={v.on} onChange={()=>toggleVar(v.id)}/>
                    <span className={v.on?"":"text-zinc-400"}>{v.label}</span>
                  </label>
                  <div className="text-sm font-medium">€{variantPrice(v).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400">{variants.filter(v=>v.on).length} variants will be sent — customer picks one.</div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sticky top-4">
            <div className="text-xs text-zinc-500">Offer total (selected config)</div>
            <div className="text-3xl font-bold mt-1">€{Math.round(price).toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-zinc-400">{product} · {delivery} · {words.toLocaleString()} words</div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-500 flex items-center gap-1">Discount <RefChip reqId="REQ-14" onOpen={openDoc}/></span>
                <span className="font-medium">{discount}%</span>
              </div>
              <input type="range" min="0" max="60" value={discount} onChange={e=>setDiscount(+e.target.value)} className="w-full accent-zinc-900"/>
              <div className="mt-2 flex gap-1.5">
                <Button size="sm" variant="subtle" onClick={()=>setDiscount(10)}>Low 10%</Button>
                <Button size="sm" variant="subtle" onClick={()=>setDiscount(25)}>High 25%</Button>
                <Button size="sm" variant="ghost" onClick={()=>setDiscount(0)}>Reset</Button>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-zinc-50 border border-zinc-100 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-zinc-500">List price</span><span>€{Math.round(base).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Discount</span><span className="text-rose-600">−€{Math.round(base-price).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500 flex items-center gap-1">Supplier cost <RefChip reqId="REQ-16" onOpen={openDoc}/></span><span>€{Math.round(cost).toLocaleString()}</span></div>
              <div className="text-[10px] text-zinc-400 -mt-1">cost from Atlas (mock)</div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-500 flex items-center gap-1">Margin <RefChip reqId="REQ-15" onOpen={openDoc}/></span>
                <span className={cx("font-bold", marginColor)}>{margin}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className={cx("h-full rounded-full", margin<MIN_MARGIN?"bg-rose-500":margin<MIN_MARGIN+10?"bg-amber-500":"bg-emerald-500")} style={{width:Math.max(4,Math.min(100,margin))+"%"}}/>
              </div>
              {margin<MIN_MARGIN && <div className="mt-1.5 text-[11px] text-rose-600">Below minimum margin ({MIN_MARGIN}%).</div>}
            </div>

            <Button className="w-full mt-4">Send offer</Button>
            <div className="mt-2 text-center text-[10px] text-zinc-400">Client: <span className="text-zinc-600">{client||"—"}</span> <RefChip reqId="REQ-04" onOpen={openDoc}/></div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================ SCREEN: OFFERS ============================ */
function Offers({openDoc}){
  const [sel,setSel]=useState(OFFERS[0]);
  const [portal,setPortal]=useState(false);
  const [accepting,setAccepting]=useState(false);
  const [deadline,setDeadline]=useState("2026-08-22");
  const fits = new Date(deadline) >= new Date("2026-08-20");
  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">Offers <RefChip reqId="REQ-11" onOpen={openDoc}/></h1>
          <p className="text-sm text-zinc-500">Draft → Sent → Accepted → handed to fulfilment.</p>
        </div>
        <Button variant="outline" size="sm" onClick={()=>setPortal(p=>!p)}>{portal?"Operator view":"Customer portal preview"} <RefChip reqId="REQ-23" onOpen={openDoc}/></Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-1 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
              <tr><th className="px-3 py-2 font-medium">Offer</th><th className="px-3 py-2 font-medium">Total</th><th className="px-3 py-2 font-medium">Status</th></tr>
            </thead>
            <tbody>
              {OFFERS.map(o=>(
                <tr key={o.id} onClick={()=>{setSel(o);setAccepting(false);}} className={cx("border-b border-zinc-50 cursor-pointer", sel.id===o.id?"bg-zinc-50":"hover:bg-zinc-50")}>
                  <td className="px-3 py-2.5"><div className="font-medium">{o.id}</div><div className="text-xs text-zinc-500">{o.customer}</div></td>
                  <td className="px-3 py-2.5">{o.total}</td>
                  <td className="px-3 py-2.5"><StatusPill status={o.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="col-span-2 p-5">
          {!portal ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{sel.id}</div>
                  <div className="text-sm text-zinc-500">{sel.customer} · project {sel.project}</div>
                </div>
                <StatusPill status={sel.status}/>
              </div>
              <div className="mt-3 flex items-center gap-1 flex-wrap">
                {sel.langs.map(l=><LangBadge key={l} code={l}/>)}
                <span className="text-[11px] text-zinc-400 ml-1">{sel.variants} variant(s) sent</span>
                <RefChip reqId="REQ-08" onOpen={openDoc}/>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs">
                {["Draft","Sent","Accepted","Fulfilment"].map((s,i)=>{
                  const order=["Draft","Sent","Accepted","Expired"];
                  const active = order.indexOf(sel.status)>=i || (s==="Fulfilment"&&sel.status==="Accepted");
                  return <React.Fragment key={s}>
                    <div className={cx("flex items-center gap-1.5", active?"text-zinc-900":"text-zinc-300")}>
                      <Dot className={active?"bg-zinc-900":"bg-zinc-300"}/>{s}
                    </div>{i<3 && <div className={cx("h-px w-8", active?"bg-zinc-300":"bg-zinc-100")}/>}
                  </React.Fragment>;
                })}
              </div>

              <div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-sm">
                <div className="flex justify-between"><span className="text-zinc-500">Total</span><span className="font-semibold">{sel.total}</span></div>
                <div className="flex justify-between mt-1"><span className="text-zinc-500">Sent on</span><span>{sel.sentOn}</span></div>
              </div>

              {sel.status!=="Accepted" && sel.status!=="Expired" && (
                <div className="mt-5">
                  {!accepting ? (
                    <Button onClick={()=>setAccepting(true)}>Accept (simulate) <RefChip reqId="REQ-12" onOpen={openDoc}/></Button>
                  ):(
                    <div className="rounded-xl border border-zinc-200 p-4">
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">Set actual delivery date <RefChip reqId="REQ-13" onOpen={openDoc}/></div>
                      <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm"/>
                      <div className={cx("mt-2 text-xs", fits?"text-emerald-600":"text-rose-600")}>
                        {fits?"✓ Fits the selected delivery mode.":"⚠ Too early for the selected delivery mode — pick a later date or a faster mode."}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" disabled={!fits}>Confirm &amp; send to fulfilment</Button>
                        <Button size="sm" variant="ghost" onClick={()=>setAccepting(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ):(
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Customer portal preview</div>
              <div className="rounded-xl border border-zinc-200 p-5 bg-white">
                <div className="text-lg font-bold">Your quote — {sel.customer}</div>
                <div className="text-sm text-zinc-500 mt-0.5">Reference {sel.id} · {sel.langs.join(", ")}</div>
                <div className="mt-4 space-y-2">
                  {[["Standard · 3–5 days", sel.total],["Faster · 24h", "€"+(parseInt(sel.total.replace(/[^0-9]/g,""))*1.3).toFixed(0)]].map(([lbl,pr])=>(
                    <div key={lbl} className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3">
                      <div className="text-sm">{lbl}</div>
                      <div className="flex items-center gap-3"><span className="font-semibold">{pr}</span><Button size="sm">Accept</Button></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-[11px] text-zinc-400">No internal cost or margin shown to the customer — same offer engine, role-gated view.</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================ SCREEN: TEMPLATES ============================ */
function Templates({openDoc}){
  const [sel,setSel]=useState(TEMPLATES[0]);
  return (
    <div className="p-6 fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">Projects / Templates <RefChip reqId="REQ-03" onOpen={openDoc}/></h1>
        <p className="text-sm text-zinc-500">Reusable project bound to a company — carries TM, glossaries, comments, add-ons and a workflow.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          {TEMPLATES.map(t=>(
            <Card key={t.id} onClick={()=>setSel(t)} className={cx("p-3 cursor-pointer", sel.id===t.id?"ring-2 ring-zinc-900":"hover:bg-zinc-50")}>
              <div className="font-medium text-sm">{t.name}</div>
              <div className="text-xs text-zinc-500">{t.company}</div>
              <div className="mt-1 flex gap-1">{t.priority && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Priority</Badge>}</div>
            </Card>
          ))}
        </div>
        <Card className="col-span-2 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{sel.name}</div>
              <div className="text-sm text-zinc-500">Company: {sel.company}</div>
            </div>
            {sel.priority && <Badge className="bg-amber-50 text-amber-700 border-amber-200"><Dot className="bg-amber-500"/>Priority · special care <RefChip reqId="REQ-25" onOpen={openDoc}/></Badge>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">Linked customers (company hierarchy) <RefChip reqId="REQ-03" onOpen={openDoc}/></div>
              <div className="flex flex-wrap gap-1">{sel.customers.map(c=><Badge key={c}>{c}</Badge>)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">References <RefChip reqId="REQ-05" onOpen={openDoc}/></div>
              <div className="text-xs text-zinc-600 space-y-0.5">
                <div>TM: <span className="font-mono">{sel.tm}</span></div>
                <div>Glossary: <span className="font-mono">{sel.glossary}</span></div>
                <div>Style guide: {sel.styleguide}</div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">Auto add-ons <RefChip reqId="REQ-17" onOpen={openDoc}/></div>
            <div className="flex flex-wrap gap-1">{sel.addons.map(a=><Badge key={a} className="bg-zinc-100 text-zinc-700 border-zinc-200">{a}</Badge>)}</div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">TM-update per tier (applied in prep step) <RefChip reqId="REQ-27" onOpen={openDoc}/></div>
            <div className="flex gap-2">{Object.entries(sel.tmWrite).map(([k,v])=>(
              <Badge key={k} className={v?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-zinc-100 text-zinc-500 border-zinc-200"}>{k}: {v?"writes TM":"no TM"}</Badge>))}</div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">Workflow template (auto-applied) <RefChip reqId="REQ-28" onOpen={openDoc}/></div>
            <div className="flex items-center gap-1 flex-wrap">
              {sel.workflow.map((w,i)=>(
                <React.Fragment key={w}>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs">{w}</span>
                  {i<sel.workflow.length-1 && <span className="text-zinc-300 text-xs">→</span>}
                </React.Fragment>
              ))}
              <Button size="sm" variant="ghost">+ step</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ SCREEN: COMMENTS ============================ */
const COMMENTS=[
  {id:"C1", project:"Zürich – Insurance DE base", lang:"IT-IT", scope:"Delivery", text:"Deliver bilingual; keep policy numbers untranslated.", best:true},
  {id:"C2", project:"Zürich – Insurance DE base", lang:"FR-FR", scope:"Delivery", text:"Use formal 'vous'; follow Zürich CI 2026 style guide.", best:true},
  {id:"C3", project:"Zürich – Insurance DE base", lang:"All", scope:"Purchase", text:"Only translate black text — skip highlighted headers.", best:false},
  {id:"C4", project:"MPI – Research magazine", lang:"EN-US", scope:"Delivery", text:"Return author-feedback file with the delivery.", best:true},
];
function Comments({openDoc}){
  const [order,setOrder]=useState({project:"Zürich – Insurance DE base", lang:"IT-IT"});
  const matches = COMMENTS.filter(c=>c.project===order.project && (c.lang===order.lang||c.lang==="All"))
    .sort((a,b)=>(b.best?1:0)-(a.best?1:0));
  return (
    <div className="p-6 fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2">Comments Library <RefChip reqId="REQ-20" onOpen={openDoc}/></h1>
        <p className="text-sm text-zinc-500">Project-level delivery/purchase comments, scoped per target language.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100 font-semibold text-sm">All comments</div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100 bg-zinc-50/50">
              <tr><th className="px-4 py-2 font-medium">Project</th><th className="px-4 py-2 font-medium">Lang</th><th className="px-4 py-2 font-medium">Scope</th><th className="px-4 py-2 font-medium">Comment</th><th/></tr>
            </thead>
            <tbody>
              {COMMENTS.map(c=>(
                <tr key={c.id} className="border-b border-zinc-50 hover:bg-zinc-50">
                  <td className="px-4 py-2.5 text-xs text-zinc-500">{c.project}</td>
                  <td className="px-4 py-2.5"><LangBadge code={c.lang}/></td>
                  <td className="px-4 py-2.5"><Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">{c.scope}</Badge></td>
                  <td className="px-4 py-2.5 text-zinc-700">{c.text}</td>
                  <td className="px-4 py-2.5 text-right"><Button size="sm" variant="ghost">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-zinc-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500">Quick exclusions:</span>
            {["Only black text","Skip headline","Only highlighted"].map(x=><Badge key={x} className="bg-zinc-100 text-zinc-600 border-zinc-200">{x}</Badge>)}
            <RefChip reqId="REQ-22" onOpen={openDoc}/>
          </div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-sm flex items-center gap-2">Auto-match <RefChip reqId="REQ-21" onOpen={openDoc}/></div>
          <p className="text-xs text-zinc-500 mt-1">For an incoming order, suggests the best comments by project + language.</p>
          <div className="mt-3 flex gap-2">
            <select value={order.lang} onChange={e=>setOrder(o=>({...o,lang:e.target.value}))} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
              <option>IT-IT</option><option>FR-FR</option>
            </select>
            <span className="text-xs text-zinc-400 self-center">Zürich project</span>
          </div>
          <div className="mt-3 space-y-2">
            {matches.map(c=>(
              <div key={c.id} className={cx("rounded-lg border p-2.5", c.best?"border-emerald-200 bg-emerald-50/40":"border-zinc-200")}>
                <div className="flex items-center gap-1.5 mb-1">
                  {c.best && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Best match</Badge>}
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">{c.scope}</Badge>
                </div>
                <div className="text-xs text-zinc-700">{c.text}</div>
                <div className="mt-2 flex gap-1.5"><Button size="sm">Use</Button><Button size="sm" variant="ghost">Override</Button></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ SCREEN: FILES & ANALYSIS ============================ */
function Files({openDoc}){
  const [lock,setLock]=useState(false);
  const FORMATS=[["Word (.docx)",false],["Excel (.xlsx)",true],["PowerPoint (.pptx)",true],["PDF",true],["Plain text (.txt)",false],["XML + ITS",true],["InDesign IDML / EDML",true],["Subtitles (.srt/.vtt)",false],["SDLXLIFF",false]];
  const COUNTING=[["Word / EDML","Lines / words","×1.0"],["Excel","Characters","×1.2"],["PowerPoint","Characters","×1.3"],["PDF (converted)","Lines","×1.4"]];
  const CATROWS=[["100% matches","1,240","−90%"],["Repetitions","320","−90%"],["Fuzzy 75–99%","640","−40%"],["No match","2,010","0%"]];
  const XLF=[["error","Missing reference tag (confetti)","Hidden link dropped in target"],["warning","Number segment flagged non-translatable","Review before delivery"],["error","Broken inline tag pair","Fix in source, re-run check"]];
  return (
    <div className="p-6 space-y-4 fade-in">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">Files &amp; Analysis <RefChip reqId="REQ-30" onOpen={openDoc}/></h1>
        <p className="text-sm text-zinc-500">Source formats, ITS rules, counting, CAT analysis and XLIFF checks (Deep Dive 3).</p>
      </div>

      <Card className="p-4">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2">Supported source formats <RefChip reqId="REQ-30" onOpen={openDoc}/></div>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map(([f,complex])=>(
            <Badge key={f} className={complex?"bg-amber-50 text-amber-700 border-amber-200":"bg-zinc-100 text-zinc-600 border-zinc-200"}>{f}{complex?" •":""}</Badge>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-zinc-400">• = extra handling / higher rate (incl. DTP for IDML/EDML). Reused from the Confluence supported-formats list. <RefChip reqId="REQ-38" onOpen={openDoc}/></div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">XML + ITS rules <RefChip reqId="REQ-31" onOpen={openDoc}/></div>
          <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100 text-sm">
            <div className="flex items-center justify-between px-3 py-2"><span>schaerer_export.xml</span><Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">XML</Badge></div>
            <div className="flex items-center justify-between px-3 py-2"><span>schaerer.its</span><Badge className="bg-blue-50 text-blue-700 border-blue-200">ITS rules</Badge></div>
          </div>
          <div className="mt-2 flex gap-2"><Button size="sm" variant="outline">Upload XML + ITS</Button><Button size="sm" variant="ghost">Auto-extract</Button></div>
          <div className="mt-2 text-[11px] text-zinc-400">ITS rules define which XML parts are translatable. Some arrive via API.</div>
        </Card>
        <Card className="p-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">Volume &amp; counting <RefChip reqId="REQ-32" onOpen={openDoc}/></div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100"><tr><th className="py-1 font-medium">Format</th><th className="py-1 font-medium">Unit</th><th className="py-1 font-medium">Rate</th></tr></thead>
            <tbody>{COUNTING.map(([f,u,m])=>(<tr key={f} className="border-b border-zinc-50"><td className="py-1.5">{f}</td><td className="py-1.5 text-zinc-600">{u}</td><td className="py-1.5">{m}</td></tr>))}</tbody>
          </table>
          <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">Show the format surcharge to the customer; prefer Word/EDML over PDF. <RefChip reqId="REQ-33" onOpen={openDoc}/></div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm flex items-center gap-2">CAT analysis &amp; match locking <RefChip reqId="REQ-34" onOpen={openDoc}/></div>
          <label className="flex items-center gap-2 text-xs text-zinc-600"><input type="checkbox" checked={lock} onChange={e=>setLock(e.target.checked)}/> Lock 100% matches <RefChip reqId="REQ-36" onOpen={openDoc}/></label>
        </div>
        <table className="w-full text-sm mt-2">
          <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100"><tr><th className="py-1 font-medium">Category</th><th className="py-1 font-medium">Lines</th><th className="py-1 font-medium">Customer discount</th><th className="py-1 font-medium">To fulfilment</th></tr></thead>
          <tbody>{CATROWS.map(([c,l,d],i)=>{
            const locked = lock && i===0;
            return (<tr key={c} className="border-b border-zinc-50"><td className="py-1.5">{c}</td><td className="py-1.5">{l}</td><td className="py-1.5 text-emerald-600">{d}</td><td className="py-1.5">{locked?<span className="text-zinc-300 line-through">{l}</span>:l}</td></tr>);
          })}</tbody>
        </table>
        <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">Match % is separate from the customer discount. No 50/50 sales↔purchase accounting — order-level CAT flows to fulfilment. <RefChip reqId="REQ-35" onOpen={openDoc}/></div>
      </Card>

      <Card className="p-4">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2">XLIFF checks <RefChip reqId="REQ-37" onOpen={openDoc}/> <Badge className="bg-rose-50 text-rose-700 border-rose-200">high priority</Badge></div>
        <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100 text-sm">
          {XLF.map(([sev,msg,act],i)=>(
            <div key={i} className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2"><Badge className={sev==="error"?"bg-rose-50 text-rose-700 border-rose-200":"bg-amber-50 text-amber-700 border-amber-200"}>{sev}</Badge><span>{msg}</span></div>
              <span className="text-xs text-zinc-400">{act}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[11px] text-zinc-400">Fix hidden tags/references in the source, then re-run the check.</div>
          <Button size="sm" variant="outline">Open in XLIFF viewer</Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================ SCREEN: INVOICING & PRICING ============================ */
function Invoicing({openDoc}){
  const [mode,setMode]=useState("collective");
  const PRICES=[["DE-DE → EN-GB","Translation","Business","48h","line","€1.85"],["DE-DE → FR-FR","Translation","First","24h","line","€2.40"],["* → EN-*","Proofreading","—","3–5 days","hour","€65.00"]];
  const FIELDS=[["PO number",true],["Cost center",false],["Project",true],["Person",false]];
  return (
    <div className="p-6 space-y-4 fade-in">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">Invoicing &amp; Pricing <RefChip reqId="REQ-39" onOpen={openDoc}/></h1>
        <p className="text-sm text-zinc-500">Special prices, accountings, VAT, payment terms and invoice profiles (Deep Dive 4).</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm flex items-center gap-2">Special / customer prices <RefChip reqId="REQ-39" onOpen={openDoc}/></div>
          <div className="flex gap-2 items-center"><Button size="sm" variant="outline">Import from Excel</Button><Button size="sm" variant="ghost">+ Wildcard rule</Button><RefChip reqId="REQ-40" onOpen={openDoc}/></div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100"><tr><th className="py-1 font-medium">Language pair</th><th className="py-1 font-medium">Order type</th><th className="py-1 font-medium">Product</th><th className="py-1 font-medium">Delivery</th><th className="py-1 font-medium">Unit</th><th className="py-1 font-medium">Price</th></tr></thead>
          <tbody>{PRICES.map((r,i)=>(<tr key={i} className="border-b border-zinc-50"><td className="py-1.5 font-medium">{r[0]}</td><td className="py-1.5 text-zinc-600">{r[1]}</td><td className="py-1.5 text-zinc-600">{r[2]}</td><td className="py-1.5 text-zinc-600">{r[3]}</td><td className="py-1.5">{r[4]}</td><td className="py-1.5 font-medium">{r[5]}</td></tr>))}</tbody>
        </table>
        <div className="mt-2 text-[11px] text-zinc-400">Wildcards (e.g. * → EN-*) and Excel import avoid entering thousands of combinations by hand.</div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">Accounting — Zürich Group <RefChip reqId="REQ-41" onOpen={openDoc}/></div>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-zinc-500">Level</span><span>Company / parent</span></div>
            <div className="flex justify-between"><span className="text-zinc-500 flex items-center gap-1">Currency / VAT <RefChip reqId="REQ-42" onOpen={openDoc}/></span><span>CHF · EU VAT ID (net)</span></div>
            <div className="flex justify-between"><span className="text-zinc-500 flex items-center gap-1">Payment term <RefChip reqId="REQ-44" onOpen={openDoc}/></span><span>30 days · pay by invoice</span></div>
            <div className="flex items-center justify-between"><span className="text-zinc-500 flex items-center gap-1">Master agreement <RefChip reqId="REQ-43" onOpen={openDoc}/></span><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">no offer needed</Badge></div>
            <div className="flex justify-between"><span className="text-zinc-500 flex items-center gap-1">Invoice profile <RefChip reqId="REQ-45" onOpen={openDoc}/></span><span>X-Bill (e-invoice)</span></div>
            <div className="flex justify-between"><span className="text-zinc-500 flex items-center gap-1">Recipients <RefChip reqId="REQ-48" onOpen={openDoc}/></span><span>billing@zurich.example</span></div>
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">Payment data source: Atlas (mock). <RefChip reqId="REQ-51" onOpen={openDoc}/></div>
        </Card>

        <Card className="p-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">Invoicing mode <RefChip reqId="REQ-46" onOpen={openDoc}/></div>
          <div className="flex rounded-lg border border-zinc-200 p-0.5 bg-white w-max">
            <button onClick={()=>setMode("single")} className={cx("px-3 py-1 text-xs rounded-md", mode==="single"?"bg-zinc-900 text-white":"text-zinc-600")}>Single per order</button>
            <button onClick={()=>setMode("collective")} className={cx("px-3 py-1 text-xs rounded-md", mode==="collective"?"bg-zinc-900 text-white":"text-zinc-600")}>Collective (monthly)</button>
          </div>
          <div className="mt-3 text-xs font-semibold text-zinc-500 flex items-center gap-1">Specific / required fields &amp; grouping <RefChip reqId="REQ-47" onOpen={openDoc}/></div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {FIELDS.map(([f,req])=>(<Badge key={f} className={req?"bg-amber-50 text-amber-700 border-amber-200":"bg-zinc-100 text-zinc-600 border-zinc-200"}>{f}{req?" *":""}</Badge>))}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">* required. Collective invoices can be grouped / split by person or project.</div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="font-semibold text-sm mb-2 flex items-center gap-2">Invoice generation <RefChip reqId="REQ-49" onOpen={openDoc}/></div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="font-medium">Auto on delivery</div><div className="text-xs text-zinc-500 mt-0.5">Invoice created and delivered with the translation.</div></div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="font-medium flex items-center gap-1">Price on completion <RefChip reqId="REQ-50" onOpen={openDoc}/></div><div className="text-xs text-zinc-500 mt-0.5">Hourly orders: disable auto-invoice, pull hours from purchase, then bill.</div></div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="font-medium">Change company</div><div className="text-xs text-zinc-500 mt-0.5">Cancel → credit note → reissue to the correct company.</div></div>
        </div>
      </Card>
    </div>
  );
}

/* ============================ SCREEN: REQUIREMENTS ============================ */
function ReqRow({r, goFeature, openDoc}){
  const m=MEETINGS[r.meeting]; const st=STATUS_OF(r);
  return (
    <tr className="border-b border-zinc-50 hover:bg-zinc-50 align-top">
      <td className="px-4 py-3 font-mono text-xs text-zinc-500 whitespace-nowrap">{r.id}</td>
      <td className="px-4 py-3">
        <div className="font-medium flex items-center gap-1.5">{r.title}
          {shotCount(r.id)>0 && <span title={shotCount(r.id)>1?`${shotCount(r.id)} reference screenshots`:"Has reference screenshot"} className="inline-flex items-center gap-0.5 text-zinc-400"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>{shotCount(r.id)>1 && <span className="text-[10px] font-medium">×{shotCount(r.id)}</span>}</span>}
          {changesFor(r.id).length>0 && <span title="Has prototype change notes" className="rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium">Updated · {changesFor(r.id).length}</span>}
        </div>
        <div className="text-xs text-zinc-500 italic mt-0.5 max-w-2xl">{storyOf(r.id)}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <Badge className={m.color}>{m.tag}</Badge>
        {REQ_TS[r.id]!=null && meetingLink(r.meeting, REQ_TS[r.id]) && (
          <a href={meetingLink(r.meeting, REQ_TS[r.id])} target="_blank" rel="noopener noreferrer" onClick={(e)=>e.stopPropagation()} title={"Open "+m.tag+" at "+mmss(REQ_TS[r.id])}
             className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 hover:underline">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>{mmss(REQ_TS[r.id])}
          </a>
        )}
      </td>
      <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap">{r.speaker}</td>
      <td className="px-4 py-3 whitespace-nowrap"><Badge className={statusClass(st)}>{st}</Badge></td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5 justify-end">
          <Button size="sm" variant="outline" onClick={()=>openDoc(r.id)}>Details</Button>
          <Button size="sm" variant="subtle" onClick={()=>goFeature(r)}>Go to requirement</Button>
        </div>
      </td>
    </tr>
  );
}
function Requirements({goFeature, openDoc}){
  const [epicFilter,setEpicFilter]=useState("All");
  const [q,setQ]=useState("");
  const match=(r)=> (q===""||(r.title+r.id+r.speaker+storyOf(r.id)).toLowerCase().includes(q.toLowerCase()));
  const shownEpics = EPICS.filter(e=> epicFilter==="All"||e.key===epicFilter);
  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold">Requirements traceability</h1>
          <p className="text-sm text-zinc-500">{REQS.length} requirements in {EPICS.length} groups · each has a user story · use <b>Details</b> to read the spec or <b>Go to requirement</b> to open the feature.</p>
        </div>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm w-56"/>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={()=>setEpicFilter("All")} className={cx("rounded-full px-3 py-1 text-xs border", epicFilter==="All"?"bg-zinc-900 text-white border-zinc-900":"border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>All groups</button>
        {EPICS.map(e=>(
          <button key={e.key} onClick={()=>setEpicFilter(e.key)} className={cx("rounded-full px-3 py-1 text-xs border", epicFilter===e.key?"bg-zinc-900 text-white border-zinc-900":"border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>{e.title}</button>
        ))}
      </div>
      {shownEpics.map(epic=>{
        const rows=REQS.filter(r=>groupOf(r.id)===epic && match(r));
        if(!rows.length) return null;
        return (
          <div key={epic.key} className="mb-6">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-bold text-zinc-900">{epic.title}</h2>
              <span className="text-xs text-zinc-400">· {rows.length} requirement{rows.length>1?"s":""}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-2">{epic.desc}</p>
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-zinc-500 border-b border-zinc-200 bg-zinc-50/60">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Requirement &amp; user story</th>
                    <th className="px-4 py-2.5 font-medium">Meeting</th>
                    <th className="px-4 py-2.5 font-medium">Raised by</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r=><ReqRow key={r.id} r={r} goFeature={goFeature} openDoc={openDoc}/>)}
                </tbody>
              </table>
            </Card>
          </div>
        );
      })}
      <div className="mt-2 text-[11px] text-zinc-400">Tip: each row shows its user story; rows with a camera icon have a reference screenshot of the current TDS screen (from the recordings). <b>Details</b> opens the Feature docs panel (story, source quote, screenshot); <b>Go to requirement</b> jumps to that feature's screen.</div>
    </div>
  );
}

/* ============================ BOTTOM DOCS PANEL ============================ */
function DocsPanel({reqId, open, setOpen}){
  const r = REQS.find(x=>x.id===reqId);
  const m = r? MEETINGS[r.meeting] : null;
  return (
    <div className="border-t border-zinc-200 bg-white">
      <button onClick={()=>setOpen(o=>!o)} className="w-full flex items-center justify-between px-6 h-11 hover:bg-zinc-50">
        <div className="flex items-center gap-2 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>
          <span className="font-medium">Feature docs</span>
          {r ? <span className="text-zinc-400">· {r.id} — {r.title}</span> : <span className="text-zinc-400">· select a feature (click any REQ-xx chip)</span>}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cx("transition-transform", open?"rotate-180":"")}><path d="m18 15-6-6-6 6"/></svg>
      </button>
      {open && (
        <div className="slideup border-t border-zinc-100 px-6 py-4 h-[30rem] overflow-y-auto">
          {!r ? (
            <div className="text-sm text-zinc-400 h-full flex items-center justify-center">Click any dashed <span className="font-mono mx-1">REQ-xx</span> chip, or a row in Requirements, to see where a feature came from and how it's implemented.</div>
          ):(
            <React.Fragment>
            <div className="grid grid-cols-3 gap-6 max-w-6xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-zinc-500">{r.id}</span>
                  <Badge className={m.color}>{m.tag}</Badge>
                </div>
                <div className="text-base font-bold leading-snug">{r.title}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {groupOf(r.id) && <Badge className="bg-zinc-900 text-white border-zinc-900">{groupOf(r.id).title}</Badge>}
                  <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">{r.cat}</Badge>
                  <Badge className={statusClass(STATUS_OF(r))}>{STATUS_OF(r)}</Badge>
                </div>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">User story</div>
                <p className="text-sm text-zinc-700 italic leading-relaxed">{storyOf(r.id)}</p>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Requirement / need</div>
                <p className="text-sm text-zinc-700 leading-relaxed">{r.need}</p>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Reference</div>
                <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3">
                  <div className="text-xs text-zinc-500 mb-1">{m.tag} · <b className="text-zinc-700">{r.speaker}</b></div>
                  <div className="text-sm text-zinc-700 italic">“{r.quote}”</div>
                  <div className="text-[10px] text-zinc-400 mt-1">Attendees: {m.attendees}</div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">How it's implemented here</div>
                <p className="text-sm text-zinc-700 leading-relaxed">{r.impl}</p>
                <div className="mt-3 text-[10px] text-zinc-400">Paraphrased from the meeting transcript for readability.</div>
              </div>
            </div>
            {imgsFor(r.id).length ? (
              <div className="mt-4 max-w-5xl">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-2">Reference — current TDS screen{imgsFor(r.id).length>1?"s":""} shown in {m.tag}
                  <span className="text-[10px] font-normal normal-case text-zinc-400">(from the recording{imgsFor(r.id).length>1?` · ${imgsFor(r.id).length} screens`:""})</span></div>
                <div className="space-y-3">
                  {imgsFor(r.id).map((im,i)=>(
                    <figure key={i} className="m-0">
                      <img src={im.src} alt={r.id+" reference "+(i+1)} className="w-full rounded-lg border border-zinc-200 shadow-sm"/>
                      {im.cap && <figcaption className="mt-1 text-[11px] text-zinc-500">{imgsFor(r.id).length>1?`${i+1}. `:""}{im.cap}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">No current-system screen for this requirement — it is net-new functionality, so no screenshot is attached (left intentionally empty).</div>
            )}
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================ APP ============================ */
/* ============================ SIDE DRAWERS ============================ */
const DRAWER_W = "35vw";
function Drawer({open, onClose, title, subtitle, width, modal=true, z="z-50", onBack, children}){
  if(!open) return null;
  const inner=(
    <React.Fragment>
      <div className="h-14 shrink-0 border-b border-zinc-100 flex items-center justify-between px-5">
        <div className="min-w-0 flex items-center gap-2">
          {onBack && <button onClick={onBack} title="Back" className="rounded-md p-1 hover:bg-zinc-100 text-zinc-500 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg></button>}
          <div className="min-w-0">
            <div className="font-semibold truncate">{title}</div>
            {subtitle && <div className="text-xs text-zinc-500 truncate">{subtitle}</div>}
          </div>
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 hover:bg-zinc-100 text-zinc-500 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </React.Fragment>
  );
  if(!modal){
    return (
      <div className="bg-white shadow-2xl border-l border-zinc-200 flex flex-col slidein z-40" style={{position:"fixed", top:0, right:0, height:"100%", width:DRAWER_W, minWidth:"360px"}}>
        {inner}
      </div>
    );
  }
  return (
    <div className={cx("fixed inset-0 flex justify-end", z)}>
      <div className="absolute inset-0 bg-black/25" onClick={onClose}></div>
      <div className={cx("relative h-full w-full bg-white shadow-2xl border-l border-zinc-200 flex flex-col slidein", width||"max-w-2xl")}>
        {inner}
      </div>
    </div>
  );
}

/* Prototype change notes — what was changed in the build, per requirement */
const CHANGELOG = {
  "REQ-01": [
    {date:"20 Aug 2026", text:"Clicking a translation project now opens a non-modal side drawer (TMS design language) instead of navigating away."},
    {date:"20 Aug 2026", text:"The project drawer lists every child order — one row per target language — each with its own individual fulfilment status (Preparing / In translation / Proofreading / …)."},
    {date:"20 Aug 2026", text:"Added drill-down: clicking a child order opens a TMS-style Order detail drawer with a Workflow step table (Preparation → MT → Post-Editing → Proofreading → Delivery), Price / Cost (Atlas) / Margin tiles, and Files / Comments / Add-ons tabs."},
  ],
  "REQ-02": [
    {date:"20 Aug 2026", text:"Project view / Order view toggle retained (earlier removal reverted per request)."},
    {date:"20 Aug 2026", text:"Project cards are now clickable and open the project side drawer."},
    {date:"20 Aug 2026", text:"Order view now shows two order types: standalone orders listed flat, and project-bound orders grouped under a parent 'Translation project' row (click the parent to open the project, click a child row to open the order)."},
  ],
  "REQ-07": [
    {date:"20 Aug 2026", text:"Offer detail drawer opened from a project shows the offer bound to its translation project (header shows the project id), reinforcing the offer → project linkage."},
  ],
  "REQ-08": [
    {date:"20 Aug 2026", text:"Offer detail drawer renders the alternate price variants side-by-side — Economy / Business / First — each with its delivery turnaround and total, Business marked as recommended."},
  ],
  "REQ-11": [
    {date:"20 Aug 2026", text:"Offers already sent for a project are now surfaced in an 'Offers sent' section inside the project drawer, with status pill and total."},
    {date:"20 Aug 2026", text:"Each sent offer is clickable and opens an Offer detail drawer showing the price variants and per-language line items (words, unit rate, line total)."},
  ],
};
function changesFor(id){ return CHANGELOG[id]||[]; }

function RequirementDrawer({reqId, open, onClose, setRoute}){
  const r = REQS.find(x=>x.id===reqId);
  const m = r ? MEETINGS[r.meeting] : null;
  const changes = r ? changesFor(r.id) : [];
  const revisits = r ? alsoIn(r.id) : [];
  return (
    <Drawer open={open && !!r} onClose={onClose} modal={false}
      title={r ? r.id+" — "+r.title : ""} subtitle={r && groupOf(r.id) ? groupOf(r.id).title : ""}>
      {r && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            <Badge className={m.color}>{m.tag}</Badge>
            {groupOf(r.id) && <Badge className="bg-zinc-900 text-white border-zinc-900">{groupOf(r.id).title}</Badge>}
            <Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">{r.cat}</Badge>
            <Badge className={statusClass(STATUS_OF(r))}>{STATUS_OF(r)}</Badge>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">User story</div>
            <p className="text-sm text-zinc-700 italic leading-relaxed">{storyOf(r.id)}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Requirement / need</div>
            <p className="text-sm text-zinc-700 leading-relaxed">{r.need}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Reference</div>
            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3">
              <div className="text-xs text-zinc-500 mb-1">{m.tag} · <b className="text-zinc-700">{r.speaker}</b>{REQ_TS[r.id]!=null && <span> · at {mmss(REQ_TS[r.id])}</span>}</div>
              <div className="text-sm text-zinc-700 italic">“{r.quote}”</div>
              <div className="text-[10px] text-zinc-400 mt-1">Attendees: {m.attendees}</div>
              {REQ_TS[r.id]!=null && meetingLink(r.meeting, REQ_TS[r.id]) && (
                <a href={meetingLink(r.meeting, REQ_TS[r.id])} target="_blank" rel="noopener noreferrer"
                   className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Watch in {m.tag} at {mmss(REQ_TS[r.id])}
                </a>
              )}
            </div>
          </div>
          {revisits.length>0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Also discussed in</div>
              <div className="flex flex-wrap gap-1.5">
                {revisits.map((rv,i)=>{ const mm=MEETINGS[rv.m]; const link=meetingLink(rv.m,rv.sec); return (
                  <a key={i} href={link||"#"} target="_blank" rel="noopener noreferrer"
                     className={cx("inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium hover:opacity-80", mm.color)}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    {mm.tag} · {mmss(rv.sec)}
                  </a>
                );})}
              </div>
            </div>
          )}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">How it's implemented here</div>
            <p className="text-sm text-zinc-700 leading-relaxed">{r.impl}</p>
          </div>
          {changes.length>0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1.5">Change notes
                <span className="rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium">{changes.length}</span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 divide-y divide-amber-100">
                {changes.map((c,i)=>(
                  <div key={i} className="flex gap-2 px-3 py-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-700 leading-snug">{c.text}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{c.date} · prototype build</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {imgsFor(r.id).length ? (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Reference — current TDS screen{imgsFor(r.id).length>1?"s":""} shown in {m.tag} <span className="font-normal normal-case">(from the recording{imgsFor(r.id).length>1?` · ${imgsFor(r.id).length}`:""})</span></div>
              <div className="space-y-3">
                {imgsFor(r.id).map((im,i)=>(
                  <figure key={i} className="m-0">
                    <img src={im.src} alt={r.id+" reference "+(i+1)} className="w-full rounded-lg border border-zinc-200 shadow-sm"/>
                    {im.cap && <figcaption className="mt-1 text-[11px] text-zinc-500">{imgsFor(r.id).length>1?`${i+1}. `:""}{im.cap}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">No current-system screen for this requirement — it is net-new functionality, so no screenshot is attached.</div>
          )}
          {r.screen && r.screen!=="requirements" && (
            <div className="pt-2 border-t border-zinc-100">
              <Button size="sm" onClick={()=>{ onClose(); setRoute(r.screen); }}>Go to requirement →</Button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

function projectOrders(p){
  return (p.orders||[]).map(o=>({...o, id:p.id+"-"+o.lang, customer:p.customer, company:p.company,
    source:p.source, target:o.lang, product:p.product}));
}
function ProjectDrawer({projId, open, onClose, setRoute, openOrder, openOffer}){
  const p = PROJECTS.find(x=>x.id===projId);
  const tpl = p ? TEMPLATES.find(t=>t.name===p.template) : null;
  const orders = p ? projectOrders(p) : [];
  const offers = p ? OFFERS.filter(o=>o.project===p.id) : [];
  return (
    <Drawer open={open && !!p} onClose={onClose} width="max-w-xl"
      title={p ? p.id+" — "+p.customer : ""} subtitle={p ? p.company : ""}>
      {p && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap"><LangBadge code={p.source}/><span className="text-zinc-300">→</span>{p.targets.map(t=><LangBadge key={t} code={t}/>)}
              {p.targets.length>1 && <span className="ml-1 text-[10px] text-zinc-400">covers {p.targets.length} languages</span>}</div>
            <StatusPill status={p.status}/>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><div className="text-xs text-zinc-400">Volume</div><div className="font-medium">{p.words.toLocaleString()} w</div></div>
            <div><div className="text-xs text-zinc-400">Product</div><div className="font-medium">{p.product}</div></div>
            <div><div className="text-xs text-zinc-400">Orders</div><div className="font-medium">{orders.length}</div></div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1.5">Orders — one per target language · click to open <RefChip reqId="REQ-01" onOpen={()=>{}}/></div>
            <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100 text-sm">
              {orders.map(o=>(
                <button key={o.id} onClick={()=>openOrder(o)} className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50">
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-1.5">{o.id}
                      <svg className="text-zinc-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5"><LangBadge code={o.source}/><span className="text-zinc-300">→</span><LangBadge code={o.target}/><span className="ml-1">· {o.type} · {o.vol}</span></div>
                  </div>
                  <StatusPill status={o.status}/>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1 flex items-center gap-1.5">Offers sent <RefChip reqId="REQ-11" onOpen={()=>{}}/></div>
            {offers.length ? (
              <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100 text-sm">
                {offers.map(o=>(
                  <button key={o.id} onClick={()=>openOffer(o)} className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-zinc-50">
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-1.5">{o.id}
                        <svg className="text-zinc-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                      </div>
                      <div className="text-xs text-zinc-500">{o.langs.join(", ")} · {o.variants} variant(s) · sent {o.sentOn}</div>
                    </div>
                    <div className="flex items-center gap-2"><span className="text-sm font-medium">{o.total}</span><StatusPill status={o.status}/></div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-400 rounded-lg border border-dashed border-zinc-200 p-3">No offers sent yet for this project.</div>
            )}
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Template &amp; references</div>
            <div className="text-sm text-zinc-600">Template: <span className="text-zinc-800">{p.template}</span></div>
            {tpl && <div className="text-xs text-zinc-600 mt-1 space-y-0.5">
              <div>TM: <span className="font-mono">{tpl.tm}</span></div>
              <div>Glossary: <span className="font-mono">{tpl.glossary}</span></div>
              <div>Style guide: {tpl.styleguide}</div>
            </div>}
          </div>
          <div className="flex gap-2 pt-2 border-t border-zinc-100">
            <Button onClick={()=>{ onClose(); setRoute("builder"); }}>Open offer builder</Button>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}

/* ---- Order detail (TMS-style) ---- */
const TYPE_STEPS={MT:"Machine Translation", HT:"Human Translation", PE:"Post-Editing", PR:"Proofreading"};
function orderSteps(order){
  const parts=(order.type||"").split("+").map(s=>s.trim()).filter(Boolean);
  const names=["Preparation"].concat(parts.map(x=>TYPE_STEPS[x]||x)).concat(["Delivery of order"]);
  const st=order.status; let cur;
  if(st==="Draft"||st==="Preparing"||st==="Pending") cur=0;
  else if(st==="In translation") cur=1;
  else if(st==="Proofreading") cur=names.length-2;
  else if(st==="Ready for delivery") cur=names.length-1;
  else if(st==="Delivered") cur=names.length;
  else cur=1;
  return names.map((n,i)=>({name:n, status: i<cur?"Delivered": i===cur?"In progress":"Pending"}));
}
const RATE_ORD={Economy:0.12, Business:0.18, First:0.25};
function orderMoney(order){
  const w=parseInt((order.vol||"0").replace(/[^0-9]/g,""))||0;
  const rate=RATE_ORD[order.product]||0.18;
  const price=Math.round(w*rate), cost=Math.round(w*0.085);
  const margin=price>0?Math.round((price-cost)/price*100):0;
  return {price,cost,margin,w};
}
function OrderDetailDrawer({order, open, onClose, onBack}){
  const [tab,setTab]=useState("Workflow");
  useEffect(()=>{ if(open) setTab("Workflow"); },[order && order.id, open]);
  if(!order) return <Drawer open={false} onClose={onClose}/>;
  const steps=orderSteps(order); const money=orderMoney(order);
  const TABS=["Workflow","Files","Comments","Add-ons"];
  return (
    <Drawer open={open} onClose={onClose} onBack={onBack} z="z-[60]" width="max-w-3xl"
      title={order.id} subtitle={order.customer+" · "+order.source+" → "+order.target}>
      <div className="space-y-4">
        {/* summary header */}
        <div className="grid grid-cols-4 gap-3">
          <div><div className="text-[11px] text-zinc-400">Delivery</div><div className="text-sm font-medium">{order.delivery}</div></div>
          <div><div className="text-[11px] text-zinc-400">Type</div><div className="text-sm font-medium">{order.type}</div></div>
          <div><div className="text-[11px] text-zinc-400">Specialization</div><div className="text-sm font-medium">{order.product}</div></div>
          <div><div className="text-[11px] text-zinc-400">Volume</div><div className="text-sm font-medium">{order.vol}</div></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="text-[11px] text-zinc-400">Price</div><div className="text-lg font-bold">€{money.price.toLocaleString()}</div></div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="text-[11px] text-zinc-400">Cost (Atlas)</div><div className="text-lg font-bold">€{money.cost.toLocaleString()}</div></div>
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3"><div className="text-[11px] text-zinc-400">Margin</div><div className={cx("text-lg font-bold", money.margin<40?"text-rose-600":"text-emerald-600")}>{money.margin}%</div></div>
        </div>
        <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Status</span><StatusPill status={order.status}/><span className="text-xs text-zinc-400">· Operator {order.operator}</span></div>

        {/* tabs */}
        <div className="flex items-center gap-1 border-b border-zinc-100">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={cx("px-3 py-2 text-sm border-b-2 -mb-px", tab===t?"border-zinc-900 text-zinc-900 font-medium":"border-transparent text-zinc-500 hover:text-zinc-800")}>{t}</button>
          ))}
        </div>

        {tab==="Workflow" && (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100"><tr><th className="py-1.5 font-medium">#</th><th className="py-1.5 font-medium">Task</th><th className="py-1.5 font-medium">Status</th><th className="py-1.5 font-medium">Assignee</th></tr></thead>
            <tbody>
              {steps.map((s,i)=>(
                <tr key={i} className="border-b border-zinc-50">
                  <td className="py-2 text-zinc-400">{i+1}</td>
                  <td className="py-2 font-medium">{s.name}</td>
                  <td className="py-2"><StatusPill status={s.status}/></td>
                  <td className="py-2 text-zinc-500 text-xs">{s.status==="Pending"?"—":(order.operator==="—"?"Supplier":order.operator)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab==="Files" && (
          <div className="rounded-lg border border-zinc-200 divide-y divide-zinc-100 text-sm">
            <div className="px-3 py-2 flex items-center justify-between"><span className="text-zinc-700">source_{order.target}.docx</span><Badge className="bg-blue-50 text-blue-700 border-blue-200">Source</Badge></div>
            <div className="px-3 py-2 flex items-center justify-between"><span className="text-zinc-700">work_{order.target}.xlf</span><Badge className="bg-zinc-100 text-zinc-600 border-zinc-200">XLIFF</Badge></div>
            {(order.status==="Delivered"||order.status==="Ready for delivery") && <div className="px-3 py-2 flex items-center justify-between"><span className="text-zinc-700">delivery_{order.target}.docx</span><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivery</Badge></div>}
          </div>
        )}
        {tab==="Comments" && (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-zinc-200 p-2.5"><div className="text-[11px] text-zinc-400 mb-0.5">Delivery · {order.target}</div>Follow the project style guide; keep numbers untranslated.</div>
            <div className="rounded-lg border border-zinc-200 p-2.5"><div className="text-[11px] text-zinc-400 mb-0.5">Purchase</div>Only translate black text — skip highlighted headers.</div>
          </div>
        )}
        {tab==="Add-ons" && (
          <div className="text-sm text-zinc-600">{order.product==="First" ? "Certification stamp · Journalistic editing" : "No add-ons for this order."}</div>
        )}
      </div>
    </Drawer>
  );
}

/* ---- Offer detail (read-only view of a sent/draft offer) ---- */
const OFFER_VARIANTS=[
  {key:"Economy", rate:0.12, delivery:"3–5 days"},
  {key:"Business", rate:0.18, delivery:"48 hours"},
  {key:"First", rate:0.25, delivery:"24 hours"},
];
function offerLineItems(offer){
  const p = PROJECTS.find(x=>x.id===offer.project);
  const wordsByLang={};
  if(p && p.orders) p.orders.forEach(o=>{ wordsByLang[o.lang]=parseInt((o.vol||"").replace(/[^0-9]/g,""))||0; });
  return offer.langs.map((l,i)=>({lang:l, source:(p?p.source:"DE-DE"), words: wordsByLang[l] || (800+i*160)}));
}
function OfferDetailDrawer({offer, open, onClose, onBack, setRoute}){
  if(!offer) return <Drawer open={false} onClose={onClose}/>;
  const items=offerLineItems(offer);
  const totalWords=items.reduce((s,x)=>s+x.words,0);
  const variants=OFFER_VARIANTS.map(v=>({...v, total:Math.round(totalWords*v.rate)}));
  const chosen=variants.find(v=>v.key==="Business")||variants[0];
  return (
    <Drawer open={open} onClose={onClose} onBack={onBack} z="z-[60]" width="max-w-2xl"
      title={offer.id} subtitle={offer.customer+" · "+offer.project}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 flex-wrap">{offer.langs.map(l=><LangBadge key={l} code={l}/>)}
            <span className="ml-1 text-[10px] text-zinc-400">{offer.langs.length} language(s)</span></div>
          <StatusPill status={offer.status}/>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div><div className="text-[11px] text-zinc-400">Total</div><div className="text-sm font-medium">{offer.total}</div></div>
          <div><div className="text-[11px] text-zinc-400">Variants</div><div className="text-sm font-medium">{offer.variants}</div></div>
          <div><div className="text-[11px] text-zinc-400">Sent</div><div className="text-sm font-medium">{offer.sentOn==="—"?"Not sent":offer.sentOn}</div></div>
          <div><div className="text-[11px] text-zinc-400">Volume</div><div className="text-sm font-medium">{totalWords.toLocaleString()} w</div></div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Price variants · client picks one</div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100 bg-zinc-50/60"><tr><th className="px-3 py-2 font-medium">Variant</th><th className="px-3 py-2 font-medium">Delivery</th><th className="px-3 py-2 font-medium text-right">Total</th></tr></thead>
              <tbody>
                {variants.map(v=>(
                  <tr key={v.key} className={cx("border-b border-zinc-50", v.key===chosen.key && "bg-zinc-50")}>
                    <td className="px-3 py-2 font-medium"><span className="inline-flex items-center gap-1.5">{v.key}{v.key===chosen.key && <Badge className="bg-zinc-900 text-white border-zinc-900">Recommended</Badge>}</span></td>
                    <td className="px-3 py-2 text-zinc-600">{v.delivery}</td>
                    <td className="px-3 py-2 text-right font-medium">€{v.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 mb-1">Line items · {chosen.key} rate</div>
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-zinc-500 border-b border-zinc-100 bg-zinc-50/60"><tr><th className="px-3 py-2 font-medium">Language</th><th className="px-3 py-2 font-medium">Words</th><th className="px-3 py-2 font-medium">Rate</th><th className="px-3 py-2 font-medium text-right">Line total</th></tr></thead>
              <tbody>
                {items.map(it=>(
                  <tr key={it.lang} className="border-b border-zinc-50">
                    <td className="px-3 py-2"><div className="flex items-center gap-1"><LangBadge code={it.source}/><span className="text-zinc-300">→</span><LangBadge code={it.lang}/></div></td>
                    <td className="px-3 py-2 text-zinc-600">{it.words.toLocaleString()}</td>
                    <td className="px-3 py-2 text-zinc-600">€{chosen.rate.toFixed(2)}/w</td>
                    <td className="px-3 py-2 text-right font-medium">€{Math.round(it.words*chosen.rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-zinc-100">
          <Button onClick={()=>{ onClose(); setRoute("builder"); }}>Open in offer builder</Button>
          <Button variant="outline" onClick={onBack}>Back to project</Button>
        </div>
      </div>
    </Drawer>
  );
}

/* ============================ APP ============================ */
function App(){
  const [route,setRoute]=useState("dashboard");
  const [docReq,setDocReq]=useState(null);
  const [docOpen,setDocOpen]=useState(false);
  const [projId,setProjId]=useState(null);
  const [orderObj,setOrderObj]=useState(null);
  const [offerObj,setOfferObj]=useState(null);
  const openDoc=(reqId)=>{ setProjId(null); setOrderObj(null); setOfferObj(null); setDocReq(reqId); setDocOpen(true); };
  const openProject=(id)=>{ setDocOpen(false); setOrderObj(null); setOfferObj(null); setProjId(id); };
  const openOrder=(o)=>{ setOfferObj(null); setOrderObj(o); };
  const openOffer=(o)=>{ setOrderObj(null); setOfferObj(o); };
  const goFeature=(r)=>{ setDocOpen(false); setProjId(null); setOrderObj(null); setOfferObj(null); setRoute(r.screen); };

  const titles={dashboard:"Dashboard",orders:"Translation Orders",builder:"Offer Builder",
    offers:"Offers",templates:"Projects / Templates",comments:"Comments Library",
    files:"Files & Analysis",invoicing:"Invoicing & Pricing",requirements:"Requirements"};

  let screen;
  if(route==="dashboard") screen=<Dashboard setRoute={setRoute} openDoc={openDoc}/>;
  else if(route==="orders") screen=<Orders setRoute={setRoute} openDoc={openDoc} openProject={openProject} openOrder={openOrder}/>;
  else if(route==="files") screen=<Files openDoc={openDoc}/>;
  else if(route==="invoicing") screen=<Invoicing openDoc={openDoc}/>;
  else if(route==="builder") screen=<OfferBuilder openDoc={openDoc}/>;
  else if(route==="offers") screen=<Offers openDoc={openDoc}/>;
  else if(route==="templates") screen=<Templates openDoc={openDoc}/>;
  else if(route==="comments") screen=<Comments openDoc={openDoc}/>;
  else screen=<Requirements goFeature={goFeature} openDoc={openDoc}/>;

  return (
    <React.Fragment>
      <div className="h-full flex" style={{paddingRight: docOpen ? DRAWER_W : 0, transition:"padding-right .2s ease"}}>
        <Sidebar route={route} setRoute={setRoute}/>
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar title={titles[route]} right={
            <React.Fragment>
              <Button variant="outline" size="sm" onClick={()=>setRoute("requirements")}>Requirements</Button>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-500 border border-zinc-200">Prototype · mock data</span>
            </React.Fragment>
          }/>
          <div className="flex-1 overflow-y-auto">{screen}</div>
        </div>
      </div>
      <RequirementDrawer reqId={docReq} open={docOpen} onClose={()=>setDocOpen(false)} setRoute={setRoute}/>
      <ProjectDrawer projId={projId} open={!!projId} onClose={()=>setProjId(null)} setRoute={setRoute} openOrder={openOrder} openOffer={openOffer}/>
      <OrderDetailDrawer order={orderObj} open={!!orderObj} onClose={()=>setOrderObj(null)} onBack={()=>setOrderObj(null)}/>
      <OfferDetailDrawer offer={offerObj} open={!!offerObj} onClose={()=>setOfferObj(null)} onBack={()=>setOfferObj(null)} setRoute={setRoute}/>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
