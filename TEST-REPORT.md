# v1.9 verification

- Six Firestore emulator scenarios passed: both approved Google emails authorized, wrong/unverified/provider-mismatched users denied, schema/media/private inbox protections retained.
- Mocked cloud UI regression passed: submissions/status/withdrawal, admin CRUD/publish/archive, sign-out, mobile editor and stalled-write recovery.
- Navbar/admin diagnostic test passed: mobile icon-only accessible 44px links, desktop text labels, no hero buttons, signed-in email displayed on denial, rules deployment explanation, recheck transitions to authorized work area only after server access succeeds.
- Live deployed rules/account tokens have not been inspected. Do not interpret emulator success as live sign-in verification. No production deployment or writes.

# v1.8 verification

16 Node tests passed. Chrome controlled-provider regression passed: automatic GPS/3-mile startup; immediate nearby bundled cards while provider waits; enabled radius/search controls; no spinner; rapid 5/10-mile changes without stale response overwrite; local typing; failed background refresh retains cards without the noisy warning. Three bounded provider requests observed. No live-provider uptime claim, production writes or deploy. Initial browser permission is still required where not already granted.

# v1.7

Chrome regression passed: removed cuisine/load controls; miles-triggered area loading; food and restaurant-name filtering; zero matches retain the area cards; no inner input focus outline; four responsive widths; no page errors; filtering makes no extra provider request. Controlled geolocation/provider fixtures used; no production changes. Older cuisine-specific browser scripts below are historical and superseded by simple-search-check.mjs.

# v1.6 verification

Five controlled Chrome scenarios passed (success, backup, outage, rate limit, denied location). Additional assertions verify: zero-match food/name searches preserve the cuisine-selected cards; no false match badges; absent cuisine is explicitly labelled; All cuisines restores the loaded list; filtering adds no provider request; mile changes reset downstream filters. These tests use synthetic venues, not claims about local restaurant availability. Backend/schema unchanged. No production deploy.

# v1.5 verification

- Fixed initial-load gate: radius change, cuisine change and search submission request geolocation when there is no chosen center; existing query/cuisine are preserved.
- Seven controlled Chrome scenarios passed: radius-initiated success/fallback/outage/rate-limit/permission denial, cuisine-initiated filtered results, and query-initiated filtered results. Actual UI exercised with mocked provider data and browser geolocation. No live restaurant availability claim.
- Tests retain exact radius, local-filter/no-extra-request, responsive layout and startup checks. Toolbar background restored; Near me button computed background is transparent.
- Backend, Firestore rules and menu matching unchanged from v1.4. No production deployment or writes.

# v1.4 verification

- 16 Node tests passed, including hotpot/hot pot, briyani/biryani and Burmese rice vocabulary with honest related-cuisine labels.
- Five controlled browser scenarios passed: successful GPS area load, provider fallback, outage, rate limit, permission denial. Verified zero initial cards/default area, removed shortcut/category/location-badge elements, transparent toolbar, exact 3–100-mile choices, food/name/cuisine local filtering and no extra provider calls while filtering.
- Public-page checks passed at 20 page/viewport combinations, footer links/year preserved, town picker regression passed; mobile screenshot inspected.
- Existing Firebase schema and admin code unchanged. Earlier release evidence below is historical.
- No new live-provider availability claim: the workflow uses the same public service and limitations. No production deployment or writes.

# FoodFinder v1.3 location-first verification

- 15 Node tests passed, including full 100-mile request radius, cuisine filtering and location/radius cache reuse across food queries.
- Five location-first browser scenarios passed: successful area load, fallback provider, complete provider failure, rate-limit pause and denied geolocation.
- Browser assertions cover all six exact mile choices; all-place query without cuisine constraints; food, restaurant-name and cuisine filtering with zero extra API requests; Burmese related-cuisine labels; out-of-radius exclusion; reset; a 100-mile request; and 320/390/768/1440-pixel layouts.
- Existing public browser suite passed: saved places, category/search filters, worldwide picker, cached results, map, footer links and 20 responsive page/viewport combinations.
- OBX/KDH/Kitty Hawk/NC dedicated town-picker regression passed; worldwide scope retained.
- Firestore schema/admin code unchanged from v1.2; previous security test evidence retained below.
- Public API Nashville smoke test encountered HTTP 504 at 5 miles. A second 3-mile request also returned HTTP 504; no Nashville data was invented or bundled. An unavailable provider is now distinguished from zero filter matches. The app cannot promise provider uptime or exhaustive coverage. No production deploy or database writes.

# FoodFinder v1.2 verification — October 6, 2026

## Current release

- 14 Node tests passed: prior core/data/location cases plus Burmese spelling variants, dish versus related-cuisine labels, word boundaries, radius/nearest sorting, query-specific cache keys and translated food queries.
- 6 Firestore emulator scenarios passed: existing ownership/admin protections plus backwards-compatible optional menu fields and invalid/oversized field rejection. No production writes.
- Five new browser scenarios passed with controlled location/provider responses: successful nearby search, backup provider, both providers unavailable, HTTP 429 pause without failover, and declined location. Confirmed no location request on page load, food retained after permission, actual coordinates in request, nearest ordering, out-of-radius exclusion, honest related-food badges, recovery Maps links and no mobile overflow.
- Existing public browser suite passed: directory, category filters, empty state, saved persistence, worldwide picker, cached results, map, four support links, and 20 page/viewport combinations.
- OBX/KDH/Kitty Hawk/NC regression suite passed with no external request for bundled browsing.
- Admin/contact UI mocked-transport suite passed: sign-in/out, private submission/status/withdrawal, create/publish/edit/archive, mobile editor and stalled-write recovery.
- Image conversion, unsafe SVG rejection, stale-cache recovery, local privacy deletion and future footer year regression suite passed.
- Mobile and desktop nearby-search screenshots inspected. Test venues are synthetic fixtures and are not included in the shipped directory.

