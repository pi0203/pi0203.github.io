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
  /** "읽은 것"의 지은이 */
  author?: string;
  /** 본문을 HTML로 변환한 것 */
  html: string;
};

/**
 * YAML은 따옴표 없는 2026-09-08을 Date 객체로 바꿔버린다.
 * 그대로 String()에 넣으면 "Tue Sep 08 2026 00:00:00 GMT+0000..."이 되므로
 * 항상 YYYY-MM-DD로 되돌린다.
 */
function toISODate(value: unknown): string {
  if (value instanceof Date) {
    return new Date(value.getTime() - value.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }
  return value ? String(value) : "";
}

export type Section = "me" | "work" | "writing" | "reading";

/**
 * content/<섹션>/ 안에 있지만 낱개 항목이 아닌 파일.
 *
 * archive.md는 자체 페이지(app/reading/archive/)를 갖는다. 여기서 걸러내지 않으면
 * [slug] 경로가 /reading/archive/를 한 번 더 만들어 정적 내보내기가 충돌한다.
 * 이 목록이 그 이름의 유일한 출처다 — 지우거나 옮기지 말 것.
 */
const RESERVED: Partial<Record<Section, ReadonlySet<string>>> = {
  reading: new Set(["archive"]),
};

function readDir(dir: Section): Entry[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];

  const reserved = RESERVED[dir];

  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => !reserved?.has(name.replace(/\.md$/, "")))
    .map((name) => {
      const raw = fs.readFileSync(path.join(full, name), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: name.replace(/\.md$/, ""),
        title: String(data.title ?? name.replace(/\.md$/, "")),
        date: toISODate(data.date),
        tag: data.tag ? String(data.tag) : undefined,
        summary: data.summary ? String(data.summary) : undefined,
        link: data.link ? String(data.link) : undefined,
        author: data.author ? String(data.author) : undefined,
        html: marked.parse(content, { async: false }) as string,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getEntries(dir: Section): Entry[] {
  return readDir(dir);
}

export function getEntry(dir: Section, slug: string): Entry | undefined {
  return readDir(dir).find((e) => e.slug === slug);
}

/* ---------------------------------------------------------------
   목록(archive) — 본문 없이 제목만 쌓이는 책들.
   낱개 글과 달리 파일 하나에 표로 들어간다.
   --------------------------------------------------------------- */

/** 목록의 한 줄 */
export type ArchiveBook = {
  /** 파일에 적힌 순서. 곧 읽은 순서다 */
  order: number;
  title: string;
  author?: string;
  year?: string;
  /** 같은 제목의 글이 따로 있으면 그 주소 조각. 자동으로 이어진다 */
  slug?: string;
};

export type Archive = {
  title: string;
  /** 표를 뺀 안내문을 HTML로 */
  intro: string;
  summary?: string;
  books: ArchiveBook[];
  count: number;
};

/** 첫 칸이 이것들이면 헤더행이므로 건너뛴다 */
const HEADER_CELLS = new Set(["제목", "책", "책 제목", "책이름", "title"]);

/** | --- | :--- | 같은 구분선인가 */
function isSeparatorRow(cells: string[]): boolean {
  return cells.every((c) => c === "" || /^:?-{2,}:?$/.test(c));
}

/**
 * content/reading/archive.md를 읽는다.
 *
 * 이 함수는 어떤 입력에도 예외를 던지지 않는다. 앞머리가 깨져도, 표가 망가져도,
 * 그 줄 하나가 빠질 뿐 사이트는 계속 선다. 손으로 200줄을 채우는 파일이라
 * 오타 하나로 배포가 멈추면 안 된다.
 */
export function getArchive(): Archive | null {
  const file = path.join(CONTENT_DIR, "reading", "archive.md");
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");

  let data: Record<string, unknown> = {};
  let body = raw;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    body = parsed.content;
  } catch {
    // 앞머리가 깨졌으면 전체를 본문으로 취급한다
  }

  const books: ArchiveBook[] = [];
  const intro: string[] = [];

  for (const line of body.split("\n")) {
    if (!line.includes("|")) {
      intro.push(line);
      continue;
    }
    const cells = line
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((c) => c.trim());

    if (isSeparatorRow(cells)) continue;
    if (HEADER_CELLS.has(cells[0])) continue;
    if (!cells[0]) continue;

    books.push({
      order: books.length,
      title: cells[0],
      author: cells[1] || undefined,
      year: cells[2] || undefined,
    });
  }

  // 같은 제목으로 쓴 글이 나중에 생기면 목록 행이 알아서 그 글로 이어진다.
  // 목록에 주소를 적어 넣을 필요가 없다.
  const byTitle = new Map(
    getEntries("reading").map((e) => [e.title.replace(/\s+/g, ""), e.slug]),
  );
  for (const book of books) {
    book.slug = byTitle.get(book.title.replace(/\s+/g, ""));
  }

  return {
    title: String(data.title ?? "읽은 목록"),
    summary: data.summary ? String(data.summary) : undefined,
    intro: marked.parse(intro.join("\n"), { async: false }) as string,
    books,
    count: books.length,
  };
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
