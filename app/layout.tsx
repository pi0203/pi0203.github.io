import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Serif, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Noto_Sans_KR({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eunchan Joe",
  description: "조은찬의 개인 홈페이지. 나에 대한 기록, 만든 것, 글.",
};

const NAV = [
  { href: "/me", label: "Me" },
  { href: "/work", label: "Work" },
  { href: "/reading", label: "Reading" },
  { href: "/writing", label: "Writing" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${display.variable} ${body.variable}`}>
        <div className="shell">
          <header className="masthead">
            <Link href="/" className="wordmark">
              Eunchan Joe
            </Link>
            <nav className="nav">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="page">{children}</main>

          <footer className="colophon">
            <span>© {new Date().getFullYear()} 조은찬</span>
            <a href="mailto:a5897@icloud.com">a5897@icloud.com</a>
          </footer>
        </div>
      </body>
    </html>
  );
}
