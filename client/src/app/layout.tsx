import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./layout.css";
import "./visualize.css";
import "./memory.css";
import "./chat.css";
import "./review.css";
import "./health.css";
import "./auth.css";
import AuthProvider from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CodeNexus | AI Code Editor",
  description: "The AI Code Editor That Thinks With You — intelligent intent detection, code visualization, and decision memory.",
  keywords: ["code editor", "AI", "IDE", "TypeScript", "Monaco Editor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
