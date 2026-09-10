/**
 * npm run studio — 항목을 파일로 만들어주는 로컬 입력 화면.
 *
 * 왜 Next 안이 아니라 따로 떨어져 있나:
 *   이 사이트는 output: "export"라 서버가 없다. 파일을 쓰려면 서버가 필요한데
 *   Next에 라우트 핸들러를 넣으면 정적 내보내기가 깨진다. 그래서 완전히 분리했다.
 *
 * 왜 의존성이 없나:
 *   내 맥에서만 도는 도구다. 배포되지 않고, 저장소를 무겁게 할 이유도 없다.
 *   node 기본 모듈만 쓴다.
 *
 * 바깥에서는 접속할 수 없다 (127.0.0.1에만 연다).
 */

import { createServer } from "node:http";
import { writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const PORT = 4321;

const SECTIONS = {
  me: { label: "나", freeName: true },
  work: { label: "만든 것", freeName: false },
  reading: { label: "읽은 것", freeName: false },
  watching: { label: "본 것", freeName: false },
  writing: { label: "글", freeName: false },
};

const today = () => new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD

/** 이미 있는 항목을 세어 화면에 보여준다 */
function counts() {
  return Object.keys(SECTIONS).map((s) => {
    const dir = path.join(CONTENT, s);
    const n = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")).length : 0;
    return { s, label: SECTIONS[s].label, n };
  });
}

function esc(v = "") {
  return String(v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

/**
 * 파일 이름을 정한다.
 *   me           — 날짜 + 제목. 한글을 그대로 써도 된다 (상세 페이지가 없어서 주소가 안 된다)
 *   그 밖의 섹션  — 주소가 되므로 영문 소문자·숫자·붙임표만. 사용자가 직접 적는다
 */
function fileNameFor(section, { title, date, slug }) {
  if (SECTIONS[section].freeName) {
    const safe = title.trim().replace(/[\/\\:*?"<>|]/g, "").replace(/\s+/g, "-");
    return `${date}-${safe}.md`;
  }
  return `${slug}.md`;
}

function frontMatter(fields) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === "" || v === false) continue;
    if (v === true) lines.push(`${k}: true`);
    else lines.push(`${k}: ${v}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

const STYLE = `<style>
  :root { --bg:#d9effd; --text:#131b25; --muted:#4f5d73; --rule:#b6dcf4; --accent:#a93814; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#131a23; --text:#e8eef5; --muted:#8a97a8; --rule:#2a3441; --accent:#ff8a63; }
  }
  * { box-sizing: border-box }
  body { margin:0; background:var(--bg); color:var(--text); font:15px/1.7 -apple-system,
    "Apple SD Gothic Neo", sans-serif; padding:2.5rem 1.5rem 5rem; word-break:keep-all }
  main { max-width:44rem; margin:0 auto }
  h1 { font-size:1.4rem; font-weight:500; margin:0 0 .3rem }
  .sub { color:var(--muted); font-size:.88rem; margin:0 0 2rem }
  .counts { display:flex; gap:1.1rem; flex-wrap:wrap; font-size:.8rem; color:var(--muted);
    border-top:1px solid var(--rule); border-bottom:1px solid var(--rule); padding:.7rem 0; margin-bottom:2rem }
  label { display:block; margin:1.1rem 0 .3rem; font-size:.82rem; letter-spacing:.04em; color:var(--muted) }
  input, select, textarea { width:100%; font:inherit; color:inherit; background:transparent;
    border:1px solid var(--rule); border-radius:4px; padding:.55rem .7rem }
  input:focus, select:focus, textarea:focus { outline:none; border-color:var(--accent) }
  textarea { min-height:16rem; resize:vertical; line-height:1.8 }
  .row { display:flex; gap:1rem } .row > * { flex:1 }
  .hint { font-size:.76rem; color:var(--muted); margin-top:.3rem }
  button { margin-top:1.8rem; font:inherit; font-size:.95rem; padding:.6rem 1.4rem;
    background:var(--accent); color:#fff; border:0; border-radius:4px; cursor:pointer }
  .msg { padding:.8rem 1rem; border-radius:4px; margin-bottom:1.5rem; font-size:.9rem;
    border:1px solid var(--rule) }
  .ok { border-color:var(--accent) } .err { border-color:var(--accent); color:var(--accent) }
  .opt { display:flex; align-items:center; gap:.5rem; margin-top:1.1rem; font-size:.85rem; color:var(--muted) }
  .opt input { width:auto }
  code { background:rgba(128,128,128,.15); padding:.1em .35em; border-radius:3px; font-size:.9em }

  pre { background:rgba(128,128,128,.12); padding:.9rem 1rem; border-radius:4px;
    overflow-x:auto; font-size:.82rem; line-height:1.6; white-space:pre-wrap; word-break:break-all }
  ul { margin:.4rem 0 0; padding-left:1.2rem } li { font-size:.85rem }
  a { color:var(--accent) }
</style>`;

const page = (msg = "", tone = "") => `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>studio — 항목 만들기</title>
${STYLE}</head><body><main>
<h1>항목 만들기</h1>
<p class="sub">저장하면 <code>content/</code> 안에 파일이 생깁니다. 그다음 <code>git push</code> 하면 사이트에 올라갑니다.</p>
${msg ? `<div class="msg ${tone}">${msg}</div>` : ""}
<div class="counts">${counts().map((c) => `<span>${c.label} ${c.n}</span>`).join("")}</div>

<form method="POST" action="/save">
  <div class="row">
    <div>
      <label for="section">어디에</label>
      <select id="section" name="section">
        ${Object.entries(SECTIONS).map(([k, v]) => `<option value="${k}">${v.label} (${k})</option>`).join("")}
      </select>
    </div>
    <div>
      <label for="date">날짜</label>
      <input id="date" name="date" value="${today()}" pattern="\\d{4}-\\d{2}-\\d{2}">
    </div>
  </div>

  <label for="title">제목</label>
  <input id="title" name="title" required autofocus>

  <label for="slug">주소 (영문 소문자·숫자·붙임표)</label>
  <input id="slug" name="slug" placeholder="예: nexus, mr-sunshine">
  <p class="hint">"나"에 쓸 때는 비워두세요 — 날짜와 제목으로 자동으로 만듭니다.
    나머지 섹션은 이 값이 주소가 되므로 꼭 적어야 합니다.</p>

  <div class="row">
    <div>
      <label for="tag">분류 <span style="opacity:.6">— "나"에만</span></label>
      <input id="tag" name="tag" placeholder="관심 / 기록 …">
    </div>
    <div>
      <label for="author">지은이 <span style="opacity:.6">— 책·영화</span></label>
      <input id="author" name="author">
    </div>
  </div>

  <label for="summary">한 줄 요약 <span style="opacity:.6">— 목록에 보입니다</span></label>
  <input id="summary" name="summary">

  <label for="body">본문</label>
  <textarea id="body" name="body" placeholder="마크다운으로 씁니다. 그냥 줄글로 써도 됩니다."></textarea>

  <div class="opt">
    <input type="checkbox" id="list" name="list" value="1">
    <label for="list" style="margin:0">이건 목록입니다 (표로 여러 권을 담는 파일)</label>
  </div>

  <button type="submit">저장</button>
</form>
</main></body></html>`;

/* ---------------------------------------------------------------
   올리기 — 되돌리기가 늦은 작업이라 저장과 분리해 두 단계로 만든다.
   저장 화면에서 무엇이 올라가는지 다시 보여주고, 그다음에야 버튼이 나온다.
   --------------------------------------------------------------- */

function git(args) {
  const r = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout || "") + (r.stderr || "") };
}

/** 올라갈 파일 목록. content/ 밖이 섞였는지도 함께 돌려준다 */
function pendingChanges() {
  const { ok, out } = git(["status", "--porcelain"]);
  if (!ok) return { error: out };
  const files = out
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => ({ state: l.slice(0, 2).trim(), file: l.slice(3).replace(/^"|"$/g, "") }));
  const outside = files.filter((f) => !f.file.startsWith("content/"));
  return { files, outside };
}

const confirmPage = ({ section, name, title, md }) => {
  const { files, outside, error } = pendingChanges();
  const where = SECTIONS[section].freeName ? `/${section}/` : `/${section}/`;

  let action;
  if (error) {
    action = `<div class="msg err">git 상태를 읽지 못했습니다.<pre>${esc(error)}</pre></div>`;
  } else if (outside.length) {
    // content/ 밖 변경이 섞여 있으면 막는다. 코드 수정이 딸려 올라가면 안 된다
    action = `<div class="msg err">
      <b>여기서는 올릴 수 없습니다.</b> <code>content/</code> 밖의 변경이 함께 있습니다:
      <ul>${outside.map((f) => `<li><code>${esc(f.file)}</code></li>`).join("")}</ul>
      코드 변경이 딸려 올라가는 걸 막으려고 일부러 멈춥니다. 터미널에서 직접 확인하고 올려주세요.
    </div>`;
  } else {
    action = `<form method="POST" action="/publish">
      <input type="hidden" name="title" value="${esc(title)}">
      <button type="submit">사이트에 올리기</button>
      <p class="hint">누르면 아래 파일들이 공개됩니다. 되돌리기는 늦습니다.</p>
    </form>`;
  }

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>확인하고 올리기</title>
${STYLE}</head><body><main>
<h1>저장했습니다</h1>
<p class="sub"><code>content/${section}/${esc(name)}</code></p>

<div class="msg ok">
  <b>올라갈 파일</b>
  <ul>${(files || []).map((f) => `<li><code>${esc(f.state)}</code> ${esc(f.file)}</li>`).join("") || "<li>없음</li>"}</ul>
</div>

<label>내용 다시 보기</label>
<pre>${esc(md)}</pre>

${action}

<p class="hint" style="margin-top:2rem">
  올리기 전에 눈으로 보려면 <code>npm run dev</code> 후
  <code>http://localhost:3000${where}</code>
</p>
<p><a href="/">&larr; 하나 더 쓰기</a></p>
</main></body></html>`;
};

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const out = {};
      for (const [k, v] of new URLSearchParams(raw)) out[k] = v;
      resolve(out);
    });
  });
}

