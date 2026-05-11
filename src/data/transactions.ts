import type { Transaction } from "../lib/triage";

export const transactions: Transaction[] = [
  {
    id: "TX-1042",
    vendor: "Northstar Travel Desk",
    amount: 1840,
    currency: "USD",
    submittedBy: "Avery Chen",
    costCenter: "Revenue Ops",
    memo: "Customer onsite travel for Q2 renewal rescue",
    receiptStatus: "attached",
    policyMatch: "matched",
    duplicateSignal: false,
    approvalHistory: "manager",
    daysOpen: 2
  },
  {
    id: "TX-1088",
    vendor: "Metro Hardware Supply",
    amount: 642,
    currency: "USD",
    submittedBy: "Jordan Patel",
    costCenter: "Field Support",
    memo: "Replacement devices for pilot deployment",
    receiptStatus: "partial",
    policyMatch: "unclear",
    duplicateSignal: false,
    approvalHistory: "none",
    daysOpen: 4
  },
  {
    id: "TX-1119",
    vendor: "Luma Events",
    amount: 9350,
    currency: "USD",
    submittedBy: "Morgan Lee",
    costCenter: "Marketing",
    memo: "Partner dinner and venue guarantee",
    receiptStatus: "attached",
    policyMatch: "violated",
    duplicateSignal: false,
    approvalHistory: "manager",
    daysOpen: 6
  },
  {
    id: "TX-1140",
    vendor: "Northstar Travel Desk",
    amount: 1840,
    currency: "USD",
    submittedBy: "Avery Chen",
    costCenter: "Revenue Ops",
    memo: "Customer onsite travel duplicate import",
    receiptStatus: "attached",
    policyMatch: "matched",
    duplicateSignal: true,
    approvalHistory: "none",
    daysOpen: 1
  },
  {
    id: "TX-1167",
    vendor: "Brightline Training",
    amount: 1280,
    currency: "CAD",
    submittedBy: "Sam Rivera",
    costCenter: "Customer Success",
    memo: "Team enablement invoice waiting on approver",
    receiptStatus: "missing",
    policyMatch: "unclear",
    duplicateSignal: false,
    approvalHistory: "none",
    daysOpen: 14
  }
];
