import Link from "next/link";

const GATEWAYS = [
  { href: "/me", ko: "나", en: "Me", desc: "기억날 때마다 하나씩 적어두는, 형식 없는 기록" },
  { href: "/work", ko: "만든 것", en: "Work", desc: "직접 만들었거나 만들고 있는 것들" },
  { href: "/reading", ko: "읽은 것", en: "Reading", desc: "읽은 책과 그 뒤에 남은 생각" },
  { href: "/writing", ko: "글", en: "Writing", desc: "조금 길게 쓴 글" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Eunchan Joe</h1>
        <p>
          조은찬입니다. 임상심리학을 공부합니다. 사람이 스스로 원하지 않는다고 말하면서도
          같은 행동을 반복하는 자리가 궁금해서 시작했고, 지금은 그 궁금함을 진단명 사이를
          가로지르는 기제와 그걸 재는 방법 쪽으로 좁혀가는 중입니다.
        </p>
        <p>
          그전에는 비어있을 뻔한 시간이 있었습니다. 군 복무 동안 200권쯤을 읽었고, 뇌과학과
          신학과 통계학이 한 책상 위에 같이 있었습니다. 지금 하는 일은 그때 벌려둔 것들이
          모여든 자리에 가깝습니다. 아무것도 닿지 않기로 되어 있는 시간이 있다는 걸 그때
          알았고, 그래서 도움이 가장 늦게 도착하는 쪽이 자꾸 눈에 걸립니다.
        </p>
      </section>

      <nav className="gateways">
        {GATEWAYS.map((g) => (
          <Link key={g.href} href={g.href} className="gateway">
            <span className="ko">{g.ko}</span>
            <span className="desc">{g.desc}</span>
            <span className="arrow">&rarr;</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
