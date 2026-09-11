"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { TocGroup } from "@/lib/content";

/**
 * 오른쪽에 뜨는, 지금 읽는 글 안의 목차.
 *
 * 왼쪽 곁단 목차와 답하는 질문이 다르다 —
 * **왼쪽은 이 칸에 무엇이 있나, 오른쪽은 지금 읽는 글 안에 무엇이 있나.**
 *
 * 아주 넓은 화면에서만 뜨고, 소제목이 둘 미만인 글에는 아예 안 그린다
 * (`getTocMap()`이 그런 글을 빼고 넘긴다).
 */
export default function Toc({ map }: { map: Record<string, TocGroup[]> }) {
  const pathname = usePathname() ?? "/";
  const groups = map[pathname.replace(/\/$/, "") || "/"];
  const ids = groups?.flatMap((g) => g.headings.map((h) => h.id));
  const [here, setHere] = useState<string | null>(null);

  useEffect(() => {
    if (!ids?.length) return;

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (!nodes.length) return;

    // 화면에 걸린 것 중 가장 위를 지금 자리로 친다.
    // 위쪽 좁은 띠만 보게 해서, 스크롤 방향에 따라 표시가 튀지 않게 한다.
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target.id);
          else seen.delete(e.target.id);
        }
        const first = ids.find((id) => seen.has(id));
        if (first) setHere(first);
      },
      { rootMargin: "-10% 0px -75% 0px" },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
    // ids는 주소가 바뀔 때만 달라진다
  }, [ids?.join("|")]);

  if (!groups?.length) return null;

  return (
    <nav className="toc" aria-label="이 글 안에 있는 것">
      <p className="cap">이 글 안에</p>
      {groups.map((g) => (
        <section key={g.anchor ?? g.title}>
          {/* 「나」는 한 화면에 글이 여럿이라 어느 글의 목차인지 밝혀야 한다 */}
          {g.anchor && (
            <a className="owner" href={`#${g.anchor}`}>
              {g.title}
            </a>
          )}
          <ul>
            {g.headings.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} aria-current={h.id === here ? "location" : undefined}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
