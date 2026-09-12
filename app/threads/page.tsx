import Link from "next/link";
import { getPlaces, formatMonth } from "@/lib/content";
import PlaceArcs, { PlaceArcList } from "@/components/place-arcs";
import { placeAnchor as anchorOf, bridgeAnchor } from "@/lib/anchors";

export const metadata = { title: "자리 — Eunchan Joe" };

const WHEN_KO = {
  then: "그때 두꺼웠던 자리",
  both: "그때와 지금에 걸친 자리",
  now: "지금 열려 있는 자리",
} as const;

/** 「왜」 칸의 마크다운 링크 하나만 풀어준다. 표의 한 칸이라 marked를 거치지 않는다 */
function whyHtml(s: string): string {
  return s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2" rel="noreferrer">$1</a>',
  );
}

export default function ThreadsPage() {
  const { places, bridges } = getPlaces();
  const told = bridges.filter((b) => b.note);

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Threads</p>
        <h1>자리</h1>
        <p>
          위 칸들은 매체로 나뉘어 있습니다 — 읽은 것, 만든 것, 본 것. 그런데 생각은 그렇게
          나뉘지 않아서, <strong>여러 권이 함께 걸리는 자리</strong>를 여기 모읍니다.
          한 권이 여러 자리에 걸릴 수 있고, 한 책에서 다른 책으로 뻗어나가기도 합니다.
          그렇게 <strong>생각이 이어진 자국</strong>을 따라갈 수 있게 두었습니다.
        </p>
      </div>

      {/* 1. 자리들이 만나는 곳 — 시간이 아니라 이어짐이 축이다 */}
      <section className="mapblock">
        <h2>
          자리들이 만나는 곳
          <span className="desc">
            자리 {places.length}개가 {bridges.length}군데에서 서로 이어진다
          </span>
        </h2>
        {/* 어디서 시작할지를 한 문장으로. 처음 오는 사람은 여기부터 읽는다 */}
        <p className="mapnote lead">
          <strong>제일 진한 선부터 보세요.</strong> 두 자리가 왜 이어지는지 적어둔 것이
          있다는 표시이고, 눌러서 읽을 수 있습니다.
        </p>

        <PlaceArcs places={places} bridges={bridges} />
        <PlaceArcList bridges={bridges} />

        {/* 화면에 실제로 그려진 신호만 설명한다. 없는 표시를 설명하지 않는다 */}
        <p className="legend">
          <span className="k line" /> 같은 책을 나눠 씀
          <span className="k line dash" /> 한 책에서 다른 책으로 뻗어나감
          {told.length > 0 && (
            <>
              <span className="k line told" /> 왜 이어지는지 적어둔 것이 있음
            </>
          )}
          <span className="k dot then" /> 그때 두꺼웠던 자리
          {places.some((p) => p.when === "both") && (
            <>
              <span className="k dot both" /> 그때와 지금에 걸친 자리
            </>
          )}
          {places.some((p) => p.when === "now") && (
            <>
              <span className="k dot now" /> 지금 열려 있는 자리
            </>
          )}
          <em>선이 굵을수록 여러 번 이어집니다. 연한 것은 나란히 놓아본 자리입니다.</em>
        </p>

        {/* 차례 — 스물다섯 개짜리 화면의 입구 */}
        <ul className="maplist wide toc">
          {places.map((p) => (
            <li key={p.name}>
              <a href={`#${anchorOf(p.name)}`}>{p.name}</a>
              <span className="n">{p.books.length + p.items.length}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. 다리에 붙은 글. 선으로 끝나지 않는 이어짐이 여기 있다 */}
      {told.length > 0 && (
        <section className="mapblock">
          <h2>이어지지만 같지 않은 자리</h2>
          <p className="mapnote">
            두 자리가 책을 나눠 쓸 때, 왜 이어지는지를 적어둔 것들입니다.
            근거가 없는 이어짐에는 아무것도 적지 않았습니다.
          </p>
          {told.map((b) => (
            <div className="bridge" id={bridgeAnchor(b)} key={`${b.a}-${b.b}`}>
              <h3>
                <Link href={`#${anchorOf(b.a)}`}>{b.a}</Link>
                <span className="cap">∩</span>
                <Link href={`#${anchorOf(b.b)}`}>{b.b}</Link>
              </h3>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: b.note as string }}
              />
            </div>
          ))}
        </section>
      )}

      {/* 3. 자리 하나하나. 목록이 아니라 문으로 끝난다 */}
      <div className="strands">
        {places.map((p) => (
          <section
            key={p.name}
            id={anchorOf(p.name)}
            className={`strand place${p.layer === "possible" ? " possible" : ""}`}
          >
            <h2>
              {p.name}
              <span className="count">{p.books.length + p.items.length}</span>
            </h2>

            <p className="when">
              {WHEN_KO[p.when ?? "then"]}
              {p.layer === "possible" && (
                <span className="layer"> · 이어질 수 있는 자리</span>
              )}
            </p>

            {p.why && (
              <div className="why prose" dangerouslySetInnerHTML={{ __html: p.why }} />
            )}

            {p.missed && (
              <div className="missed">
                <h3>그때 못 보고 지나친 것</h3>
                <div className="prose" dangerouslySetInnerHTML={{ __html: p.missed }} />
              </div>
            )}

            {/* 이 자리가 다른 자리와 이어지는 이유. 위에 한 번 모아 보여주지만
                여기서도 읽혀야 그 선이 무슨 뜻인지 제자리에서 알 수 있다 */}
            {p.told.map((b) => {
              const other = b.a === p.name ? b.b : b.a;
              return (
                <div className="told" key={`${b.a}-${b.b}`}>
                  <h3>
                    <Link href={`#${anchorOf(other)}`}>{other}</Link>
                    <span>와 이어지는 자리</span>
                  </h3>
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: b.note as string }}
                  />
                </div>
              );
            })}

            {p.items.length > 0 && (
              <ul className="wrote">
                {p.items.map((it) => (
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

            {p.books.length > 0 && (
              <ul className="pbooks">
                {p.books.map((b) => (
                  <li key={b.title}>
                    <span className="head">
                      {b.slug ? (
                        <Link href={`/reading/${b.slug}/`}>{b.title}</Link>
                      ) : (
                        <span className="t">{b.title}</span>
                      )}
                      {b.unread && <span className="yet">아직 안 읽음</span>}
                      {/* 여러 자리에 걸린 책은 다른 자리로 건너뛰는 문이 된다 */}
                      {[...b.also, ...(b.from?.places ?? [])]
                        .filter((n, k, a) => a.indexOf(n) === k)
                        .map((name) => (
                          <Link key={name} className="also" href={`#${anchorOf(name)}`}>
                            {name}
                          </Link>
                        ))}
                    </span>
                    {/* 왜 이 자리에 걸리는지. 조사로 이은 것에는 출처가 함께 붙는다 */}
                    {b.why && (
                      <span
                        className="why"
                        dangerouslySetInnerHTML={{ __html: whyHtml(b.why) }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="tail">
        아홉 갈래로 적어둔 <Link href="/me/#갈래">지금 관심이 벌어져 있는 자리들</Link>은
        그대로 있습니다. 그쪽은 지금 하고 있는 일이고, 여기는 그 일이 어디서 왔는지에
        가깝습니다. 둘이 겹치는 자리도 있고 아직 만나지 않은 자리도 있습니다.
      </p>
    </>
  );
}
