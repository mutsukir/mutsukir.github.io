import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MindARThree } from 'mindar-image-three';
//import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

const loadGLTF = (path) => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(path, (gltf) => {
        resolve(gltf);
      });
    });
}

const loadVideo = (path) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      //video.addEventListener('loadeddata', () => {
      video.addEventListener('loadedmetadata', () => {
        video.setAttribute('playsinline', '');
        resolve(video);
      });
      video.src = path;
    });
}

const createChromaMaterial = (texture, keyColor) => {
  const keyColorObject = new THREE.Color(keyColor);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      tex: {
        type: "t",
        value: texture
      },
      color: {
        type: "c",
        value: keyColorObject
      },
      edgeColor: {
        type: "c",
        value: new THREE.Color(0xaaccdd)
      },
      similarity: {
        value: 0.35
      },
      smoothness: {
        value: 0.05
      },
      keyThreshold: {
        value: 0.9
      }
    },
    vertexShader:
    "varying mediump vec2 vUv;\n" +
    "void main(void)\n" +
    "{\n" +
    "vUv = uv;\n" +
    "mediump vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n" +
    "gl_Position = projectionMatrix * mvPosition;\n" +
    "}",
    fragmentShader:
    "uniform mediump sampler2D tex;\n" +
    "uniform mediump vec3 color;\n" +
    "uniform mediump vec3 edgeColor;\n" +
    "uniform mediump float similarity;\n" +
    "uniform mediump float smoothness;\n" +
    "uniform mediump float keyThreshold;\n" +
    "varying mediump vec2 vUv;\n" +
    "void main(void)\n" +
    "{\n" +
    "  mediump vec3 tColor = texture2D( tex, vUv ).rgb;\n" +
    // Convert to HSV
    "  mediump float maxC = max(max(tColor.r, tColor.g), tColor.b);\n" +
    "  mediump float minC = min(min(tColor.r, tColor.g), tColor.b);\n" +
    "  mediump float chroma = maxC-minC;\n" +
    "  mediump float brightness = maxC;\n" +
    "  mediump float saturation = chroma / max(0.0001, brightness);\n" +
    "  mediump float chromaDist = distance(tColor, color);\n" +
    "  mediump float alpha = smoothstep(similarity, similarity + smoothness, chromaDist);\n" +
    "  if (tColor.g > 0.8 && tColor.g > tColor.r && tColor.g > tColor.b){\n" +
    "    tColor = edgeColor;}" +
    "  gl_FragColor = vec4(tColor, alpha);\n" +
    "}",
    transparent: true
  });
  return material;
}


