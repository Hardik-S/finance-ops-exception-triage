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
  reviewerAction: string;
  sourceTrail: string[];
  derivedSignals: {
    inferredDuplicate: boolean;
  };
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

const stateActions: Record<ExceptionState, string> = {
  "ready-for-approval": "Send to finance approver with business purpose attached.",
  "needs-evidence": "Request the missing receipt or policy context from the submitter.",
  "policy-review": "Hold payment and route the row to policy review.",
  "duplicate-risk": "Compare against the matching claim before any approval action.",
  "aging-escalation": "Escalate to the submitter's manager and finance queue owner."
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
    guidance: stateGuidance[state],
    reviewerAction: stateActions[state],
    sourceTrail: buildSourceTrail(transaction),
    derivedSignals: {
      inferredDuplicate: false
    }
  };
}

export function buildReviewQueue(transactions: Transaction[]): TriageResult[] {
  const duplicateKeys = new Set(
    Object.entries(
      transactions.reduce<Record<string, number>>((counts, transaction) => {
        const key = duplicateKey(transaction);
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {})
    )
      .filter(([, count]) => count > 1)
      .map(([key]) => key)
  );

  return transactions
    .map((transaction) => {
      const inferredDuplicate =
        duplicateKeys.has(duplicateKey(transaction)) && transaction.approvalHistory === "none";
      const scoringTransaction = {
        ...transaction,
        duplicateSignal: transaction.duplicateSignal || inferredDuplicate
      };
      const result = triageTransaction(scoringTransaction);
      const resultWithSource = {
        ...result,
        transaction,
        derivedSignals: {
          inferredDuplicate
        }
      };

      if (inferredDuplicate && !transaction.duplicateSignal) {
        return {
          ...resultWithSource,
          evidence: [
            "Duplicate candidate derived from vendor, amount, submitter, and cost-center context.",
            ...result.evidence.filter((item) => !item.startsWith("Duplicate signal"))
          ]
        };
      }

      return resultWithSource;
    })
    .sort((left, right) => right.score - left.score || left.transaction.id.localeCompare(right.transaction.id));
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

export function createReviewerPacket(results: TriageResult[]): string {
  const summary = summarizeQueue(results);
  const queueLines = results
    .filter((result) => result.state !== "ready-for-approval")
    .map(
      (result) =>
        `- ${result.transaction.id} | ${result.state} | score ${result.score} | Recommended reviewer action: ${result.reviewerAction}`
    )
    .join("\n");

  return [
    "# Finance Ops Exception Triage",
    "",
    "Boundary: No real fraud detection. This packet summarizes synthetic finance operations exceptions for human review only.",
    "",
    `Queue: ${results.length} synthetic rows, ${summary.totalScore} total review score.`,
    "",
    "## Recommended reviewer action",
    queueLines || "- No exceptions require follow-up in this fixture set.",
    "",
    "## Source evidence",
    ...results.flatMap((result) => [
      `- ${result.transaction.id}:`,
      ...result.evidence.map((item) => `  - ${item}`),
      `  Source trail: ${result.sourceTrail.join(" -> ")}`
    ])
  ].join("\n");
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

function duplicateKey(transaction: Transaction) {
  return [
    normalizeText(transaction.vendor),
    transaction.amount,
    transaction.currency,
    normalizeText(transaction.submittedBy),
    normalizeText(transaction.costCenter)
  ].join("|");
}

function buildSourceTrail(transaction: Transaction) {
  return [
    `fixture:${transaction.id}`,
    `submitter:${transaction.submittedBy}`,
    `receipt:${transaction.receiptStatus}`,
    `policy:${transaction.policyMatch}`,
    `approval:${transaction.approvalHistory}`
  ];
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
