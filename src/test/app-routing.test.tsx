import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it('opens all five reports in the public workspace', () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ['/reports/warehouses', '/reports/articles', '/reports/batches', '/reports/warehouse-profit', '/reports/exhausted-batches']) {
      const matches = router.matchRoutes(path);
      expect(matches.some(match => match.routeId === '/_workspace')).toBe(true);
      expect(matches.at(-1)?.pathname).toBe(path);
    }
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it('opens every workspace page through the public demonstration layout', () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ['/', '/orders', '/articles', '/clients', '/sales/new', '/payments', '/users', '/statistics', '/transfers', '/deliveries', '/countries', '/settlements', '/warehouses', '/suppliers', '/categories', '/combos', '/orders/ORD-0024']) {
      const matches = router.matchRoutes(path);
      expect(matches.some(match => match.routeId === '/_workspace')).toBe(true);
      expect(matches.some(match => match.routeId.includes('_authenticated'))).toBe(false);
      expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});
