import { useEffect, useRef, useState } from "react";
import type * as T from "three";
type Kind = "fish" | "swan" | "ribbon";
export function Sculpture({
  kind = "fish",
  motion = true,
}: {
  kind?: Kind;
  motion?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const motionRef = useRef(motion);
  motionRef.current = motion;
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    let disposed = false,
      frame = 0,
      renderer: T.WebGLRenderer | undefined,
      observer: IntersectionObserver | undefined,
      resize: ResizeObserver | undefined;
    let cleanup = () => {};
    import("three")
      .then((THREE) => {
        if (disposed || !host.current) return;
        const element = host.current;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          setFallback(true);
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
        camera.position.set(0, 0, 7.4);
        const root = new THREE.Group();
        scene.add(root);
        const materials: T.Material[] = [];
        const geometries: T.BufferGeometry[] = [];
        const mesh = (
          geometry: T.BufferGeometry,
          color: string,
          position = [0, 0, 0],
          scale = [1, 1, 1],
        ) => {
          geometries.push(geometry);
          const material = new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
          });
          materials.push(material);
          const item = new THREE.Mesh(geometry, material);
          item.position.set(position[0], position[1], position[2]);
          item.scale.set(scale[0], scale[1], scale[2]);
          root.add(item);
          return item;
        };
        const paint = (geometry: T.BufferGeometry, colors: string[]) => {
          const p = geometry.getAttribute("position");
          const values = [];
          for (let i = 0; i < p.count; i++) {
            const t = Math.max(0, Math.min(1, (p.getY(i) + 1.4) / 2.8));
            const c = new THREE.Color(
              colors[
                Math.min(colors.length - 1, Math.floor(t * colors.length))
              ],
            );
            const shade = 0.84 + 0.14 * Math.sin(p.getX(i) * 2 + p.getZ(i) * 2);
            values.push(c.r * shade, c.g * shade, c.b * shade);
          }
          geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(values, 3),
          );
          geometries.push(geometry);
          const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
          });
          materials.push(material);
          const item = new THREE.Mesh(geometry, material);
          root.add(item);
          return item;
        };
        if (kind === "fish") {
          const body = paint(new THREE.SphereGeometry(1, 32, 18), [
            "#a5a083",
            "#c1b59c",
            "#6b8f9c",
            "#92b8bc",
          ]);
          body.scale.set(1.35, 0.64, 0.4);
          const shape = new THREE.Shape();
          shape.moveTo(-1.1, 0);
          shape.bezierCurveTo(-1.6, 0.35, -1.75, 0.75, -2, 0.8);
          shape.lineTo(-1.8, 0);
          shape.lineTo(-2, -0.75);
          shape.quadraticCurveTo(-1.5, -0.3, -1.1, 0);
          mesh(
            new THREE.ExtrudeGeometry(shape, {
              depth: 0.13,
              bevelEnabled: false,
            }),
            "#c6a170",
            [0, 0, -0.06],
          );
          const fin = new THREE.Shape();
          fin.moveTo(-0.25, 0.35);
          fin.lineTo(0.05, 1.05);
          fin.lineTo(0.7, 0.35);
          mesh(new THREE.ShapeGeometry(fin), "#7f9d9a", [0, 0, 0.03]);
          const side = new THREE.Shape();
          side.moveTo(0.2, 0.04);
          side.lineTo(-0.28, -0.53);
          side.lineTo(0.72, -0.12);
          mesh(new THREE.ShapeGeometry(side), "#ccb68b", [0, 0, 0.42]);
          mesh(
            new THREE.SphereGeometry(0.1, 20, 12),
            "#e8e6d9",
            [0.91, 0.17, 0.29],
          );
          mesh(
            new THREE.SphereGeometry(0.055, 16, 10),
            "#11161a",
            [0.95, 0.18, 0.37],
          );
          const ring = mesh(
            new THREE.TorusGeometry(0.48, 0.008, 5, 44, Math.PI),
            "#314e60",
            [0.68, -0.03, 0.15],
            [1, 1.1, 1],
          );
          ring.rotation.y = 0.6;
          root.rotation.set(0.04, -0.32, -0.07);
        } else if (kind === "swan") {
          const body = paint(new THREE.SphereGeometry(1, 30, 16), [
            "#8d9f9e",
            "#d2d7cb",
            "#f5f0df",
          ]);
          body.scale.set(1.12, 0.45, 0.57);
          body.position.set(-0.2, -0.5, 0);
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.45, -0.45, 0.03),
            new THREE.Vector3(0.8, 0.15, 0),
            new THREE.Vector3(0.38, 0.9, 0.03),
            new THREE.Vector3(0.68, 1.21, 0.04),
            new THREE.Vector3(1.1, 1.03, 0.04),
          ]);
          paint(new THREE.TubeGeometry(curve, 48, 0.115, 9, false), [
            "#b8c7c5",
            "#f6f0df",
            "#efe9d9",
          ]);
          mesh(
            new THREE.SphereGeometry(0.22, 20, 16),
            "#f2eddb",
            [1.04, 1.06, 0.04],
            [1.2, 0.85, 0.8],
          );
          const beak = mesh(
            new THREE.ConeGeometry(0.095, 0.34, 4),
            "#d18e54",
            [1.35, 1.01, 0.04],
          );
          beak.rotation.z = -Math.PI / 2;
          mesh(
            new THREE.SphereGeometry(0.035, 10, 8),
            "#171c1d",
            [1.12, 1.12, 0.2],
          );
          for (let i = 0; i < 7; i++) {
            const feather = mesh(
              new THREE.SphereGeometry(1, 18, 12),
              i % 2 ? "#efead7" : "#c9d4cb",
              [-0.42 + i * 0.08, -0.22 + i * 0.02, 0.35],
              [0.8 - i * 0.045, 0.13, 0.12],
            );
            feather.rotation.z = 0.27 + i * 0.1;
          }
          root.rotation.y = -0.2;
        } else {
          paint(new THREE.TorusKnotGeometry(0.88, 0.18, 180, 12, 2, 3), [
            "#ae9f82",
            "#a3c2ba",
            "#7d949b",
            "#b5b3ad",
          ]);
          for (let i = 0; i < 9; i++) {
            const key = mesh(
              new THREE.BoxGeometry(0.14, 0.8, 0.2),
              i % 3 === 0 ? "#121b22" : "#ece8d9",
              [(i - 4) * 0.24, -0.9, 0],
            );
            key.rotation.z = (i - 4) * -0.12;
            key.position.y += Math.pow(i - 4, 2) * 0.025;
          }
          root.rotation.set(0.1, -0.45, 0.16);
        }
        let visible = true,
          last = 0,
          rx = 0,
          ry = 0,
          contextLost = false;
        const pointer = { x: 0, y: 0 };
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        const draw = (now: number) => {
          if (disposed || !renderer || !visible || contextLost) return;
          const animate = motionRef.current && !reduced.matches;
          const t = animate ? now * 0.00035 : 0;
          rx += (pointer.x - rx) * 0.035;
          ry += (pointer.y - ry) * 0.035;
          root.position.y = animate ? Math.sin(t * 2) * 0.08 : 0;
          root.rotation.y +=
            ((kind === "fish" ? -0.32 : kind === "ribbon" ? -0.45 : -0.2) +
              rx * 0.22 -
              root.rotation.y) *
            0.04;
          root.rotation.x += (ry * 0.08 - root.rotation.x) * 0.04;
          if (kind === "ribbon")
            root.rotation.z = 0.16 + (animate ? Math.sin(t) * 0.08 : 0);
          if (visible && (animate || now - last > 150)) {
            renderer.render(scene, camera);
            last = now;
          }
          frame = 0;
          if (!reduced.matches) frame = requestAnimationFrame(draw);
        };
        const size = () => {
          if (!renderer) return;
          const r = element.getBoundingClientRect();
          renderer.setSize(Math.max(1, r.width), Math.max(1, r.height));
          camera.aspect = r.width / Math.max(1, r.height);
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        };
        resize = new ResizeObserver(size);
        resize.observe(element);
        size();
        frame = requestAnimationFrame(draw);
        observer = new IntersectionObserver((entries) => {
          visible = entries[0].isIntersecting;
          if (!visible) {
            cancelAnimationFrame(frame);
            frame = 0;
          } else if (!frame) frame = requestAnimationFrame(draw);
        });
        observer.observe(element);
        const mediaChange = () => {
          cancelAnimationFrame(frame);
          frame = 0;
          if (visible) frame = requestAnimationFrame(draw);
        };
        reduced.addEventListener("change", mediaChange);
        const move = (e: PointerEvent) => {
          if (reduced.matches) return;
          const r = element.getBoundingClientRect();
          pointer.x = (e.clientX - r.left) / r.width - 0.5;
          pointer.y = (e.clientY - r.top) / r.height - 0.5;
        };
        const leave = () => {
          pointer.x = pointer.y = 0;
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        const lost = (e: Event) => {
          e.preventDefault();
          contextLost = true;
          cancelAnimationFrame(frame);
          setFallback(true);
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        cleanup = () => {
          reduced.removeEventListener("change", mediaChange);
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
          renderer?.domElement.removeEventListener("webglcontextlost", lost);
          geometries.forEach((g) => g.dispose());
          materials.forEach((m) => m.dispose());
          renderer?.dispose();
          renderer?.domElement.remove();
        };
      })
      .catch(() => {
        if (!disposed) setFallback(true);
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resize?.disconnect();
      cleanup();
    };
  }, [kind]);
  return (
    <div
      className={"sculpture sculpture-" + kind}
      ref={host}
      role="img"
      aria-label={
        kind === "fish"
          ? "A floating, matte-coloured fish sculpture"
          : kind === "swan"
            ? "An ivory swan sculpture"
            : "A floating sculptural loop with piano keys"
      }
    >
      {fallback && (
        <svg
          className="sculpture-fallback"
          viewBox="0 0 500 260"
          aria-hidden="true"
        >
          {kind === "fish" ? (
            <>
              <ellipse cx="260" cy="125" rx="120" ry="65" fill="#a5b5b3" />
              <path d="M150 125 70 55 88 125 70 195Z" fill="#c2a57a" />
              <circle cx="330" cy="110" r="7" fill="#17222b" />
            </>
          ) : kind === "swan" ? (
            <>
              <ellipse cx="240" cy="180" rx="105" ry="35" fill="#e8e6d8" />
              <path
                d="M290 175C355 95 255 70 300 45S370 55 350 72"
                fill="none"
                stroke="#e8e6d8"
                strokeWidth="20"
              />
              <path d="M350 65 378 73 350 78" fill="#c2a57a" />
            </>
          ) : (
            <>
              <path
                d="M175 190C70 50 330 0 340 110S130 230 175 80 440 90 310 190"
                fill="none"
                stroke="#a5b5b3"
                strokeWidth="29"
              />
              <path
                d="M190 185V225M225 185V225M260 185V225M295 185V225"
                stroke="#e8e6d8"
                strokeWidth="20"
              />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
