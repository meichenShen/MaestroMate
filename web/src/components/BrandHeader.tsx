import { AudioLines, ArrowUpRight, Waves } from "lucide-react";
export function BrandHeader() {
  return (
    <header className="brand-header">
      <a className="brand" href="#main" aria-label="MaestroMate，前往音乐探索">
        <span className="brand-mark">
          <AudioLines size={22} />
        </span>
        <span>
          Maestro<span className="brand-light">Mate</span>
          <small>和音乐，成为朋友</small>
        </span>
      </a>
      <div className="header-right">
        <span className="header-note">
          <Waves size={15} /> 一部作品，三种遇见
        </span>
        <a
          className="project-link"
          href="https://github.com/meichenShen/MaestroMate"
          target="_blank"
          rel="noreferrer"
        >
          关于项目 <ArrowUpRight size={15} />
        </a>
        <span className="demo-tag">探索版 01</span>
      </div>
    </header>
  );
}
