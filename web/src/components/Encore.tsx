export function Encore() {
  return (
    <div className="encore" aria-hidden="true">
      <svg viewBox="0 0 180 140" fill="none">
        <g
          className="encore-rays"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M90 12v15M37 30l11 12M143 30l-11 12M19 75h15M146 75h15M42 119l9-11M138 119l-9-11" />
        </g>
        <path
          className="encore-note"
          d="M84 99V48l36-9v49M84 58l36-9"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <ellipse cx="75" cy="102" rx="11" ry="8" fill="currentColor" />
        <ellipse cx="111" cy="90" rx="11" ry="8" fill="currentColor" />
      </svg>
    </div>
  );
}
