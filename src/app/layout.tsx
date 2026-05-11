import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Finance Ops Exception Triage",
  description: "Explainable synthetic finance exception review board."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
