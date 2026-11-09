export function Mark({
  kind = "listen",
}: {
  kind?: "listen" | "meet" | "discover" | "theatre";
}) {
  const paths = {
    listen: [
      "M17 42V15l24-5v27",
      "M17 35C2 30 1 49 14 46c4-1 3-6 3-11",
      "M41 30c-15-4-17 14-4 12 5-1 4-7 4-12",
    ],
    meet: [
      "M17 23c-3-20 27-23 29-3 1 10-6 16-14 16S17 31 17 23Z",
      "M9 57c0-23 45-24 46 0",
      "M27 18v4m12-4v4",
      "M27 29q7 5 12-1",
    ],
    discover: [
      "M9 23C8 3 39 1 40 23c1 22-31 22-31 0Z",
      "M35 37 56 57",
      "M18 19q4-8 12-6",
    ],
    theatre: [
      "M5 53V12l27-8 27 8v41",
      "M5 16q17 12 12 37m42-37Q42 28 47 53",
      "M25 53V26h14v27",
      "M3 56h58",
    ],
  };
  return (
    <svg
      className="line-mark"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      {paths[kind].map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength="1"
          style={{ animationDelay: i * 0.16 + "s" }}
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
