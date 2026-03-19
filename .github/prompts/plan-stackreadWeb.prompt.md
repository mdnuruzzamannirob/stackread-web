# Plan: Stackread Web (User App)

## Mission

Build stackread.com as a production-grade Next.js 16 App Router application for regular users only, strictly aligned with implemented backend routes in stackread-backend. No mock/fake placeholder data.

## Core Stack

- Next.js 16 App Router + TypeScript strict
- Tailwind CSS v4 with @theme and oklch variables in globals.css (no tailwind.config.ts)
- shadcn/ui, Framer Motion, Sonner, Lucide React
- Redux Toolkit + RTK Query (feature-based)
- React Hook Form + Zod
- next-intl (en, bn)
- next-themes (light/dark)
- react-pdf + epub.js unified reader
- @stripe/stripe-js (Stripe Elements)
- Vitest + Testing Library
- Deploy on Vercel

## Design System

- Font family: Geist for headings and body
- Primary palette: Blue/Indigo, all color tokens in oklch
- Visual style: minimal and clean, generous whitespace, rounded-lg radius
- Responsive behavior: desktop top nav, dashboard left sidebar + top bar, mobile bottom navigation
- Motion: purposeful load transitions, section reveal stagger, reader tool panel transitions

## Auth Architecture (Next.js 16)

- proxy.ts: redirect-only and locale-safe rewriting only, no auth validation
- Layout server boundary for protected areas verifies session and redirects unauthenticated users
- Access token session in secure httpOnly cookie
- No middleware-based authorization logic
- User 2FA is optional and user-controlled in Security Settings

## User Auth Flows

### Email login

- POST /auth/login
- If requiresTwoFactor = false: set session cookie and redirect to /dashboard
- If requiresTwoFactor = true: keep tempToken in memory only and redirect to /auth/2fa/challenge

### 2FA challenge

- POST /auth/2fa/challenge with tempToken + otp
- On success: set session cookie, clear tempToken from memory

### OAuth

- GET /auth/google then provider callback
- GET /auth/facebook then provider callback
- Handle callback route in app, then normalize session and route to onboarding or dashboard

## Backend Truth Constraints

- Use country from GET /auth/me for payment gateway UX selection
- Gracefully handle no refresh-token endpoint
- Gracefully handle no Firebase device-token endpoint
- SMS flows disabled in frontend UX despite legacy documentation references

## Complete Page Inventory

Each page includes route, purpose, access, rendering strategy, backend endpoints, and key UI blocks.

### Public Pages

1. Route: /[locale]

- Description: Landing with hero, featured books, active flash sale, plans preview, how-it-works, CTA
- Access: Public
- Render: Server page with client islands for carousels and animated sections
- APIs: GET /books/featured, GET /flash-sales/active, GET /plans
- Key components: HeroSection, FeaturedBooksCarousel, FlashSaleBanner, PlanPreviewGrid, CTASections

2. Route: /[locale]/pricing

- Description: Plan cards, monthly-yearly toggle, coupon pre-check input
- Access: Public
- Render: Server page + client billing toggle and coupon form
- APIs: GET /plans, POST /coupons/validate
- Key components: PricingTable, BillingCycleToggle, CouponValidateForm, PlanComparison

3. Route: /[locale]/catalogue

- Description: Book grid with filters and pagination/load more
- Access: Public
- Render: Server initial query + client infinite query controls
- APIs: GET /books, GET /categories, GET /authors
- Key components: CatalogueFilters, BookGrid, LoadMoreButton, ActiveFilterChips

4. Route: /[locale]/books/[id]

- Description: Book metadata, reviews, CTA for read/borrow/reserve/wishlist
- Access: Public
- Render: Server page + client review/wishlist actions when authenticated
- APIs: GET /books/:id, GET /books/:bookId/reviews, POST /wishlist/:bookId, POST /borrows, POST /reservations
- Key components: BookHeader, BookMetaPanel, ReviewList, ActionCTAGroup

5. Route: /[locale]/authors

