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
          조은찬입니다. 임상심리학을 공부합니다. 음식중독이라는 개념이 실제로 성립하는지
          문헌을 살펴보다가 자가점검 도구를 만들었고, 지금은 측정과 개입 쪽을 보고 있습니다.
        </p>
        <p>
          그건 하나의 관심사일 뿐이라 나머지도 여기에 적어둡니다. 군 복무 동안 읽은 책
          목록도 옮기는 중입니다.
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
