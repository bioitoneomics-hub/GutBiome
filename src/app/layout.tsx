import type { Metadata } from "next";
import { Roboto_Flex, Source_Serif_4, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/auth-gate";

const roboto = Roboto_Flex({
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const serif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MYGUTBIOME · ONEOMICS",
  description:
    "Generate doctor, patient, and detailed gut microbiome reports covering AMR pathogens, disease patterns, beneficial organisms, and diet.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col font-sans">
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </body>
    </html>
  );
}
