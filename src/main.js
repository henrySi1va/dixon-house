import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// --- DOM Setup ---
function createAppLayout() {
  const appContainer = document.createElement('div');
  appContainer.style.display = 'flex';
  appContainer.style.flexDirection = 'column';
  appContainer.style.alignItems = 'center';
  appContainer.style.marginTop = '24px';

  const heading = document.createElement('h1');
  heading.textContent = 'Dixon House';
  heading.style.marginBottom = '16px';
  appContainer.appendChild(heading);

  const viewerContainer = document.createElement('div');
  viewerContainer.style.width = '80vw';
  viewerContainer.style.height = '70vh';
  viewerContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  viewerContainer.style.background = '#fff';
  viewerContainer.style.position = 'relative';
  appContainer.appendChild(viewerContainer);

  document.body.appendChild(appContainer);
  return viewerContainer;
}

// --- Three.js Setup ---
function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  return renderer;
}

function createCamera(container) {
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(5, 5, 5);
  return camera;
}

function addLights(scene) {
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  scene.add(light);
}

// --- Model Loading ---
function addModelEdges(model) {
  model.traverse((child) => {
    if (child.isMesh) {
      const edges = new THREE.EdgesGeometry(child.geometry, 0.1);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const line = new THREE.LineSegments(edges, lineMaterial);
      line.position.copy(child.position);
      line.rotation.copy(child.rotation);
      line.scale.copy(child.scale);
      child.add(line);
    }
  });
}

function fitCameraToObject(camera, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const cameraZ = maxDim / (2 * Math.tan(fov / 2));

  camera.position.set(center.x + maxDim * 0.3, center.y + maxDim * 0.3, cameraZ * 0.6);
  camera.lookAt(center);

  controls.target.copy(center);
  controls.update();
}

// --- Main Viewer Logic ---
function initViewer() {
  const container = createAppLayout();

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  // Renderer
  const renderer = createRenderer(container);

  // Camera
  const camera = createCamera(container);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Lights
  addLights(scene);

  // Load Model
  const loader = new GLTFLoader();
  loader.load(
    '/dixon_house.gltf',
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      addModelEdges(model);
      fitCameraToObject(camera, controls, model);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );

  // Handle Resize
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// --- Start ---
initViewer();
