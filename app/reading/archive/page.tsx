import Link from "next/link";
import { getArchive } from "@/lib/content";
import ArchiveList from "./archive-list";

export function generateMetadata() {
  const archive = getArchive();
  return { title: `${archive?.title ?? "목록"} — Eunchan Joe` };
}

export default function ArchivePage() {
  const archive = getArchive();

  if (!archive) {
    return <p className="empty">아직 목록이 없습니다.</p>;
  }

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Reading</p>
        <h1>{archive.title}</h1>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: archive.intro }}
        />
      </div>

      <ArchiveList books={archive.books} />

      <Link href="/reading" className="backlink">
        &larr; 읽은 것
      </Link>
    </>
  );
}
