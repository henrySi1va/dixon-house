import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Light
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);

// Load GLTF
const loader = new GLTFLoader();
loader.load(
  '/dixon_house.gltf',
  (gltf) => {
    const model = gltf.scene;
    // model.rotation.x = -Math.PI / 2; // Rotate if y-axis is not up
    scene.add(model);

    // Add edges to the model
    model.traverse((child) => {
      console.log(child);
      if (child.isMesh) {
          const edges = new THREE.EdgesGeometry(child.geometry, 0.1);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
          const line = new THREE.LineSegments( edges, lineMaterial);
          line.position.copy(child.position);
          line.rotation.copy(child.rotation);
          line.scale.copy(child.scale);
          child.add(line);
      }
    });

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Reposition camera to fit the whole model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = maxDim / (2 * Math.tan(fov / 2));

    camera.position.set(center.x + maxDim * 0.3, center.y + maxDim * 0.3, cameraZ * 0.6);
    camera.lookAt(center);

    // Set controls target to center too
    controls.target.copy(center);
    controls.update();
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
