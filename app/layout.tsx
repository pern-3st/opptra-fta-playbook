import type { Metadata } from "next";
import { Spectral, Raleway } from "next/font/google";
import "./globals.css";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  variable: "--font-heading",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FTA Playbook | Opptra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${raleway.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
