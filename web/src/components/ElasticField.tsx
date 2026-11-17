// A local radial vector field bends existing SVG artwork. The link and text
// remain ordinary, stationary HTML; there is no screenshot/canvas capture.
export function ElasticField({ id }: { id: string }) {
  return (
    <svg
      className="elastic-definitions"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={id}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          primitiveUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodColor="#808080" result="neutral" />
          <feImage
            href="/images/elastic-field.svg"
            x="0"
            y="0"
            width="260"
            height="260"
            preserveAspectRatio="none"
            result="radial"
            data-elastic-field=""
          />
          <feMerge result="field">
            <feMergeNode in="neutral" />
            <feMergeNode in="radial" />
          </feMerge>
          <feGaussianBlur in="field" stdDeviation="3" result="smooth-field" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smooth-field"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            data-elastic-displacement=""
          />
        </filter>
      </defs>
    </svg>
  );
}
