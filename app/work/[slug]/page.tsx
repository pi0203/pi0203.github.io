import Link from "next/link";
import Neighbors from "@/components/neighbors";
import { notFound } from "next/navigation";
import { getEntries, getEntry, getNeighbors, formatMonth } from "@/lib/content";

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
      <Neighbors n={getNeighbors("work", slug)} dir="work" />
      <Link href="/work" className="backlink">
        &larr; 만든 것
      </Link>
    </article>
  );
}
