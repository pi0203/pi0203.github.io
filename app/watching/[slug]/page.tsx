import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEntries,
  getEntry,
  getListSummaries,
  getList,
  formatMonth,
} from "@/lib/content";
import ArchiveList from "@/components/archive-list";

export function generateStaticParams() {
  return [...getEntries("watching"), ...getListSummaries("watching")].map((e) => ({
    slug: e.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("watching", slug);
  return { title: `${entry?.title ?? "본 것"} — Eunchan Joe` };
}

export default async function WatchingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const list = getList("watching", slug);
  if (list) {
    return (
      <>
        <div className="pagehead">
          <p className="eyebrow">Watching</p>
          <h1>{list.title}</h1>
          <div className="prose" dangerouslySetInnerHTML={{ __html: list.intro }} />
        </div>
        <ArchiveList books={list.books} />
        <Link href="/watching" className="backlink">
          &larr; 본 것
        </Link>
      </>
    );
  }

  const item = getEntry("watching", slug);
  if (!item) notFound();

  return (
    <article className="article">
      <header>
        <div className="meta">
          {item.author && <>{item.author} &middot; </>}
          {formatMonth(item.date)}
        </div>
        <h1>{item.title}</h1>
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: item.html }} />
      <Link href="/watching" className="backlink">
        &larr; 본 것
      </Link>
    </article>
  );
}
