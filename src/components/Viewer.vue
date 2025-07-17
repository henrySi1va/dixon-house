<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useViewerStore } from '@/store/store.js';

const viewerContainer = ref(null);
const viewerStore = useViewerStore();

let renderer, scene, controls, animationId;
let perspectiveCamera, orthographicCamera, camera;

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
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);

  if (cam.isPerspectiveCamera) {
    const fov = cam.fov * (Math.PI / 180);
    const cameraZ = maxDim / (2 * Math.tan(fov / 2));
    cam.position.set(center.x + maxDim * 0.3, center.y + maxDim * 0.3, cameraZ * 0.6);
    cam.lookAt(center);
  } else if (cam.isOrthographicCamera) {
    cam.position.set(center.x, center.y + maxDim, center.z);
    cam.up.set(0, 0, -1);
    cam.lookAt(center);
    cam.updateProjectionMatrix();
  }

  controls.target.copy(center);
  controls.update();
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
  camera.position.copy(prevCamera.position);
  camera.up.copy(prevCamera.up);
  camera.lookAt(controls.target);

  controls.dispose();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(prevCamera instanceof THREE.PerspectiveCamera ? controls.target : controls.target);
  controls.update();
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
    class="w-full aspect-[1/1] max-w-[700px] bg-yellow-200 border
    border-yellow-300 rounded-lg flex items-center justify-center overflow-hidden"
  >
    <div
      ref="viewerContainer"
      class="w-full h-full"
      style="position: relative;"
    ></div>
  </div>
</template>