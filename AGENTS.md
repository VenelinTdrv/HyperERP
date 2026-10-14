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
- Keep the requested order workspace at the index route and its styling in the semantic global design system, so the entry screen stays consistent.
- Treat order and catalog data as frontend demonstration state until a real service is connected; never imply that demo confirmation persists an order.
- Share sidebar and header through WorkspaceShell across order entry, unprocessed orders, and delivery routes so navigation and workspace styling remain consistent.
- Keep the unprocessed orders list at /orders with an explicit status filter and frontend demonstration data, so processed orders cannot appear and no persistence is implied.
- Keep incoming supplier deliveries in frontend demonstration state, including add/edit/receive actions, until a real inventory service is connected; never imply that stock is actually updated.
- Keep the article workspace at /articles within WorkspaceShell; article additions, edits, and bulk category changes are frontend demonstration state until a real catalog service is connected.
- Keep combos at /combos within WorkspaceShell with a separate combo editor; CRUD and product quantities remain frontend demonstration state until a real catalog service is connected.
