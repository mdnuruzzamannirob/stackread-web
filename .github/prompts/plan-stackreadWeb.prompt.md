## Plan: Stackread Web Customer App

Build out `stackread-web` as the customer-facing Next.js app for Stackread, using the backend as the source of truth for auth, onboarding, catalog browsing, reading, subscription, payment, and notification flows. The current repo already has the auth/onboarding shell, locale routing, Redux Toolkit + RTK Query, cookie-based session handling, and a protected dashboard scaffold, so the plan should extend that foundation instead of replacing it.

**Steps**

1. Lock the product scope and route map around the customer app only.
   - Keep `stackread-web` focused on the customer journey only: public browsing, auth, onboarding, book discovery, reading, wishlist, subscriptions, payments, notifications, and the protected user dashboard.
   - Exclude staff/admin surfaces entirely from this app: RBAC, audit logs, reports, system settings, publishers back-office, staff management, member administration, and any other `/admin/*` or `/staff/*` backend capability belong in `stackread-dashboard`.
   - Anchor the route map to the existing Next.js App Router structure in `src/app/[locale]/*`, with the app staying organized around public pages, auth pages, onboarding pages, and protected customer pages.
   - Treat these as the core customer routes to preserve and flesh out: `/(public)`, `/auth/*`, `/onboarding/*`, `/(protected)/dashboard`, and future protected book/account/subscription/payment/notification screens.
   - Keep locale-prefixed navigation and redirects intact for both supported locales so every customer route remains reachable under the existing i18n shell.
2. Normalize the backend contract in the web API layer, then add client endpoints in stages.
   - Keep the backend response envelope fixed in `src/lib/api/types.ts`: every client request should expect the `ApiEnvelope` / `ApiErrorEnvelope` shape, with field-level validation errors surfaced from the `errors` array when present.
   - Preserve `src/store/baseQueryWithReauth.ts` as the central request path so authenticated requests can transparently reuse cookie-based sessions, bearer tokens, and refresh-token recovery without duplicating retry logic in individual screens.
   - Extend RTK Query in `src/store/features/*` by domain, not by screen, so the web app can share data and cache state across pages.
   - Add the customer-facing API slices and endpoint groups in this order: auth/account, onboarding, books/catalog, search, dashboard/home feed, wishlist, reviews, reading/progress, subscriptions, payments, notifications, and profile preferences.
   - For auth/account, support the backend flows exposed by `src/modules/auth/router.ts`: register, login, logout, refresh, verify-email, resend-verification, forgot-password, resend-reset-otp, verify-reset-otp, reset-password, `GET /me`, `GET /me/login-history`, `PATCH /me`, `PATCH /me/password`, `PATCH /me/notification-prefs`, and the full 2FA surface (`POST /2fa/challenge`, `POST /2fa/email/send`, `POST /2fa/enable`, `POST /2fa/verify`, `POST /2fa/disable`, `GET /2fa/backup-codes`) plus Google/Facebook OAuth entry points.
   - For onboarding, wire the public plan catalog and user-specific onboarding state exposed by `src/modules/onboarding/router.ts`: `GET /onboarding/plans`, `GET /onboarding/status`, `POST /onboarding/select`, and `POST /onboarding/complete`.
   - Keep the RTK Query base layer aligned with backend auth and locale behavior so every endpoint can reuse the same base URL, headers, and refresh handling before adding domain-specific cache tags, optimistic updates, or invalidation rules.
3. Complete the authentication and onboarding journey end-to-end.
   - Keep the current login/register/2FA/reset-password/OAuth patterns, but make them consistent across all auth pages, error states, redirects, and persisted session handling.
   - Treat `src/app/[locale]/(protected)/layout.tsx` as the server-side gate for authenticated customer pages: it should require a valid `/auth/me` session and then redirect pending users into onboarding instead of rendering protected content too early.
   - Treat `src/app/[locale]/onboarding/layout.tsx` as the onboarding gate: users who have completed onboarding should be redirected back into the protected app, while pending or selected-plan users stay in the onboarding flow until they finish.
   - Keep login outcome handling aligned with backend behavior: successful login should persist the session, store the user profile, respect `requiresTwoFactor`, and route users to onboarding or dashboard based on `GET /onboarding/status`.
   - Cover the full customer auth lifecycle, not only sign-in: register, verify email, resend verification, forgot password, resend reset OTP, verify reset OTP, reset password, 2FA challenge, 2FA email OTP send, logout, and session refresh.
   - Make OAuth callbacks deterministic by handling Google/Facebook success and failure states cleanly, preserving the locale-aware login redirect on backend failures and the authenticated destination on success.
   - Keep session persistence stable across reloads and tab refreshes by keeping the cookie/token storage flow, client hydration, and 401 refresh recovery in sync with the backend session model.