const server = createServer(async (req, res) => {
  const send = (html, code = 200) => {
    res.writeHead(code, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  };

  if (req.method === "GET") return send(page());
  if (req.method !== "POST") return send(page(), 405);

  const f = await readBody(req);

  // --- 올리기 ---------------------------------------------------
  if (req.url === "/publish") {
    const { outside, error } = pendingChanges();
    if (error) return send(page(`git 상태를 읽지 못했습니다.<pre>${esc(error)}</pre>`, "err"), 500);
    if (outside.length) {
      // 확인 화면을 지나온 뒤에도 한 번 더 막는다. 그 사이에 뭔가 바뀌었을 수 있다
      return send(page("content/ 밖의 변경이 있어 올리지 않았습니다. 터미널에서 직접 해주세요.", "err"), 400);
    }

    const steps = [
      ["add", "content"],
      ["commit", "-m", `항목 추가: ${(f.title || "").trim() || "제목 없음"}`],
      ["push"],
    ];
    for (const args of steps) {
      const r = git(args);
      if (!r.ok) {
        // 실패를 조용히 삼키지 않는다. git이 한 말을 그대로 보여준다
        return send(
          page(`<b>git ${args[0]} 에서 멈췄습니다.</b><pre>${esc(r.out)}</pre>`, "err"),
          500,
        );
      }
    }
    return send(
      page(
        "올렸습니다. 약 1분 뒤 " +
          '<a href="https://eunchanjoe.vercel.app" target="_blank">eunchanjoe.vercel.app</a> 에 반영됩니다.',
        "ok",
      ),
    );
  }

  const section = f.section;
  const title = (f.title || "").trim();
  const date = (f.date || "").trim();
  const slug = (f.slug || "").trim();

  // 저장하기 전에 막을 것들 — 하나라도 걸리면 파일을 만들지 않는다
  const fail = (m) => send(page(m, "err"), 400);
  if (!SECTIONS[section]) return fail("섹션을 알 수 없습니다.");
  if (!title) return fail("제목이 비어 있습니다.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail("날짜는 2026-09-10 형태로 적어주세요.");
  if (!SECTIONS[section].freeName) {
    if (!slug) return fail(`"${SECTIONS[section].label}"은 주소가 필요합니다. 영문 소문자·숫자·붙임표로 적어주세요.`);
    if (!/^[a-z0-9-]+$/.test(slug)) return fail("주소에는 영문 소문자, 숫자, 붙임표만 쓸 수 있습니다.");
  }

  const dir = path.join(CONTENT, section);
  mkdirSync(dir, { recursive: true });
  const name = fileNameFor(section, { title, date, slug });
  const full = path.join(dir, name);

  // 이미 있는 파일을 덮어쓰지 않는다. 되돌릴 수 없는 실수를 막는 게 우선이다
  if (existsSync(full)) {
    return fail(`<code>content/${section}/${name}</code> 파일이 이미 있습니다. 제목이나 주소를 바꿔주세요.`);
  }

  const md =
    frontMatter({
      title,
      date,
      tag: f.tag?.trim(),
      summary: f.summary?.trim(),
      author: f.author?.trim(),
      list: f.list === "1",
    }) + (f.body || "").trim() + "\n";

  writeFileSync(full, md, "utf8");
  return send(confirmPage({ section, name, title, md }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  항목 만들기 화면이 열렸습니다\n  http://localhost:${PORT}\n`);
  console.log(`  이 컴퓨터에서만 접속됩니다. 멈추려면 Ctrl+C\n`);
});
