import type { CorpusBand } from "@/lib/content";

/*
 * 전권을 한 장에. 점 하나가 한 권이다.
 *
 * **간선이 없으므로 난잡해질 수가 없다.** 축은 적힌 순서 — 모든 행에 있는 유일한
 * 값이고, 그게 곧 읽은 순서다. 연도는 못 쓴다(166권 중 56권이 비어 있다).
 *
 * 자리는 나눗셈이라 빌드마다 같다. 라이브러리도 자바스크립트도 쓰지 않는다.
 * 책 이름은 그림 안에 글자로 박지 않고 `<title>`로만 단다 —
 * 217개를 쓰면 그게 난잡해지는 길이다.
 */
const PER_ROW = 22;
const PITCH = 16;
const PAD = 8;
const LABEL = 22; // 띠 이름이 차지하는 높이
const GAP = 14; // 띠와 띠 사이

export default function CorpusGrid({ bands }: { bands: CorpusBand[] }) {
  if (!bands.length) return null;

  const rows = (n: number) => Math.ceil(n / PER_ROW);
  const W = PAD * 2 + PER_ROW * PITCH;
  const H =
    PAD * 2 +
    bands.reduce((sum, b) => sum + LABEL + rows(b.books.length) * PITCH + GAP, 0) -
    GAP;

  let y = PAD;

  return (
    <div className="corpus">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img"
        aria-label="읽은 책과 읽고 싶은 책 전부를 점으로 그린 그림">
        {bands.map((band) => {
          const top = y + LABEL;
          y = top + rows(band.books.length) * PITCH + GAP;

          return (
            <g key={band.slug}>
              <text className="band" x={PAD} y={top - 9}>
                {band.title}
                <tspan className="n"> {band.books.length}</tspan>
              </text>

              {band.books.map((b, i) => {
                const cx = PAD + (i % PER_ROW) * PITCH + PITCH / 2;
                const cy = top + Math.floor(i / PER_ROW) * PITCH + PITCH / 2;

                // 무엇을 진하게 그릴지. 넷 다 파일에 실제로 있는 값이다
                const kind = b.slug ? "wrote" : b.sprouts ? "sprout" : b.lined ? "lined" : "plain";
                const r = kind === "wrote" ? 5.5 : kind === "sprout" ? 4.5 : 3;

                const dot = (
                  <>
                    <circle className={`dot ${kind}`} cx={cx} cy={cy} r={r} />
                    {/* 다시 본 책은 테를 하나 더 두른다 */}
                    {b.reread && <circle className="again" cx={cx} cy={cy} r={r + 2.5} />}
                    <title>
                      {b.title}
                      {b.author ? ` · ${b.author}` : ""}
                      {b.note ? ` · ${b.note}` : ""}
                    </title>
                  </>
                );

                return b.slug ? (
                  <a key={b.title + i} href={`/reading/${b.slug}/`}>
                    {dot}
                  </a>
                ) : (
                  <g key={b.title + i}>{dot}</g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
