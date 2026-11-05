import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DBI Staff Food Management Portal",
  description: "Institutional meal planning, daily food counts, and QR verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

