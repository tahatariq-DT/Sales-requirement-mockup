# DigitalTolk — Sales Module Prototype

A clickable, **frontend-only** prototype of the new **Sales (order-entry) module** for the
DigitalTolk / 24translate TMS. It exists to demo and explain the module to stakeholders and to
serve as a **living requirements traceability document** — every feature links back to the
meeting where it was raised, who raised it, and the exact timestamp in the recording.

No backend: all data is mock data held in the source. The whole app compiles to a single
self-contained `sales_module_prototype.html` (React + Tailwind inlined, no CDN needed) that
opens in any browser.

## What's inside

- **Sales tab** with Dashboard, Translation Orders (project + order views), Offer Builder,
  Offers, Projects/Templates, Comments Library, Files & Analysis, and Invoicing & Pricing.
- **Translation projects** grouping one source → many target-language child orders, each with
  its own status; drill into a project drawer → order-detail drawer (TMS side-drawer language).
- **Offers** attached to projects, with a clickable offer-detail drawer (price variants + line items).
- **Requirements** tab — a traceability table of **69 requirements** across 7 epic groups, each
  with a user story, the source meeting + speaker, a deep link to the recording at the exact
  timestamp, an "also discussed in" list for revisits, reference screenshots (where available),
  and prototype change notes.

## Requirements sources (meetings)

| Ref | Meeting | Notes |
|-----|---------|-------|
| M1  | Sales Deepdive        | Projects, templates, company hierarchy |
| M2  | Sales Deep Dive 2     | Translation project + offers lifecycle |
| M3  | Sales Deep Dive 3     | Documents / files handling |
| M4  | Sales Deep Dive 4     | Invoicing & pricing |
| M5  | Sales req demo        | Walkthrough + clarifications (Faisal + Clemens) |
| M6  | Sales Deep Dive 5     | Invoicing, hourly pricing, project/workspace hierarchy |
| M7  | Sales Deep Dive 6     | Pricing, discounts, follow-up, templates, tenders |

Per-meeting requirement digests are in [`docs/`](docs/).

## Build

Requires Node.js (18+).

```bash
npm install        # installs react, react-dom, @babel, tailwindcss
npm run build      # compiles app.src.jsx → sales_module_prototype.html
```

Then open `sales_module_prototype.html` in a browser. The committed copy of that file is the
latest build, so you can also just open it directly without building.

## Project structure

```
app.src.jsx        # THE source of truth — all screens, components, data, requirements
images.js          # base64 reference screenshots (window.REQ_IMAGES)
tw.in.css          # Tailwind entry
build2.js          # compiles JSX (Babel, classic runtime) → app.compiled.js + scan.txt
assemble3.js       # inlines React + Tailwind + images + app → sales_module_prototype.html
sales_module_prototype.html   # built artifact (committed)
docs/              # per-meeting requirement notes (M5–M7)
```

### How the data is organized in `app.src.jsx`

- `MEETINGS`, `MEETING_URLS`, `REQ_TS`, `ALSO_IN` — meeting metadata, recording links, timestamps.
- `REQS` — the requirement list (REQ-01 … REQ-69).
- `EPICS` / `STORIES` / `STATUS_OF` — epic grouping, user stories, build status.
- `CHANGELOG` — prototype change notes shown per requirement.
- `PROJECTS`, `ORDERS`, `OFFERS`, `TEMPLATES`, `COMMENTS` — mock domain data.
- Screen components + drawers (`RequirementDrawer`, `ProjectDrawer`, `OrderDetailDrawer`,
  `OfferDetailDrawer`) and the `App` root.

## Making changes

1. Edit `app.src.jsx` (and `images.js` for new screenshots).
2. `npm run build`.
3. Commit `app.src.jsx`, `images.js`, and the rebuilt `sales_module_prototype.html`.

Build intermediates (`app.compiled.js`, `scan.txt`, `tw.out.css`) and `node_modules/` are
git-ignored.
