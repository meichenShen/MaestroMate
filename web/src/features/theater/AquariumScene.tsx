export function AquariumScene({ moving, phase }: { moving: boolean; phase: string }) {
  return <svg className={`aquarium-art ${moving ? 'is-moving' : ''} phase-${phase}`} viewBox="0 0 720 420" role="img" aria-label="水光、游鱼和水草组成的水下想象场景">
    <defs>
      <linearGradient id="water" x1="0" y1="0" x2="0.2" y2="1"><stop stopColor="#285b66"/><stop offset=".55" stopColor="#123b4a"/><stop offset="1" stopColor="#0c2938"/></linearGradient>
      <radialGradient id="glow" cx=".65" cy="0" r=".9"><stop stopColor="#b0d8ba" stopOpacity=".48"/><stop offset="1" stopColor="#5f9a8e" stopOpacity="0"/></radialGradient>
      <linearGradient id="ray" x1="0" x2=".4" y1="0" y2="1"><stop stopColor="#e1f0c8" stopOpacity=".25"/><stop offset="1" stopColor="#e1f0c8" stopOpacity="0"/></linearGradient>
      <linearGradient id="fish" x1="0" x2="1"><stop stopColor="#c7d6a9"/><stop offset="1" stopColor="#88b8a5"/></linearGradient>
      <linearGradient id="goldfish" x1="0" x2="1"><stop stopColor="#e1b794"/><stop offset="1" stopColor="#c68e69"/></linearGradient>
      <pattern id="grain" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".55" fill="#fff" opacity=".09"/><circle cx="9" cy="10" r=".4" fill="#fff" opacity=".07"/></pattern>
      <g id="little-fish"><path d="M-20 0C-9-12 9-12 21 0C9 12-9 12-20 0L-32-12V12Z" fill="currentColor"/><circle cx="12" cy="-2" r="1.4" fill="#153c44"/></g>
      <g id="plant"><path d="M0 0Q-10-45 7-100Q20-140 8-180" fill="none" stroke="currentColor" strokeWidth="3"/><path d="M1-25Q-40-40-26-65Q-3-54 1-25M3-68Q39-88 25-111Q5-100 3-68M7-105Q-20-115-18-141Q8-131 7-105M11-141Q36-155 22-178Q10-165 11-141" fill="currentColor"/></g>
    </defs>
    <rect width="720" height="420" fill="url(#water)"/><rect width="720" height="420" fill="url(#glow)"/>
    <g className="light-rays" fill="url(#ray)"><path d="M310 0H365L170 420H55Z"/><path d="M409 0H449L365 420H280Z"/><path d="M491 0H514L626 420H560Z"/><path d="M558 0H571L720 290V420Z"/></g>
    <g fill="none" stroke="#bad5bc" strokeWidth="1" opacity=".18"><ellipse cx="452" cy="12" rx="183" ry="22"/><ellipse cx="452" cy="14" rx="140" ry="13"/><ellipse cx="452" cy="15" rx="80" ry="6"/></g>
    <g className="bubbles" fill="none" stroke="#a5c7b9" strokeWidth="1" opacity=".4">{[ [122,92,3],[164,188,5],[580,67,3],[618,246,4],[277,101,2],[519,287,2],[99,282,2],[355,297,3],[627,137,2],[244,235,2] ].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} style={{animationDelay:`${i * -.8}s`}} />)}</g>
    <g fill="#aecbbb" opacity=".35">{Array.from({length:24},(_,i)=><circle key={i} cx={(i*97+41)%700} cy={(i*53+47)%360} r={i%3===0?1.3:.7} />)}</g>
    <g className="fish-school" color="#86afa8" opacity=".55"><use href="#little-fish" transform="translate(565 165) scale(.35)"/><use href="#little-fish" transform="translate(597 146) scale(.28)"/><use href="#little-fish" transform="translate(609 175) scale(.32)"/><use href="#little-fish" transform="translate(643 159) scale(.22)"/></g>
    <g className="hero-fish" transform="translate(374 180)"><path d="M-73 0C-45-39 19-42 65-8L77 0L65 9C20 42-45 39-73 0L-111-32L-104 0L-111 32Z" fill="url(#fish)"/><path d="M-29-24Q-4-60 18-29M-23 26Q1 52 19 29" fill="#7fa99b"/><path d="M28-23Q7 0 28 24M-52-16Q-37 0-52 16" fill="none" stroke="#58867e" strokeWidth="1.5" opacity=".7"/><path d="M-10-4Q12-11 6 13Z" fill="#d8dcc2" opacity=".6"/><circle cx="49" cy="-5" r="3.6" fill="#203e43"/><circle cx="50" cy="-6" r="1" fill="#e5e6c8"/></g>
    <g className="coral-fish" transform="translate(224 256) scale(-.65 .65)"><path d="M-46 0C-16-30 30-27 52 0C28 29-16 29-46 0L-76-25L-71 0L-76 25Z" fill="url(#goldfish)"/><path d="M-14-19Q4-42 15-21M-10 21Q6 37 19 20" fill="#c28e71"/><path d="M19-17Q4 0 19 18" fill="none" stroke="#946c58"/><circle cx="37" cy="-3" r="2.4" fill="#2d4343"/></g>
    <g className="small-fish" color="#d9c9a0"><use href="#little-fish" transform="translate(484 271) scale(.55)"/><use href="#little-fish" transform="translate(530 298) scale(.37)"/></g>
    <path d="M0 380Q135 347 257 383T514 382T720 368V420H0Z" fill="#153b3d"/>
    <g className="plants-back" color="#3f7467" opacity=".65"><use href="#plant" transform="translate(49 420) scale(1.2 1.6)"/><use href="#plant" transform="translate(94 430) scale(-.8 1.1)"/><use href="#plant" transform="translate(666 438) scale(-1.1 1.5)"/></g>
    <g className="plants-front" color="#608778"><use href="#plant" transform="translate(13 450) scale(.9 1.15) rotate(-8)"/><use href="#plant" transform="translate(119 448) scale(.65 .75) rotate(12)"/><use href="#plant" transform="translate(710 455) scale(1.2 1.6) rotate(8)"/><use href="#plant" transform="translate(625 449) scale(-.6 .8) rotate(8)"/></g>
    <g fill="#6b8e7e" opacity=".7"><ellipse cx="155" cy="407" rx="34" ry="7"/><ellipse cx="579" cy="406" rx="23" ry="5"/></g>
    <rect width="720" height="420" fill="url(#grain)" pointerEvents="none"/>
  </svg>;
}
