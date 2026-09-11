import Link from "next/link";
import { getByStrand, formatMonth } from "@/lib/content";

export const metadata = { title: "갈래 — Eunchan Joe" };

/**
 * 「나」의 "지금 관심이 벌어져 있는 자리들"에 적힌 아홉 갈래를 그대로 쓴다.
 * 새 이름을 지어내지 않는다. 여기 순서대로 화면에 뜬다.
 */
const STRANDS = [
  "진단명 사이를 가로지르는 것",
  "재는 일",
  "개입",
  "애착과 관계",
  "뇌와 몸",
  "먹는 일",
  "제도 안에서의 판단",
  "여러 집단",
  "디지털 도구",
];

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
        {STRANDS.map((name) => {
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
