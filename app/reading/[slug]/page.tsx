import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntries, getEntry, formatMonth } from "@/lib/content";

export function generateStaticParams() {
  return getEntries("reading").map((e) => ({ slug: e.slug }));
}

export default async function ReadingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getEntry("reading", slug);
  if (!book) notFound();

  return (
    <article className="article">
      <header>
        <div className="meta">
          {book.author && <>{book.author} &middot; </>}
          {formatMonth(book.date)}에 읽음
        </div>
        <h1>{book.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: book.html }} />
      <Link href="/reading" className="backlink">
        &larr; 읽은 것
      </Link>
    </article>
  );
}
