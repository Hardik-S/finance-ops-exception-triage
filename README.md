# Finance Ops Exception Triage

Finance Ops Exception Triage is a public, synthetic portfolio product for showing finance-operations judgment without pretending to detect fraud. The first slice classifies fixture transactions into review states, surfaces the evidence behind each state, and gives approval guidance for a human operator.

## Portfolio Signal

This project demonstrates a controlled workflow product instead of a generic dashboard:

- deterministic exception-state logic that can be tested;
- synthetic finance operations fixtures that are safe to publish;
- evidence-first review cards for analysts and approvers;
- explicit language that this is not real fraud detection or payment authorization.

## Stack Rationale

- Next.js App Router and TypeScript keep the web surface deployable on Vercel while leaving room for server routes later.
- Fixture-first data avoids private transaction data and keeps the repo public.
- Vitest covers the scoring and queue summary logic because that behavior is the meaningful part of the slice.
- Plain CSS is used to keep the scaffold readable and avoid adding a component library before the product needs one.

## Local Setup

```powershell
npm install
npm run test
npm run build
npm run dev
```

## Verification

Expected verification for this slice:

```powershell
npm run test
npm run build
```

The deployed page should contain `Finance Ops Exception Triage` and the `No real fraud detection` boundary copy.

## Decision Log

- The repo is public because every transaction is synthetic and no credentials, personal data, bank data, or private business logic are included.
- Exception states are intentionally operational: ready for approval, needs evidence, policy review, duplicate risk, and aging escalation.
- Duplicate risk is prioritized before other states because duplicate payment prevention is a concrete finance-ops control and a useful reviewer signal.
- The product uses rule-based triage for the first slice. A model-based classifier would be premature until the deterministic workflow and approval boundary are clear.

## Limitations

- This demo does not connect to accounting systems, card processors, banking APIs, or real ledgers.
- Scores are explanatory workflow signals, not fraud probabilities.
- Approval guidance is a queue-routing aid for synthetic examples, not financial advice or an authorization control.
