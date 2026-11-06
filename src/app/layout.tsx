import type { Metadata } from "next";
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
    <html lang="en">
      <body className="min-h-screen bg-[#F6F5FA] text-[#24212D] antialiased flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

