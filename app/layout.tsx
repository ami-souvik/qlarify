import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Toaster } from "sonner";
import AuthContext from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qlarify",
  description: "Turn text into system architectures",
};

import { ThemeProvider } from "@/context/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} antialiased selection:bg-orange-100 selection:text-charcoal`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthContext>
            <Toaster position="top-center" richColors />
            {children}
          </AuthContext>
        </ThemeProvider>
      </body>
    </html>
  );
}
