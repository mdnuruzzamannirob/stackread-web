## Plan: Complete Stackread Web Parity

Deliver full user-portal parity in stackread-web against the existing stackread-backend user-facing APIs (catalog, search, library, reader, wishlist, reviews, promotions, dashboard). Keep backend unchanged, replace static/mocked frontend sections with API-backed surfaces, and ship a complete localized (en/bn), protected, production-ready web experience.

**Steps**

1. Phase 1 - Contract lock + frontend data foundation (_blocks all UI implementation_).
   Action: Build an endpoint/DTO matrix from backend routers/validation + docs/openAPI.json for all missing user domains: books, authors, categories, publishers, search, dashboard, reading, wishlist, reviews, promotions.
   Action: Define canonical frontend model shapes and shared pagination/meta utilities to avoid per-page ad-hoc typing.
   Action: Expand RTK Query cache taxonomy in baseApi tagTypes to include new domains (Books, Search, Dashboard, Reading, Wishlist, Reviews, CatalogTaxonomy, Promotions).
2. Phase 1 - Add missing RTK Query slices (_depends on 1; parallelizable by domain_).
   Parallel track A: Catalog APIs (books, authors, categories, publishers, featured/preview/detail filters).
   Parallel track B: Discovery APIs (search, suggestions, popular terms, history, click logging).
   Parallel track C: Reader APIs (start/session/progress, history/current/completed, bookmarks CRUD, highlights CRUD).
   Parallel track D: Social/utility APIs (wishlist CRUD, reviews CRUD + list, coupon validation + active flash sales).
   Action: Keep all requests aligned to existing baseQueryWithReauth behavior and public-auth whitelist rules.
3. Phase 2 - Information architecture and route scaffold (_depends on 2 for data hooks, but shell routes can start in parallel_).
   Action: Replace hash-anchor navigation with real route surfaces for Search, Library, Reading activity, Wishlist, and Book detail flows.
   Action: Use dashboard page-map as the single source of truth for sidebar/header route metadata; remove hardcoded menu drift in dashboardSidebar.
   Action: Add protected route structure for full user flows: catalog browsing, search, library states, reading detail/reader, wishlist, review interactions.
4. Phase 2 - Dashboard conversion from static to live data (_depends on 2_).
   Action: Refactor ReadingStats, RecentActivity, BookRecommendations, and TopicsGrid to consume API results instead of prop defaults/mock constants.
   Action: Wire dashboard page to dashboard + reading + wishlist + review-derived counts as needed.
   Action: Add loading/empty/error states consistent with existing notification/settings UX.
5. Phase 3 - Catalog + discovery implementation (_depends on 2 and 3_).
   Action: Implement Books list surface with server/client filters from booksValidation query contract (search, featured, status/availability where user-visible, author/category/publisher/access/language).
   Action: Implement Book details with preview, metadata, access gating hints, related recommendations, and quick actions (read, wishlist, review).
   Action: Implement Search page with suggestions-as-you-type, popular terms, results pagination, and click logging.
   Action: Connect dashboard header search input to the dedicated search experience.
6. Phase 3 - Library + wishlist surfaces (_depends on 2 and 3; parallel with step 5_).
   Action: Implement Library hub using GET /dashboard/library and reading list variants.
   Action: Implement dedicated Currently Reading, Reading History, and Completed views.
   Action: Implement Wishlist page with optimistic add/remove interactions from list and detail contexts.
7. Phase 4 - Full reader experience (online-first) (_depends on 2, 3, 5, 6_).
   Action: Build reading route/workspace that starts sessions and continuously syncs progress.
   Action: Support in-browser interactive reading for PDF + EPUB; for MOBI/TXT/AZW3 provide fallback actions (download/open externally) with clear UX messaging.
   Action: Implement bookmark/highlight side panels with create/update/delete and position syncing.
   Action: Handle subscription-access failures with actionable upgrade/plan-change CTAs.
   Action: Keep scope online-first (no offline download manager workflow in this phase).
8. Phase 4 - Reviews + engagement (_depends on 2, 5, 7_).
   Action: Add review list and rating summary on book details.
   Action: Add create/edit/delete review flows for authenticated users with mutation-driven cache invalidation.
   Action: Ensure review actions reflect in dashboard counters/recent activity where applicable.
9. Phase 5 - Promotions + payment/onboarding continuity hardening (_depends on existing subscription/onboarding flow + step 2_).
   Action: Add coupon validation UX to relevant payment/plan-change actions.
   Action: Surface active flash sales on marketing/home and/or contextual promotional slots.
   Action: Tighten payment return states so success/cancel/onboarding screens consistently reconcile with confirm-stripe-session and onboarding confirm-payment semantics.
10. Phase 5 - Public home conversion to backend-driven content (_depends on 2; parallel with late phases_).
    Action: Replace hardcoded plans, featured picks, and genre/topic sections with backend-backed content (plans, featured books, taxonomy signals where available).
    Action: Preserve fast public performance with sensible loading placeholders and graceful fallbacks when endpoints return sparse data.
11. Phase 6 - Localization, UX consistency, and navigation completeness (_runs continuously; final pass blocks release_).
    Action: Add/normalize all new i18n keys in en/bn for added routes, filters, reader actions, empty/error states, and promotional copy.
    Action: Align header titles and route resolution with new paths via resolveDashboardTitleKey and page-map metadata.
    Action: Remove remaining placeholder anchors and ensure all sidebar/header actions resolve to implemented pages.
