import Link from "next/link";
import {
  getEntries,
  getListSummaries,
  getList,
  getPlaces,
  getTwice,
  getSproutGraph,
  getCorpus,
  formatMonth,
} from "@/lib/content";
import SproutGraph, { SproutList } from "@/components/sprout-graph";
import CorpusGrid from "@/components/corpus-grid";
import { placeAnchor } from "@/lib/anchors";

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
  const corpus = getCorpus();
  const { places, bridges } = getPlaces();
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

      {/* 2. 자리 — 다섯 칸을 가로질러 책과 글이 같은 문제에서 만나는 곳 */}
      <section className="mapblock">
        <h2>
          <Link href="/threads/">자리</Link>
          <span className="desc">
            {places.length}개가 {bridges.length}군데에서 서로 이어진다
          </span>
        </h2>
        <ul className="maplist wide">
          {places.map((p) => (
            <li key={p.name}>
              <Link href={`/threads/#${placeAnchor(p.name)}`}>{p.name}</Link>
              <span className="n">{p.books.length + p.items.length}</span>
            </li>
          ))}
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

      {/*
        * 4. 전권을 한 장에.
        *
        * ⚠ 점 217개를 깔면 그대로 권수 자랑이 될 수 있다. 그래서 세는 방향을 뒤집는다 —
        * 읽은 양이 아니라 **아직 안 꺼낸 양**을 보여주는 그림으로 쓴다.
        */}
      <section className="mapblock">
        <h2>
          읽은 것 전부
          <span className="desc">점 하나가 한 권 · 적힌 순서대로</span>
        </h2>
        <p className="mapnote">
          {(() => {
            const all = corpus.reduce((n, b) => n + b.books.length, 0);
            const marked = corpus.reduce(
              (n, b) => n + b.books.filter((x) => x.slug || x.sprouts || x.lined).length,
              0,
            );
            return (
              <>
                세 목록에 {all}권이 있습니다. <strong>진한 점은 무언가 적힌 책</strong>입니다 —
                글이 붙었거나, 여기서 다른 책이 뻗어나갔거나, 지금 와서 한 줄이 달린 것.
                지금은 {marked}권입니다. <strong>나머지는 읽고 지나갔습니다.</strong>
              </>
            );
          })()}
        </p>
        <CorpusGrid bands={corpus} />
        <p className="legend">
          <span className="k wrote" /> 글이 있는 책
          <span className="k sprout" /> 여기서 뻗어나간 책이 있음
          <span className="k again" /> 두 때에 읽은 책
          {/* 넷째 칸이 붙은 책이 실제로 보일 때만. 없는 표시를 설명하지 않는다 */}
          {corpus.some((b) => b.books.some((x) => x.lined && !x.slug && !x.sprouts)) && (
            <>
              <span className="k lined" /> 지금 와서 한 줄이 붙음
            </>
          )}
          <span className="k plain" /> 그 밖에
          <em>이름은 점에 마우스를 올리면 뜹니다.</em>
        </p>
      </section>

      {/* 5. 뻗어나간 그림 — 이 사이트에서 유일하게 이미 그물인 자료 */}
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
