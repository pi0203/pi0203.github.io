import type { PlaceBridge } from "@/lib/content";

/**
 * 자리와 이어짐의 앵커 이름.
 *
 * 화면 여러 곳이 같은 자리로 뛴다 — 호 그림, 자리 칸의 ↗ 문, 다리 글의 제목,
 * 그리고 책 상세 페이지. 이름 짓는 법이 한 군데 있어야 어긋나지 않는다.
 */
export function placeAnchor(name: string): string {
  return `p-${name.replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "")}`;
}

export function bridgeAnchor(b: PlaceBridge): string {
  return `x-${placeAnchor(b.a)}-${placeAnchor(b.b)}`;
}
