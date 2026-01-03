import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://letuscrack.com'),
  title: {
    default: "Letuscrack - Master Coding Interviews",
    template: "%s | Letuscrack",
  },
  description:
    "Master coding problems with clear explanations and solutions in Python, Java, C++, JavaScript, and more. Crack any coding interview with confidence.",
  keywords: [
    "coding interviews",
    "leetcode solutions",
    "algorithm problems",
    "data structures",
    "interview prep",
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "competitive programming",
    "system design",
    "dynamic programming",
    "graph algorithms"
  ],
  authors: [{ name: "Letuscrack" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Letuscrack",
    title: "Letuscrack - Master Coding Interviews",
    description:
      "Master coding problems with clear explanations and solutions in multiple programming languages.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Letuscrack - Master Coding Interviews',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Letuscrack - Master Coding Interviews",
    description:
      "Master coding problems with clear explanations and solutions in multiple programming languages.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#111113" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col animated-gradient grid-pattern">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
