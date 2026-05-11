import { describe, expect, it } from "vitest";
import { transactions } from "../data/transactions";
import { buildReviewQueue, createReviewerPacket, summarizeQueue, triageTransaction } from "./triage";

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

  it("derives duplicate risk from transaction context instead of trusting a pre-labeled row", () => {
    const contextualRows = transactions.map((transaction) => ({
      ...transaction,
      duplicateSignal: false
    }));

    const queue = buildReviewQueue(contextualRows);
    const derivedDuplicate = queue.find((result) => result.transaction.id === "TX-1140");

    expect(derivedDuplicate?.state).toBe("duplicate-risk");
    expect(derivedDuplicate?.evidence.join(" ")).toContain("Duplicate candidate");
    expect(derivedDuplicate?.transaction.duplicateSignal).toBe(false);
    expect(derivedDuplicate?.derivedSignals.inferredDuplicate).toBe(true);
  });

  it("creates a reviewer packet with boundary, next action, and source evidence", () => {
    const queue = buildReviewQueue(transactions);
    const packet = createReviewerPacket(queue);

    expect(packet).toContain("Finance Ops Exception Triage");
    expect(packet).toContain("No real fraud detection");
    expect(packet).toContain("Recommended reviewer action");
    expect(packet).toContain("TX-1140");
  });

  it("orders the review queue by highest reviewer risk first", () => {
    const queue = buildReviewQueue(transactions);

    expect(queue.map((result) => result.transaction.id)).toEqual([
      "TX-1167",
      "TX-1119",
      "TX-1140",
      "TX-1088",
      "TX-1042"
    ]);
  });

  it("orders the packet follow-up list by reviewer priority", () => {
    const packet = createReviewerPacket(buildReviewQueue(transactions));

    expect(packet.indexOf("TX-1167")).toBeLessThan(packet.indexOf("TX-1119"));
    expect(packet.indexOf("TX-1119")).toBeLessThan(packet.indexOf("TX-1140"));
  });

  it("normalizes duplicate keys across casing and whitespace drift", () => {
    const queue = buildReviewQueue([
      {
        ...transactions[0],
        vendor: " Northstar   Travel Desk ",
        submittedBy: " AVERY chen ",
        costCenter: "Revenue   Ops",
        duplicateSignal: false,
        approvalHistory: "manager"
      },
      {
        ...transactions[3],
        vendor: "northstar travel desk",
        submittedBy: "avery chen",
        costCenter: "revenue ops",
        duplicateSignal: false,
        approvalHistory: "none"
      }
    ]);

    expect(queue[0].transaction.id).toBe("TX-1140");
    expect(queue[0].state).toBe("duplicate-risk");
    expect(queue[0].derivedSignals.inferredDuplicate).toBe(true);
  });

  it("includes every evidence line for multi-rule packet cases", () => {
    const packet = createReviewerPacket(buildReviewQueue(transactions));

    expect(packet).toContain("TX-1167");
    expect(packet).toContain("Receipt is missing.");
    expect(packet).toContain("Policy check needs human interpretation.");
    expect(packet).toContain("Exception has been open for 14 days.");
  });

  it("does not infer duplicate risk for a single matching-shaped row", () => {
    const [singleRow] = transactions;
    const queue = buildReviewQueue([{ ...singleRow, duplicateSignal: false }]);

    expect(queue[0].state).toBe("ready-for-approval");
    expect(queue[0].derivedSignals.inferredDuplicate).toBe(false);
  });

  it("creates an empty queue packet without throwing", () => {
    const packet = createReviewerPacket([]);

    expect(packet).toContain("0 synthetic rows");
    expect(packet).toContain("No exceptions require follow-up");
  });
});
