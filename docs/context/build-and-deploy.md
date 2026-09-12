# 빌드·배포·studio

**언제 읽나** — 명령을 돌릴 때. 배포가 깨졌을 때. `npm run studio`를 손볼 때.
무엇을 커밋하면 안 되는지 확인할 때.

## 명령어

```bash
npm run dev     # 로컬 확인 (http://localhost:3000)
npm run studio  # 항목 만들기 화면 (http://localhost:4321). 이 컴퓨터에서만 열린다
npm run build   # 정적 내보내기 → out/
git push        # GitHub Pages(약 60초) + Vercel(약 10초) 자동 배포
```

Next.js 정적 내보내기(`output: "export"`) → GitHub Pages와 Vercel 양쪽에 자동 배포.

## 주의

- `out/`, `.vercel`, `.env*`는 커밋하지 않는다 (`.gitignore`에 있음)
- **`_원본자료/`와 `군대에서 읽은 책들(인스타 게시물 보관함 캡쳐)/`도 gitignore다.**
  이 저장소는 공개다. SNS 캡쳐에는 계정명·좋아요 수·사적인 사진이 함께 담긴다
- `HANDOFF.md`도 gitignore다. 작업 상태가 공개 저장소에 쌓이지 않게 한다
- GitHub Pages는 **Actions 빌드 방식(`build_type: workflow`)이어야 한다.**
  저장소 브랜치 방식으로 되돌아가면 `_next/` 폴더를 Jekyll이 무시해서 CSS가 전부 깨진다

## `npm run studio`

`studio/server.mjs` — 의존성 없는 독립 스크립트. **Next 안에 두지 않는다.**
이 사이트는 `output: "export"`라 서버가 없어서, 파일을 쓰는 라우트를 Next에 넣으면
정적 내보내기가 깨진다. `127.0.0.1`에만 열어 다른 기기에서는 접속되지 않는다.

- 저장과 올리기는 **반드시 두 단계**다. 저장 뒤 무엇이 올라가는지 다시 보여주고 그다음에 버튼
- **`content/` 밖의 변경이 있으면 올리기를 막는다.** 코드 수정이 딸려 올라가는 걸 방지한다.
  그럴 때는 터미널에서 직접 올린다
- 기존 파일은 덮어쓰지 않는다. 제목·날짜·주소 형식이 틀리면 파일을 아예 만들지 않는다
- `git push` 실패는 화면에 그대로 보여준다

## README.md

create-next-app 기본 문서 그대로이고 이 프로젝트에 대한 내용이 없다. **참고하지 않는다.**
