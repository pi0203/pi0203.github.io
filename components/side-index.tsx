"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { slug: string; title: string; list?: true };

/**
 * 넓은 화면에서만 왼쪽에 상시로 뜨는 목차.
 *
 * 본문 폭은 건드리지 않는다 — 읽는 맛이 거기서 나온다. 가운데 칸은 그대로 두고
 * 남는 여백에 얹는다. 자리가 모자라는 폭에서는 통째로 사라지고, 그때는
 * 글 끝의 갈림길과 지도가 같은 일을 한다.
 */
export default function SideIndex({ index }: { index: Record<string, Item[]> }) {
  const pathname = usePathname() ?? "/";
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[0];
  const items = section ? index[section] : undefined;
  if (!items?.length) return null;

  const here = parts[1];

  return (
    <nav className="sideindex" aria-label="이 칸에 있는 것">
      <ul>
        {items.map((it) => (
          <li key={it.slug} className={it.list ? "islist" : undefined}>
            <Link
              href={`/${section}/${it.slug}/`}
              aria-current={it.slug === here ? "page" : undefined}
            >
              {it.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/map/" className="all">
        전체 지도 →
      </Link>
    </nav>
  );
}