- Description: Author grid with search and pagination
- Access: Public
- Render: Server page + client filter interactions
- APIs: GET /authors
- Key components: AuthorGrid, AuthorSearchInput, PaginationControls

6. Route: /[locale]/authors/[id]

- Description: Author profile and authored books listing
- Access: Public
- Render: Server page
- APIs: GET /authors/:id, GET /books
- Key components: AuthorProfileCard, AuthorBooksGrid

7. Route: /[locale]/categories

- Description: Category list/tree with counts
- Access: Public
- Render: Server page
- APIs: GET /categories
- Key components: CategoryTree, CategoryStatPill

8. Route: /[locale]/categories/[id]

- Description: Category detail and filtered books
- Access: Public
- Render: Server page + client filters
- APIs: GET /categories/:id, GET /books
- Key components: CategoryHeader, FilteredBookGrid

9. Route: /[locale]/search

- Description: Search results, filters, suggestions
- Access: Public
- Render: Client-heavy for interactive query states
- APIs: GET /search, GET /search/suggestions, GET /search/popular-terms, POST /search/log-click
- Key components: SearchBar, SuggestionPanel, ResultGrid, SearchFilterSidebar

10. Route: /[locale]/about

- Description: Static about content
- Access: Public
- Render: Server
- APIs: none
- Key components: RichContentSection

11. Route: /[locale]/blog

- Description: Static blog index
- Access: Public
- Render: Server
- APIs: none
- Key components: BlogCardList

12. Route: /[locale]/blog/[slug]

- Description: Static blog detail
- Access: Public
- Render: Server
- APIs: none
- Key components: BlogArticle

13. Route: /[locale]/faq

- Description: FAQ accordion
- Access: Public
- Render: Server with client accordion
- APIs: none
- Key components: FAQAccordion

14. Route: /[locale]/contact

- Description: Contact form
- Access: Public
- Render: Client form
- APIs: none (local validation + mailto or external integration later)
- Key components: ContactForm

15. Route: /[locale]/terms

- Description: Terms of Service
- Access: Public
- Render: Server
- APIs: none
- Key components: PolicyDocument

16. Route: /[locale]/privacy

- Description: Privacy Policy
- Access: Public
- Render: Server
- APIs: none
- Key components: PolicyDocument

17. Route: /[locale]/cookies

- Description: Cookie Policy
- Access: Public
- Render: Server
- APIs: none
- Key components: PolicyDocument

18. Route: /[locale]/refund

- Description: Refund Policy
- Access: Public
- Render: Server
- APIs: none
- Key components: PolicyDocument

19. Route: /[locale]/maintenance

- Description: Maintenance fallback page
- Access: Public
- Render: Server
- APIs: GET /admin/settings/maintenance
- Key components: MaintenanceStateView

### Auth Pages

20. Route: /[locale]/auth/login

- Access: Public
- Render: Client form
- APIs: POST /auth/login, GET /auth/google, GET /auth/facebook
- Components: LoginForm, OAuthButtons

21. Route: /[locale]/auth/register

- Access: Public
- Render: Client form
- APIs: POST /auth/register
- Components: RegisterForm, CountrySelect

22. Route: /[locale]/auth/verify-email

- Access: Public
- Render: Client auto-submit token
- APIs: POST /auth/verify-email
- Components: TokenVerifier, VerifyStateCard

23. Route: /[locale]/auth/check-email

- Access: Public
- Render: Client countdown
- APIs: POST /auth/resend-verification
- Components: ResendCountdownCard

24. Route: /[locale]/auth/forgot-password

- Access: Public
- Render: Client form
- APIs: POST /auth/forgot-password
- Components: ForgotPasswordForm

25. Route: /[locale]/auth/reset-password

- Access: Public
- Render: Client token form
- APIs: POST /auth/reset-password
- Components: ResetPasswordForm

26. Route: /[locale]/auth/oauth-callback

- Access: Public
- Render: Client callback parser
- APIs: GET /auth/google/callback, GET /auth/facebook/callback
- Components: OAuthCallbackHandler

27. Route: /[locale]/auth/2fa/challenge

