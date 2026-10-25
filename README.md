# Endcap

A private field school for retail management.

The goal of Endcap is to let you walk into a grocery store, warehouse club, department store or convenience store and explain **why it operates the way it does**: a $5 digital coupon, an endcap display, a staffing pattern, a checkout line, a store layout. It is a sibling of [Lyceum](https://github.com/galaxyhockey/gxylycium) and is built the same way. It is static files plus optional Firebase sync. With no setup it saves to browser storage. There is no build step.

It is hosted on GitHub Pages at `https://galaxyhockey.github.io/gxyretail/`. To run it locally, serve the folder with `python3 -m http.server 8080` and open `http://localhost:8080`. Opening `index.html` straight from disk will not work, because browsers block modules on `file://`. `START-HERE.txt` and `DEPLOY-GITHUB-PAGES.txt` have the step-by-step setup.

## The look

The design is "shelf and tag."
- **Colors and type:** a cool store-floor ground, white shelving cards, and a navy night-aisle masthead edged with a yellow shelf rail. Course codes look like shelf tags, price-tag red is the action color, and register-display numerals are used for anything counted.
- **Recurring elements:** the question of the day is a till receipt, the "in the store, ask" prompt is a shelf tag, and the labs read out on a register display.
- **Themes:** light and dark follow your device by default. Settings → Appearance can force either one.

---

## The program

```
Stage 1 · Foundations
  RTL 101  How Retail Makes Money          5 units   formats, the P&L, margin vs turns, break-even
  RTL 201  The Shopper                     5 units   decisions, missions, heuristics, segments, atmosphere
Stage 2 · The commercial toolkit
  RTL 211  Price                           6 units   markup/margin, elasticity, EDLP vs Hi-Lo, psych pricing, loss leaders, markdowns
  RTL 221  Promotions, Coupons & Loyalty   5 units   lift & incrementality, vendor funding, digital coupons, loyalty, retail media
  RTL 301  Merchandising & Category Mgmt   5 units   assortment, category roles, private label, planograms, displays
Stage 3 · Running the store
  RTL 311  The Store: Location & Layout    5 units   trade areas (Huff), layouts, shopper path, checkout queues, space productivity
  RTL 321  Inventory & the Supply Chain    5 units   turns, reorder points, out-of-stocks, DCs & bullwhip, shrink & omnichannel
  RTL 331  Operations, Labor & Service     4 units   labor scheduling, the good-jobs strategy, SERVQUAL, store execution
Stage 4 · Management
  RTL 401  Retail Analytics & Decisions    5 units   KPI tree, basket affinity, test vs control, mix effects, forecasting
  RTL 411  Strategy & Competition          5 units   generic strategies, wheel of retailing, competing with giants, tech, capstone teardown
```

That is 50 units, 186 multiple-choice questions and 296 vocabulary terms.

**Every unit** has a goal, a lesson in plain English, an "in the store, ask" prompt, key terms, the math with worked numbers where it matters, a case, an embedded lab where one fits, a field observation you can file to your notebook, a check question, a quick quiz, readings, and notes. Each case is labelled either **Factual case, sourced** or **Hypothetical, invented for teaching**.

**Every course** ends with a graded **assignment** (numeric answers checked with a tolerance, multiple choice, and written answers you compare against a model answer), a **course review quiz**, and a **field assignment**: a structured report you file after visiting real stores.

## The interactive parts

- **Question of the day.** One question a day, drawn from the units you have opened, the same on every device for that day. A question you miss comes back two days later, and a missed retry comes back three days after that. Wrong answers on unit and course quizzes go into the same retry queue. The Console shows your streak, a 14-day strip and your accuracy. A bonus question is always available but does not count toward the streak.
- **Review deck.** Leitner spaced repetition (boxes at 1/2/4/9/21 days) built from the check questions and vocabulary of every unit you have opened. Sessions take up to 20 mixed cards, and missed cards come round again in the same session.
- **18 labs:** markup ↔ margin, store P&L, turns/GMROI, break-even, membership-club model, elasticity, an 8-week pricing simulation with a hidden demand curve, promotion evaluator, digital-coupon economics, loyalty economics, shelf-space reallocation, Huff model, checkout staffing (Erlang C), reorder point/newsvendor, labor productivity, KPI tree, basket affinity, and difference-in-differences.
- **Field kit**, built for a phone: a multi-counter tally with rate per hour, a queue timer (wait and service times), a two-store price audit that computes price indexes for KVIs and for all items, and a unit-price checker.
- **Field notebook.** Holds unit observations, kit snapshots, kept daily questions and filed reports. Export it as Markdown.
- **Transcript.** Units done, quiz and assignment bests, and field reports per course.
- **Reference.** A searchable glossary, a formula sheet, a case file (filter factual or hypothetical), and a library of every source with the units that cite it.

## Sources and integrity

The lessons are original writing. The primary text is Lumen Learning's open *Retail Management* ([LibreTexts](https://commons.libretexts.org/book/biz-44956)). Supplemental sources are OpenStax *Principles of Marketing* (chapters 3, 5, 12, 15, 17, 18), Saylor's open marketing text, a second LibreTexts retail text, U.S. government data (Census retail and e-commerce, BLS, USDA ERS, the FTC pricing guides and slotting study, NIST), Costco's 10-K, trade press for Schnucks' Tally robots and Schnucks Rewards, and peer-reviewed research on elasticity, promotions, price endings, choice overload, out-of-stocks, shelf space, waiting lines and service quality. The whole list is in `assets/content/sources.js` and on the Library tab.

Figures are dated to their source, for example FMI's roughly 1.6% grocery net margin for 2023, Census's roughly 16% e-commerce share for 2025, and Costco's FY2024 membership fees. Shaky retail folklore is called out as such, including the jam study's replication problems and the beer-and-diapers story.

## Files

```
index.html                UI shell
sw.js                     service worker (endcap-* caches only)
manifest.webmanifest
firebase.json, firestore.rules, firestore.indexes.json, .firebaserc
.nojekyll                 GitHub Pages serves every file as-is
icons/                    the shelf-tag mark
assets/
    config.js             ← the only file you must edit: Firebase config, UID lock, masthead text
    store.js              Firebase/localStorage persistence (users/{uid}/endcap/*, or endcap:* keys)
    app.js                router, console, program, assignments, field, reference, settings
    labs.js               the 18 labs
    fieldkit.js           tally, queue timer, price audit, unit price
    pwa.js, style.css
    content/
      index.js            course order and stages
      sources.js          the library
      r101.js … r411.js   one file per course
```

## Adding content

- **A unit:** append to a course's `units` array in `content/rNNN.js`. The fields are `n, title, sub, goal, body[], ask, terms[], math?, kase{kind:'fact'|'hypo'}, field, lab?, check, qs[], read[]`. Its questions join the daily pool and its check and terms join the review deck automatically.
- **A course:** write `content/rNNN.js` in the same shape (with `assign`, `field`, `quiz`), import it in `content/index.js`, add it to a stage, and add the file to `SHELL_FILES` in `sw.js`.
- **A source:** add a key to `SRC` in `sources.js` and to a group in `SRC_GROUPS`, then cite it by key.
- **A lab:** add an entry to `LABS` in `labs.js` (most labs are a `calc()` spec) and reference its `id` from a unit's `lab`.

Bump `VERSION` in `sw.js` when you change shell files so installed copies update.

## Sign-in and the lock

Endcap ships in **local-only mode**: no sign-in, and everything is saved in the browser under `endcap:` keys. To sync across devices:

1. Paste a Firebase web config into `assets/config.js`. You can reuse Lyceum's Firebase project, because Endcap stores its data under `users/{uid}/endcap` and never touches Lyceum's `users/{uid}/data`.
2. Add `galaxyhockey.github.io` to Firebase Authentication → Settings → Authorised domains, if it is not there already.
3. Sign in once. A red banner says the deployment is unlocked. **Settings → Access and storage** shows your UID and generates the `ALLOWED_UIDS` block and a pinned `firestore.rules` file, each with a copy button.
4. Commit `assets/config.js` and push. Then publish the rules: paste them in Firestore → Rules, or run `firebase deploy --only firestore:rules`.

If the Firebase project is shared with Lyceum, one pinned rules file covers both schools.

## Moving from the Lyceum copy

Endcap first lived at `gxylycium/retail/`. Both URLs are on the same origin (`galaxyhockey.github.io`), so local-only progress saved there under `endcap:` keys shows up here automatically in the same browser. For another device, or to be safe, use Settings → Export backup on the old copy and Import backup here.
