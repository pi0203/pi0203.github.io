import Link from "next/link";
import type { Neighbors, Section } from "@/lib/content";

/**
 * 글 끝에 붙는 갈림길.
 *
 * 지금까지 글을 다 읽으면 「← 읽은 것」 하나뿐이라 거기서 길이 끊겼다.
 * 세 방향 다 이미 있는 자료에서만 나온다 — 목록의 순서, 앞머리의 갈래,
 * 「읽고 싶은 책들」의 「어디서」 칸. 없는 방향은 그리지 않는다.
 */
export default function Neighbors({ n, dir }: { n: Neighbors; dir: Section }) {
  const has = n.around.length || n.strands.length || n.sprouted.length;
  if (!has) return null;

  return (
    <nav className="neighbors">
      {n.sprouted.length > 0 && (
        <section>
          <h2>여기서 뻗어나간 책</h2>
          <p className="why">읽고 나서 「여기서 더 가볼 만한 곳」으로 적어둔 것들입니다.</p>
          <ul>
            {n.sprouted.map((b) => (
              <li key={b.title}>
                <span className="t">{b.title}</span>
                {b.author && <span className="by">{b.author}</span>}
                {/* 「· 읽음」이 붙어 있으면 실제로 따라간 것이다 */}
                {b.note?.includes("읽음") && <span className="done">읽음</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {n.strands.length > 0 && (
        <section>
          <h2>같은 갈래에 걸린 것</h2>
          <p className="why">
            섹션은 매체로 나뉘지만 관심사는 그걸 가로지릅니다.{" "}
            <Link href="/threads/">갈래</Link>에 전부 모여 있습니다.
          </p>
          <ul>
            {n.strands.map(({ item, via }) => (
              <li key={`${item.section}-${item.title}`}>
                {item.href ? (
                  <Link href={item.href}>{item.title}</Link>
                ) : (
                  <span className="t">{item.title}</span>
                )}
                <span className="by">{item.sectionKo}</span>
                {/* 무엇을 함께 쓰는지. 이게 이웃인 이유다 */}
                <span className="via">{via.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {n.around.length > 0 && (
        <section>
          <h2>그 무렵에 읽은 것</h2>
          <p className="why">
            {n.aroundFrom && (
              <>
                <Link href={`/${dir}/${n.aroundFrom.slug}/`}>{n.aroundFrom.title}</Link>에
                적힌 순서대로, 앞뒤에 놓인 책들입니다.{" "}
              </>
            )}
            같은 시기라는 것 말고 다른 뜻은 없습니다.
          </p>
          <ul>
            {n.around.map((b) => (
              <li key={`${b.order}-${b.title}`}>
                {b.slug ? (
                  <Link href={`/${dir}/${b.slug}/`}>{b.title}</Link>
                ) : (
                  <span className="t">{b.title}</span>
                )}
                {b.author && <span className="by">{b.author}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </nav>
  );
}
