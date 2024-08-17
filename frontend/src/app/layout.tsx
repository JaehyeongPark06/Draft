import "./globals.css";

import { Albert_Sans } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const albert_sans = Albert_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Draft",
  description: "A real time collaborative document editor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={albert_sans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="px-6">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
