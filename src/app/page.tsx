import { transactions } from "../data/transactions";
import { summarizeQueue, triageTransaction } from "../lib/triage";

const stateLabels = {
  "ready-for-approval": "Ready for approval",
  "needs-evidence": "Needs evidence",
  "policy-review": "Policy review",
  "duplicate-risk": "Duplicate risk",
  "aging-escalation": "Aging escalation"
};

export default function Home() {
  const results = transactions.map(triageTransaction);
  const summary = summarizeQueue(results);

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

      <section className="summary" aria-label="Exception summary">
        {Object.entries(stateLabels).map(([state, label]) => (
          <article key={state}>
            <span>{label}</span>
            <strong>{summary[state as keyof typeof stateLabels]}</strong>
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
          </article>
        ))}
      </section>
    </main>
  );
}
