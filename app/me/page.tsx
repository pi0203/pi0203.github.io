import { getEntries, formatMonth } from "@/lib/content";

export const metadata = { title: "나 — Eunchan Joe" };

export default function MePage() {
  const notes = getEntries("me");

  return (
    <>
      <div className="pagehead">
        <p className="eyebrow">Me</p>
        <h1>나</h1>
        <p>
          정해진 형식은 없습니다. 기억나는 것이 생길 때마다 하나씩 적어둡니다. 최근에
          적은 것이 위에 옵니다.
        </p>
      </div>

      {notes.length === 0 ? (
        <p className="empty">아직 적어둔 것이 없습니다.</p>
      ) : (
        <div className="stream">
          {notes.map((note) => (
            <article key={note.slug} id={note.anchor} className="note">
              <div className="meta">
                {formatMonth(note.date)}
                {/* 다루는 시기가 따로 있을 때만. 없으면 쓴 날짜만 남는다 */}
                {note.about && <span className="about">{note.about}년에 대해</span>}
                {note.tag && <span className="tag">{note.tag}</span>}
              </div>
              <div>
                <h2>{note.title}</h2>
                <div className="prose" dangerouslySetInnerHTML={{ __html: note.html }} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
