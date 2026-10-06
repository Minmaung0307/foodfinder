**v1.9.1:** Restored the working Use my location and Choose a town hero buttons. Mobile navbar and admin improvements remain. Deploy hosting only if v1.9 rules were already deployed.

**Current: v1.9.** Read [ADMIN-MOBILE-MM.md](ADMIN-MOBILE-MM.md). Deploy Hosting AND Firestore rules for admin access.

**Current: v1.8.** See [AUTO-NEARBY-MM.md](AUTO-NEARBY-MM.md). Automatic location startup, immediate local/cache results and non-blocking background refresh.

**Current: v1.7.** See [SIMPLE-CONTROLS-MM.md](SIMPLE-CONTROLS-MM.md). Cuisine selector and redundant load button removed.

**Current: v1.6.** See [FILTER-STEPS-MM.md](FILTER-STEPS-MM.md). Zero-match text searches retain the cuisine-selected list; mile changes reset downstream filters.

**Current: v1.5.** See [START-SEARCH-MM.md](START-SEARCH-MM.md) for the initial-search fix and corrected button styling.

**Current version: v1.4.** Read [SIMPLE-SEARCH-MM.md](SIMPLE-SEARCH-MM.md) for the simplified location-first interface. No default location or shortcut chips.

> **v1.3 update:** လက်ရှိ နေရာအရင်ရွေးပြီး local filter သုံးနည်းကို [AREA-SEARCH-MM.md](AREA-SEARCH-MM.md) တွင်ဖတ်ပါ။ အောက်ပါ v1.2 food-query flow ကို အစားထိုးထားပါသည်။

# FoodFinder v1.2 — Nearby food search

A mobile-first food directory with instant category browsing, a worldwide city picker, bounded free OpenStreetMap searches, saved places, optional maps, directions and a secure Firebase admin inbox/editor.

**Start with [SETUP-MM.md](SETUP-MM.md)** for Burmese setup and usage instructions. The configured Firebase project is **foodfinder-mm**.

No build step. Only `public/` is hosted. Keep the Firestore rules/indexes and `.firebaserc` with the project. Never deploy `legacy/` or `data-sources/` as your web root.

```sh
npm start
npm install
npm test
npm run test:rules
```

Browser checks are in `tests/*check.mjs`; install Playwright separately or set `PLAYWRIGHT_MODULE` and `CHROME_PATH` to your local installations. Run a local server at port 8767, or set `FOOD_URL`. Screenshot tests write to a `work/` folder; create it first when running outside the development workspace.

Review [DATA-LICENSE.md](DATA-LICENSE.md) and [TEST-REPORT.md](TEST-REPORT.md). There are no production writes, paid API calls, deployments or payment transactions in the test suite. Firestore tests use a `demo-` emulator project.

Location search supports OBX, KDH, Kitty Hawk and US postal state abbreviations in both the main search and city picker. USA towns are the default picker scope; Worldwide remains available. `python3 scripts/update-cities.py` refreshes both the worldwide base and USA small-town supplement.

See [NEARBY-FOOD-MM.md](NEARBY-FOOD-MM.md) for Burmese dish search, geolocation, match labels, menu editing and the v1.2 deployment command. Deploy both Hosting and Firestore rules for the optional menu fields.
