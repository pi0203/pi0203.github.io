import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  getNotice,
  formatMonth,
} from "@/lib/content";

export const metadata = { title: "읽은 것 — Eunchan Joe" };

export default function ReadingPage() {
  const books = getEntries("reading");
  const lists = getListSummaries("reading");
  const about = getNotice("reading", "about");

  // 읽은 책이 모두 몇 권인지. 「읽고 싶은 책들」은 아직 안 읽은 것이라 빼야 한다
  const counted = lists
    .filter((l) => !l.unread)
    .map((l) => getList("reading", l.slug)?.count ?? 0)
    .reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Reading</p>
        <h1>읽은 것</h1>
        <p>읽은 책의 목록과, 그중 생각을 적어둔 것들입니다.</p>
      </div>

      {/*
       * 목록을 먼저 둔다. 낱개 글을 위에 두면 그 몇 권이 대표작처럼 보인다 —
       * 실제로는 글이 붙은 것이 훨씬 적고, 고른 것도 아니다.
       */}
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

      {books.length > 0 && (
        <>
          <div className="blockhead">
            <h2>생각을 적어둔 것</h2>
            <p>
              {counted > 0 && `목록에 ${counted}권이 있고, `}
              그중 글이 있는 것은 아직 {books.length}권입니다.{" "}
              <strong>중요한 순서로 고른 것이 아닙니다.</strong> 손이 닿는 대로 적고 있어서,
              여기 없는 책이 덜 중요했다는 뜻은 아닙니다.
            </p>
          </div>

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
        </>
      )}

      {about && (
        <div className="notice endnote" dangerouslySetInnerHTML={{ __html: about }} />
      )}
    </>
  );
}
