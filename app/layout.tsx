import type { Metadata } from "next";
import Link from "next/link";
import { Instrument_Serif, Noto_Sans_KR } from "next/font/google";
import ThemeToggle from "@/components/theme-toggle";
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
  { href: "/watching", label: "Watching" },
  { href: "/writing", label: "Writing" },
];

/**
 * 첫 페인트 전에 저장된 값을 붙인다. 이게 없으면 어둡게를 골라둔 사람이
 * 새로고침할 때마다 밝은 화면을 한 번씩 보게 된다.
 */
const THEME_INIT = `
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className={`${display.variable} ${body.variable}`}>
        <div className="shell">
          <header className="masthead">
            <Link href="/" className="wordmark">
              Eunchan Joe
            </Link>
            <div className="mastnav">
              <nav className="nav">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ThemeToggle />
            </div>
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
