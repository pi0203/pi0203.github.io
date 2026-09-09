import Link from "next/link";
import { getEntries, formatMonth } from "@/lib/content";

export const metadata = { title: "만든 것 — Eunchan Joe" };

export default function WorkPage() {
  const items = getEntries("work");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Work</p>
        <h1>만든 것</h1>
        <p>직접 만들었거나 지금 만들고 있는 것들입니다.</p>
      </div>

      {items.length === 0 ? (
        <p className="empty">아직 올린 것이 없습니다.</p>
      ) : (
        <div className="list">
          {items.map((item) => (
            <Link key={item.slug} href={`/work/${item.slug}`} className="item">
              <div className="row">
                <h2>{item.title}</h2>
                <time>{formatMonth(item.date)}</time>
              </div>
              {item.summary && <p>{item.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
