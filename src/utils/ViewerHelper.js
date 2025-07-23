import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

export function addLights(scene) {
  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 20, 0);
  scene.add(light);
}

export function addModelEdges(model) {
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

export function fitCameraToObject(cam, controls, object, modelCenter, modelSize) {
  const box = new THREE.Box3().setFromObject(object);
  box.getCenter(modelCenter);
  box.getSize(modelSize);

  const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

  if (cam.isPerspectiveCamera) {
    const fov = cam.fov * (Math.PI / 180);
    const cameraZ = maxDim / (2 * Math.tan(fov / 2));
    cam.position.set(modelCenter.x + maxDim * 0.3, modelCenter.y + maxDim * 0.3, cameraZ * 1.0);
    cam.lookAt(modelCenter);
    controls.target.copy(modelCenter);
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    // Reset touches to default for perspective
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.update();
  } else if (cam.isOrthographicCamera) {
    cam.zoom = 0.95;
    cam.position.set(modelCenter.x, modelCenter.y + maxDim * 1.2, modelCenter.z);
    cam.up.set(0, 0, -1);
    cam.lookAt(modelCenter);
    cam.updateProjectionMatrix();
    controls.target.copy(modelCenter);
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    // Set touches for pan only on mobile
    controls.touches = {
      ONE: THREE.TOUCH.PAN,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.update();
  }
}

export function createCameras(width, height, viewType) {
  const aspect = width / height;
  const frustumSize = 20;

  const perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  const orthographicCamera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
    frustumSize / 2, frustumSize / -2,
    0.1, 1000
  );
  const camera = viewType === "3D" ? perspectiveCamera : orthographicCamera;
  return { perspectiveCamera, orthographicCamera, camera };
}

export function switchCamera(
  viewType,
  perspectiveCamera,
  orthographicCamera,
  oldControls,
  renderer,
  scene,
  modelCenter,
  modelSize
) {
  // Dispose old controls
  if (oldControls) oldControls.dispose();

  // Select camera
  const camera = viewType === "3D" ? perspectiveCamera : orthographicCamera;
  // Create new controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Set up controls and camera position
  const model = scene.getObjectByName('modelRoot') || scene.children[scene.children.length - 1];
  fitCameraToObject(camera, controls, model, modelCenter, modelSize);

  return { camera, controls };
}

export function onWindowResize(viewerContainer, camera, perspectiveCamera, orthographicCamera, renderer) {
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

export function extractRoomsFromGLTF(model) {
  const rooms = [];
  model.traverse((child) => {
    if (
      child.type === 'Group' &&
      typeof child.name === 'string' &&
      child.name.startsWith('r_')
    ) {
      // Extract room name after the prefix
      let name = child.name.substring(2);
      name = name.replaceAll('_', ' ');
      // Capitalize first letter of each word
      name = name.replace(/\b\w/g, c => c.toUpperCase());
      // Collect all meshes within this group
      const meshes = [];
      child.traverse((sub) => {
        if (sub.isMesh) meshes.push(sub);
      });
      rooms.push({
        id: child.uuid,
        name,
        group: child,
        meshes
      });
    }
  });
  return rooms;
}

/**
 * Moves the camera to the center of the given room.
 * @param {THREE.Camera} camera
 * @param {OrbitControls} controls
 * @param {Object} room - Room object with .meshes array
 * @param {string} mode - "perspective" or "orthographic"
 * @param {number} standingHeight - Height above the floor for perspective mode (default 2)
 */
export function moveCameraToRoom(camera, controls, room, mode = "perspective", standingHeight = 2) {
  if (!room || !room.meshes || room.meshes.length === 0) return;

  // Compute bounding box of all meshes in the room
  const box = new THREE.Box3();
  room.meshes.forEach(mesh => box.expandByObject(mesh));
  const center = new THREE.Vector3();
  box.getCenter(center);

  if (mode === "perspective") {
    // First-person: place camera at center + standingHeight, looking forward (positive Z)
    camera.position.set(center.x, center.y + standingHeight, center.z);

    // Look forward along +Z from the center (adjust as needed for your model orientation)
    const lookAt = new THREE.Vector3(center.x, center.y + standingHeight, center.z + 1);
    camera.lookAt(lookAt);
    controls.target.copy(lookAt);

    // Only allow rotation (simulate head movement)
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.NONE
    };
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.update();
  } else if (mode === "orthographic") {
    // Place camera above the room, looking straight down
    const boxSize = box.getSize(new THREE.Vector3());
    const above = 5 + boxSize.y;
    camera.position.set(center.x, center.y + above, center.z);
    camera.up.set(0, 0, -1);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    controls.target.copy(center);
    // No need to update orthographic camera controls
  }
}