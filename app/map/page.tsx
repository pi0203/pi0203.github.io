import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  getByStrand,
  STRAND_NAMES,
  getTwice,
  getSproutGraph,
  formatMonth,
} from "@/lib/content";
import SproutGraph, { SproutList } from "@/components/sprout-graph";

export const metadata = { title: "지도 — Eunchan Joe" };

const SECTIONS = [
  { dir: "me", ko: "나", desc: "형식 없이 쌓이는 기록" },
  { dir: "work", ko: "만든 것", desc: "만들었거나 만들고 있는 것" },
  { dir: "reading", ko: "읽은 것", desc: "책과 그 뒤에 남은 생각" },
  { dir: "watching", ko: "본 것", desc: "영화와 드라마" },
  { dir: "writing", ko: "글", desc: "조금 길게 쓴 것" },
] as const;

export default function MapPage() {
  const graph = getSproutGraph();
  const strands = getByStrand();
  const twice = getTwice("reading");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Map</p>
        <h1>지도</h1>
        <p>
          이 사이트에 있는 것을 한 장에 펼쳐둡니다. 어디에 무엇이 있는지 찾아보기 위한
          화면이라 설명은 짧게 두었습니다.
        </p>
      </div>

      {/* 1. 다섯 칸을 통째로 펼친다 */}
      {SECTIONS.map((s) => {
        const entries = getEntries(s.dir);
        const lists = getListSummaries(s.dir);
        if (!entries.length && !lists.length) return null;
        return (
          <section key={s.dir} className="mapblock">
            <h2>
              <Link href={`/${s.dir}/`}>{s.ko}</Link>
              <span className="desc">{s.desc}</span>
            </h2>

            {lists.length > 0 && (
              <ul className="maplist wide">
                {lists.map((l) => {
                  const full = getList(s.dir, l.slug);
                  return (
                    <li key={l.slug}>
                      <Link href={`/${s.dir}/${l.slug}/`}>{l.title}</Link>
                      {full && <span className="n">{full.count}권</span>}
                    </li>
                  );
                })}
              </ul>
            )}

            <ul className="maplist">
              {entries.map((e) => (
                <li key={e.slug}>
                  {/* 「나」는 상세 페이지가 없어 링크를 걸지 않는다 */}
                  {s.dir === "me" ? (
                    <span className="plain">{e.title}</span>
                  ) : (
                    <Link href={`/${s.dir}/${e.slug}/`}>{e.title}</Link>
                  )}
                  <span className="n">{formatMonth(e.date)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* 2. 갈래 — 다섯 칸을 가로지르는 축 */}
      <section className="mapblock">
        <h2>
          <Link href="/threads/">갈래</Link>
          <span className="desc">칸을 가로질러 같은 관심사에 걸리는 것</span>
        </h2>
        <ul className="maplist wide">
          {STRAND_NAMES.map((name) => {
            const items = strands.get(name) ?? [];
            return (
              <li key={name}>
                {/* 비어 있는 갈래도 적는다 — 없는 것까지 보여야 지도다 */}
                {items.length ? (
                  <Link href="/threads/">{name}</Link>
                ) : (
                  <span className="plain">{name}</span>
                )}
                <span className="n">{items.length ? items.length : "비어 있음"}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 3. 두 때 */}
      {twice.length > 0 && (
        <section className="mapblock">
          <h2>
            <Link href="/reading/">같은 책, 두 때</Link>
            <span className="desc">사이를 두고 다시 본 책</span>
          </h2>
          <ul className="maplist">
            {twice.map((b) => (
              <li key={b.slug}>
                <Link href={`/reading/${b.slug}/`}>{b.title}</Link>
                <span className="n">
                  {b.read} → {b.date.slice(0, 4)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. 뻗어나간 그림 — 이 사이트에서 유일하게 이미 그물인 자료 */}
      <section className="mapblock">
        <h2>
          <Link href="/reading/to-read/">뻗어나간 자리</Link>
          <span className="desc">
            책 {graph.sources.length}권에서 {graph.targets.length}권이 따라 나왔다
          </span>
        </h2>
        <p className="mapnote">
          한 권을 읽고 나면 다음 책이 하나만 나오지는 않습니다. 읽고 나서 적어둔
          「여기서 더 가볼 만한 곳」을 그대로 그린 것입니다. 실제로 따라가 읽은 것에는
          「읽음」이 붙어 있습니다.
        </p>
        <SproutGraph g={graph} />
        <SproutList g={graph} />
      </section>
    </>
  );
}
