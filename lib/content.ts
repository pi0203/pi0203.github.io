import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Entry = {
  /** 파일명에서 온 주소 조각 */
  slug: string;
  title: string;
  /** YYYY-MM-DD. 정렬과 표시에 쓴다 */
  date: string;
  /** "나" 항목의 자유로운 분류. 없어도 된다 */
  tag?: string;
  /** 목록에 보일 한 줄. 없으면 목록에서 생략된다 */
  summary?: string;
  /** "만든 것"에서 외부로 나가는 링크 */
  link?: string;
  /** 본문을 HTML로 변환한 것 */
  html: string;
};

function readDir(dir: string): Entry[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];

  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith(".md"))
    .map((name) => {
      const raw = fs.readFileSync(path.join(full, name), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: name.replace(/\.md$/, ""),
        title: String(data.title ?? name.replace(/\.md$/, "")),
        date: String(data.date ?? ""),
        tag: data.tag ? String(data.tag) : undefined,
        summary: data.summary ? String(data.summary) : undefined,
        link: data.link ? String(data.link) : undefined,
        html: marked.parse(content, { async: false }) as string,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getEntries(dir: "me" | "work" | "writing"): Entry[] {
  return readDir(dir);
}

export function getEntry(dir: "me" | "work" | "writing", slug: string): Entry | undefined {
  return readDir(dir).find((e) => e.slug === slug);
}

/** 2026-09-09 -> 2026년 9월 */
export function formatMonth(date: string): string {
  const [y, m] = date.split("-");
  if (!y || !m) return date;
  return `${y}년 ${Number(m)}월`;
}

/** 2026-09-09 -> 2026. 09. 09. */
export function formatDate(date: string): string {
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return date;
  return `${y}. ${m}. ${d}.`;
}
