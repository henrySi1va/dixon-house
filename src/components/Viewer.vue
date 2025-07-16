<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const viewerContainer = ref(null);

let renderer, camera, scene, controls, animationId;

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

function onWindowResize() {
  if (!viewerContainer.value || !camera || !renderer) return;
  const width = viewerContainer.value.clientWidth;
  const height = viewerContainer.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
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

  // Camera
  const aspect = viewerContainer.value.clientWidth / viewerContainer.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(5, 5, 5);

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