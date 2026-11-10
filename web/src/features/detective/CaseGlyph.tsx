export function CaseGlyph({ kind }: { kind: number }) {
  return (
    <svg
      className="case-glyph"
      viewBox="0 0 100 70"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        {kind === 0 ? (
          <>
            <path d="M6 22c12-24 24 24 36 0s24 24 36 0" />
            <path d="M6 49h76" />
          </>
        ) : kind === 1 ? (
          <>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d={`M${9 + i * 11} ${12 + i * 3}v${46 - i * 6}`} />
            ))}
          </>
        ) : (
          <>
            <path d="M9 21q12-25 24 0t24 0t24 0" />
            <path d="M9 50q12-25 24 0t24 0t24 0" />
          </>
        )}
      </g>
    </svg>
  );
}
