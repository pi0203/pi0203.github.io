import type { Place, PlaceBridge } from "@/lib/content";
import { bridgeAnchor } from "@/lib/anchors";

/**
 * 자리들이 만나는 곳 — 호 그림.
 *
 * **가로축을 시간으로 잡지 않는다.** 연도로 늘어놓으면 연표가 되고, 이 사이트는
 * "언제 무엇을 했는가"가 아니라 "무엇이 무엇과 만나는가"를 보여주는 자리다.
 * 그래서 축이 없다. 자리가 세로로 놓이고, 책을 함께 쓰는 자리끼리 왼쪽으로 호를 그어
 * 잇는다. 시간은 축이 아니라 점의 채움으로만 나타난다.
 *
 * 세로로 세운 이유는 한글 이름이 길어서다. 가로로 24개를 늘어놓으면 글자가 겹친다.
 *
 * 좌표는 전부 산술이다. 난수도 라이브러리도 없어서 두 번 빌드해도 같은 그림이 나온다.
 */

const ROW = 30; // 자리 한 줄
const PAD = 16;
const W = 680;
const AXIS = 158; // 점이 놓이는 세로선. 왼쪽은 호가 부푸는 자리, 오른쪽은 이름
// 부풂을 얕게 묶어둔다. 자리 순서가 이미 이어진 것끼리 붙여놓아서,
// 호를 크게 그릴 이유가 없다 — 깊은 호는 서로 겹쳐 읽기만 어려워진다
const MAX_BULGE = 68;

export default function PlaceArcs({
  places,
  bridges,
}: {
  places: Place[];
  bridges: PlaceBridge[];
}) {
  if (!places.length) return null;

  const y = (i: number) => PAD + i * ROW + ROW / 2;
  const H = PAD * 2 + places.length * ROW;
  const at = new Map(places.map((p, i) => [p.name, i]));

  return (
    <div
      className="arcs"
      role="img"
      aria-label="자리들이 책을 나눠 쓰거나 뻗어나가며 서로 이어진 그림"
    >
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {/* 호가 먼저. 점과 글자가 그 위에 온다 */}
        {bridges.map((b) => {
          const i = at.get(b.a);
          const j = at.get(b.b);
          if (i === undefined || j === undefined) return null;
          const [y1, y2] = [y(i), y(j)];
          const bulge = Math.min(Math.abs(y2 - y1) / 3 + 10, MAX_BULGE);
          const n = b.shared.length + b.sprouted.length;
          // 한 권만 나눠 쓰는 이어짐은 아주 연하게. 그건 자리 칸의 ↗ 문에 이미 다 있다.
          // 뻗어나감만으로 이어진 것은 점선으로 — 같은 책을 쓰는 것과 다른 종류다
          const kind = [
            n < 2 ? "thin" : "",
            b.note ? "told" : "",
            !b.shared.length ? "sprout" : "",
          ].filter(Boolean).join(" ");
          const path = (
            <path
              className={`arc ${kind}`.trim()}
              strokeWidth={0.9 + Math.min(n, 5) * 0.45}
              d={`M ${AXIS} ${y1} C ${AXIS - bulge} ${y1}, ${AXIS - bulge} ${y2}, ${AXIS} ${y2}`}
            />
          );
          // 글이 붙은 선은 누를 수 있어야 한다. 선이 곧 읽을 것이 있다는 표시가 된다
          return b.note ? (
            <a key={`${b.a}-${b.b}`} href={`#${bridgeAnchor(b)}`}>
              <title>{`${b.a} ∩ ${b.b} — 왜 이어지는지 적어둔 것이 있습니다`}</title>
              {path}
            </a>
          ) : (
            <g key={`${b.a}-${b.b}`}>{path}</g>
          );
        })}

        {places.map((p, i) => {
          const n = p.books.length + p.items.length;
          return (
            <g key={p.name}>
              <circle
                className={`pnode ${p.when ?? "then"}${p.layer === "possible" ? " faint" : ""}`}
                cx={AXIS}
                cy={y(i)}
                r={2.5 + Math.min(n, 25) * 0.24}
              />
              <text
                className={`plabel${p.layer === "possible" ? " faint" : ""}`}
                x={AXIS + 14}
                y={y(i)}
              >
                {p.name}
                <tspan className="n"> {n}</tspan>
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * 좁은 화면용. 그림 대신 겹침을 목록으로 떨어뜨린다.
 * 같은 자료를 다르게 그린 것이라 그림이 사라져도 내용은 안 사라진다.
 */
export function PlaceArcList({ bridges }: { bridges: PlaceBridge[] }) {
  if (!bridges.length) return null;
  return (
    <ul className="arclist">
      {bridges.map((b) => (
        <li key={`${b.a}-${b.b}`}>
          <span className="pair">
            {b.a} <span className="cap">∩</span> {b.b}
          </span>
          <span className="shared">
            {b.shared.join(" · ")}
            {b.sprouted.map((e) => (
              <span key={`${e.from}-${e.to}`} className="sprout">
                {e.from} → {e.to}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
