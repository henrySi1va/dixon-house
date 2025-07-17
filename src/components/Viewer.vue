<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useViewerStore } from '@/store/store.js';

const viewerContainer = ref(null);
const viewerStore = useViewerStore();
const isFullscreen = ref(false);

let renderer, scene, controls, animationId;
let perspectiveCamera, orthographicCamera, camera;
let modelCenter = new THREE.Vector3();
let modelSize = new THREE.Vector3();

function addLights(scene) {
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  scene.add(light);
}

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

function fitCameraToObject(cam, controls, object) {
  const box = new THREE.Box3().setFromObject(object);
  box.getCenter(modelCenter);
  box.getSize(modelSize);

  const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

  if (cam.isPerspectiveCamera) {
    const fov = cam.fov * (Math.PI / 180);
    const cameraZ = maxDim / (2 * Math.tan(fov / 2));
    cam.position.set(modelCenter.x + maxDim * 0.3, modelCenter.y + maxDim * 0.3, cameraZ * 0.6);
    cam.lookAt(modelCenter);
    controls.target.copy(modelCenter);
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.update();
  } else if (cam.isOrthographicCamera) {
    // Place camera directly above the model, looking down
    cam.position.set(modelCenter.x, modelCenter.y + maxDim * 1.2, modelCenter.z);
    cam.up.set(0, 0, -1);
    cam.lookAt(modelCenter);
    cam.updateProjectionMatrix();
    controls.target.copy(modelCenter);
    // Restrict controls to pan only
    controls.enablePan = true;
    controls.enableRotate = false;
    controls.enableZoom = true;
    // Enable left-click to pan.
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.update();
  }
}

function createCameras(width, height) {
  const aspect = width / height;
  const frustumSize = 20;

  perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  orthographicCamera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
    frustumSize / 2, frustumSize / -2,
    0.1, 1000
  );
  camera = viewerStore.view === "3D" ? perspectiveCamera : orthographicCamera;
}

function switchCamera(viewType) {
  const prevCamera = camera;
  camera = viewType === "3D" ? perspectiveCamera : orthographicCamera;

  // Re-create controls for new camera
  controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);

  // Reset camera position and controls for each type
  if (viewType === "3D") {
    // Perspective: reset position and controls
    fitCameraToObject(camera, controls, scene.getObjectByName('modelRoot') || scene.children[scene.children.length - 1]);
  } else {
    // Orthographic: place above, restrict controls
    fitCameraToObject(camera, controls, scene.getObjectByName('modelRoot') || scene.children[scene.children.length - 1]);
  }
}

function onWindowResize() {
  if (!viewerContainer.value || !camera || !renderer) return;
  const width = viewerContainer.value.clientWidth;
  const height = viewerContainer.value.clientHeight;

  perspectiveCamera.aspect = width / height;
  perspectiveCamera.updateProjectionMatrix();

  const aspect = width / height;
  const frustumSize = 20;
  orthographicCamera.left = (frustumSize * aspect) / -2;
  orthographicCamera.right = (frustumSize * aspect) / 2;
  orthographicCamera.top = frustumSize / 2;
  orthographicCamera.bottom = frustumSize / -2;
  orthographicCamera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

// --- Fullscreen logic ---
function toggleFullscreen() {
  const el = viewerContainer.value?.parentElement;
  if (!el) return;
  if (!isFullscreen.value) {
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

function fullscreenChangeHandler() {
  const el = viewerContainer.value?.parentElement;
  isFullscreen.value = !!document.fullscreenElement && document.fullscreenElement === el;
}

onMounted(() => {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight);
  viewerContainer.value.appendChild(renderer.domElement);

  // Cameras
  createCameras(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);

  // Lights
  addLights(scene);

  // Load Model
  const loader = new GLTFLoader();
  loader.load(
    '/dixon_house.gltf',
    (gltf) => {
      const model = gltf.scene;
      model.name = 'modelRoot'; // For easy reference
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
  window.addEventListener('resize', onWindowResize);

  // Fullscreen event
  document.addEventListener('fullscreenchange', fullscreenChangeHandler);

  // Animation Loop
  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

// Watch for view changes and switch camera accordingly
watch(
  () => viewerStore.view,
  (newView) => {
    switchCamera(newView);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
  document.removeEventListener('fullscreenchange', fullscreenChangeHandler);
  if (animationId) cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  }
  scene = null;
  camera = null;
  controls = null;
  renderer = null;
});
</script>

<template>
  <div
    class="w-full aspect-[1/1] max-w-[700px] bg-yellow-200 border border-yellow-300 rounded-lg flex items-center justify-center overflow-hidden relative"
  >
    <div
      ref="viewerContainer"
      class="w-full h-full"
      style="position: relative;"
    ></div>
    <button
      class="absolute top-4 right-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 z-20 text-sm"
      @click="toggleFullscreen"
      type="button"
    >
      {{ isFullscreen ? 'Exit Fullscreen' : 'Fullscreen' }}
    </button>
  </div>
</template>