import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';


const loadTexture = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(path, (texture) => {
      resolve(texture);
    }); 
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new MindARThree({
      container: document.body,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    scene.add(light);

    const faceMesh = mindarThree.addFaceMesh();
    const texture = await loadTexture('assets/face_kabuki.png');
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
    scene.add(faceMesh);

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
