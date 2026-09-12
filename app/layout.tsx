import type { Metadata } from "next";
import Link from "next/link";
import {
  Instrument_Serif,
  Noto_Sans_KR,
  Noto_Serif_KR,
  Nanum_Pen_Script,
} from "next/font/google";
import ThemeToggle from "@/components/theme-toggle";
import Breadcrumb from "@/components/breadcrumb";
import SideIndex from "@/components/side-index";
import Toc from "@/components/toc";
import { getTitleMap, getSectionIndex, getTocMap } from "@/lib/content";
import "./globals.css";

const display = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/*
 * 목소리 셋. 서체가 바뀌는 것이 곧 **지금 누가 말하고 있는가**의 표시다.
 *
 *   --font-body    사이트가 말한다 — UI·설명·목록·조사 결과
 *   --font-read    글이 말한다   — 제목·질문·장면을 여는 문장
 *   --font-hand    사람이 말한다 — 조은찬 본인이 그때 직접 쓴 문장
 *   --font-display 숫자와 라틴   — 217, 25 같은 수를 다른 질감으로
 *
 * 손글씨는 **출처가 붙은 짧은 문장에만** 쓴다. 한 화면에 한 번, 1.6rem 이상.
 * 작게 쓰면 못 읽고, 많이 쓰면 감성 문구 사이트가 된다.
 */
const read = Noto_Serif_KR({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-read",
  display: "swap",
});

const hand = Nanum_Pen_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eunchan Joe",
  description: "조은찬의 개인 홈페이지. 나에 대한 기록, 만든 것, 글.",
};

/*
 * 다섯 칸은 매체로 나뉜 것이고 「갈래」는 그걸 가로지른다.
 * 지금까지 어디에서도 링크가 없어서 홈에서만 닿을 수 있었다.
 */
const NAV = [
  { href: "/me", label: "Me" },
  { href: "/work", label: "Work" },
  { href: "/reading", label: "Reading" },
  { href: "/watching", label: "Watching" },
  { href: "/writing", label: "Writing" },
  { href: "/threads", label: "Threads" },
  { href: "/map", label: "Map" },
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
      <body className={`${display.variable} ${body.variable} ${read.variable} ${hand.variable}`}>
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

          <SideIndex index={getSectionIndex()} />
          <Toc map={getTocMap()} />
          <Breadcrumb titles={getTitleMap()} />

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