4. Build the public discovery experience around backend browsing endpoints.
   - Implement the home and catalog experience for featured books, recent additions, search suggestions, categories, authors, publishers, and promotions/active coupon messaging.
   - Use the public backend reads first, then layer in search, filtering, and pagination using the backend query conventions.
   - Keep the existing public layout and locale-aware navigation while making the landing experience feel like the product entry point rather than a placeholder.
5. Add the protected reading experience and book detail flow.
   - Build book detail, preview, and reading pages that consume the books and reading endpoints, including reading progress, session tracking, bookmarks, highlights, and reading history.
   - Enforce subscription gating in the client flow so access checks, plan eligibility, and file download/view behavior match backend access rules.
   - Keep these screens responsive and reader-focused, since they are the core value of the app.
6. Add the subscription, payment, and account management surfaces.
   - Implement current subscription, renewal, upgrade/downgrade, payment history, and gateway selection flows.
   - Add user profile, login history, email verification state, password change, and notification preferences views if they are exposed by the backend profile APIs.
   - Make payment and subscription status screens resilient to pending/processing states, retries, and backend verification delays.
7. Wire notifications and async-state UX.
   - Add a notifications inbox and unread count state backed by the backend notifications module.
   - Surface pending states for payment verification, subscription expiry, and any delayed backend processes with loading, empty, and error states instead of optimistic-only UI.
   - If the backend exposes push delivery hooks that the web app can use directly, keep that optional and isolated behind the notifications layer rather than coupling it to core navigation.
8. Polish global app behavior, i18n, and error handling.
   - Keep `next-intl` locale routing, theme switching, and `src/proxy.ts` behavior intact while filling in missing translation and navigation details.
   - Standardize forms with React Hook Form + Zod, and map backend validation errors into field-level UI consistently.
   - Add loading skeletons, empty states, auth guards, and route-level redirects where the current scaffold still renders placeholder content.
9. Verify the customer app with focused checks once implementation starts.
   - Run lint and build validation for the web app after the API wiring and page work are in place.
   - Manually test login, 2FA, onboarding redirect, public browsing, protected dashboard access, password reset, and at least one payment/subscription flow against a live backend.
   - Confirm locale switching, session persistence, and 401 refresh recovery behave correctly in the browser.

**Relevant files**

- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/layout.tsx` — locale validation and top-level route shell.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/(protected)/layout.tsx` — server-side auth and onboarding gate.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/onboarding/layout.tsx` — onboarding redirect logic.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/auth/*` — login, register, 2FA, password reset, verification, and OAuth callback pages.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/(public)/*` — public home and discovery entry points.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/app/[locale]/(protected)/dashboard/page.tsx` — current protected customer dashboard scaffold.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/store/baseQueryWithReauth.ts` — automatic auth refresh and redirect handling.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/store/features/auth/authApi.ts` — existing auth endpoint patterns to extend.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/store/features/auth/authSlice.ts` — auth state and login outcome handling.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/lib/api/server.ts` — server-side API requests for layouts and protected pages.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/lib/auth/*` — token storage, guards, onboarding resolution, and auth normalization helpers.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/components/*` — shared layout, UI, provider, navbar, and form primitives.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/i18n/*` — locale routing and request config.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/proxy.ts` — locale-aware middleware routing.
- `c:/Users/devmd/work/library-management-system/stackread-web/src/lib/env.ts` — API base URL, app URL, locale, and cookie configuration.

**Verification**

1. Validate the final page and store changes with `pnpm lint` and `pnpm build` in `stackread-web`.
2. Exercise the key backend flows manually in the browser: register, verify email, login, 2FA, onboarding, dashboard redirect, search/catalog, and subscription/payment pages.
3. Confirm the app still handles expired sessions by forcing a 401 and observing refresh or redirect behavior.
4. Check the locale-prefixed routes in both supported locales and confirm translations and redirects behave consistently.

**Decisions**

- Keep `stackread-web` customer-facing only; do not plan admin/staff surfaces here.
- Treat the backend response envelope and auth/session behavior as fixed contracts and align the web around them.
- Prefer incremental extension of the existing scaffold over a rewrite, because auth, onboarding, token persistence, and locale plumbing are already in place.
- Use server-side layout checks for protected routes and onboarding redirects instead of duplicating that logic only in client components.

**Further Considerations**

1. If the next phase should be MVP-first, start with auth, onboarding, home, search, book detail, and dashboard before adding reading annotations and notifications.
2. If you want parity faster, the reading, subscription, payment, and notification work can be split into parallel tracks after the API layer is normalized.