- Access: Temp-auth only
- Render: Client OTP form
- APIs: POST /auth/2fa/challenge
- Components: TwoFactorChallengeForm

### User Dashboard Pages

28. Route: /[locale]/dashboard

- Access: User
- Render: Server shell + client widgets
- APIs: GET /dashboard, GET /dashboard/stats, GET /dashboard/recommendations, GET /notifications/unread-count
- Components: DashboardKPIs, ResumeReadingStrip, RecommendationGrid, CmdKSearch

29. Route: /[locale]/dashboard/library

- Access: User
- Render: Server + client tab switch
- APIs: GET /dashboard/library, GET /borrows/my, GET /reservations/my, GET /wishlist, GET /reading/currently-reading
- Components: LibraryTabs, BorrowList, ReservationList, WishlistGrid

30. Route: /[locale]/dashboard/reading-history

- Access: User
- Render: Server + client pagination
- APIs: GET /reading/history
- Components: ReadingHistoryTable

31. Route: /[locale]/dashboard/currently-reading

- Access: User
- Render: Server
- APIs: GET /reading/currently-reading
- Components: CurrentlyReadingCards

32. Route: /[locale]/dashboard/completed

- Access: User
- Render: Server
- APIs: GET /reading/completed
- Components: CompletedBooksGrid

33. Route: /[locale]/reader/[bookId]

- Access: User
- Render: Client-heavy unified reader
- APIs: POST /reading/:bookId/start, PATCH /reading/:bookId/progress, POST /reading/:bookId/session, GET/POST/PATCH/DELETE /books/:bookId/bookmarks, GET/POST/PATCH/DELETE /books/:bookId/highlights
- Components: UnifiedReader, PdfReaderPane, EpubReaderPane, ReaderToolbar, BookmarkPopover, HighlightContextMenu

34. Route: /[locale]/dashboard/bookmarks

- Access: User
- Render: Client list manager
- APIs: GET /books/:bookId/bookmarks, PATCH /books/:bookId/bookmarks/:id, DELETE /books/:bookId/bookmarks/:id
- Components: BookmarkManagerTable

35. Route: /[locale]/dashboard/highlights

- Access: User
- Render: Client list manager
- APIs: GET /books/:bookId/highlights, PATCH /books/:bookId/highlights/:id, DELETE /books/:bookId/highlights/:id
- Components: HighlightManagerTable

36. Route: /[locale]/dashboard/wishlist

- Access: User
- Render: Server + client actions
- APIs: GET /wishlist, DELETE /wishlist/:bookId
- Components: WishlistGrid, QuickActions

37. Route: /[locale]/dashboard/borrows

- Access: User
- Render: Server
- APIs: GET /borrows/my, POST /borrows/:id/return
- Components: BorrowStatusList

38. Route: /[locale]/dashboard/reservations

- Access: User
- Render: Server
- APIs: GET /reservations/my, DELETE /reservations/:id
- Components: ReservationQueueList

39. Route: /[locale]/dashboard/notifications

- Access: User
- Render: Client interactions
- APIs: GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/mark-read
- Components: NotificationCenterList

40. Route: /[locale]/dashboard/subscription

- Access: User
- Render: Server
- APIs: GET /subscriptions/my, GET /subscriptions/my/history, GET /plans
- Components: CurrentPlanCard, UsagePanel, SubscriptionTimeline

41. Route: /[locale]/dashboard/subscription/history

- Access: User
- Render: Server
- APIs: GET /subscriptions/my/history
- Components: SubscriptionHistoryTable

42. Route: /[locale]/dashboard/checkout

- Access: User
- Render: Client checkout orchestration
- APIs: GET /auth/me, GET /plans, POST /coupons/validate, POST /payments/initiate, POST /payments/verify
- Components: CheckoutSummary, GatewaySelectorByCountry, StripeElementsForm, RedirectGatewayActions

43. Route: /[locale]/dashboard/payment/result

- Access: User
- Render: Client callback status page
- APIs: POST /payments/verify, GET /payments/my/:id
- Components: PaymentResultState

