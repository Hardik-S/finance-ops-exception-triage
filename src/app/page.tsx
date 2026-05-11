import { transactions } from "../data/transactions";
import {
  buildReviewQueue,
  createReviewerPacket,
  type ExceptionState,
  summarizeQueue
} from "../lib/triage";

const stateLabels: Record<ExceptionState, string> = {
  "ready-for-approval": "Ready for approval",
  "needs-evidence": "Needs evidence",
  "policy-review": "Policy review",
  "duplicate-risk": "Duplicate risk",
  "aging-escalation": "Aging escalation"
};

export default function Home() {
  const results = buildReviewQueue(transactions);
  const summary = summarizeQueue(results);
  const packet = createReviewerPacket(results);
  const topCase =
    results.length > 0
      ? results.reduce((current, result) => (result.score > current.score ? result : current))
      : undefined;

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Synthetic finance operations workflow</p>
          <h1>Finance Ops Exception Triage</h1>
          <p className="lede">
            A fixture-backed review board that classifies transaction exceptions into explainable
            states, shows the evidence behind each queue decision, and keeps approval guidance
            separate from fraud-detection claims.
          </p>
        </div>
        <div className="boundary">
          <span>Boundary</span>
          <strong>No real fraud detection</strong>
          <p>Rules support human review of synthetic finance exceptions only.</p>
        </div>
      </section>

      <section className="reviewPath" aria-label="Reviewer quick path">
        <article>
          <span>Top reviewer action</span>
          <strong>{topCase?.transaction.id ?? "No open exceptions"}</strong>
          <p>{topCase?.reviewerAction ?? "No reviewer action is needed for an empty queue."}</p>
        </article>
        <article>
          <span>Fixture provenance</span>
          <strong>Synthetic ledger export</strong>
          <p>Each row carries receipt, policy, approval, owner, and age signals.</p>
        </article>
        <article>
          <span>Handoff boundary</span>
          <strong>Review packet only</strong>
          <p>No approvals, payments, real ledgers, or fraud claims are automated.</p>
        </article>
      </section>

      <section className="summary" aria-label="Exception summary">
        {Object.entries(stateLabels).map(([state, label]) => (
          <article key={state}>
            <span>{label}</span>
            <strong>{summary[state as ExceptionState]}</strong>
          </article>
        ))}
      </section>

      <section className="board" aria-label="Transaction exceptions">
        {results.map((result) => (
          <article className="case" key={result.transaction.id}>
            <div className="caseHeader">
              <div>
                <p>{result.transaction.id}</p>
                <h2>{result.transaction.vendor}</h2>
              </div>
              <span className={`status ${result.state}`}>{stateLabels[result.state]}</span>
            </div>
            <div className="caseMeta">
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: result.transaction.currency
                }).format(result.transaction.amount)}
              </span>
              <span>{result.transaction.costCenter}</span>
              <span>{result.transaction.daysOpen} days open</span>
            </div>
            <p className="memo">{result.transaction.memo}</p>
            <div className="evidence">
              <h3>Evidence</h3>
              <ul>
                {result.evidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="guidance">
              <span>Score {result.score}</span>
              <p>{result.guidance}</p>
            </div>
            <div className="reviewerAction">
              <span>Recommended reviewer action</span>
              <p>{result.reviewerAction}</p>
            </div>
            <div className="sourceTrail">
              <span>Source trail</span>
              <p>{result.sourceTrail.join(" -> ")}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="packet" aria-label="Reviewer packet preview">
        <div>
          <p className="eyebrow">Reviewer packet preview</p>
          <h2>Copy-ready exception handoff</h2>
          <p>
            The packet keeps queue evidence, reviewer actions, and the no-fraud-detection boundary
            together so the demo reads as an approval workflow, not a magic classifier.
          </p>
        </div>
        <pre>{packet}</pre>
      </section>
    </main>
  );
}
