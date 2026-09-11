import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Entry = {
  /** 파일명에서 온 주소 조각 */
  slug: string;
  title: string;
  /** YYYY-MM-DD. 글을 쓴 날. 정렬과 표시에 쓴다 */
  date: string;
  /**
   * 글이 다루는 시기. `date`가 쓴 날이라면 이쪽은 "언제의 나에 대한 글인가"다.
   * 2021년 이야기를 2026년에 적을 수 있으므로 둘은 다르다.
   * 연도 하나("2021")든 범위("2020–2022")든 자유. 없으면 화면에 안 나온다.
   */
  about?: string;
  /** "나" 항목의 자유로운 분류. 없어도 된다 */
  tag?: string;
  /**
   * 이 항목이 걸리는 갈래(관심사). 섹션은 매체로 나뉘지만 생각은 관심사로 묶인다.
   * 음식에 대한 책과 음식 앱이 다른 섹션에 있어도 같은 갈래로 이어진다.
   * 앞머리에 `strand: 먹는 일, 재는 일`처럼 쉼표로 적는다. 없으면 아무 데도 안 걸린다.
   */
  strands?: string[];
  /** 목록에 보일 한 줄. 없으면 목록에서 생략된다 */
  summary?: string;
  /** "만든 것"에서 외부로 나가는 링크 */
  link?: string;
  /** "읽은 것"의 지은이 */
  author?: string;
  /**
   * 처음 읽은 때. `date`는 **이 글을 쓴 날**이고 이쪽은 **책을 읽은 때**다.
   * 둘이 다르면 그 글은 다시 본 책이다 — 그때와 지금, 두 층을 담는다.
   * 연도만("2020") 적어도 되므로 `toISODate()`를 거치지 않는다.
   */
  read?: string;
  /**
   * 이 목록의 책들은 아직 안 읽은 것인가 (`list: true`인 파일에만 뜻이 있다).
   * "읽은 책이 몇 권인지"를 셀 때 이 목록은 빼야 한다.
   */
  unread?: boolean;
  /**
   * 그때 적어둔 것을 옮긴 글인가.
   * 지금 쓴 글과 한 목록에 섞이면 현재 생각으로 읽히므로 화면에서 갈라준다.
   */
  then?: boolean;
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
      // toISODate를 거치지 않는다 — 연도만 적거나 범위로 적을 수 있어야 한다
      about: data.about ? String(data.about) : undefined,
      tag: data.tag ? String(data.tag) : undefined,
      strands: data.strand
        ? String(data.strand)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      summary: data.summary ? String(data.summary) : undefined,
      link: data.link ? String(data.link) : undefined,
      author: data.author ? String(data.author) : undefined,
      read: data.read ? String(data.read) : undefined,
      unread: data.unread === true,
      then: data.then === true,
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

/**
 * 두 때를 가진 글만. `read`(책을 읽은 때)가 `date`(글을 쓴 날)와 다른 것들이다.
 * 이 사이트가 검색으로 대신할 수 없는 자리라서 따로 꺼낸다 —
 * 책 정보가 아니라 한 권이 한 사람에게서 어떻게 달라졌는가.
 * 오래된 쪽부터. 「그때」가 먼저 오는 게 읽는 순서다.
 */
export function getTwice(dir: Section): Entry[] {
  return getEntries(dir)
    .filter((e) => e.read && e.read.slice(0, 4) !== e.date.slice(0, 4))
    .sort((a, b) => (a.read ?? "").localeCompare(b.read ?? ""));
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
  /**
   * 넷째 칸 — 지금 와서 이 책에 대해 드는 한 줄.
   * **비어 있는 것이 기본이다.** 166칸을 채우는 일이 아니라,
   * 떠오를 때 한 줄 더하는 자리다. 안 적으면 화면에 안 나온다.
   */
  now?: string;
  /** 같은 제목의 글이 따로 있으면 그 주소 조각. 자동으로 이어진다 */
  slug?: string;
  /** 그 글이 두 때를 담고 있는가 (`read`가 있는가) — 다시 본 책 */
  reread?: boolean;
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
      // 넷째 칸까지만 읽는다. 다섯째부터는 여전히 무시 — 열을 늘려도 안 깨진다
      now: cells[3] || undefined,
    });
  }

  // 같은 제목으로 쓴 글이 나중에 생기면 목록 행이 알아서 그 글로 이어진다.
  // 목록에 주소를 적어 넣을 필요가 없다.
  const byTitle = new Map(
    getEntries(dir).map((e) => [
      e.title.replace(/\s+/g, ""),
      { slug: e.slug, reread: Boolean(e.read) },
    ]),
  );
  for (const book of books) {
    const hit = byTitle.get(book.title.replace(/\s+/g, ""));
    book.slug = hit?.slug;
    book.reread = hit?.reread;
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
export function getNotice(dir: Section, name = "notice"): string | null {
  const file = path.join(CONTENT_DIR, dir, `_${name}.md`);
  if (!fs.existsSync(file)) return null;
  const { body } = parseFile(file);
  if (!body.trim()) return null;
  return marked.parse(body, { async: false }) as string;
}

/* ---------------------------------------------------------------
   갈래 — 매체로 나뉜 섹션을 관심사로 가로지른다.
   --------------------------------------------------------------- */

/** 갈래 하나에 걸린 항목. 어느 섹션에서 왔는지를 함께 들고 다닌다 */
export type StrandItem = {
  section: Section;
  /** 화면에 쓰는 섹션 이름 */
  sectionKo: string;
  /** 상세 페이지 주소. "나"는 상세가 없어 undefined */
  href?: string;
  title: string;
  date: string;
  summary?: string;
};

const SECTION_KO: Record<Section, string> = {
  me: "나",
  work: "만든 것",
  writing: "글",
  reading: "읽은 것",
  watching: "본 것",
};

/**
 * 「나」의 "지금 관심이 벌어져 있는 자리들"에 적힌 아홉 갈래.
 * 새 이름을 지어내지 않는다 — 여기 적힌 것만 쓰고, 순서도 그대로 따른다.
 * 「갈래」 화면과 「지도」가 같은 목록을 봐야 해서 여기 둔다.
 */
export const STRAND_NAMES = [
  "진단명 사이를 가로지르는 것",
  "재는 일",
  "개입",
  "애착과 관계",
  "뇌와 몸",
  "먹는 일",
  "제도 안에서의 판단",
  "여러 집단",
  "디지털 도구",
] as const;

/**
 * 다섯 섹션을 전부 훑어 갈래별로 모은다.
 * 갈래를 안 적은 항목은 어디에도 안 걸린다 — 억지로 다 채우지 않는다.
 */
export function getByStrand(): Map<string, StrandItem[]> {
  const out = new Map<string, StrandItem[]>();
  for (const section of Object.keys(SECTION_KO) as Section[]) {
    for (const e of getEntries(section)) {
      for (const s of e.strands ?? []) {
        const list = out.get(s) ?? [];
        list.push({
          section,
          sectionKo: SECTION_KO[section],
          // "나"는 상세 페이지가 없다
          href: section === "me" ? undefined : `/${section}/${e.slug}/`,
          title: e.title,
          date: e.date,
          summary: e.summary,
        });
        out.set(s, list);
      }
    }
  }
  for (const list of out.values()) list.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}

/**
 * 주소 → 화면에 쓸 이름. 위치 표시(breadcrumb)가 쓴다.
 *
 * 위치 표시는 주소를 봐야 해서 브라우저 쪽에서 그려야 하는데, 한글 제목은
 * 마크다운에만 있다. 그래서 빌드 때 표를 만들어 넘긴다.
 * 낱개 글과 목록을 다 합쳐도 수십 개라 통째로 보내도 된다.
 */
export function getTitleMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const section of Object.keys(SECTION_KO) as Section[]) {
    out[`/${section}`] = SECTION_KO[section];
    if (section === "me") continue; // 상세 페이지가 없다
    for (const e of [...getEntries(section), ...getListSummaries(section)]) {
      out[`/${section}/${e.slug}`] = e.title;
    }
  }
  out["/threads"] = "갈래";
  return out;
}

