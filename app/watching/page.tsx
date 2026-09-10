import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  formatMonth,
} from "@/lib/content";

export const metadata = { title: "본 것 — Eunchan Joe" };

export default function WatchingPage() {
  const items = getEntries("watching");
  const lists = getListSummaries("watching");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Watching</p>
        <h1>본 것</h1>
        <p>재밌게 본 영화와 드라마, 그리고 보면서 걸렸던 것들.</p>
      </div>

      {items.length === 0 && lists.length === 0 ? (
        <p className="empty">아직 적어둔 것이 없습니다.</p>
      ) : (
        <div className="list">
          {items.map((item) => (
            <Link key={item.slug} href={`/watching/${item.slug}`} className="item">
              <div className="row">
                <h2>
                  {item.title}
                  {item.author && <span className="byline">{item.author}</span>}
                </h2>
                <time>{formatMonth(item.date)}</time>
              </div>
              {item.summary && <p>{item.summary}</p>}
            </Link>
          ))}
        </div>
      )}

      {lists.map((list) => {
        const full = getList("watching", list.slug);
        return (
          <Link key={list.slug} href={`/watching/${list.slug}`} className="drawer">
            <div className="row">
              <h2>{list.title}</h2>
              {full && <span className="count">{full.count}편</span>}
            </div>
            {list.summary && <p>{list.summary}</p>}
          </Link>
        );
      })}
    </>
  );
}
