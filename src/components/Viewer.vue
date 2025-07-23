<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useViewerStore } from '@/store/store.js';
import {
  addLights,
  addModelEdges,
  fitCameraToObject,
  createCameras,
  switchCamera as switchCameraHelper,
  onWindowResize as onWindowResizeHelper,
  extractRoomsFromGLTF,
  moveCameraToRoom
} from '@/utils/ViewerHelper.js';

const viewerContainer = ref(null);
const viewerStore = useViewerStore();
const isFullscreen = ref(false);

let renderer, scene, controls, animationId;
let perspectiveCamera, orthographicCamera, camera;
let modelCenter = new THREE.Vector3();
let modelSize = new THREE.Vector3();

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
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight);
  viewerContainer.value.appendChild(renderer.domElement);

  // Cameras
  const cams = createCameras(viewerContainer.value.clientWidth, viewerContainer.value.clientHeight, viewerStore.view);
  perspectiveCamera = cams.perspectiveCamera;
  orthographicCamera = cams.orthographicCamera;
  camera = cams.camera;

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);

  // Lights
  addLights(scene);

  // Load Model
  const loader = new GLTFLoader();
  loader.load(
    '/dixon_house_v19.gltf',
    (gltf) => {
      const model = gltf.scene;
      model.name = 'modelRoot';
      scene.add(model);
      addModelEdges(model);
      fitCameraToObject(camera, controls, model, modelCenter, modelSize);

      // Extract rooms and update store
      const rooms = extractRoomsFromGLTF(model);
      viewerStore.clearRooms();
      viewerStore.setRooms(rooms);
    },
    undefined,
    (error) => {
      console.error(error);
    }
  );

  window.addEventListener('resize', () => {
    onWindowResizeHelper(viewerContainer, camera, perspectiveCamera, orthographicCamera, renderer);
  });

  document.addEventListener('fullscreenchange', fullscreenChangeHandler);

  function animate() {
    animationId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

watch(
  () => viewerStore.view,
  (newView) => {
    const result = switchCameraHelper(
      newView,
      perspectiveCamera,
      orthographicCamera,
      controls,
      renderer,
      scene,
      modelCenter,
      modelSize
    );
    camera = result.camera;
    controls = result.controls; // Replace controls instance!
  }
);

watch(
  () => viewerStore.highlightedRoomId,
  (roomId) => {
    // Remove previous outlines
    viewerStore.rooms.forEach(room => {
      if (room.meshes) {
        room.meshes.forEach(mesh => {
          if (mesh.userData.outlineMesh) {
            mesh.remove(mesh.userData.outlineMesh);
            mesh.userData.outlineMesh = null;
          }
        });
      }
    });
    // Add outline to the highlighted room
    if (roomId) {
      const room = viewerStore.rooms.find(r => r.id === roomId);
      if (room && room.meshes) {
        room.meshes.forEach(mesh => {
          const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffa500,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.7,
            depthTest: false
          });
          const outlineMesh = new THREE.Mesh(mesh.geometry.clone(), outlineMaterial);
          outlineMesh.scale.copy(mesh.scale).multiplyScalar(1);
          outlineMesh.position.copy(mesh.position);
          outlineMesh.rotation.copy(mesh.rotation);
          outlineMesh.quaternion.copy(mesh.quaternion);
          outlineMesh.updateMatrix();
          outlineMesh.updateMatrixWorld();
          mesh.add(outlineMesh);
          mesh.userData.outlineMesh = outlineMesh;
        });
      }
    }
  }
);

// Watch for selected room changes
watch(
  () => viewerStore.selectedRoom,
  (roomId) => {
    if (roomId) {
      const room = viewerStore.rooms.find(r => r.id === roomId);
      if (room) {
        const mode = camera.isOrthographicCamera ? "orthographic" : "perspective";
        moveCameraToRoom(camera, controls, room, mode);
      }
    } else {
      // Reset camera to default position and target
      fitCameraToObject(
        camera,
        controls,
        scene.getObjectByName('modelRoot'),
        modelCenter,
        modelSize
      );
    }
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResizeHelper);
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
      class="absolute top-4 right-4 p-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-yellow-300 hover:text-gray-900 transition-colors duration-150 z-20 flex items-center justify-center border border-yellow-300"
      @click="toggleFullscreen"
      type="button"
      aria-label="Toggle fullscreen"
    >
      <span v-if="!isFullscreen">
        <!-- Fullscreen: 4 arrows outward -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 8V4h4"/>
            <path d="M20 8V4h-4"/>
            <path d="M4 16v4h4"/>
            <path d="M20 16v4h-4"/>
          </g>
        </svg>
      </span>
      <span v-else>
        <!-- Exit Fullscreen: 4 arrows inward -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 4H4v4"/>
            <path d="M16 4h4v4"/>
            <path d="M4 16v4h4"/>
            <path d="M20 16v4h-4"/>
          </g>
        </svg>
      </span>
    </button>
  </div>
</template>