Live browser request: the generated Burmese coffee query around Austin (5 km) returned HTTP 200 and 184 OSM elements from overpass-api.de. A previous request returned a non-JSON response; private.coffee timed out from this environment. The verified endpoint is first in the configured list, with private.coffee as a bounded backup. These observations are not an uptime guarantee. Public provider uptime and exhaustive menu coverage cannot be guaranteed. Production Google sign-in, live admin writes and deployment have not been performed.

---

## Prior release history (counts below refer to their release)

# FoodFinder verification — October 6, 2026

## Completed

- **7 Node tests passed:** English/diacritic/Burmese search aliases; unsafe URL/phone rejection; coordinate checks; OSM record conversion; editor validation; city disambiguation and distance; all 2,653 starter records and their city IDs/source links; correct new Firebase project and absence of paid Places/Analytics in active code.
- **5 Firestore emulator security scenarios passed:** both approved Google admins; anonymous published-only reads with a query cap; rejection of unverified/wrong-provider/other-user/stale-session writes; schema and revision checks; archive visibility; bounded WebP media and atomic parent/media creation; private inbox ownership, pending limit, review and withdrawal. Tests used `demo-foodfinder-security`, not the production database.
- **Browser functional checks passed:** initial no-search directory, four category filters, name search and empty state, favorites surviving reload, safe detail links, worldwide city picker, cached live results, map markers, Stripe link presence and current-year footer.
- **Responsive checks passed:** public home, Privacy, Terms, Contact and Admin at 320, 390, 768 and 1440 pixels, with no horizontal overflow. Long connection-error messages and file controls were checked on mobile.
- **Cloud UI flows passed with mocked transport:** sign in/out, submit, check status, delete own note, admin create/publish/edit/archive, and delayed-write recovery without losing typed fields or disabling account/status controls. These checks exercise the real UI without writing test content to production.
- **Media and recovery checks passed:** local PNG/JPEG/TIFF/plain SVG conversion; rejection of scripted/external-reference SVG; older local results retained on failed refresh; clearing FoodFinder browser data; footer advancing to 2031 under a test clock. TIFF decoding was verified through the actual worker in the rebuilt app.
- **Real network smoke test:** the exact live query ran from a local Chrome browser against `https://overpass-api.de/api/interpreter` and returned **296 named places within 3 km of the Yangon test center**. This confirms one successful real browser request, not permanent availability or worldwide completeness. Other provider requests during preparation returned 406/504/timeouts; fallback and explicit failure messages are included for this reason.
- Desktop/mobile home and results were visually inspected. Native SVG illustrations were used; no stock photo was presented as a real restaurant photo.

## Limits of this verification

Production Google account sign-in, deployed Firestore indexes/rules, Firebase Console provider/domain settings, and the owner's Google account security settings require the owner's setup. No production deploy, database mutation, email, Stripe payment or refund was performed. Private messages intentionally go to the on-site admin inbox; this project has no automatic email-notification backend.

Browser cloud mocks verify UI behavior; emulator rules verify authorization. Neither substitutes for a final sign-in/publish/check on the deployed project after setup. Other countries' live coverage depends on OpenStreetMap and provider availability. Bundled data is a dated snapshot, not confirmation that venues remain open.

## Reproduce

See `README.md` and `SETUP-MM.md`. `npm test` runs core/data tests. `npm run test:rules` runs the isolated Firestore emulator checks. The three `tests/*check.mjs` files test browser flows with local mock responses. Point `FOOD_URL` at your local preview and supply Playwright/Chromium as documented.

## v1.1 USA / Outer Banks regression

The earlier city base excluded towns below the cities15000 threshold. The main food-name input also did not search the location index. Both issues were fixed, and state/area abbreviations now have explicit meaning.

- 11 Node core/data/location tests pass, including lowercase/dotted KDH, OBX/Outer Banks, Kitty Hawk/Kittyhawk, NC/N.C./North Carolina, state filtering (not substring matches), USA scope, retained worldwide scope, and excluding region-only records from the admin city picker.
- The added USA dataset contains 21,785 city/town records; combined with the worldwide base there are 52,530 location records plus the editorial OBX area shortcut. Population thresholds still mean some smaller settlements are absent.
- Nine Outer Banks starter samples contain 173 distinct OSM elements after ID deduplication. Across all 17 starter samples there are 2,831 entries (overlapping town samples can share an OSM element).
- A real Chrome request to the configured public Overpass provider returned 29 named food places within 3.5 km of the Kill Devil Hills center. Provider failures were also observed; the dated starter data remains available independently of that provider.
- Browser regression passed for the user's four exact queries in both the main search and location picker, click-to-select location suggestions, clearing an old food query when changing towns, NC town selection, mobile layout, Escape-to-close and the retained Worldwide option. No external provider request was needed to browse the packaged OBX towns.
- Existing public browser regression (20 page/viewport combinations) and cloud UI mock tests passed after the location changes. The admin still selects a real city/town, not the multi-town area alias.
- Public combined-area Firestore queries were added to emulator authorization checks; rules and indexes were not broadened.

The v1.1 work changes local project files only. No live deployment or production data edit was performed. A hosting-only deploy updates an already configured v1 installation.
