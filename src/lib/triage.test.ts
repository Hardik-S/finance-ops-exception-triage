import { describe, expect, it } from "vitest";
import { transactions } from "../data/transactions";
import { summarizeQueue, triageTransaction } from "./triage";

describe("triageTransaction", () => {
  it("prioritizes duplicate risk ahead of otherwise clean evidence", () => {
    const duplicate = transactions.find((item) => item.id === "TX-1140");

    expect(duplicate).toBeDefined();
    const result = triageTransaction(duplicate!);

    expect(result.state).toBe("duplicate-risk");
    expect(result.evidence.join(" ")).toContain("Duplicate signal");
    expect(result.score).toBeGreaterThanOrEqual(35);
  });

  it("separates approval-ready rows from rows needing evidence", () => {
    const ready = triageTransaction(transactions[0]);
    const evidenceGap = triageTransaction(transactions[1]);

    expect(ready.state).toBe("ready-for-approval");
    expect(evidenceGap.state).toBe("needs-evidence");
  });

  it("summarizes every canonical exception state for the dashboard", () => {
    const summary = summarizeQueue(transactions.map(triageTransaction));

    expect(summary["ready-for-approval"]).toBe(1);
    expect(summary["needs-evidence"]).toBe(1);
    expect(summary["policy-review"]).toBe(1);
    expect(summary["duplicate-risk"]).toBe(1);
    expect(summary["aging-escalation"]).toBe(1);
    expect(summary.totalScore).toBeGreaterThan(0);
  });
});
