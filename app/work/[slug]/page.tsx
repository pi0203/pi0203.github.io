import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntries, getEntry, formatMonth } from "@/lib/content";

export function generateStaticParams() {
  return getEntries("work").map((e) => ({ slug: e.slug }));
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getEntry("work", slug);
  if (!item) notFound();

  return (
    <article className="article">
      <header>
        <div className="meta">{formatMonth(item.date)}</div>
        <h1>{item.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
      {item.link && (
        <p className="prose">
          <a href={item.link} target="_blank" rel="noreferrer">
            바로 가기 &rarr;
          </a>
        </p>
      )}
      <Link href="/work" className="backlink">
        &larr; 만든 것
      </Link>
    </article>
  );
}
