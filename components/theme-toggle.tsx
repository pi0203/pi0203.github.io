"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const ORDER: Theme[] = ["system", "light", "dark"];
const LABEL: Record<Theme, string> = {
  system: "기기 설정",
  light: "밝게",
  dark: "어둡게",
};
/* 기기 설정일 때는 해도 달도 아닌 중립 기호를 쓴다 */
const ICON: Record<Theme, string> = { system: "◐", light: "☀", dark: "☾" };

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {
    // 시크릿 모드나 저장이 막힌 환경. 이번 방문에만 적용되고 끝난다
  }
}

export default function ThemeToggle() {
  // 서버에서 그린 것과 어긋나지 않도록 첫 렌더는 기본값으로 두고,
  // 붙은 뒤에 실제 값을 읽어 맞춘다
  const [theme, setTheme] = useState<Theme>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: Theme = "system";
    try {
      const v = localStorage.getItem("theme");
      if (v === "light" || v === "dark") saved = v;
    } catch {
      /* 못 읽으면 기기 설정으로 둔다 */
    }
    setTheme(saved);
    setReady(true);
  }, []);

  function next() {
    const value = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setTheme(value);
    apply(value);
  }

  return (
    <button
      type="button"
      className="themetoggle"
      onClick={next}
      aria-label={`화면 밝기: ${LABEL[theme]}. 눌러서 바꾸기`}
      title={LABEL[theme]}
      /* 값을 읽기 전에는 아이콘을 감춰 깜빡임을 막는다 */
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      {ICON[theme]}
    </button>
  );
}
