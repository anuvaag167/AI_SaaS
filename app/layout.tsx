// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import {Inter} from 'next/font/google';
import { ClerkProvider } from "@clerk/nextjs";
import { ModalProvider } from "@/components/modal-provider";

const inter = Inter({subsets:['latin']})

export const metadata: Metadata = {
  title: "Genius",
  description: "AI SaaS Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body>
        <ModalProvider />
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
