## Plan: Complete Stackread-Web Production Readiness

Finish stackread-web by prioritizing real blockers first (API contract dependencies), then closing feature-completeness gaps in user-facing UX, then hardening quality (i18n, tests, CI, observability). The recommended path is to execute this in phased Copilot workstreams with clear verification gates before moving to the next phase.

**Steps**

1. Phase 0 - Baseline and scope lock.
   Define completion criteria for stackread-web as user-facing only (public + member account flows), and explicitly exclude staff/admin operations already scoped to stackread-dashboard. Confirm release target includes i18n parity for en and bn, production stability, and CI quality gates.

2. Phase 1 - Contract blockers and backend dependency alignment.
   Fix backend user identity extraction for user-protected dashboard/search endpoints so web pages can reliably consume authenticated data.

- depends on 1
- files: stackread-backend/src/modules/dashboard/controller.ts, stackread-backend/src/modules/search/controller.ts, stackread-backend/src/common/middlewares/auth.ts, stackread-backend/src/types/express.d.ts

3. Phase 1 - API contract assertions in web.
   Add lightweight runtime contract guards or strict response mapping for high-risk endpoints (auth, dashboard, search, subscriptions, notifications) to avoid silent shape drift and improve error messaging.

- depends on 2
- parallel with 4
- files: stackread-web/src/lib/api/types.ts, stackread-web/src/lib/api/error-message.ts, stackread-web/src/store/baseQueryWithReauth.ts, stackread-web/src/store/features/dashboard/dashboardApi.ts, stackread-web/src/store/features/search/searchApi.ts

4. Phase 1 - Session strategy hardening.
   Keep cookie-first auth as source of truth and simplify local token persistence semantics so token handling is consistent across refresh, OAuth callback, and SSR guard flows.

- depends on 2
- parallel with 3
- files: stackread-web/src/lib/auth/token-storage.ts, stackread-web/src/lib/auth/onboarding.ts, stackread-web/src/lib/auth/server-session.ts, stackread-web/src/store/features/auth/authSlice.ts, stackread-web/src/components/providers.tsx

5. Phase 2 - Replace mock/placeholder public experience with backend-driven content.
   Convert landing page, navbar, and footer from static mock content and dead links to real data/navigation based on catalog, plans, and promotions endpoints.

- depends on 3
- files: stackread-web/src/app/[locale]/(public)/page.tsx, stackread-web/src/components/layout/publicNavbar.tsx, stackread-web/src/components/layout/publicFooter.tsx, stackread-web/src/store/features/catalog/catalogApi.ts, stackread-web/src/store/features/subscriptions/subscriptionsApi.ts, stackread-web/src/store/features/promotions/promotionsApi.ts

6. Phase 2 - Complete unfinished protected workflows.
   Implement currently stubbed/partial user flows.

- Notification pagination and older-history loading instead of placeholder toast.
- Backup-code management in security settings (enable visibility/count/regeneration flow).
- Preferences beta toggle persistence decision (persist server-side or remove if out of scope).
- Review authoring/editing/deletion UI in book details.
- Bookmark/highlight CRUD UX beyond read-only list.
- depends on 3
- files: stackread-web/src/app/[locale]/(protected)/notifications/page.tsx, stackread-web/src/app/[locale]/(protected)/notifications/[id]/page.tsx, stackread-web/src/app/[locale]/(protected)/(settings)/security/page.tsx, stackread-web/src/app/[locale]/(protected)/(settings)/preferences/page.tsx, stackread-web/src/app/[locale]/(protected)/books/[bookId]/page.tsx, stackread-web/src/app/[locale]/(protected)/reading/bookmarks/page.tsx, stackread-web/src/store/features/reviews/reviewsApi.ts, stackread-web/src/store/features/reading/readingApi.ts

7. Phase 2 - Navigation and account consistency pass.
   Remove duplicate/competing account affordances and unify account state presentation.

