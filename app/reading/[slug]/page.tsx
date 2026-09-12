import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntries,
  getEntry,
  getListSummaries,
  getList,
  getNotice,
  getNeighbors,
  splitScenes,
  formatMonth,
} from "@/lib/content";
import ArchiveList from "@/components/archive-list";
import Neighbors from "@/components/neighbors";

export function generateStaticParams() {
  // 낱개 글과 목록이 같은 경로를 쓴다. 화면만 다르게 그린다.
  return [...getEntries("reading"), ...getListSummaries("reading")].map((e) => ({
    slug: e.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("reading", slug);
  return { title: `${entry?.title ?? "읽은 것"} — Eunchan Joe` };
}

export default async function ReadingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 목록이면 표를 그린다
  const list = getList("reading", slug);
  if (list) {
    const notice = getNotice("reading");
    return (
      <>
        <div className="pagehead">
          <p className="eyebrow">Reading</p>
          <h1>{list.title}</h1>
          <div className="prose" dangerouslySetInnerHTML={{ __html: list.intro }} />
        </div>

        {notice && (
          <div className="notice" dangerouslySetInnerHTML={{ __html: notice }} />
        )}

        <ArchiveList books={list.books} />

        <Link href="/reading" className="backlink">
          &larr; 읽은 것
        </Link>
      </>
    );
  }

  // 아니면 낱개 글
  const book = getEntry("reading", slug);
  if (!book) notFound();

  const scenes = splitScenes(book.html);
  const when = book.read ? (
    <>
      {book.read}년에 읽고 &middot; {formatMonth(book.date)}에 적음
    </>
  ) : (
    formatMonth(book.date)
  );

  return (
    <article className="article">
      {/*
       * 여는 장면 — 본인이 고른 한 문장만. 메타는 그 아래 작게.
       * 캘리그래피가 하는 일 그대로다: 한 문장 · 큰 여백 · 작은 출처.
       * `pull`이 없으면 이 장면을 아예 그리지 않는다.
       */}
      {book.pull ? (
        <section className="opening">
          <p className="said">{book.pull}</p>
          <p className="from">
            {book.title}
            {book.author && <> &middot; {book.author}</>} &middot; {when}
          </p>
        </section>
      ) : (
        <header>
          <div className="meta">
            {book.author && <>{book.author} &middot; </>}
            {when}
          </div>
          <h1>{book.title}</h1>
        </header>
      )}

      {book.then && (
        <p className="then">{book.date.slice(0, 4)}년에 적어둔 것을 옮겼습니다.</p>
      )}

      {/* 층마다 목소리가 다르다 — 그때 쓴 글과 나중에 붙인 조사가 같게 읽히면 안 된다 */}
      {scenes.map((sc) => (
        <section key={sc.id} className={`scene v-${sc.voice}`} id={sc.id}>
          {sc.title && <h2>{sc.title}</h2>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: sc.html }} />
        </section>
      ))}

      <Neighbors n={getNeighbors("reading", slug)} dir="reading" />
      <Link href="/reading" className="backlink">
        &larr; 읽은 것
      </Link>
    </article>
  );
}
