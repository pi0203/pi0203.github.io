"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 지금 어디에 있는지.
 *
 * 검색으로 글 하나에 바로 떨어진 사람은 여기가 무엇의 일부인지 알 수 없었다.
 * 맨 위에 한 줄로 둔다.
 *
 * 섹션 화면에서는 안 그린다 — 바로 아래 큰 제목이 같은 말을 한다.
 * 이름은 `titles`에서만 가져온다. 없으면 그 칸을 통째로 접는다.
 */
export default function Breadcrumb({ titles }: { titles: Record<string, string> }) {
  const pathname = usePathname() ?? "/";
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const section = `/${parts[0]}`;
  const here = titles[`/${parts[0]}/${parts[1]}`];
  if (!titles[section] || !here) return null;

  return (
    <nav className="crumbs" aria-label="위치">
      <Link href={`${section}/`}>{titles[section]}</Link>
      <span aria-hidden="true">›</span>
      <span className="here">{here}</span>
    </nav>
  );
}
