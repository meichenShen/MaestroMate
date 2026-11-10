# Anonymous in-site feedback

> Continue inline under superpowers:executing-plans; one fresh bounded final review. The user's request authorizes implementation and the existing public update workflow.

**Goal:** Replace the GitHub-issue feedback link with a genuine account-free form whose notes are privately available to the owner; label the separate GitHub destination clearly.
**Design:** Existing English black/cyan design, native modal with message(required,1–2000 characters), type and optional reply email. Submit only shows success after durable server acknowledgement. Preserve draft on failure; same-payload retries are idempotent. Footer says “Say hello on GitHub”. No automatic mail or public feedback list.
**Architecture:** Retain React/Vite and all music code. Add a small standard Worker and a Sites D1 binding, using generated schema-only Drizzle migrations. Build client into dist/client and bundle Worker into dist/server/index.js; mirror the official Sites metadata/migration staging contract. Owner reads the feedback table in Sites Settings or via existing native read_database tools; never put feedback in GitHub/localStorage.

## Interfaces / constraints
- Public form uses same-origin API, no visitor account. Anonymous short-lived capability uses an opaque bearer in a custom request header (no ambient cookies/login); POST validates origin, token, schema and body size. Session issuance also requires a same-origin custom header, so cross-site forms cannot submit. No public read endpoint. Parameterized SQL, bounded per-session/global intake; no IP collection, attachment upload or third-party form service.
- Preserve one audio provider, routes, palette, research/history and feature branch. Homepage modal suspends settling; Escape/close restores opener focus. Source/build files stay separate; local database and artifacts remain ignored.
- D1 schema generated then committed; migrations applied by Sites before Worker upload, never CREATE/ALTER on requests. No prior D1 binding in tracked manifest; inspect native overview before provisioning. Retain project_id/public audience.
- Current cloud policy still blocks the production hostname (CONNECT403), and no browser-control/request_changes tool exists. Do not bypass it or call a successful local simulation “live delivery”. Complete all authorized work; use native migration/data inspection, and identify any remaining production-write verification limit honestly.

## Steps / gates
1. RED form tests: clicking feedback stays on-site, labels/keyboard/focus, submission success only after acknowledgement, failure retains note, pending/duplicate behavior, GitHub destination label. Implement isolated FeedbackEntry and styles.
2. RED Worker/D1 tests against actual SQLite: validation, CSRF/session expiry, no public reads, idempotent exact retries, rejected key conflicts, bounded body/rate and database failures. Add schema and generated migration, small request handlers, parameterized transaction. Implement private owner retrieval guide.
3. Integrate Worker/client packaging and source helper. Real local HTTP + persistent SQLite browser test proves actual write and durable reload independent of the browser; preserve all existing frontend regressions. Unit/build/full browser suite, one final review, fix Important findings with RED→GREEN, publish exact-source same project, inspect native DB schema and verify live write if supported access becomes available.

## Review focus
- Anonymous POST cannot expose feedback or mutate other rows; contact information never enters public response/log/bundle.
- Timeout/retry/edited drafts cannot lose notes, duplicate submissions or show a false success.
- Native dialog dismissal while pending and reopening does not race a late result; no keyboard/snap regression.
- Client assets/audio still load with correct content type/ranges after static-to-Worker migration.
- Hosted D1 migrations/manifest/asset binding match packaged source and local QA is clearly distinguished from live data.

## Ledger
Pre-flight: existing build/static helper must become Worker-aware, not scaffold a second website. Official openai/sites source at7eb9d4b9cf93ad7e64aebc8a5ca70e29ec2cfb94 confirms d1 is a logical string binding and migration staging is dist/.openai/drizzle. No new account/AI or notification service. Current request supersedes the early no-database demo scope only for feedback persistence.

Implementation: API RED (missing module) and UI RED (footer had an external link) observed before implementation. Five feedback API contracts now pass against migrated SQLite; browser submission is independently read from the persistent local database. Failure/dismissal tests preserve drafts and require matching acknowledgement. A portal prevents homepage heading CSS leaking into the native modal. Existing music/browser regressions are running against the real built Worker preview.

One fresh final review (gpt-6-astra/high, bounded, read-only) found no Critical/Important. It independently passed the API tests and whitespace check. Its optional staging-cleanup note was applied: clear the generated dist/.openai/drizzle directory before copying migrations. No repeated review loop. Live production delivery is still a separate verification gate subject to the documented managed-network constraint.

Final gate:20 unit tests and all15 browser script groups passed against the frozen final Worker/client build. Server restart retained local feedback; desktop/mobile modal screenshots inspected. Published Sites v10 to the same public URL; deployment succeeded and native D1 inspection confirmed both tables and an empty seven-column feedback table. Anonymous production HTTP remains blocked (CONNECT403), so live write verification remains explicitly unverified. Source/deployment provenance is in web/VERIFICATION.md. No runtime change after packaging.
