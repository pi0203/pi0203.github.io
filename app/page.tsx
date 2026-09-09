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
          같은 행동을 반복하는 자리가 궁금해서 시작했고, 지금은 그 궁금함이 여러 갈래로
          벌어져 있습니다. 진단명 사이를 가로지르는 공통된 기제, 그걸 재려면 무엇이
          필요한지, 재고 나서 무엇을 할 수 있는지. 그리고 도움이 가장 필요한 사람에게
          도움이 가장 늦게 닿는다는 사실.
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