// ***********  MAIN **************
document.addEventListener('DOMContentLoaded', () => {
  const start = async() => {
    const mindarThree = new MindARThree({
      container: document.body,
      imageTargetSrc: 'assets/ptcg03.mind',
      filterMinCF: 0.0000001, filterBeta: 1,
      missTolerance: 15
    });
    const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;

    // Add light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Add house
    const house = await loadGLTF("assets/witchs_retreat/scene.gltf"); // Credit - 3D model: "Witch's Retreat" (https://sketchfab.com/3d-models/witchs-retreat-6ddff528def04b5096cf3dbdd8a95dc9) by Rick Hoppmann 
    house.scene.scale.multiplyScalar(0.3);
    house.scene.position.set(0, 0, 0);
    house.scene.rotation.x = Math.PI/2.5;
    //house.scene.rotation.y = -Math.PI;
    const anchor = mindarThree.addAnchor(0);
    anchor.group.add(house.scene);

    const tree = await loadGLTF("assets/pine_tree/scene.gltf"); // Credit - 3D model: "Blue pine under snow" (https://sketchfab.com/3d-models/blue-pine-under-snow-d5846c9412974ad99b450aff134ff561) by 1-3D.com 
    tree.scene.scale.multiplyScalar(0.003);
    tree.scene.position.set(-0.8, -0.5, 0.1);
    tree.scene.rotation.x = Math.PI/2.3;
    //house.scene.rotation.y = -Math.PI;
    anchor.group.add(tree.scene);

    const tree2 = await loadGLTF("assets/pine_tree/scene.gltf"); // same as above
    tree2.scene.scale.multiplyScalar(0.003);
    tree2.scene.position.set(0.8, 0, -0.1);
    tree2.scene.rotation.x = Math.PI/2.3;
    //house.scene.rotation.y = -Math.PI;
    anchor.group.add(tree2.scene);

    // Add video
    const video = await loadVideo("assets/elsa_green_360.mp4");
    video.loop = true;
    //video.autoplay = true;
    video.play();
    video.pause();
    const texture = new THREE.VideoTexture(video);

    const geometry = new THREE.PlaneGeometry(1, 1080/1920);
    //const material = new THREE.MeshBasicMaterial({map: texture});
    const material = createChromaMaterial(texture, 0x00ff00);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2.5;
    plane.position.y = -0.5;
    plane.position.z = 0.5;
    plane.scale.multiplyScalar(1);
    anchor.group.add(plane);


    anchor.onTargetFound = () => {
      video.play();
    }
    anchor.onTargetLost = () => {
      video.pause();
    }

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  start();

    // Add Big board
    /*const texture_main = new THREE.TextureLoader().load('textures/027-08_main.png' ); 
    const material_main = new THREE.MeshBasicMaterial( { map:texture_main, transparent: true, opacity: 1.0, color: 0xFFFFFF } );
    const geometry_main = new THREE.PlaneGeometry(1.25, 1.9);
    const plane_main = new THREE.Mesh(geometry_main,material_main);
    plane_main.rotation.x = Math.PI/3;
    plane_main.position.set(0,1.25,0.75);
    anchor.group.add(plane_main);

    // Add lace under house
    const texture_lace = new THREE.TextureLoader().load('textures/lace.png' ); 
    const material_lace = new THREE.MeshBasicMaterial( { map:texture_lace, transparent: true, opacity: 1.0, color: 0xa182b8 } );
    const geometry_lace = new THREE.PlaneGeometry(1.5, 1.5);
    const plane_lace = new THREE.Mesh(geometry_lace, material_lace);
    anchor.group.add(plane_lace);


    const texture_button = [
      new THREE.TextureLoader().load('textures/027-02.png' ),
      new THREE.TextureLoader().load('textures/027-03.png' ),
      new THREE.TextureLoader().load('textures/027-04.png' ),
      new THREE.TextureLoader().load('textures/027-05.png' )
    ];

    // Add video
    const video = await loadVideo("assets/cat_video.mp4");
    video.loop = true;
    const video_texture = new THREE.VideoTexture(video);
    const video_geometry = new THREE.PlaneGeometry(1.2, 1080/1920*1.2);
    const video_material = new THREE.MeshBasicMaterial({map: video_texture});
    const video_plane = new THREE.Mesh(video_geometry, video_material);
    video_plane.position.set(1.2, -0.05, 0.1);
    video_plane.rotation.x = Math.PI/3;
    anchor.group.add(video_plane);
    video.addEventListener('play', () => {
      video.currentTime = 0;
    });


    // Add 4 buttons
    const material_button = [];
    const plane_button = [];
    //const geometry_button = new THREE.PlaneGeometry(0.5, 0.5);
    const geometry_button = new THREE.PlaneGeometry(0.5, 0.5);
    let selected = 'none';

    for (let i=0; i<texture_button.length;i++){
      material_button[i] = new THREE.MeshBasicMaterial( { map:texture_button[i], transparent: true, opacity: 1.0, color: 0xFFFFFF } );
      plane_button[i] = new THREE.Mesh(geometry_button,material_button[i]);
      plane_button[i].rotation.x = Math.PI/3;
      if (i<texture_button.length/2){
        plane_button[i].position.set((-1.5-1*i)/2, (i%(texture_button.length/2)+0.2), 0.75);
      }
      else{
        plane_button[i].position.set((1.5+(1*(i-2)))/2, (i%(texture_button.length/2)+0.2), 0.75);
      }
      plane_button[i].userData.clickable = true;

      anchor.group.add(plane_button[i]); 
    }

    anchor.onTargetFound = () => {
      video.play();
      for (let i=0; i<texture_button.length;i++){
        plane_button[i].userData.clickable = true;
      }
    }
    anchor.onTargetLost = () => {
      video.pause();
      for (let i=0; i<texture_button.length;i++){
        plane_button[i].userData.clickable = false;
      }
    }


    // Add text

    const text = document.querySelector("#ar-div");
    const css_plane = new CSS3DObject(text);
    css_plane.rotation.x = Math.PI/3;
    css_plane.position.set(-1000, 0, 0);

    const cssAnchor = mindarThree.addCSSAnchor(0);
    cssAnchor.group.add(css_plane);

    text.addEventListener('click', function (evt) {
      if (selected === 'contact') {
        window.location.href="https://www.linkedin.com/in/sara-kam-051bb541/";
      }
      else if (selected === 'jewelry'){
        window.location.href="https://linktr.ee/tooomini";
      }
      else if (selected === 'none'){
        window.location.href="https://www.instagram.com/tooo.mini/";
      }
    });

    // Add listener for click
    document.body.addEventListener("click", (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      const mouse = new THREE.Vector2(mouseX, mouseY);
      // add raycaster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      // get intersects
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0){ // if there's any intersects
        let o = intersects[0].object;

        // get the correct parent
        while (o.parent && !o.userData.clickable){
          o = o.parent;
        }

        if (o.userData.clickable){
          // Programmer
          if (o===plane_button[0]){
            console.log("programmer");
            if (selected ==='programmer'){
              selected = 'none';
            }
            else{
              selected = 'programmer';
              document.getElementById("ar-div").innerHTML = "C/C++/C#, Python, Java<br>HTML, CSS, Javascript,<br>Django, SQL, Tensorflow(AI),<br>Unity(Game), VR, AR<br>Windows/Mac/Linux";  
            }
          }
          // Tranlator
          else if (o===plane_button[1]){
            console.log("translator");
            if (selected ==='translator'){
              selected = 'none';
            }
            else{
              selected = 'translator';
              document.getElementById("ar-div").innerHTML = "Chinese / Cantonese<br>English<br>Japanese";  
            }
          }
          //Contact
          else if (o===plane_button[2]){
            console.log("contact");
            if (selected ==='contact'){
              selected = 'none';
            }
            else{
              selected = 'contact';
              document.getElementById("ar-div").innerHTML = "email: wskamsara@gmail.com<br> <br>Click me -> Linkedin";  
            }
          }

          // Jewelry
          else if (o===plane_button[3]){
            console.log("jewelry");
            if (selected ==='jewelry'){
              selected = 'none';
            }
            else{
              selected = 'jewelry';
              document.getElementById("ar-div").innerHTML = "www.tooo-mini.com<br>Etsy(US), Creema(JP), Pinkoi(TW)<br> <br>Click me for more";  
            }
          }

          // None
          if (selected === 'none'){
            document.getElementById("ar-div").innerHTML = "Hello!<br>  I am Sara!<br>Programmer<br>+Translator<br>+Jewelry designer ^__^<br> <br><b>instagram: tooo.mini</b>";
          }
          
        }

      }

    });
  
    const clock = new THREE.Clock();
    
    await mindarThree.start();
    renderer.setAnimationLoop( () => {
      const delta = clock.getDelta();
      //plane_button[0].rotation.set(0, 0, plane_button[0].rotation.z + Math.sin(delta)*0.2+0.2);
      //plane_button[0].rotation.set(0, 0, plane_button[0].rotation.z + Math.sin(delta)*Math.PI/2);
      //let a = Math.cos(clock.getElapsedTime())*0.15+ 1;
      //plane_button[0].scale.set(a, a, a);
      //material_button.color.set();

      //css_plane.position.set(css_plane.position.x + delta*0.3,css_plane.position.y + delta*0.3,css_plane.position.z + delta*0.3); 

      // Move up & down
      if (selected === 'programmer'){
        plane_button[0].position.set(plane_button[0].position.x, plane_button[0].position.y , plane_button[0].position.z + Math.sin(clock.getElapsedTime()*2)*0.005);
      }
      else if (selected === 'translator'){
        plane_button[1].position.set(plane_button[1].position.x, plane_button[1].position.y , plane_button[1].position.z + Math.sin(clock.getElapsedTime()*2)*0.005);
      }
      else if (selected === 'contact'){
        plane_button[2].position.set(plane_button[2].position.x, plane_button[2].position.y , plane_button[2].position.z + Math.sin(clock.getElapsedTime()*2)*0.005);
      }
      else if (selected === 'jewelry'){
        plane_button[3].position.set(plane_button[3].position.x, plane_button[3].position.y , plane_button[3].position.z + Math.sin(clock.getElapsedTime()*2)*0.005);
      }
      

      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    });


  }

  start();*/
});