import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntries,
  getEntry,
  getListSummaries,
  getList,
  getNotice,
  getNeighbors,
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

  return (
    <article className="article">
      <header>
        <div className="meta">
          {book.author && <>{book.author} &middot; </>}
          {/* 읽은 때가 따로 있으면 두 때를 같이 — 한 책이 두 때를 갖는다 */}
          {book.read ? (
            <>
              {book.read}년에 읽고 &middot; {formatMonth(book.date)}에 적음
            </>
          ) : (
            formatMonth(book.date)
          )}
        </div>
        {book.then && (
          <p className="then">{book.date.slice(0, 4)}년에 적어둔 것을 옮겼습니다.</p>
        )}
        <h1>{book.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: book.html }} />
      <Neighbors n={getNeighbors("reading", slug)} dir="reading" />
      <Link href="/reading" className="backlink">
        &larr; 읽은 것
      </Link>
    </article>
  );
}
