<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application rules
- Keep the five reports in separate public /reports/* routes with shared ReportsWorkspace and isolated fixtures, so navigation works without exposing operational inventory.
- Keep the sales list at the index route and the new-order workspace at /sales/new and its styling in the semantic global design system, so the entry screen stays consistent.
- Treat order and catalog data as frontend demonstration state until a real service is connected; never imply that demo confirmation persists an order.
- Create new orders through the shared orders store and navigate to /orders after validation, so order entry and order management use the same session-only data.
- Share sidebar and header through WorkspaceShell across all workspace screens so navigation and styling stay consistent.
- Keep desktop sidebar collapse in WorkspaceShell with a visible toggle and labeled icon links; preserve the mobile drawer so all navigation stays accessible.
- Keep the orders list at /orders with an explicit status filter and frontend demonstration data, so processed orders cannot appear and no persistence is implied.
- Keep incoming supplier deliveries in frontend demonstration state, including add/edit/receive actions, until a real inventory service is connected; never imply that stock is actually updated.
- Keep client creation on a dedicated /clients/new screen using the shared clients store, so a new client uses the same session-only data as the list.
- Keep the article workspace at /articles within WorkspaceShell; article additions, edits, and bulk category changes are frontend demonstration state until a real catalog service is connected. Its Admin/Influencer preview shares one catalog; only Admin exposes management, selection and audit metadata.
- Keep combos at /combos within WorkspaceShell with a separate combo editor; CRUD and product quantities remain frontend demonstration state until a real catalog service is connected.
- Keep categories at /categories within WorkspaceShell as a frontend demonstration hierarchy; prevent cyclic parent assignments and deleting parents with children to protect the tree until a real catalog service is connected.
- Keep countries at /countries within WorkspaceShell as frontend demonstration nomenclature with unique 2-letter codes; the Bulgaria system row stays locked against edit and delete until a real catalog service is connected.
- Keep settlements at /settlements within WorkspaceShell as frontend demonstration nomenclature (country, name, region, postal code) until a real catalog service is connected.
- Keep warehouses at /warehouses within WorkspaceShell as frontend demonstration nomenclature (physical/virtual type, country, city, address, postal code) until a real inventory service is connected; never imply that stock transfers actually move goods.
- Keep users at /users within WorkspaceShell as frontend demonstration state; demo-users validates assistant-to-influencer associations, never access rights. Passwords are never stored or sent; real auth/roles need a backend with a separate roles table.
- Keep stock transfers at /transfers within WorkspaceShell; statuses, product quantities and stock moves on completion are frontend demonstration state until a real inventory service is connected.
- Keep payments at /payments within WorkspaceShell as frontend demonstration state; no real Econt/Pigeon integration until a backend is connected.
- Keep /invoices in WorkspaceShell with session-only invoices-store examples and snapshots from one checked sale; filter statuses and relative dates through the shared store helpers, and use demo IDs to avoid implying official issuance.
- Generate demonstration record dates relative to the current day instead of hardcoding a calendar date, so screens that default to "today" always return rows.
- Order-detail exports use the current draft, shared order-blank printing/PDF and browser-generated XLS, so actions reflect the visible order without changing session data.
- Render every list footer through the shared Pagination component instead of hand-written pager markup, so paging and the records-per-page choice stay identical across screens and new lists inherit them.
- Keep the influencer / wholesale-trader nomenclature and the demo seller credited to each order in one shared module that order, sale and payment screens import, so names and types stay identical everywhere.
- Take chart colors from the shared ChartConfig tokens; the generated `--color-*` variables exist only inside `<ChartContainer>`, so a legend or swatch rendered outside it must read the config value directly instead of the CSS variable.

## Cloud transition
- The public demonstration workspace lives under _workspace with unchanged URLs, including sales at /; /auth redirects to /. Never weaken authentication on private server functions or expose operational records to the public preview.
- Public sales, order and article queries use isolated demo-erp fixtures and demo-prefixed cache keys; private server functions remain authenticated and mutations disabled until persisted actions are connected.
- Public preview data is always demonstration state regardless of any existing login session; never fall back from a failed cloud read to demo data within a private list.
- Private operational records use owner_user_id with admin-or-owner RLS; ownerless legacy seeds are admin-only, so names cannot confer access.
