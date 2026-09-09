import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntries, getEntry, formatDate } from "@/lib/content";

export function generateStaticParams() {
  return getEntries("writing").map((e) => ({ slug: e.slug }));
}

export default async function WritingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getEntry("writing", slug);
  if (!post) notFound();

  return (
    <article className="article">
      <header>
        <div className="meta">{formatDate(post.date)}</div>
        <h1>{post.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <Link href="/writing" className="backlink">
        &larr; 글
      </Link>
    </article>
  );
}
