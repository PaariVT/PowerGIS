# PowerGIS UI Redesign & Security Review

Review date: 17 November 2026  
Reviewed release: 3.42.0  
Scope: React/TypeScript UI, authentication flow, simulator mode, role presentation, global styling, offline queue and existing static checks.

## 1. Changes applied

### Application-wide UI refresh
- Replaced the neutral-only design tokens with a navy, electric-blue, cyan and teal palette, with semantic green/amber/red/violet accents.
- Added a shared enterprise visual layer for the application shell, header, sidebar, navigation states, scope banner, dashboard cards, tables, search controls, form focus states, scrollbars and mobile layouts.
- Added clearer typography hierarchy, softer card elevation, consistent rounded corners, subtle gradients and visible focus indicators.
- Added reduced-motion support and safe-area handling for mobile devices.
- Updated the login portal background and surface styling.
- Updated shared theme gradient tokens and navigation category accent colours.

### Functional fixes
- Fixed the global asset-search field opening the command palette on focus, which prevented normal search interaction.
- Hid the simulator switch in production builds where the simulator is not supported.
- Restricted demo persona login and identity switching to development builds without a configured Supabase backend.
- Restricted simulator state restoration and event-driven activation; stale localStorage simulator flags are removed when the current build must not use simulator mode.
- Changed unknown/malformed role fallback from Super Administrator to read-only Auditor, following least-privilege behaviour.

### Regression protection
- Added `scripts/ui_security_audit.mjs` and `npm run audit:ui-security`.
- Updated existing static tests to assert the new fail-closed simulator guard rather than the removed hardcoded bypass.
- Added the new UI security audit to `npm run test:static`.

## 2. Security findings and status

| Finding | Priority | Status |
|---|---:|---|
| Demo persona authentication contained hardcoded development and backend overrides in the auth context | Critical | Fixed |
| Login page contained a hardcoded demo-access override and exposed demo entry points in production | Critical | Fixed |
| Simulator mode could be restored from browser storage without checking the current build/backend mode | High | Fixed |
| Unknown role values could inherit Super Administrator presentation permissions | High | Fixed; unknown roles now fail closed to Auditor |
| Simulator toggle could be displayed in a production build with no configured backend, despite activation being blocked | Medium | Fixed |
| Asset search focus opened the command palette instead of allowing direct search | Medium | Fixed |
| Offline mutation records are not explicitly partitioned by authenticated user identity | High | Follow-up required |
| Offline operational payloads are stored in browser IndexedDB and should be treated as sensitive device data | High | Follow-up required |
| Live database RLS, cross-jurisdiction isolation and authenticated workflow behaviour require staging verification | Critical release gate | Not verifiable from this source-only review |

## 3. Important security recommendations still required

### P0 — Before production release
1. Bind every queued offline mutation to the authenticated Supabase user ID at the time it is created. Before replay, verify that the active user matches the recorded owner. Quarantine or require an explicit administrator workflow for mutations created by a different account. Do not replay User A's pending actions as User B.
2. Review all Supabase RLS policies using real authenticated accounts for every role and jurisdiction. Test both allowed and denied operations, including direct REST/RPC calls that bypass the UI.
3. Verify that service-role keys and other privileged secrets exist only in server-side Edge Function secrets. The browser must contain only the public/publishable key.
4. Validate the production Supabase profile role against an explicit allow-list before creating a client session. Unknown roles should be rejected or assigned a non-privileged state.
5. Perform a physical-safety review of SCADA command boundaries. No UI action should imply that a physical breaker operation succeeded unless a secured gateway confirms it and all required interlocks are independently verified.

### P1 — Data protection and operational resilience
1. Define offline-data retention, device logout behaviour, shared-device handling and secure deletion for IndexedDB records. Minimize sensitive payload fields and assess encryption-at-rest requirements for field devices.
2. Ensure the offline replay queue cannot mix users, tenants, regions or jurisdictions. Add tests for account switching while pending, failed and blocked operations exist.
3. Add automated browser tests for login, password recovery, keyboard navigation, responsive navigation, tables, dialogs, map interactions and offline/online transitions.
4. Add rate limiting and monitoring at the server/API boundary for authentication and high-impact mutations.
5. Review exported CSV/GeoJSON and downloaded evidence for jurisdiction leakage and unintended personal information.

### P2 — UI and product quality
1. Add a shared component library for buttons, status badges, metric cards, page headers, data tables, filters, dialogs, form fields and empty/loading/error states. Migrate module-by-module to reduce inconsistent legacy markup.
2. Add a theme preference (light/dark) and persist it safely as a presentation preference only.
3. Add saved table views, column visibility, advanced filters and export confirmation for large operational tables.
4. Add accessible chart summaries, keyboard-operable map controls, visible focus order and screen-reader labels.
5. Add a consistent audit timeline and action confirmation pattern for approvals, PTW, fault transitions, inventory and work orders.
6. Add visual regression screenshots at desktop, tablet and mobile breakpoints.

## 4. Verification performed

- TypeScript/TSX transpile syntax check: 155 source files passed with zero syntax diagnostics.
- UI/security static regression audit: 8/8 checks passed.
- Existing static regression suite: 21/21 passed.
- Release-readiness audit: 23 migrations checked; 2 PWA icons checked; zero failures and zero warnings.
- Platform static audit: zero failures. It reports that `node_modules` is absent, so a full application type-check and Vite production build were not run.

## 5. Verification limitations

This was a source-code and static-test review. It is not a penetration test and does not prove production security. No live Supabase project, authenticated cross-role test accounts, browser automation environment or physical SCADA gateway was available. The offline queue's user-identity binding and live RLS verification remain explicit production gates.