- Wire sidebar logout action to real logout flow.
- Make settings sidebar subscription badge and plan labels dynamic from subscription/profile APIs.
- depends on 6
- files: stackread-web/src/components/layout/dashboardSidebar.tsx, stackread-web/src/components/common/userMenuPopover.tsx, stackread-web/src/components/layout/SettingsSidebar.tsx, stackread-web/src/app/[locale]/(protected)/(settings)/subscription/page.tsx

8. Phase 3 - Full i18n coverage.
   Extract all hardcoded user-facing strings in auth, protected, public, and settings pages into message catalogs and ensure locale-aware date/relative-time formatting.

- depends on 5
- parallel with 9
- files: stackread-web/src/app/[locale]/auth/login/page.tsx, stackread-web/src/app/[locale]/auth/register/page.tsx, stackread-web/src/app/[locale]/(protected)/dashboard/page.tsx, stackread-web/src/app/[locale]/(protected)/search/page.tsx, stackread-web/src/app/[locale]/(protected)/books/[bookId]/page.tsx, stackread-web/src/components/layout/SettingsShell.tsx, stackread-web/src/components/layout/SettingsSidebar.tsx, stackread-web/src/app/[locale]/(protected)/notifications/data.ts, stackread-web/src/messages/en.json, stackread-web/src/messages/bn.json

9. Phase 3 - Accessibility and responsive parity.
   Standardize focus states, labels, keyboard navigation, and mobile behavior across forms, modals, tables, and notification interactions.

- depends on 6
- parallel with 8
- files: stackread-web/src/components/settings/SettingsShared.tsx, stackread-web/src/components/layout/authCard.tsx, stackread-web/src/app/[locale]/(protected)/(settings)/subscription/page.tsx, stackread-web/src/app/[locale]/(protected)/notifications/page.tsx, stackread-web/src/components/ui/\*

10. Phase 4 - Performance and data-efficiency pass.
    Eliminate expensive broad fetches used only for ID-to-name joins and replace with lean endpoint usage or backend-enriched response projections.

- depends on 6
- files: stackread-web/src/app/[locale]/(protected)/library/page.tsx, stackread-web/src/app/[locale]/(protected)/reading/history/page.tsx, stackread-web/src/app/[locale]/(protected)/reading/currently-reading/page.tsx, stackread-web/src/app/[locale]/(protected)/wishlist/page.tsx, stackread-web/src/app/[locale]/(protected)/books/[bookId]/page.tsx, stackread-backend/src/modules/dashboard/service.ts

11. Phase 4 - Resilience UX pass.
    Introduce consistent loading skeletons, empty states, and retry affordances for all key query/mutation screens.

- depends on 6
- parallel with 10
- files: stackread-web/src/app/[locale]/(protected)/dashboard/page.tsx, stackread-web/src/app/[locale]/(protected)/search/page.tsx, stackread-web/src/app/[locale]/(protected)/library/page.tsx, stackread-web/src/app/[locale]/(protected)/reading/history/page.tsx, stackread-web/src/app/[locale]/(protected)/(settings)/subscription/page.tsx, stackread-web/src/app/global-error.tsx

12. Phase 5 - Testing foundation and CI.
    Add web test stack and CI pipeline for lint/build/tests to prevent regressions.

- depends on 8 and 11
- files: stackread-web/package.json, stackread-web/eslint.config.mjs, stackread-web/tsconfig.json, stackread-web/vitest.config.ts (new), stackread-web/tests/_ (new), stackread-web/.github/workflows/_ (new)

13. Phase 5 - Documentation and operational readiness.
    Replace default README with project-specific architecture, setup, environment variables, scripts, and known edge cases. Include backend dependency notes for web-critical endpoints.

- depends on 12
- files: stackread-web/README.md, stackread-web/src/lib/env.ts, stackread-backend/README.md

14. Phase 6 - Staging, UAT, and release.
    Run full regression with real backend data and bilingual coverage; gate release on zero P1 issues.

- depends on 13
- includes: auth, onboarding, payment success/cancel flows, dashboard, reading, wishlist, reviews, notifications, settings, account deletion.

**Relevant files**

