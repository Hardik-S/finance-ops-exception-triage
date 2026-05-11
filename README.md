# Finance Ops Exception Triage

Finance Ops Exception Triage is a public, synthetic portfolio product for showing finance-operations judgment without pretending to detect fraud. The first slice classifies fixture transactions into review states, surfaces the evidence behind each state, and gives approval guidance for a human operator.

## Reviewer Quick Path

1. Open the production demo and read the boundary card first: the app is a review workflow, not fraud detection or payment authorization.
2. Use the top reviewer-action strip to see which synthetic transaction should be handled first and why.
3. Scan the exception summary, then inspect the transaction cards for evidence, source trail, score, and recommended next action.
4. Review the packet preview at the bottom of the page. It is the handoff artifact a finance-ops analyst could paste into a ticket or approval queue.

## Portfolio Signal

This project demonstrates a controlled workflow product instead of a generic dashboard:

- deterministic exception-state logic that can be tested;
- duplicate-candidate detection derived from fixture context, not only hand-labeled rows;
- synthetic finance operations fixtures that are safe to publish;
- evidence-first review cards and a copy-ready reviewer packet for analysts and approvers;
- explicit language that this is not real fraud detection or payment authorization.

## Stack Rationale

- Next.js App Router and TypeScript keep the web surface deployable on Vercel while leaving room for server routes later.
- Fixture-first data avoids private transaction data and keeps the repo public.
- Vitest covers the scoring and queue summary logic because that behavior is the meaningful part of the slice.
- Plain CSS is used to keep the scaffold readable and avoid adding a component library before the product needs one.
- Next `dev` and `build` use webpack because Turbopack hits a Windows path-length panic inside the required deep automation worktree.

## Local Setup

```powershell
npm ci
npm run verify
npm run dev
```

## Verification

Expected verification for this slice after the fixer quality pass:

```powershell
npm ci
npm run verify
npm audit --omit=dev --audit-level=moderate
```

The deployed page should contain `Finance Ops Exception Triage`, `No real fraud detection`, `Recommended reviewer action`, and `Reviewer packet preview`.

Audit caveat: `npm audit --omit=dev --audit-level=moderate` currently reports a moderate transitive PostCSS advisory through `next@16.2.6`. The suggested `npm audit fix --force` path downgrades to an old breaking Next version, so the project records the advisory instead of applying a destructive framework change.

Production URL: https://finance-ops-exception-triage.vercel.app

Original worker deployment: `dpl_HNc6E2U2sHqhAp98y5RwdFqBzDrn`, aliased to production on 2026-05-10.

Fixer deployment: https://finance-ops-exception-triage-bin3wdu4t-batb4016-9101s-projects.vercel.app, aliased to production on 2026-05-10 after the reviewer-packet quality pass.

## Fixture Provenance

All transactions live in `src/data/transactions.ts` and are synthetic. They model a small finance-ops export with these fields:

- submitter, vendor, cost center, memo, amount, and currency;
- receipt state: attached, partial, or missing;
- policy state: matched, unclear, or violated;
- approval history and days open;
- a duplicate signal that can also be inferred from vendor, amount, submitter, and cost-center context.

The source trail shown in the UI is deliberately narrow: it points back to fixture fields and review-state inputs, not private systems or real ledgers.

## File Map

- `src/data/transactions.ts`: synthetic transaction queue.
- `src/lib/triage.ts`: scoring, state selection, derived duplicate detection, queue summary, and reviewer packet generation.
- `src/lib/triage.test.ts`: Vitest coverage for duplicate precedence, priority ordering, state summary, normalized duplicate inference, and packet output.
- `src/app/page.tsx`: reviewer workflow surface and packet preview.
- `src/app/styles.css`: responsive layout and status styling.
- `docs/reviewer-packet.example.md`: committed example of the generated reviewer handoff packet.
- `.github/workflows/verify.yml`: GitHub Actions gate for `npm run verify` on `main`, fixer branches, and pull requests.

## Decision Log

- The repo is public because every transaction is synthetic and no credentials, personal data, bank data, or private business logic are included.
- Exception states are intentionally operational: ready for approval, needs evidence, policy review, duplicate risk, and aging escalation.
- Duplicate risk is prioritized before other states because duplicate payment prevention is a concrete finance-ops control and a useful reviewer signal.
- The product uses rule-based triage for the first slice. A model-based classifier would be premature until the deterministic workflow and approval boundary are clear.
- The fixer pass added `buildReviewQueue` so duplicate-risk rows can be derived from context before packet generation. This preserves fixture transparency while reducing reliance on pre-labeled demo rows.
- Review queues are sorted by reviewer score before rendering. This keeps the first viewport, transaction board, and packet aligned around the highest-risk synthetic exception rather than the source fixture order.
- Duplicate grouping normalizes case and whitespace because exported finance rows often include casing and spacing drift that should not hide a duplicate candidate.
- `createReviewerPacket` is intentionally plain Markdown so the handoff can be inspected in source, tested, and copied without a backend or account integration.
- The `typecheck` script disables incremental output so verification does not leave `tsconfig.tsbuildinfo` noise in the worktree.
- The app sets conservative response headers in `next.config.ts` because the demo is public and has no reason to be embedded, request device permissions, or load third-party runtime assets.

## Limitations

- This demo does not connect to accounting systems, card processors, banking APIs, or real ledgers.
- Scores are explanatory workflow signals, not fraud probabilities.
- Approval guidance is a queue-routing aid for synthetic examples, not financial advice or an authorization control.

## Next Improvements

- Add a small filter or segmented control for exception state once the UI needs interaction beyond the reviewer packet.
- Add screenshot or accessibility checks for the production route.
- Expand the synthetic queue with multi-currency edge cases only if they add workflow judgment rather than visual clutter.
