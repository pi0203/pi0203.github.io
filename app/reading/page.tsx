import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  formatMonth,
} from "@/lib/content";

export const metadata = { title: "읽은 것 — Eunchan Joe" };

export default function ReadingPage() {
  const books = getEntries("reading");
  const lists = getListSummaries("reading");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Reading</p>
        <h1>읽은 것</h1>
        <p>
          읽은 책과 그에 대해 남은 생각. 아래에는 따로 모아둔 목록들이 있습니다.
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

      {lists.map((list) => {
        const full = getList("reading", list.slug);
        return (
          <Link key={list.slug} href={`/reading/${list.slug}`} className="drawer">
            <div className="row">
              <h2>{list.title}</h2>
              {full && <span className="count">{full.count}권</span>}
            </div>
            {list.summary && <p>{list.summary}</p>}
          </Link>
        );
      })}
    </>
  );
}
