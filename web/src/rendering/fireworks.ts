import * as THREE from "three";

/** GPU age/size technique informed by Max van Leeuwen's MIT particle example.
 * Original 3D bursts, ballistic trails and finite choreography; no textures/CDN.
 */
export function createFireworks(scene: THREE.Scene) {
  const centers = [
    [-7, 13, -2],
    [4, 16, -5],
    [7, 12, 3],
    [-1, 15, 1],
  ];
  const starts = [0.65, 1.85, 3.1, 4.1],
    colors = ["#45D9FD", "#EE2560", "#FFDA8E", "#A593E0"];
  const positions: number[] = [],
    directions: number[] = [],
    parameters: number[] = [],
    tints: number[] = [];
  const append = (
    burst: number,
    dx: number,
    dy: number,
    dz: number,
    trail: number,
    seed: number,
    rocket = 0,
  ) => {
    positions.push(...centers[burst]);
    directions.push(dx, dy, dz);
    parameters.push(starts[burst], trail, seed, rocket);
    const c = new THREE.Color(colors[burst]);
    tints.push(c.r, c.g, c.b);
  };
  for (let b = 0; b < 4; b++) {
    for (let i = 0; i < 240; i++) {
      const y = 1 - (2 * (i + 0.5)) / 240,
        r = Math.sqrt(1 - y * y),
        angle = i * 2.399963229728653,
        seed = ((i * 73 + b * 31) % 239) / 239;
      for (let tail = 0; tail < 8; tail++)
        append(b, Math.cos(angle) * r, y, Math.sin(angle) * r, tail, seed);
    }
    for (let tail = 0; tail < 12; tail++) append(b, 0, 1, 0, tail, 0.5, 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute(
    "aDirection",
    new THREE.Float32BufferAttribute(directions, 3),
  );
  geometry.setAttribute(
    "aParams",
    new THREE.Float32BufferAttribute(parameters, 4),
  );
  geometry.setAttribute("aTint", new THREE.Float32BufferAttribute(tints, 3));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatioSafe(), 1.4) },
    },
    vertexShader: `
      uniform float uTime; uniform float uPixelRatio;
      attribute vec3 aDirection; attribute vec4 aParams; attribute vec3 aTint;
      varying vec3 vTint; varying float vOpacity;
      void main(){
        float tail=aParams.y; float age=uTime-aParams.x-tail*.033;
        vec3 p=position;
        float weight=exp(-tail*.34); float size=7.0+4.0*aParams.z;
        if(aParams.w>.5){
          float launch=age+.7;
          float t=clamp(launch/.7,0.0,1.0);
          p.y=mix(2.0,position.y,t);
          vOpacity=step(0.0,launch)*(1.0-step(.7,launch))*weight;
          size=9.0;
        }else{
          float t=max(0.0,age);
          float distance=(1.0-exp(-t*1.05))*(5.0+aParams.z*2.0);
          p+=aDirection*distance;
          p.y-=.65*t*t;
          vOpacity=smoothstep(0.0,.14,t)*(1.0-smoothstep(1.1,3.0,t))*weight*.75;
          size*=mix(1.0,.48,tail/7.0);
        }
        vec4 view=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*view;
        gl_PointSize=size*uPixelRatio*clamp(65.0/-view.z,.65,1.5);
        vTint=aTint;
      }`,
    fragmentShader: `
      varying vec3 vTint; varying float vOpacity;
      void main(){
        vec2 p=gl_PointCoord*2.0-1.0; float r=length(p);
        if(r>1.0||vOpacity<.005)discard;
        float core=pow(max(0.0,1.0-r),3.0);
        float halo=exp(-4.0*r*r)*.25;
        vec3 color=mix(vTint,vec3(1.0),core*.95);
        gl_FragColor=vec4(color*(1.0+core*1.6),(core+halo)*vOpacity);
      }`,
  });
  const cloud = new THREE.Points(geometry, material);
  cloud.name = "Celebration sparks";
  cloud.frustumCulled = false;
  scene.add(cloud);
  let elapsed = 0,
    disposed = false;
  const duration = 7.9;
  return {
    get elapsed() {
      return elapsed;
    },
    get active() {
      return !disposed && elapsed < duration;
    },
    advance(seconds: number, enabled: boolean) {
      if (disposed) return;
      if (enabled)
        elapsed = Math.min(
          duration,
          elapsed + Math.max(0, Number.isFinite(seconds) ? seconds : 0),
        );
      material.uniforms.uTime.value = elapsed;
      cloud.visible = enabled && elapsed < duration;
    },
    finish() {
      elapsed = duration;
      cloud.visible = false;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      scene.remove(cloud);
      geometry.dispose();
      material.dispose();
    },
  };
}
function devicePixelRatioSafe() {
  return typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
}
