import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "DBI Staff Food Management Portal | Digital Bridge International",
  description: "Digital Bridge International - Staff food planning, daily counts, and QR verification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-[#F6F5FA] text-[#24212D] font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

