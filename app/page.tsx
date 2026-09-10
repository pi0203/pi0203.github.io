import Link from "next/link";

const GATEWAYS = [
  { href: "/me", ko: "나", en: "Me", desc: "기억날 때마다 하나씩 적어두는, 형식 없는 기록" },
  { href: "/work", ko: "만든 것", en: "Work", desc: "직접 만들었거나 만들고 있는 것들" },
  { href: "/reading", ko: "읽은 것", en: "Reading", desc: "읽은 책과 그 뒤에 남은 생각" },
  { href: "/watching", ko: "본 것", en: "Watching", desc: "재밌게 본 영화와 드라마" },
  { href: "/writing", ko: "글", en: "Writing", desc: "조금 길게 쓴 글" },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <h1>Eunchan Joe</h1>
        <p>
          조은찬입니다. 임상심리학을 공부합니다.
        </p>
        <p>
          하나를 제대로 알아보려 들면 결국 그 사람 전체를 보게 되더군요. 그래서 한 분야
          안에만 머물지 않으려 합니다. 뇌과학과 통계학과 죽음에 관한 책이 한 시기에 나란히
          놓여 있던 것도 그래서입니다.
        </p>
        <p>
          궁금한 게 생기면 만들어보는 편이고, 계속 쓰고 배우는 사람으로 남고 싶습니다.
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
