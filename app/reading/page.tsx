import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  getNotice,
  getTwice,
  formatMonth,
} from "@/lib/content";

export const metadata = { title: "읽은 것 — Eunchan Joe" };

export default function ReadingPage() {
  const books = getEntries("reading");
  const lists = getListSummaries("reading");
  const about = getNotice("reading", "about");
  const twice = getTwice("reading");

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
       * 두 때를 가진 책. 책 정보로는 검색을 이길 수 없고, 검색에 없는 것은
       * 같은 사람이 같은 책을 두 번 읽은 기록이다. 그래서 이것만 앞에 둔다.
       * 대표작이라서가 아니라 `read`가 붙었다는 사실 하나로 뽑힌 것이므로
       * 몇 권인지를 그대로 적는다.
       */}
      {twice.length > 0 && (
        <section className="twice">
          <div className="blockhead">
            <h2>같은 책, 두 때</h2>
            <p>
              한 권을 사이를 두고 다시 본 기록입니다.{" "}
              <strong>그때 가져간 것과 지금 보이는 것의 차이</strong>를 적습니다. 지금은{" "}
              {twice.length}권입니다.
            </p>
          </div>

          {twice.map((book) => (
            <Link key={book.slug} href={`/reading/${book.slug}`} className="span">
              <span className="years">
                <span className="y-then">{book.read?.slice(0, 4)}</span>
                <span className="y-arrow" aria-hidden="true">
                  ↓
                </span>
                <span className="y-now">{book.date.slice(0, 4)}</span>
              </span>
              <span className="what">
                <span className="t">
                  {book.title}
                  {book.author && <span className="byline">{book.author}</span>}
                </span>
                {book.summary && <span className="s">{book.summary}</span>}
              </span>
            </Link>
          ))}
        </section>
      )}

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
            <p>
              글 하나는 세 층입니다 — <strong>그때 적은 것</strong>,{" "}
              <strong>그 책이 실제로 하는 일</strong>(이후에 나온 반박과 뒷받침을 출처와
              함께), <strong>지금 열리는 것</strong>(답이 아니라 질문). 가운데 층은 그때
              닿을 수 없던 자료라서 나중에 붙인 것이고, 첫 층은 고치지 않았습니다.
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
