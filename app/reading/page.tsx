import Link from "next/link";
import { getEntries, formatMonth } from "@/lib/content";

export const metadata = { title: "읽은 것 — Eunchan Joe" };

export default function ReadingPage() {
  const books = getEntries("reading");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Reading</p>
        <h1>읽은 것</h1>
        <p>
          읽은 책과 그에 대해 남은 생각들. 서평이라기보다는, 읽고 나서 내 쪽에 무엇이
          달라졌는지를 적어둡니다.
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
    </>
  );
}
