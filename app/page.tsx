import Link from "next/link";

const GATEWAYS = [
  { href: "/me", ko: "나", en: "Me", desc: "기억날 때마다 하나씩 적어두는, 형식 없는 기록" },
  { href: "/work", ko: "만든 것", en: "Work", desc: "직접 만들었거나 만들고 있는 것들" },
  { href: "/writing", ko: "글", en: "Writing", desc: "조금 길게 쓴 글" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Eunchan Joe</h1>
        <p>
          조은찬입니다. 사람이 왜 그렇게 하는지가 궁금해서 심리학을 공부하고, 궁금한 걸
          직접 만들어보면서 확인합니다. 이곳은 그 과정을 조금씩 쌓아두는 자리입니다.
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
