import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F6F5FA] text-[#24212D] font-sans antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}

