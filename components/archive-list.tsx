"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArchiveBook } from "@/lib/content";

type Sort = "listed" | "title";

export default function ArchiveList({ books }: { books: ArchiveBook[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("listed");

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = books.filter(
      (book) =>
        !needle ||
        book.title.toLowerCase().includes(needle) ||
        (book.author ?? "").toLowerCase().includes(needle),
    );
    if (sort === "title") {
      found.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    }
    return found;
  }, [books, query, sort]);

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
        </div>
      </div>

      <p className="tally">
        {query.trim() ? `${shown.length}권 찾음` : `${books.length}권`}
      </p>

      <div className="booklist">
        {shown.map((book) => {
          const inner = (
            <>
              <span className="t">{book.title}</span>
              {book.author && <span className="byline">{book.author}</span>}
              {book.note && <span className="yr">{book.note}</span>}
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
            <div key={`${book.order}-${book.title}`} className="book">
              {inner}
            </div>
          );
        })}
      </div>

      {shown.length === 0 && <p className="empty">찾는 책이 목록에 없습니다.</p>}
    </>
  );
}