44. Route: /[locale]/dashboard/payments

- Access: User
- Render: Server
- APIs: GET /payments/my, GET /payments/my/:id
- Components: PaymentHistoryTable, InvoiceDrawer

45. Route: /[locale]/dashboard/settings/profile

- Access: User
- Render: Client form
- APIs: GET /auth/me, PATCH /auth/me
- Components: ProfileSettingsForm

46. Route: /[locale]/dashboard/settings/security

- Access: User
- Render: Client form
- APIs: PATCH /auth/me/password, POST /auth/2fa/enable, POST /auth/2fa/verify, POST /auth/2fa/disable, GET /auth/2fa/backup-codes
- Components: PasswordChangeForm, TwoFactorToggleCard, BackupCodeInfo

47. Route: /[locale]/dashboard/settings/notifications

- Access: User
- Render: Client form
- APIs: PATCH /auth/me/notification-prefs
- Components: NotificationPreferenceForm

48. Route: /[locale]/onboarding/plan-selection

- Access: User
- Render: Client wizard step
- APIs: GET /onboarding/plans, POST /onboarding/select
- Components: OnboardingPlanSelector

49. Route: /[locale]/onboarding/completion

- Access: User
- Render: Client completion state
- APIs: POST /onboarding/complete, GET /onboarding/status
- Components: OnboardingDoneCard

### Special Pages

50. Route: /[locale]/not-found

- Access: Public
- Render: Server
- APIs: none
- Components: NotFoundState

51. Route: /[locale]/error

- Access: Public
- Render: Client error boundary UI
- APIs: none
- Components: ErrorStatePanel

52. Route: /[locale]/offline

- Access: Public
- Render: Client
- APIs: none
- Components: OfflineStatePanel

53. Module-level loading skeletons

- Access: Contextual
- Render: Server/client loading files
- APIs: none
- Components: Skeleton variants per module

54. Module-level empty states

- Access: Contextual
- Render: Shared UI
- APIs: none
- Components: EmptyState variants

## Component Architecture

### Shared/Common

- Logo, LocaleSwitcher, ThemeToggle, UserAvatarMenu, CommandPalette, SearchInput, EmptyState, ErrorState, ConfirmDialog, Pagination, DataCard, StatCard, PolicyLayout, CurrencyAmount, BookCover, RatingStars
- Decision: mostly Server-compatible; interactivity wrappers as Client components

### Layout Components

- PublicTopNavbar, PublicFooter, DashboardSidebar, DashboardTopbar, MobileBottomNav, AuthLayoutShell, DashboardLayoutShell
- Decision: shells as Server components, navigation toggles as Client islands

### Feature Components

- Auth: LoginForm, RegisterForm, OAuthButtons, OTPInput
- Catalog: BookFilters, BookGrid, BookDetailMeta, ReviewComposer
- Reader: ReaderShell, ReaderToolbar, BookmarksPanel, HighlightsPanel
- Billing: PlanCards, CouponApply, GatewaySelector, StripeCheckoutForm
- Dashboard: ResumeReading, RecommendationPanel, LibraryTabs
- Settings: ProfileForm, SecurityForm, NotificationForm
- Notifications: NotificationList, NotificationActions
- Onboarding: Stepper, PlanChooser, CompletionState

## Server vs Client Rules

- Server Components for data-first pages and SEO-heavy routes
- Client Components for forms, OTP, Stripe Elements, reader interactions, optimistic mutations, real-time UI states
- RTK Query only in Client components
- Server components fetch directly via secure server helpers for initial page payloads

## Redux Store Structure

