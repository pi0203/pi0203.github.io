import type { SproutGraph } from "@/lib/content";

/*
 * 자리는 여기서 계산해 그대로 박아 넣는다. 무작위가 없으므로
 * 몇 번을 빌드해도 같은 그림이 나온다. 라이브러리도 쓰지 않는다.
 */
const ROW = 26; // 뻗어나간 책 한 줄의 높이
const PAD = 18;
const W = 680; // viewBox 기준 폭. 실제 크기는 화면에 맞춰 늘어난다
const SRC_X = 224; // 출발점 점
const DST_X = 288; // 도착점 점

export default function SproutGraph({ g }: { g: SproutGraph }) {
  if (!g.targets.length) return null;

  const y = (i: number) => PAD + i * ROW + ROW / 2;
  const H = PAD * 2 + g.targets.length * ROW;

  // 출발점은 제 자식들의 한가운데에 놓는다. 그러면 선이 서로 안 넘는다
  const srcY = new Map(
    g.sources.map((s) => {
      const rows = g.targets.flatMap((t, i) => (t.from === s.title ? [y(i)] : []));
      return [s.title, rows.reduce((a, b) => a + b, 0) / rows.length];
    }),
  );

  return (
    <div className="graph" role="img" aria-label="읽은 책에서 뻗어나간 책들의 그림">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        {g.targets.map((t, i) => {
          const sy = srcY.get(t.from) ?? y(i);
          return (
            <path
              key={`e${i}`}
              className="edge"
              d={`M ${SRC_X} ${sy} C ${SRC_X + 30} ${sy}, ${DST_X - 30} ${y(i)}, ${DST_X} ${y(i)}`}
            />
          );
        })}

        {g.sources.map((s) => {
          const sy = srcY.get(s.title) ?? 0;
          return (
            <g key={s.title}>
              <text className="src" x={SRC_X - 12} y={sy} textAnchor="end">
                {s.title}
              </text>
              {/* 많이 벌어진 출발점일수록 크게 */}
              <circle className="node src" cx={SRC_X} cy={sy} r={2.5 + s.fanout * 0.7} />
            </g>
          );
        })}

        {g.targets.map((t, i) => (
          <g key={`t${i}`}>
            <circle className={`node dst${t.read ? " read" : ""}`} cx={DST_X} cy={y(i)} r="3" />
            <text className={`dst${t.read ? " read" : ""}`} x={DST_X + 12} y={y(i)}>
              {t.title}
              {t.read && <tspan className="mark"> · 읽음</tspan>}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/** 좁은 화면에서 그림 대신 떨어지는 같은 내용 */
export function SproutList({ g }: { g: SproutGraph }) {
  return (
    <ul className="sproutlist">
      {g.sources.map((s) => (
        <li key={s.title}>
          <span className="from">{s.title}</span>
          <span className="to">
            {g.targets
              .filter((t) => t.from === s.title)
              .map((t) => (
                <span key={t.title} className={t.read ? "read" : undefined}>
                  {t.title}
                  {t.read && " · 읽음"}
                </span>
              ))}
          </span>
        </li>
      ))}
    </ul>
  );
}
