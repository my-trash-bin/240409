import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "240409 Auth test",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>240409</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