- src/store/index.ts
- src/store/hooks.ts
- src/store/baseApi.ts
- src/store/baseQueryWithReauth.ts
- src/store/features/auth/authSlice.ts
- src/store/features/auth/authApi.ts
- src/store/features/ui/uiSlice.ts
- src/store/features/reader/readerSlice.ts
- src/store/features/notifications/notificationsSlice.ts
- src/store/features/notifications/notificationsApi.ts
- src/store/features/checkout/checkoutSlice.ts
- src/store/features/catalog/catalogSlice.ts
- src/store/features/catalog/booksApi.ts
- src/store/features/catalog/authorsApi.ts
- src/store/features/catalog/categoriesApi.ts
- src/store/features/onboarding/onboardingApi.ts
- src/store/features/plans/plansApi.ts
- src/store/features/subscriptions/subscriptionsApi.ts
- src/store/features/payments/paymentsApi.ts
- src/store/features/promotions/promotionsApi.ts
- src/store/features/reading/readingApi.ts
- src/store/features/wishlist/wishlistApi.ts
- src/store/features/borrows/borrowsApi.ts
- src/store/features/reservations/reservationsApi.ts
- src/store/features/reviews/reviewsApi.ts
- src/store/features/search/searchApi.ts
- src/store/features/dashboard/dashboardApi.ts

Auth slice state fields:

- actorType, token, user, tempToken, requiresTwoFactor, onboardingStatus, isHydrated, twoFactorEnabled

UI slice state fields:

- sidebar, theme, modal, recentlyViewed, cmdkOpen

## RTK Query Strategy

- Single baseApi and feature injection per domain
- Domain tag types: Auth, Books, Authors, Categories, Plans, Subscriptions, Payments, Promotions, Reading, Wishlist, Borrows, Reservations, Reviews, Notifications, Search, Dashboard
- 401 handling in baseQueryWithReauth: clear auth state and hard redirect to /auth/login
- Avoid RTK Query in server components

## Payment Flow

1. Read country and plan context from GET /auth/me and selected plan data.
2. Bangladesh UX presents bKash/Nagad first; international UX presents Stripe/PayPal first.
3. Stripe uses inline Elements client flow.
4. SSLCommerz/PayPal style flows are redirect return flows.
5. Finalize all outcomes through POST /payments/verify and show payment result page.

## Reader Flow

- Unified /reader/[bookId] route supports PDF and EPUB formats
- Save progress on page/scroll transitions
- Support bookmarks and highlights through contextual tools
- Queue writes for offline and replay on reconnect

## Internationalization

- Locale prefix routes /en and /bn
- messages/en.json and messages/bn.json
- next-intl middleware/proxy only for locale routing, not auth

## Project Structure

- src/app/[locale]/(public)/\*
- src/app/[locale]/auth/\*
- src/app/[locale]/dashboard/\*
- src/app/[locale]/onboarding/\*
- src/app/[locale]/reader/[bookId]/page.tsx
- src/app/[locale]/not-found.tsx
- src/app/[locale]/error.tsx
- src/app/[locale]/offline/page.tsx
- src/components/common/\*
- src/components/layout/\*
- src/components/features/auth/\*
- src/components/features/catalog/\*
- src/components/features/reader/\*
- src/components/features/dashboard/\*
- src/components/features/billing/\*
- src/components/features/settings/\*
- src/components/features/notifications/\*
- src/lib/api/\*
- src/lib/auth/\*
- src/lib/i18n/\*
- src/store/\*
- src/messages/en.json
- src/messages/bn.json
- public/\*

## Environment Template (.env.local)

- NEXT_PUBLIC_APP_URL=http://localhost:3000
- NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
- NEXT_PUBLIC_FIREBASE_API_KEY=
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
- NEXT_PUBLIC_FIREBASE_APP_ID=
- NEXT_PUBLIC_DEFAULT_LOCALE=en
- NEXT_PUBLIC_SUPPORTED_LOCALES=en,bn
- SESSION_COOKIE_NAME=stackread_session
- SESSION_COOKIE_SECURE=false
- INTERNAL_API_TIMEOUT_MS=15000

## Endpoint Coverage Index (Backend Implemented)