/**
 * 섹션마다 그 안에 무엇이 있는지. 곁단 목차가 쓴다.
 *
 * 위치 표시와 같은 이유로 빌드 때 만들어 넘긴다 — 곁단은 지금 주소를 봐야 하는데
 * 제목은 마크다운에만 있다. 목록을 먼저, 낱개 글을 뒤에 둔다.
 */
export function getSectionIndex(): Record<string, { slug: string; title: string; list?: true }[]> {
  const out: Record<string, { slug: string; title: string; list?: true }[]> = {};
  for (const section of Object.keys(SECTION_KO) as Section[]) {
    if (section === "me") continue; // 상세 페이지가 없어 오갈 곳이 없다
    out[section] = [
      ...getListSummaries(section).map((e) => ({
        slug: e.slug,
        title: e.title,
        list: true as const,
      })),
      ...getEntries(section).map((e) => ({ slug: e.slug, title: e.title })),
    ];
  }
  return out;
}

/* ---------------------------------------------------------------
   이웃 — 글 하나를 다 읽고 나서 갈 수 있는 곳.
   지금까지는 「← 읽은 것」 하나뿐이라 글 끝이 막다른 길이었다.
   세 방향을 만든다. 셋 다 이미 있는 자료에서만 나온다 — 새로 지어내지 않는다.
   --------------------------------------------------------------- */

/** 제목 비교용. 띄어쓰기와 가운뎃점 차이로 어긋나는 걸 막는다 */
function normTitle(s: string): string {
  return s.replace(/\s+/g, "").replace(/[·・]/g, "");
}

export type Neighbors = {
  /** 목록에서 이 책 앞뒤에 적힌 책들. 적힌 순서가 곧 읽은 순서다 */
  around: ArchiveBook[];
  /** 그 목록의 이름과 주소 */
  aroundFrom?: { title: string; slug: string };
  /**
   * 같은 갈래에 걸린 다른 항목들. 갈래마다 나누지 않고 항목으로 묶는다 —
   * 갈래 둘을 함께 쓰는 글은 나누면 같은 줄이 두 번 나온다.
   * `via`가 무엇을 함께 쓰는지를 들고 있다.
   */
  strands: { item: StrandItem; via: string[] }[];
  /** 「읽고 싶은 책들」에서 이 책을 출발점으로 적어둔 것들 */
  sprouted: ArchiveBook[];
};

