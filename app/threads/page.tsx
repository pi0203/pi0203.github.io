import Link from "next/link";
import { getByStrand, STRAND_NAMES, formatMonth } from "@/lib/content";

export const metadata = { title: "갈래 — Eunchan Joe" };

export default function ThreadsPage() {
  const byStrand = getByStrand();

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Threads</p>
        <h1>갈래</h1>
        <p>
          위 칸들은 매체로 나뉘어 있습니다 — 읽은 것, 만든 것, 본 것. 그런데 생각은 그렇게
          나뉘지 않아서, 같은 관심사에 걸리는 것들을 여기 모아둡니다. 아직 아무것도 안 걸린
          갈래는 비워둡니다.
        </p>
      </div>

      <div className="strands">
        {STRAND_NAMES.map((name) => {
          const items = byStrand.get(name) ?? [];
          return (
            <section key={name} className="strand">
              <h2>
                {name}
                <span className="count">{items.length}</span>
              </h2>

              {items.length === 0 ? (
                <p className="empty">아직 걸린 것이 없습니다.</p>
              ) : (
                <ul>
                  {items.map((it) => (
                    <li key={`${it.section}-${it.title}`}>
                      <span className="from">{it.sectionKo}</span>
                      {it.href ? (
                        <Link href={it.href}>{it.title}</Link>
                      ) : (
                        <span className="plain">{it.title}</span>
                      )}
                      <time>{formatMonth(it.date)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
