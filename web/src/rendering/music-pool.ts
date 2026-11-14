import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  getPoolLayout,
  poolCamera,
  poolNotePositions,
} from "../features/water/layout";

export interface PoolScene {
  update(motion: boolean, active: boolean): void;
  pulse(note: number): void;
  splash(clientX: number, clientY: number): void;
  dispose(): void;
}
const locations = poolNotePositions.map(
  (p) => new THREE.Vector3(p.x, p.y, p.z),
);

// Original finite analytic waves, shaded using actual displaced geometry.
// No experimental HTML-in-Canvas, external texture, model or sound dependency.
export function createMusicPool(
  host: HTMLElement,
  failure: () => void,
): PoolScene {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);
  const scene = new THREE.Scene(),
    root = new THREE.Group();
  scene.add(root);
  const camera = new THREE.OrthographicCamera(-7, 7, 3.8, -3.8, 0.1, 40);
  camera.position.set(0, poolCamera.y, poolCamera.z);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight("#f7f0ff", "#181324", 3));
  const key = new THREE.DirectionalLight("#fff4df", 5);
  key.position.set(-3, 8, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight("#45d9fd", 2);
  fill.position.set(5, 3, -3);
  scene.add(fill);
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.08);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
    const mesh = new THREE.Mesh(geometry, material);
    root.add(mesh);
    return mesh;
  };
  const body = add(
    new THREE.CylinderGeometry(3.5, 3.4, 0.18, 96),
    new THREE.MeshStandardMaterial({
      color: "#272439",
      metalness: 0.55,
      roughness: 0.24,
    }),
  );
  body.position.y = -0.15;
  const rim = add(
    new THREE.TorusGeometry(3.51, 0.033, 8, 128),
    new THREE.MeshStandardMaterial({
      color: "#554963",
      metalness: 0.3,
      roughness: 0.4,
    }),
  );
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = -0.035;
  const ripples = Array.from(
    { length: 16 },
    () => new THREE.Vector4(0, 0, -100, 0),
  );
  let rippleIndex = 0;
  const uniforms = { uTime: { value: 0 }, uRipples: { value: ripples } };
  const waterMaterial = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: `uniform float uTime;uniform vec4 uRipples[16];varying vec2 vUv;varying vec3 vWorld;varying float vHeight;
      void main(){vUv=uv;vec3 p=position;float wave=sin(p.x*1.4+uTime*.7)*cos(p.z*1.8-uTime*.55)*.017;
        for(int i=0;i<16;i++){float age=uTime-uRipples[i].z;if(age>=0.&&age<4.){float d=length(vec2(p.x,p.z)-uRipples[i].xy);wave+=sin(d*13.-age*10.)*exp(-age*1.4)*exp(-d*.65)*uRipples[i].w;}}
        p.y+=wave;vHeight=wave;vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader: `uniform float uTime;varying vec2 vUv;varying vec3 vWorld;varying float vHeight;
      void main(){vec2 p=vUv*2.-1.;float r=length(p);if(r>1.)discard;
        vec3 normal=normalize(cross(dFdx(vWorld),dFdy(vWorld)));if(normal.y<0.)normal=-normal;
        vec3 viewDir=normalize(cameraPosition-vWorld);vec3 light=normalize(vec3(-.4,1.,.5));
        float gloss=pow(max(0.,dot(reflect(-light,normal),viewDir)),52.);
        float fresnel=pow(1.-max(0.,dot(normal,viewDir)),3.);
        float lines=sin(p.x*16.+sin(p.y*13.+uTime*.35)*2.+vHeight*25.)+cos(p.y*19.-uTime*.2+p.x*5.);
        float caustic=pow(max(0.,1.-abs(lines)*.8),7.);
        vec3 color=mix(vec3(.075,.075,.14),vec3(.15,.18,.29),1.-r*.4);
        color+=vec3(.17,.15,.27)*fresnel+vec3(.15,.32,.40)*caustic*.45+vec3(.85,.80,.65)*gloss*.7;
        color+=vec3(.12,.16,.23)*vHeight*3.;color=mix(color,vec3(.29,.25,.41),smoothstep(.94,1.,r)*.55);
        gl_FragColor=vec4(color,.96);}`,
  });
  const surface = add(
    new THREE.PlaneGeometry(7, 7, 72, 72).rotateX(-Math.PI / 2),
    waterMaterial,
  );
  surface.position.y = 0.01;
  let motion = true,
    enabled = true,
    visible = true,
    disposed = false,
    lost = false,
    frame = 0,
    last = 0,
    elapsed = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const active = () =>
    !disposed && !lost && visible && enabled && !document.hidden;
  const render = (now = performance.now()) => {
    if (!active()) return;
    const dt = last ? Math.min((now - last) / 1000, 0.08) : 0;
    last = now;
    if (motion && !reduced.matches) elapsed += dt;
    uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
    host.dataset.frame = String(Number(host.dataset.frame || 0) + 1);
  };
  const loop = (now: number) => {
    frame = 0;
    if (!active() || !motion || reduced.matches) return;
    if (now - last >= 32) render(now);
    frame = requestAnimationFrame(loop);
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (active()) {
      render();
      if (motion && !reduced.matches) frame = requestAnimationFrame(loop);
    }
  };
  const resize = () => {
    const rect = host.getBoundingClientRect(),
      aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
    const layout = getPoolLayout(rect.width, rect.height);
    const h = poolCamera.viewHeight;
    camera.left = (-h * aspect) / 2;
    camera.right = (h * aspect) / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    root.scale.x = layout.scaleX;
    root.updateMatrixWorld(true);
    renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height));
    schedule();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    schedule();
  });
  intersection.observe(host);
  const visibility = () => schedule();
  document.addEventListener("visibilitychange", visibility);
  reduced.addEventListener("change", schedule);
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    failure();
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);
  const ripple = (x: number, z: number) => {
    if (!active()) return;
    ripples[rippleIndex++ % 16].set(x, z, elapsed, 0.105);
    schedule();
  };
  const ray = new THREE.Raycaster(),
    plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    hit = new THREE.Vector3();
  resize();
  return {
    update(nextMotion, nextActive) {
      motion = nextMotion;
      enabled = nextActive;
      schedule();
    },
    pulse(note) {
      const p = locations[note];
      if (!p) return;
      ripple(p.x, p.z);
    },
    splash(x, y) {
      const rect = host.getBoundingClientRect();
      ray.setFromCamera(
        new THREE.Vector2(
          ((x - rect.left) / rect.width) * 2 - 1,
          1 - ((y - rect.top) / rect.height) * 2,
        ),
        camera,
      );
      if (ray.ray.intersectPlane(plane, hit)) {
        root.worldToLocal(hit);
        if (Math.hypot(hit.x, hit.z) < 3.4) ripple(hit.x, hit.z);
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      reduced.removeEventListener("change", schedule);
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry);
          const m = o.material;
          for (const material of Array.isArray(m) ? m : [m])
            materials.add(material);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
