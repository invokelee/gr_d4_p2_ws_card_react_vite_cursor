import type { CSSProperties } from "react";
import type { QuoteCardData } from "../lib/types";
import { resolveBackgroundUrl } from "../lib/backgrounds";

type Props = {
  data: QuoteCardData;
};

function formatLifespan(d: QuoteCardData): string {
  const b = d.birthYear;
  const e = d.deathYear;
  if (b == null && e == null) return "생애 연도 미상";
  if (d.isAlive && b != null) return `${b}–현재`;
  if (b != null && e != null) return `${b}–${e}`;
  if (b != null) return `${b}–`;
  if (e != null) return `?–${e}`;
  return "생애 연도 미상";
}

export function QuoteCard({ data }: Props) {
  const bg = resolveBackgroundUrl(data.backgroundIndex);

  return (
    <article
      className="quote-card m3-elevation-2"
      style={{ "--card-bg-image": `url("${bg}")` } as CSSProperties}
    >
      <div className="quote-card__scrim" aria-hidden />
      <div className="quote-card__content">
        <div className="quote-card__eyebrow m3-label-large">한국을 빛낸 말</div>
        <blockquote className="quote-card__quote m3-headline-small">
          <p lang="ko">{data.quoteKo}</p>
        </blockquote>
        <p className="quote-card__translation m3-body-large" lang="en">
          {data.quoteEn}
        </p>
        <footer className="quote-card__meta">
          <div className="quote-card__name m3-title-large">{data.name}</div>
          <p className="quote-card__achievements m3-body-medium">
            {data.achievements}
          </p>
          <p className="quote-card__years m3-label-medium">
            {formatLifespan(data)}
            {data.mood ? ` · ${data.mood}` : ""}
          </p>
        </footer>
      </div>
    </article>
  );
}