- Auth: 21 endpoints
- Authors: 5 endpoints
- Books: 12 endpoints
- Borrows: 5 endpoints
- Categories: 5 endpoints
- Dashboard: 4 endpoints
- Health: 3 endpoints
- Members: 6 endpoints
- Notifications: 5 endpoints
- Onboarding: 4 endpoints
- Payments: 9 endpoints
- Plans: 5 endpoints
- Promotions: 13 endpoints
- RBAC: 6 endpoints
- Reading: 14 endpoints
- Reports: 6 endpoints
- Reservations: 5 endpoints
- Reviews: 6 endpoints
- Search: 5 endpoints
- Settings: 3 endpoints
- Staff: 9 endpoints
- Staff Auth: 9 endpoints
- Subscriptions: 10 endpoints
- Wishlist: 3 endpoints
- Webhooks: 1 dynamic endpoint
- Total mapped backend endpoints: 176

## Implementation Phases

### Phase 1: Foundation

- Build: Next.js setup, Tailwind v4 theme tokens, shadcn baseline, Redux foundation, auth-aware protected layout, proxy redirects, i18n skeleton
- Pages/components: base layouts, nav systems, locale switch, theme toggle, global shells
- API integrations: GET /health, GET /admin/settings/maintenance
- Dependencies: next-intl, next-themes, redux toolkit, sonner, framer-motion, shadcn
- Order: project bootstrap -> theme/i18n -> store -> layout guard -> quality baseline

### Phase 2: Auth

- Build: login/register/verify/reset/OAuth callback/2FA challenge flow
- Pages/components: all auth pages
- API integrations: /auth/\* and OAuth routes
- Dependencies: react-hook-form, zod, lucide-react
- Order: login/register -> verify/reset -> OAuth callback -> 2FA challenge -> auth hydration

### Phase 3: Public Experience

- Build: landing, catalogue, book detail, authors, categories, search, legal/static pages
- API integrations: /books, /authors, /categories, /search, /plans, /flash-sales/active
- Dependencies: motion + image optimization
- Order: landing -> catalogue -> detail pages -> search -> static pages

### Phase 4: Subscription + Checkout + Payment

- Build: pricing, checkout, payment result/history, subscription overview/history
- APIs: /plans, /subscriptions/my, /subscriptions/my/history, /coupons/validate, /payments/initiate, /payments/verify, /payments/my
- Dependencies: stripe-js, secure callback handling
- Order: pricing -> checkout -> verify callback -> payment history -> subscription views

### Phase 5: Reader (PDF + EPUB)

- Build: unified reader, progress sync, bookmarks/highlights, offline queue
- APIs: /reading/\* and /books/:bookId/bookmarks|highlights
- Dependencies: react-pdf, epub.js
- Order: reader shell -> progress -> bookmarks -> highlights -> offline queue

### Phase 6: Dashboard Operations

- Build: dashboard home, library, borrows, reservations, wishlist, reading states
- APIs: /dashboard, /borrows/my, /reservations/my, /wishlist, /reading/\*
- Order: dashboard summary -> my library -> borrows/reservations -> reading management

### Phase 7: Notifications + Settings + Profile

- Build: notification center and account settings pages
- APIs: /notifications, /auth/me, /auth/me/password, /auth/me/notification-prefs, /auth/2fa/\*
- Order: profile -> security -> notifications

### Phase 8: i18n + SEO + Tests + Deploy

- Build: full translation coverage, metadata/SEO, unit/integration tests, deploy hardening
- APIs: all integrated endpoints smoke tested
- Dependencies: vitest/testing-library
- Order: translation freeze -> SEO pass -> test pass -> release checklist

## Known Backend Inconsistencies to Track

- Some older docs mention SMS and separate bKash/Nagad webhook endpoints, while backend currently uses POST /webhooks/:gateway dynamic route.
- Older docs mention /notifications/read-all, backend currently exposes PATCH /notifications/mark-read.
- Legacy docs include /coupons/validate as authenticated user-only; backend route currently allows unauthenticated validation.
- User-flow guidance says avoid /payments/gateways/my, but backend currently exposes GET /payments/gateways/my.
- Legacy docs mention /search/popular, backend currently uses /search/popular-terms.

## Non-Negotiables

- Backend routes are the only API source of truth
- No fake/mock data
- No SMS references in user-facing flows
- Auth checks in protected layout server boundary, not proxy
- User 2FA optional and settings-driven
