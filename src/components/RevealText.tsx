import { Fragment } from 'react';

interface TextSegment {
  text: string;
  italic?: boolean;
}

interface RevealTextProps {
  segments: TextSegment[];
  baseDelayMs?: number;
  stepMs?: number;
}

/**
 * Splits editorial display headings/quotes into masked word tokens that
 * gently rise into place with calibrated stagger while keeping full screen-reader text intact.
 */
export function RevealText({
  segments,
  baseDelayMs = 60,
  stepMs = 34,
}: RevealTextProps) {
  const fullLabel = segments.map((s) => s.text).join('');
  let wordCounter = 0;

  return (
    <>
      <span className="sr-only">{fullLabel}</span>
      <span aria-hidden="true" className="reveal-words-root">
        {segments.map((seg, segIdx) => {
          if (!seg.text) return null;
          const parts = seg.text.split(/(\s+)/);
          return (
            <Fragment key={segIdx}>
              {parts.map((part, partIdx) => {
                if (!part) return null;
                if (/^\s+$/.test(part)) {
                  return <Fragment key={partIdx}>{part}</Fragment>;
                }
                const delay = baseDelayMs + wordCounter * stepMs;
                wordCounter += 1;
                const inner = (
                  <span
                    className="reveal-word-inner"
                    style={{ '--word-delay': `${delay}ms` } as React.CSSProperties}
                  >
                    {seg.italic ? <em>{part}</em> : part}
                  </span>
                );
                return (
                  <span key={partIdx} className="reveal-word-mask">
                    {inner}
                  </span>
                );
              })}
            </Fragment>
          );
        })}
      </span>
    </>
  );
}