12. Phase 7 - Stabilization and release verification (_depends on all prior steps_).
    Action: Execute lint/build gates.
    Action: Run end-to-end manual verification across auth, onboarding, browsing, searching, reading, wishlist, reviews, subscription/payment interactions, notifications, and localization toggles.
    Action: Perform regression checks on existing working surfaces (auth/settings/subscription/notifications).
    Action: Record unresolved backend constraints (if any) as explicit follow-ups before release.

**Relevant files**

- `stackread-backend/src/app/routes.ts` — authoritative user-facing route map to match in web routing.
- `stackread-backend/src/modules/books/router.ts` and `stackread-backend/src/modules/books/validation.ts` — catalog endpoints and filter contract.
- `stackread-backend/src/modules/search/router.ts` and `stackread-backend/src/modules/search/validation.ts` — search/suggestions/popular/history contracts.
- `stackread-backend/src/modules/dashboard/router.ts` and `stackread-backend/src/modules/dashboard/validation.ts` — dashboard stats/recommendations/library contracts.
- `stackread-backend/src/modules/reading/router.ts` and `stackread-backend/src/modules/reading/validation.ts` — reader sessions, progress, bookmarks, highlights contracts.
- `stackread-backend/src/modules/wishlist/router.ts` and `stackread-backend/src/modules/wishlist/validation.ts` — wishlist CRUD contract.
- `stackread-backend/src/modules/reviews/router.ts` and `stackread-backend/src/modules/reviews/validation.ts` — review list/create/update/delete contract.
- `stackread-backend/src/modules/promotions/router.ts` and `stackread-backend/src/modules/promotions/validation.ts` — coupon/flash-sale user-facing contract.
- `stackread-backend/src/modules/payments/router.ts` and `stackread-backend/src/modules/onboarding/router.ts` — payment confirmation + onboarding continuity behavior.
- `stackread-backend/docs/openAPI.json` — consolidated request/response schema reference.
- `stackread-web/src/store/baseApi.ts` — extend tagTypes for all new frontend domains.
- `stackread-web/src/store/baseQueryWithReauth.ts` — preserve auth refresh/public endpoint behavior for new APIs.
- `stackread-web/src/store/index.ts` — ensure injected APIs/middleware integration remains consistent.
- `stackread-web/src/lib/api/types.ts` and `stackread-web/src/lib/api/server.ts` — envelope typing and server fetch conventions.
- `stackread-web/src/lib/dashboard/page-map.ts` — reuse as navigation/source-of-truth for newly implemented routes.
- `stackread-web/src/components/layout/dashboardSidebar.tsx` and `stackread-web/src/components/layout/dashboardHeader.tsx` — migrate from anchors/static links to full route coverage.
- `stackread-web/src/app/[locale]/(protected)/dashboard/page.tsx` — convert composition to live backend data sources.
- `stackread-web/src/components/modules/dashboard/readingStats.tsx` — replace defaults with API-driven metrics.
- `stackread-web/src/components/modules/dashboard/recentActivity.tsx` — replace mock items with reading history/current data.
- `stackread-web/src/components/modules/dashboard/bookRecommendations.tsx` — wire recommendations endpoint.
- `stackread-web/src/components/modules/dashboard/topicsGrid.tsx` — source categories/taxonomy-driven topics.
- `stackread-web/src/app/[locale]/(public)/page.tsx` — replace hardcoded marketing content with backend-driven sections.
- `stackread-web/src/app/[locale]/onboarding/plan/page.tsx` and `stackread-web/src/app/[locale]/payment/success/page.tsx` — coupon and payment reconciliation updates.
- `stackread-web/src/messages/en.json` and `stackread-web/src/messages/bn.json` — localization coverage for all new flows.

**Verification**

1. Run `pnpm lint` in stackread-web and resolve all lint violations introduced by new routes/components/apis.
2. Run `pnpm build` in stackread-web to validate type safety and Next.js routing/build integrity.
3. Manual auth/onboarding verification: register/login/2FA/onboarding select/pay/confirm path and protected-route redirects.
4. Manual catalog/search verification: filters, pagination, suggestions, popular terms, click logging, book detail transitions.
5. Manual reader verification: PDF/EPUB rendering, start/session/progress sync, bookmark/highlight CRUD, unsupported-format fallback UX.
6. Manual engagement verification: wishlist add/remove consistency, review CRUD visibility, dashboard count updates.
7. Manual payments/promotions verification: coupon validation behavior, flash sale surfacing, subscription plan-change continuity.
8. Manual localization verification: en/bn labels for new pages/actions/errors and correct route behavior across locales.
9. Regression sweep: existing settings/security/subscription/notifications flows still operate with unchanged behavior.

**Decisions**

- Included scope: stackread-web user portal only.
- Excluded scope: stackread-dashboard/admin staff portal work.
- Delivery mode: single full-parity plan (not MVP-only).
- Reader scope: full reader experience in this phase.
- Reader format strategy: interactive PDF + EPUB, fallback for other formats.
- Offline scope: excluded for this completion plan (online-first).
- Marketing scope: include backend-driven conversion of public home sections.

**Further Considerations**

1. Reader implementation path recommendation: keep renderer abstraction from day one (Option A: direct PDF+EPUB readers behind a common adapter) vs ad-hoc per format (Option B). Recommended: Option A for maintainability.
2. Catalog performance recommendation: combine server-side pagination with client-side filter state sync in URL params (Option A) vs in-memory-only filtering (Option B). Recommended: Option A for shareable links and SEO-friendly behavior.
3. Contract drift safety recommendation: generate/validate API types against openAPI during CI (Option A) vs manual type upkeep (Option B). Recommended: Option A to reduce backend/frontend mismatch risk.
