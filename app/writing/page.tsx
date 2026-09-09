import Link from "next/link";
import { getEntries, formatDate } from "@/lib/content";

export const metadata = { title: "글 — Eunchan Joe" };

export default function WritingPage() {
  const posts = getEntries("writing");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Writing</p>
        <h1>글</h1>
        <p>짧은 메모로 두기엔 아까운, 조금 길게 쓴 글들입니다.</p>
      </div>

      {posts.length === 0 ? (
        <p className="empty">아직 쓴 글이 없습니다.</p>
      ) : (
        <div className="list">
          {posts.map((post) => (
            <Link key={post.slug} href={`/writing/${post.slug}`} className="item">
              <div className="row">
                <h2>{post.title}</h2>
                <time>{formatDate(post.date)}</time>
              </div>
              {post.summary && <p>{post.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