- stackread-web/src/store/baseQueryWithReauth.ts — token refresh and retry interception point.
- stackread-web/src/lib/auth/token-storage.ts — client token persistence semantics.
- stackread-web/src/lib/auth/onboarding.ts — destination routing based on backend onboarding/email verification state.
- stackread-web/src/components/providers.tsx — hydration bootstrap for auth token.
- stackread-web/src/app/[locale]/(public)/page.tsx — currently static mock landing experience.
- stackread-web/src/components/layout/publicNavbar.tsx — dead-link placeholders and non-data-driven navigation.
- stackread-web/src/components/layout/publicFooter.tsx — placeholder links and newsletter UX.
- stackread-web/src/app/[locale]/(protected)/notifications/page.tsx — pagination placeholder and filter UX.
- stackread-web/src/app/[locale]/(protected)/notifications/data.ts — hardcoded English relative-time formatter.
- stackread-web/src/app/[locale]/(protected)/(settings)/security/page.tsx — disabled backup-code management.
- stackread-web/src/app/[locale]/(protected)/(settings)/preferences/page.tsx — local-only beta preference behavior.
- stackread-web/src/app/[locale]/(protected)/books/[bookId]/page.tsx — reviews display without CRUD controls.
- stackread-web/src/app/[locale]/(protected)/reading/bookmarks/page.tsx — limited bookmarks UX and ID-centric flow.
- stackread-web/src/components/layout/dashboardSidebar.tsx — logout action not wired.
- stackread-web/src/components/layout/SettingsSidebar.tsx — static plan/badge labels not API-driven.
- stackread-web/src/messages/en.json — partial key coverage relative to rendered UI.
- stackread-web/src/messages/bn.json — parity target for Bengali.
- stackread-backend/src/modules/dashboard/controller.ts — uses req.user context; should align with request.auth.
- stackread-backend/src/modules/search/controller.ts — uses req.user context; should align with request.auth.
- stackread-backend/src/common/middlewares/auth.ts — authoritative user/staff auth context population.
- stackread-backend/src/types/express.d.ts — request auth typing contract.

**Verification**

1. Backend contract verification.
   Run backend tests and targeted endpoint checks for dashboard/search user-scoped APIs with authenticated user token.
   Commands: pnpm test, pnpm test:integration, manual GET /dashboard/stats, GET /dashboard/library, GET /search/history, POST /search/log-click.

2. Frontend quality gate.
   Run pnpm lint and pnpm build in stackread-web for every phase merge.

3. End-to-end user journey validation (manual + automated).

- Auth: register, verify email, login, 2FA challenge, logout, OAuth callback.
- Onboarding: plan selection, paid and free completion, payment success/cancel redirects.
- Core usage: dashboard, search, book details, reading history/current, wishlist, bookmarks/highlights, notifications.
- Settings: profile update, security (2FA + backup codes), preferences, subscription actions, account deletion.

4. Localization regression.
   Validate every major page in en and bn with no hardcoded English-only UI artifacts and correct locale-aware timestamps.

5. Performance and resilience checks.
   Use network throttling and forced API failures to confirm consistent skeleton/loading/error/retry behavior and no blank-content states.

6. CI gate verification.
   Require passing lint/build/tests workflow before merge to main.

**Decisions**

- Included scope: user-facing stackread-web completion, plus minimal backend fixes that are strict dependencies for web correctness.
- Excluded scope: staff/admin capabilities already owned by stackread-dashboard (members, RBAC, staff management, audit, admin reports).
- Included quality bar: production-ready i18n parity, resilient UX states, tests, and CI.
- Copilot execution model: implement each phase as separate Copilot task/PR with phase-specific acceptance checks to reduce regression risk.

**Further Considerations**

1. Notification details reliability.
   Recommendation: add backend GET /notifications/:id if detailed route must support deep links beyond first-page list fetch.

2. Session persistence policy.
   Recommendation: keep secure cookie-first auth and use client-side token storage only as short-lived UX optimization, not source of truth.

3. Public-site strategy.
   Recommendation: if marketing site should remain curated/static by design, still replace dead links and wire at least core CTAs to real routes and onboarding paths.
