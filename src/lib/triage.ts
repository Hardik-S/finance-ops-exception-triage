export type Transaction = {
  id: string;
  vendor: string;
  amount: number;
  currency: "USD" | "CAD";
  submittedBy: string;
  costCenter: string;
  memo: string;
  receiptStatus: "attached" | "missing" | "partial";
  policyMatch: "matched" | "unclear" | "violated";
  duplicateSignal: boolean;
  approvalHistory: "none" | "manager" | "finance";
  daysOpen: number;
};

export type ExceptionState =
  | "ready-for-approval"
  | "needs-evidence"
  | "policy-review"
  | "duplicate-risk"
  | "aging-escalation";

export type TriageResult = {
  transaction: Transaction;
  state: ExceptionState;
  score: number;
  evidence: string[];
  guidance: string;
};

const stateGuidance: Record<ExceptionState, string> = {
  "ready-for-approval":
    "Evidence is complete enough for a finance approver to review the business purpose.",
  "needs-evidence":
    "Ask for the missing receipt detail before approving or rejecting the exception.",
  "policy-review":
    "Route to policy review because the submitted details conflict with expected controls.",
  "duplicate-risk":
    "Compare vendor, amount, memo, and submitter against nearby claims before action.",
  "aging-escalation":
    "Escalate the owner path because the exception has waited too long without closure."
};

export function triageTransaction(transaction: Transaction): TriageResult {
  const evidence: string[] = [];
  let score = 0;

  if (transaction.duplicateSignal) {
    score += 35;
    evidence.push("Duplicate signal matched vendor, amount, and submitter pattern.");
  }

  if (transaction.policyMatch === "violated") {
    score += 30;
    evidence.push("Policy check found a direct mismatch.");
  } else if (transaction.policyMatch === "unclear") {
    score += 16;
    evidence.push("Policy check needs human interpretation.");
  }

  if (transaction.receiptStatus === "missing") {
    score += 24;
    evidence.push("Receipt is missing.");
  } else if (transaction.receiptStatus === "partial") {
    score += 12;
    evidence.push("Receipt detail is incomplete.");
  }

  if (transaction.daysOpen >= 10) {
    score += 18;
    evidence.push(`Exception has been open for ${transaction.daysOpen} days.`);
  }

  if (transaction.amount >= 5000) {
    score += 12;
    evidence.push("Amount exceeds the high-review threshold.");
  }

  if (evidence.length === 0) {
    evidence.push("Required evidence is attached and no rule conflicts were found.");
  }

  const state = chooseState(transaction);

  return {
    transaction,
    state,
    score,
    evidence,
    guidance: stateGuidance[state]
  };
}

export function summarizeQueue(results: TriageResult[]) {
  return results.reduce(
    (summary, result) => {
      summary[result.state] += 1;
      summary.totalScore += result.score;
      return summary;
    },
    {
      "ready-for-approval": 0,
      "needs-evidence": 0,
      "policy-review": 0,
      "duplicate-risk": 0,
      "aging-escalation": 0,
      totalScore: 0
    } satisfies Record<ExceptionState, number> & { totalScore: number }
  );
}

function chooseState(transaction: Transaction): ExceptionState {
  if (transaction.duplicateSignal) {
    return "duplicate-risk";
  }

  if (transaction.policyMatch === "violated") {
    return "policy-review";
  }

  if (transaction.daysOpen >= 10) {
    return "aging-escalation";
  }

  if (transaction.receiptStatus !== "attached" || transaction.policyMatch === "unclear") {
    return "needs-evidence";
  }

  return "ready-for-approval";
}
