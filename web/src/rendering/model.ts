import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// One downloaded model and one set of textures for the whole application.
// The CC0 geometry is shared; each scene owns its animated materials.
let fish: Promise<THREE.Mesh> | undefined;
export function loadFish() {
  if (!fish)
    fish = new GLTFLoader()
      .loadAsync("/models/barramundi.glb")
      .then((gltf) => {
        gltf.scene.updateMatrixWorld(true);
        let source: THREE.Mesh | undefined;
        gltf.scene.traverse((object) => {
          if ((object as THREE.Mesh).isMesh && !source)
            source = object as THREE.Mesh;
        });
        if (!source) throw Error("Fish model has no mesh");
        const geometry = source.geometry
          .clone()
          .applyMatrix4(source.matrixWorld)
          .rotateY(Math.PI / 2);
        geometry.computeBoundingBox();
        const box = geometry.boundingBox!;
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        geometry
          .translate(-center.x, -center.y, -center.z)
          .scale(2.7 / size.x, 2.7 / size.x, 2.7 / size.x);
        geometry.computeBoundingBox();
        return new THREE.Mesh(geometry, source.material);
      })
      .catch((error) => {
        fish = undefined;
        throw error;
      });
  return fish;
}
