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

export type Section = "me" | "work" | "writing" | "reading" | "watching";

/** 파일 하나를 읽어 앞머리와 본문으로 나눈다. 앞머리가 깨져도 예외를 던지지 않는다 */
function parseFile(full: string): { data: Record<string, unknown>; body: string } {
  const raw = fs.readFileSync(full, "utf8");
  try {
    const parsed = matter(raw);
    return { data: parsed.data as Record<string, unknown>, body: parsed.content };
  } catch {
    // 앞머리가 깨졌으면 전체를 본문으로 취급한다
    return { data: {}, body: raw };
  }
}

/**
 * 앞머리에 list: true 가 있으면 낱개 글이 아니라 목록이다.
 * 목록은 표를 담고 자체 화면으로 그려진다. 낱개 글 목록에는 섞이지 않는다.
 */
function isList(data: Record<string, unknown>): boolean {
  return data.list === true;
}

function readDir(dir: Section, opts: { lists: boolean }): Entry[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];

  return fs
    .readdirSync(full)
    // _로 시작하는 파일은 항목이 아니다 (주의문 같은 공용 조각)
    .filter((name) => name.endsWith(".md") && !name.startsWith("_"))
    .map((name) => ({ name, ...parseFile(path.join(full, name)) }))
    .filter(({ data }) => isList(data) === opts.lists)
    .map(({ name, data, body }) => ({
      slug: name.replace(/\.md$/, ""),
      title: String(data.title ?? name.replace(/\.md$/, "")),
      date: toISODate(data.date),
      tag: data.tag ? String(data.tag) : undefined,
      summary: data.summary ? String(data.summary) : undefined,
      link: data.link ? String(data.link) : undefined,
      author: data.author ? String(data.author) : undefined,
      html: marked.parse(body, { async: false }) as string,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 낱개 글만 (목록은 빠진다) */
export function getEntries(dir: Section): Entry[] {
  return readDir(dir, { lists: false });
}

/** 목록만 — /reading/ 화면 아래에 문으로 뜨는 것들 */
export function getListSummaries(dir: Section): Entry[] {
  return readDir(dir, { lists: true });
}

/** 낱개 글이든 목록이든, 슬러그로 하나 찾는다 */
export function getEntry(dir: Section, slug: string): Entry | undefined {
  return [...readDir(dir, { lists: false }), ...readDir(dir, { lists: true })].find(
    (e) => e.slug === slug,
  );
}

/** 이 슬러그가 목록인가 */
export function isListSlug(dir: Section, slug: string): boolean {
  return readDir(dir, { lists: true }).some((e) => e.slug === slug);
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
  /** 셋째 칸. 연도든 과목이든 목록마다 뜻이 다르다. 오른쪽에 작게 붙는다 */
  note?: string;
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
 * 목록 파일 하나를 읽는다. `list: true`가 붙은 어떤 파일이든 된다.
 *
 * 이 함수는 어떤 입력에도 예외를 던지지 않는다. 앞머리가 깨져도, 표가 망가져도,
 * 그 줄 하나가 빠질 뿐 사이트는 계속 선다. 손으로 수백 줄을 채우는 파일이라
 * 오타 하나로 배포가 멈추면 안 된다.
 */
export function getList(dir: Section, slug: string): Archive | null {
  const file = path.join(CONTENT_DIR, dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;

  const { data, body } = parseFile(file);
  if (!isList(data)) return null;

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
      note: cells[2] || undefined,
    });
  }

  // 같은 제목으로 쓴 글이 나중에 생기면 목록 행이 알아서 그 글로 이어진다.
  // 목록에 주소를 적어 넣을 필요가 없다.
  const byTitle = new Map(
    getEntries(dir).map((e) => [e.title.replace(/\s+/g, ""), e.slug]),
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

/**
 * 섹션 공용 주의문. `content/<섹션>/_notice.md`가 있으면 그 본문을 HTML로 돌려준다.
 * 목록 화면 세 곳에 같은 문구가 들어가므로 파일 하나로 두고 불러 쓴다.
 */
export function getNotice(dir: Section): string | null {
  const file = path.join(CONTENT_DIR, dir, "_notice.md");
  if (!fs.existsSync(file)) return null;
  const { body } = parseFile(file);
  if (!body.trim()) return null;
  return marked.parse(body, { async: false }) as string;
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
