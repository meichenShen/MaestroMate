import * as THREE from "three";
/** Original reef geometry and procedural moving water, no image textures. */
export function createUnderwater() {
  const group = new THREE.Group(),
    geometry = new Set<THREE.BufferGeometry>(),
    materials = new Set<THREE.Material>();
  const add = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    parent: THREE.Object3D = group,
  ) => {
    geometry.add(g);
    materials.add(m);
    const o = new THREE.Mesh(g, m);
    parent.add(o);
    return o;
  };
  const sand = new THREE.MeshStandardMaterial({
      color: "#75779c",
      roughness: 0.9,
    }),
    rock = new THREE.MeshStandardMaterial({ color: "#313b79", roughness: 0.8 }),
    coral = new THREE.MeshStandardMaterial({
      color: "#ff8aaf",
      roughness: 0.45,
    }),
    blueCoral = new THREE.MeshStandardMaterial({
      color: "#7464e9",
      roughness: 0.5,
    });
  const reef = new THREE.Group();
  group.add(reef);
  for (let i = 0; i < 5; i++) {
    const b = add(new THREE.SphereGeometry(1, 28, 12), sand, reef);
    b.position.set((i - 2) * 3, -4.1, -2 - (i % 2));
    b.scale.set(3.2, 0.9, 2.4);
  }
  for (let i = 0; i < 11; i++) {
    const r = add(new THREE.IcosahedronGeometry(1, 2), rock, reef),
      side = i % 2 ? 1 : -1;
    r.position.set(
      side * (4.5 + (i % 3) * 0.8),
      -3.05 + (i % 4) * 0.25,
      -2.5 - (i % 3),
    );
    r.scale.set(1 + (i % 3) * 0.3, 0.6 + (i % 4) * 0.45, 0.8);
    r.rotation.y = i * 0.7;
  }
  const plants: THREE.Group[] = [];
  for (const side of [-1, 1])
    for (let i = 0; i < 4; i++) {
      const stem = new THREE.Group();
      stem.position.set(side * (3.6 + i * 0.5), -3.6, -1.5 - i * 0.4);
      reef.add(stem);
      plants.push(stem);
      for (let branch = 0; branch < 3; branch++) {
        const h = 1.3 + i * 0.24,
          dx = (branch - 1) * 0.36;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(),
          new THREE.Vector3(dx * 0.2, h * 0.35, 0),
          new THREE.Vector3(dx, h * 0.7, 0.08),
          new THREE.Vector3(dx + side * 0.16, h, 0.12),
        ]);
        add(
          new THREE.TubeGeometry(
            curve,
            20,
            0.055 - (branch % 2) * 0.012,
            6,
            false,
          ),
          i % 2 ? coral : blueCoral,
          stem,
        );
      }
    }
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
  };
  const water = new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: `varying vec2 vUv;uniform float uTime;uniform float uAspect;uniform vec2 uPointer;
 void main(){vec2 p=vec2(vUv.x*uAspect,vUv.y)*6.;float t=uTime*.27;
 float f=sin(p.x*1.8+sin(p.y*2.+t))+cos(p.y*2.2+sin(p.x+t*.7));
 float caustic=pow(max(0.,1.-abs(f)),18.);
 float beam=pow(max(0.,sin(vUv.x*20.+vUv.y*3.+sin(t)*.6)),20.)*pow(vUv.y,1.5);
 float r=length((vUv-uPointer)*vec2(uAspect,1.));float ripple=pow(max(0.,sin(r*38.-uTime*1.8)),16.)/(1.+r*8.);
 vec3 deep=vec3(.018,.021,.070),light=vec3(.045,.12,.30);vec3 col=mix(deep,light,vUv.y*.75);
 col+=vec3(.16,.20,.40)*caustic*.26+vec3(.14,.22,.42)*beam*.4+vec3(.12,.16,.3)*ripple*.14;
 gl_FragColor=vec4(col,1.);}`,
  });
  const backdrop = add(new THREE.PlaneGeometry(1, 1), water);
  backdrop.position.set(0, 0, -6.5);
  backdrop.renderOrder = -10;
  const bubblesUniform = { uTime: { value: 0 } };
  const bubbleGeometry = new THREE.BufferGeometry();
  const p = new Float32Array(36 * 3);
  for (let i = 0; i < 36; i++) {
    p[i * 3] = Math.sin(i * 5.7) * 7;
    p[i * 3 + 1] = Math.cos(i * 3.3) * 4;
    p[i * 3 + 2] = -4 + (i % 5);
  }
  bubbleGeometry.setAttribute("position", new THREE.BufferAttribute(p, 3));
  geometry.add(bubbleGeometry);
  const bubbleMat = new THREE.ShaderMaterial({
    uniforms: bubblesUniform,
    transparent: true,
    depthWrite: false,
    vertexShader:
      "uniform float uTime;void main(){vec3 p=position;p.y=mod(p.y+uTime*.15+4.,8.)-4.;p.x+=sin(uTime*.3+p.y)*.05;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=5.+mod(abs(position.x)*13.,5.);gl_Position=projectionMatrix*mv;}",
    fragmentShader:
      "void main(){float d=length(gl_PointCoord-.5);float edge=smoothstep(.5,.38,d)*smoothstep(.30,.39,d);float glint=smoothstep(.16,.0,length(gl_PointCoord-vec2(.34,.33)));gl_FragColor=vec4(.65,.75,1.,edge*.34+glint*.4);}",
  });
  materials.add(bubbleMat);
  const bubbles = new THREE.Points(bubbleGeometry, bubbleMat);
  group.add(bubbles);
  return {
    group,
    update(t: number, width: number, height = 8.8, px = 0, py = 0) {
      uniforms.uTime.value = t;
      uniforms.uAspect.value = width / height;
      uniforms.uPointer.value.set(0.5 + px, 0.5 + py);
      bubblesUniform.uTime.value = t;
      backdrop.scale.set(width * 1.8, height * 1.7, 1);
      reef.scale.x = Math.max(0.5, width / 19);
      plants.forEach((s, i) => (s.rotation.z = Math.sin(t * 0.65 + i) * 0.1));
    },
    dispose() {
      geometry.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      group.removeFromParent();
    },
  };
}
