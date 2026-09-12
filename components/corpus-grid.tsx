import type { CorpusBand } from "@/lib/content";

/*
 * 전권을 한 장에. 점 하나가 한 권이다.
 *
 * **간선이 없으므로 난잡해질 수가 없다.** 축은 적힌 순서 — 모든 행에 있는 유일한
 * 값이고, 그게 곧 읽은 순서다. 연도는 못 쓴다(166권 중 56권이 비어 있다).
 *
 * 세 목록을 줄이 아니라 **공중에 뜬 세 개의 면**으로 그린다. 사선 투영(oblique)이라
 * 한 줄이 뒤로 물러날수록 오른쪽으로 밀리고, 그래서 목록이 덩어리가 아니라 **면**으로
 * 읽힌다. 세 목록의 두께 차이가 앞뒤로 놓인 깊이로 보인다.
 *
 * **WebGL을 쓰지 않는다.** 자리는 곱셈 두 번이라 빌드마다 같고, 라이브러리도
 * 자바스크립트도 없다. 점에 마우스를 올리면 이름이 뜨는 것도 그대로다 —
 * 3차원 캔버스로 갔으면 `<title>`도 접근성도 잃는다.
 * 책 이름은 그림 안에 글자로 박지 않는다. 217개를 쓰면 그게 난잡해지는 길이다.
 */
const PER_ROW = 22;
const PITCH = 16; // 한 줄 안에서 점 사이
const DEPTH = 9.5; // 뒤로 한 줄 물러날 때 내려가는 높이
const SKEW = 7.5; // 뒤로 한 줄 물러날 때 오른쪽으로 밀리는 폭
const PAD = 10;
const LABEL = 24;
const GAP = 30; // 면과 면 사이. 떠 있는 것처럼 보이려면 넉넉해야 한다

export default function CorpusGrid({ bands }: { bands: CorpusBand[] }) {
  if (!bands.length) return null;

  const rows = (n: number) => Math.ceil(n / PER_ROW);
  const W = PAD * 2 + PER_ROW * PITCH + 8 * SKEW;
  const H =
    PAD * 2 +
    bands.reduce((s, b) => s + LABEL + rows(b.books.length) * DEPTH + GAP, 0) -
    GAP +
    10;

  let y = PAD;

  return (
    <div className="corpus">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        role="img"
        aria-label="읽은 책과 읽고 싶은 책 전부를 면 위의 점으로 그린 그림"
      >
        {bands.map((band) => {
          const top = y + LABEL;
          const n = rows(band.books.length);
          y = top + n * DEPTH + GAP;

          // 면의 테두리. 이 선이 있어야 점들이 평면 위에 놓인 것으로 읽힌다
          const x0 = PAD;
          const x1 = PAD + PER_ROW * PITCH;
          const dx = n * SKEW;
          const dy = n * DEPTH;

          return (
            <g key={band.slug}>
              <text className="band" x={PAD} y={top - 10}>
                {band.title}
                <tspan className="n"> {band.books.length}</tspan>
              </text>

              <path
                className="plane"
                d={`M ${x0} ${top} L ${x1} ${top} L ${x1 + dx} ${top + dy} L ${x0 + dx} ${top + dy} Z`}
              />

              {band.books.map((b, i) => {
                const col = i % PER_ROW;
                const row = Math.floor(i / PER_ROW);
                // 사선 투영 — 뒤로 갈수록 오른쪽으로 밀리고 아래로 내려간다
                const cx = PAD + col * PITCH + PITCH / 2 + row * SKEW;
                const cy = top + row * DEPTH + DEPTH / 2;

                const kind = b.slug
                  ? "wrote"
                  : b.sprouts
                    ? "sprout"
                    : b.lined
                      ? "lined"
                      : "plain";
                const r = kind === "wrote" ? 5 : kind === "sprout" ? 4.2 : 2.8;

                const dot = (
                  <>
                    <circle className={`dot ${kind}`} cx={cx} cy={cy} r={r} />
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