/**
 * 낱개 글 하나에 붙일 이웃 세 갈래.
 *
 * 이 함수도 예외를 던지지 않는다. 자료가 없으면 빈 배열이 나오고,
 * 화면은 있는 것만 그린다.
 */
export function getNeighbors(dir: Section, slug: string): Neighbors {
  const out: Neighbors = { around: [], strands: [], sprouted: [] };
  const entry = getEntries(dir).find((e) => e.slug === slug);
  if (!entry) return out;
  const key = normTitle(entry.title);

  // (1) 같은 시기에 읽은 책 — 아직 안 읽은 목록에서는 찾지 않는다
  for (const summary of getListSummaries(dir)) {
    if (summary.unread) continue;
    const list = getList(dir, summary.slug);
    const at = list?.books.findIndex((b) => normTitle(b.title) === key) ?? -1;
    if (!list || at < 0) continue;
    out.around = list.books.slice(Math.max(0, at - 3), at + 4).filter((b) => b.order !== at);
    out.aroundFrom = { title: list.title, slug: summary.slug };
    break;
  }

  // (2) 같은 갈래 — 자기 자신은 빼고, 같은 항목은 한 줄로 합친다
  const byStrand = getByStrand();
  const seen = new Map<string, { item: StrandItem; via: string[] }>();
  for (const name of entry.strands ?? []) {
    for (const item of byStrand.get(name) ?? []) {
      if (item.section === dir && item.href === `/${dir}/${slug}/`) continue;
      const id = `${item.section}/${item.title}`;
      const hit = seen.get(id);
      if (hit) hit.via.push(name);
      else seen.set(id, { item, via: [name] });
    }
  }
  // 함께 쓰는 갈래가 많은 것부터. 더 가까운 이웃이다
  out.strands = [...seen.values()].sort((a, b) => b.via.length - a.via.length);

  // (3) 여기서 뻗어나간 책 — 「어디서」 칸이 "<이 책>에서"로 시작하는 행.
  //     뒤에 " · 읽음"이 붙기도 하므로 앞부분만 본다.
  for (const summary of getListSummaries(dir)) {
    if (!summary.unread) continue;
    const list = getList(dir, summary.slug);
    if (!list) continue;
    out.sprouted.push(
      ...list.books.filter((b) => normTitle(b.note ?? "").startsWith(`${key}에서`)),
    );
  }

  return out;
}

/* ---------------------------------------------------------------
   뻗어나간 관계 — 「읽고 싶은 책들」의 「어디서」 칸이 만든 그림.

   이 사이트에서 유일하게 이미 그물로 되어 있는 자료다.
   책 한 권이 다음 책 여럿을 불러온 자취라, 목록으로 보면 스물세 줄이지만
   그려놓으면 어디가 크게 벌어졌는지가 한눈에 보인다.
   --------------------------------------------------------------- */

export type SproutGraph = {
  /** 출발이 된 책. 나온 순서를 지킨다 */
  sources: { title: string; slug?: string; fanout: number }[];
  /** 거기서 나온 책. `from`이 출발점 제목 */
  targets: { title: string; author?: string; from: string; read: boolean }[];
};

/**
 * 「어디서」 칸을 읽어 출발점과 뻗어나간 책으로 가른다.
 *
 * 칸의 꼴은 `<책 제목>에서`이고 뒤에 ` · 읽음`이 붙기도 한다.
 * 그 꼴이 아니면 그냥 건너뛴다 — 여기서도 예외를 던지지 않는다.
 */
export function getSproutGraph(dir: Section = "reading"): SproutGraph {
  const edges: SproutGraph["targets"] = [];
  const order: string[] = [];

  for (const summary of getListSummaries(dir)) {
    if (!summary.unread) continue;
    for (const b of getList(dir, summary.slug)?.books ?? []) {
      const m = /^(.+?)에서(?:\s*·\s*(읽음))?$/.exec(b.note ?? "");
      if (!m) continue;
      const from = m[1].trim();
      if (!order.includes(from)) order.push(from);
      edges.push({ title: b.title, author: b.author, from, read: Boolean(m[2]) });
    }
  }

  // 출발점에 글이 있으면 이어준다. 지금은 아직 하나도 없다
  const byTitle = new Map(getEntries(dir).map((e) => [normTitle(e.title), e.slug]));
  const sources = order.map((title) => ({
    title,
    slug: byTitle.get(normTitle(title)),
    fanout: edges.filter((e) => e.from === title).length,
  }));

  // 출발점끼리 묶어 둔다. 그래야 그릴 때 선이 서로 넘지 않는다
  edges.sort((a, b) => order.indexOf(a.from) - order.indexOf(b.from));

  return { sources, targets: edges };
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
