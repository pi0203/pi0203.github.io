"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArchiveBook } from "@/lib/content";

type Sort = "listed" | "title";

/** 글이 있거나 한 줄이 붙어 있는 행. 166행 중 살아 있는 쪽 */
function hasSomething(book: ArchiveBook) {
  return Boolean(book.slug || book.now);
}

export default function ArchiveList({ books }: { books: ArchiveBook[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("listed");
  const [onlyNoted, setOnlyNoted] = useState(false);

  const noted = useMemo(() => books.filter(hasSomething).length, [books]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = books.filter((book) => {
      if (onlyNoted && !hasSomething(book)) return false;
      return (
        !needle ||
        book.title.toLowerCase().includes(needle) ||
        (book.author ?? "").toLowerCase().includes(needle) ||
        (book.now ?? "").toLowerCase().includes(needle)
      );
    });
    if (sort === "title") {
      found.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    return found;
  }, [books, query, sort, onlyNoted]);

  return (
    <>
      <div className="controls">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목이나 지은이로 찾기"
          aria-label="책 찾기"
        />
        <div className="sorts">
          <button
            type="button"
            data-on={sort === "listed"}
            onClick={() => setSort("listed")}
          >
            적힌 순
          </button>
          <button
            type="button"
            data-on={sort === "title"}
            onClick={() => setSort("title")}
          >
            제목 순
          </button>
          {/* 166행 안에서 뭔가 적힌 행을 찾아내는 길 */}
          <button
            type="button"
            data-on={onlyNoted}
            onClick={() => setOnlyNoted((v) => !v)}
            disabled={noted === 0}
          >
            뭔가 적힌 것만
          </button>
        </div>
      </div>

      <p className="tally">
        {query.trim() || onlyNoted
          ? `${shown.length}권`
          : `${books.length}권 · 뭔가 적힌 것 ${noted}권`}
      </p>

      <div className="booklist">
        {shown.map((book) => {
          const inner = (
            <>
              <span className="t">
                {book.title}
                {book.reread && <span className="again">다시</span>}
              </span>
              {book.author && <span className="byline">{book.author}</span>}
              {book.note && <span className="yr">{book.note}</span>}
              {/* 넷째 칸 — 지금 와서 드는 한 줄. 적힌 행에만 뜬다 */}
              {book.now && <span className="now">{book.now}</span>}
            </>
          );

          // 같은 제목으로 쓴 글이 있으면 그 글로 이어진다
          return book.slug ? (
            <Link
              key={`${book.order}-${book.title}`}
              href={`/reading/${book.slug}`}
              className="book has-note"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={`${book.order}-${book.title}`}
              className={book.now ? "book has-line" : "book"}
            >
              {inner}
            </div>
          );
        })}
      </div>

      {shown.length === 0 && <p className="empty">찾는 책이 목록에 없습니다.</p>}
    </>
  );
}
