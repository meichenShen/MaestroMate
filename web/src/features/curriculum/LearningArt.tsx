import { useId } from "react";
export function LearningArt({
  kind,
}: {
  kind:
    | "work"
    | "lesson"
    | "create"
    | "layers"
    | "colour"
    | "return"
    | "pitch"
    | "rhythm";
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className={"learning-art art-" + kind}
      viewBox="0 0 360 260"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="90"
          y1="30"
          x2="290"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".18" />
        </linearGradient>
      </defs>
      {kind === "work" ? (
        <g className="art-float">
          <path d="M82 73 212 35 289 98 163 149Z" fill={`url(#${id})`} />
          <path d="m82 73 81 76v88l-81-76Z" fill="currentColor" opacity=".25" />
          <path
            d="m163 149 126-51v88l-126 51Z"
            fill="currentColor"
            opacity=".12"
          />
          <path
            d="M106 119c36-36 81 33 123-5M108 143c40-40 70 32 130-6"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path d="m170 75 31-9 20 13-31 10Z" fill="#fffff3" />
          <circle cx="222" cy="152" r="10" fill="currentColor" />
          <circle cx="251" cy="135" r="5" fill="#fffff3" />
        </g>
      ) : kind === "lesson" ? (
        <g className="art-float">
          <path
            d="m66 143 112-32 119 32-112 47Z"
            fill="currentColor"
            opacity=".15"
          />
          <path
            d="M68 81c43-11 77-6 110 19 37-29 79-37 117-22v87c-40-13-77-4-117 23-35-21-69-29-110-17Z"
            fill={`url(#${id})`}
          />
          <path
            d="M178 100v88M91 111c22-3 43 1 62 12M203 119c23-13 44-17 69-16M91 137c22-3 43 1 62 12M203 144c23-13 44-17 69-16"
            stroke="#fffff3"
            strokeWidth="3"
            opacity=".7"
            strokeLinecap="round"
          />
          <circle cx="252" cy="61" r="16" fill="currentColor" />
          <path d="m246 61 5 5 9-11" stroke="#0b0b10" strokeWidth="2" />
        </g>
      ) : kind === "create" ? (
        <g className="art-float">
          <ellipse
            cx="180"
            cy="172"
            rx="127"
            ry="47"
            fill={`url(#${id})`}
            opacity=".5"
          />
          <ellipse
            cx="180"
            cy="158"
            rx="111"
            ry="33"
            stroke="currentColor"
            strokeWidth="3"
            opacity=".35"
          />
          <ellipse
            cx="180"
            cy="158"
            rx="58"
            ry="19"
            stroke="currentColor"
            strokeWidth="3"
            opacity=".65"
          />
          <path
            d="M179 147V68l48-11v37l-48 11"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="164" cy="148" rx="19" ry="12" fill="currentColor" />
          <circle cx="107" cy="112" r="12" fill="#45D9FD" />
          <circle cx="267" cy="124" r="9" fill="#EE2560" />
        </g>
      ) : kind === "pitch" ? (
        <g>
          {[0, 1, 2, 3, 4].map((v) => (
            <g key={v}>
              <rect
                x={56 + v * 53}
                y={169 - v * 27}
                width="32"
                height={35 + v * 27}
                rx="16"
                fill={`url(#${id})`}
              />
              <circle
                cx={72 + v * 53}
                cy={144 - v * 27}
                r="8"
                fill="currentColor"
              />
            </g>
          ))}
        </g>
      ) : kind === "rhythm" ? (
        <g>
          {[0, 1, 2, 3].map((v) => (
            <g key={v}>
              <circle
                cx={70 + v * 74}
                cy="130"
                r="28"
                stroke="currentColor"
                strokeWidth="3"
                opacity={v % 2 ? ".3" : "1"}
              />
              {v % 2 === 0 && (
                <circle cx={70 + v * 74} cy="130" r="14" fill="currentColor" />
              )}
            </g>
          ))}
          <path
            d="M67 187h225"
            stroke="currentColor"
            strokeWidth="2"
            opacity=".2"
          />
        </g>
      ) : kind === "colour" ? (
        <g>
          {["#45D9FD", "#EE2560", "#FFDA8E", "#A593E0"].map((c, i) => (
            <path
              key={c}
              d={`M${80 + i * 60} ${83 + (i % 2) * 22}v${96 - (i % 2) * 44}`}
              stroke={c}
              strokeWidth="34"
              strokeLinecap="round"
            />
          ))}
          <path
            d="M65 55c67-34 143-23 227 15"
            stroke="currentColor"
            strokeWidth="2"
            opacity=".3"
          />
        </g>
      ) : kind === "return" ? (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect
                x={39 + i * 108}
                y={73 + (i % 2) * 12}
                width="88"
                height="112"
                rx="26"
                fill="currentColor"
                opacity={i === 1 ? ".15" : ".35"}
              />
              <path
                d={`m${55 + i * 108} 143 18-35 17 20 20-${i === 2 ? 10 : 28}`}
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <path
            d="M45 98c45-72 67 72 111 0s67 72 111 0 40-13 52 2"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d="M41 173q26-37 52 0t52 0 52 0 52 0 52 0"
            stroke="currentColor"
            strokeWidth="4"
            opacity=".45"
          />
        </g>
      )}
    </svg>
  );
}
