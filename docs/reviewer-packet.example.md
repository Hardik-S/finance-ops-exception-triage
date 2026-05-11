# Finance Ops Exception Triage

Boundary: No real fraud detection. This packet summarizes synthetic finance operations exceptions for human review only.

Queue: 5 synthetic rows, 163 total review score.

## Recommended reviewer action

- TX-1167 | aging-escalation | score 58 | Recommended reviewer action: Escalate to the submitter's manager and finance queue owner.
- TX-1119 | policy-review | score 42 | Recommended reviewer action: Hold payment and route the row to policy review.
- TX-1140 | duplicate-risk | score 35 | Recommended reviewer action: Compare against the matching claim before any approval action.
- TX-1088 | needs-evidence | score 28 | Recommended reviewer action: Request the missing receipt or policy context from the submitter.

## Source evidence

- TX-1167:
  - Policy check needs human interpretation.
  - Receipt is missing.
  - Exception has been open for 14 days.
  Source trail: fixture:TX-1167 -> submitter:Sam Rivera -> receipt:missing -> policy:unclear -> approval:none
- TX-1119:
  - Policy check found a direct mismatch.
  - Amount exceeds the high-review threshold.
  Source trail: fixture:TX-1119 -> submitter:Morgan Lee -> receipt:attached -> policy:violated -> approval:manager
- TX-1140:
  - Duplicate signal matched vendor, amount, and submitter pattern.
  Source trail: fixture:TX-1140 -> submitter:Avery Chen -> receipt:attached -> policy:matched -> approval:none
- TX-1088:
  - Policy check needs human interpretation.
  - Receipt detail is incomplete.
  Source trail: fixture:TX-1088 -> submitter:Jordan Patel -> receipt:partial -> policy:unclear -> approval:none
- TX-1042:
  - Required evidence is attached and no rule conflicts were found.
  Source trail: fixture:TX-1042 -> submitter:Avery Chen -> receipt:attached -> policy:matched -> approval:manager
