import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-face-three';


const loadGLTF = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
      resolve(gltf);
    });
  });
}

/*const loadTexture = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(path, (texture) => {
      resolve(texture);
    }); 
  });
}
*/

document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new MindARThree({
      container: document.body,
    });
    const {renderer, scene, camera} = mindarThree;

    const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(-0.5, 1, 1);
    scene.add(light);
    scene.add(light2);

    /*const faceMesh = mindarThree.addFaceMesh();
    const texture = await loadTexture('assets/face_kabuki.png');
    faceMesh.material.map = texture;
    faceMesh.material.transparent = true;
    faceMesh.material.needsUpdate = true;
    scene.add(faceMesh);*/

    const occluder = await loadGLTF("assets/sparkar-occluder/headOccluder.glb");
    const occluderMaterial = new THREE.MeshBasicMaterial({colorWrite: false});
    occluder.scene.scale.set(0.075, 0.075, 0.07);
    occluder.scene.position.set(0, -0.3, 0.1);
    occluder.scene.traverse((o) => {
      if (o.isMesh) {
	      o.material = occluderMaterial;
      }
    });
    occluder.scene.renderOrder = 0;

    const occluderAnchor = mindarThree.addAnchor(168);
    occluderAnchor.group.add(occluder.scene);


    // Mage hat
    const mage_hat = await loadGLTF("assets/magehat/scene.gltf");
    mage_hat.scene.scale.set(120,120,120);
    mage_hat.scene.position.set(0,-4, -0.75);
    mage_hat.scene.rotation.y = Math.PI/8;
    mage_hat.scene.renderOrder = 1;
    //mage_hat.scene.rotation.x = - Math.PI/6;
    const anchor_hat = mindarThree.addAnchor(10);
    anchor_hat.group.add(mage_hat.scene);

    // Add Big board
    /*const texture_main = new THREE.TextureLoader().load('textures/diamond_ar.png' ); 
    const material_main = new THREE.MeshBasicMaterial( { map:texture_main, transparent: true, opacity: 1.0, color: 0xFFFFFF } );
    const geometry_main = new THREE.PlaneGeometry(1, 1);
    const plane_main = new THREE.Mesh(geometry_main,material_main);
    //plane_main.rotation.x = Math.PI/3;

    plane_main.position.set(-0.1,-0.2,-0.3);
    plane_main.scale.set(0.1,0.1,0.1);
    plane_main.rotation.y = -Math.PI/6;
    const left_earrings_anchor = mindarThree.addAnchor(127);
    left_earrings_anchor.group.add(plane_main);*/

    // Glasses
    // 1. Heart Glasses
    const heart_glasses = await loadGLTF("assets/heart_glasses/scene.gltf");
    heart_glasses.scene.scale.multiplyScalar(0.06);
    heart_glasses.scene.position.set(-0.01, 0.05, -0.2);
    //mage_hat.scene.position.set(0,-3.35, -0.8);
    heart_glasses.scene.renderOrder = 1;
    //mage_hat.scene.rotation.x = - Math.PI/6;
    const glasses_anchor = mindarThree.addAnchor(195);
    glasses_anchor.group.add(heart_glasses.scene);
    heart_glasses.scene.visible = false;

    // 2. Gold Glasses
    const gold_glasses = await loadGLTF("assets/gold_glasses/scene.gltf");
    gold_glasses.scene.scale.multiplyScalar(0.35);
    gold_glasses.scene.position.set(0, -0.1, -0.5);
    //mage_hat.scene.position.set(0,-3.35, -0.8);
    gold_glasses.scene.renderOrder = 1;
    //mage_hat.scene.rotation.x = - Math.PI/6;
    glasses_anchor.group.add(gold_glasses.scene);
    //gold_glasses.scene.visible = false;


    // 3. Round glasses
    const cool_glasses = await loadGLTF("assets/cool_glasses/scene.gltf");
    cool_glasses.scene.rotation.y = Math.PI;
    //gold_glasses2.scene.scale.multiplyScalar(0.35);
    cool_glasses.scene.position.set(0.5, -0.1, -0.1);
    //mage_hat.scene.position.set(0,-3.35, -0.8);
    cool_glasses.scene.renderOrder = 1;
    //mage_hat.scene.rotation.x = - Math.PI/6;
    glasses_anchor.group.add(cool_glasses.scene);
    cool_glasses.scene.visible = false;

    // Earrings
    const pink_rose = await loadGLTF("assets/anarkali_earring/scene.gltf");
    //const pink_rose = await loadGLTF("assets/pusheen_the_cat.glb");
    pink_rose.scene.scale.multiplyScalar(0.4);
    //pink_rose.scene.rotation.x = Math.PI;
    pink_rose.scene.position.set(-0.05,-0.2,-0.2);
    //heart_glasses.scene.position.set(-0.01, 0.05, -0.2);
    //mage_hat.scene.position.set(0,-3.35, -0.8);
    pink_rose.scene.renderOrder = 1;

    const left_earrings_anchor = mindarThree.addAnchor(132);
    left_earrings_anchor.group.add(pink_rose.scene);


    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();
});
