import Link from "next/link";
import { getEntries, getArchive, formatMonth } from "@/lib/content";

export const metadata = { title: "읽은 것 — Eunchan Joe" };

export default function ReadingPage() {
  const books = getEntries("reading");
  const archive = getArchive();

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Reading</p>
        <h1>읽은 것</h1>
        <p>
          책이 한 말은 이미 책에 적혀 있으니, 여기에는 그 말 때문에 내 쪽에서 달라진
          자리를 적습니다. 동의하지 못한 대목도 함께 적습니다.
        </p>
      </div>

      {books.length === 0 ? (
        <p className="empty">아직 적어둔 책이 없습니다.</p>
      ) : (
        <div className="list">
          {books.map((book) => (
            <Link key={book.slug} href={`/reading/${book.slug}`} className="item">
              <div className="row">
                <h2>
                  {book.title}
                  {book.author && <span className="byline">{book.author}</span>}
                </h2>
                <time>{formatMonth(book.date)}</time>
              </div>
              {book.summary && <p>{book.summary}</p>}
            </Link>
          ))}
        </div>
      )}

      {archive && (
        <Link href="/reading/archive" className="drawer">
          <div className="row">
            <h2>{archive.title}</h2>
            <span className="count">{archive.count}권</span>
          </div>
          {archive.summary && <p>{archive.summary}</p>}
        </Link>
      )}
    </>
  );
}
