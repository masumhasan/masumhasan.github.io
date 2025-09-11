// ---- Config ----
const conf = {
  fov: 75,
  cameraZ: 75,
  xyCoef: 50,
  zCoef: 10,
  lightIntensity: 0.9,
  light1Color: 0x0e09dc,
  light2Color: 0x1cd1e1,
  light3Color: 0x18c02c,
  light4Color: 0xee3bcf,
  audioReactive: true, // Always ON
};

const canvas = document.getElementById("background");
let renderer, scene, camera, plane, light1, light2, light3, light4;
let width, height, wWidth, wHeight;
const simplex = new SimplexNoise();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mousePosition = new THREE.Vector3();

initThree();
animate();

function initThree() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  camera = new THREE.PerspectiveCamera(
    conf.fov,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = conf.cameraZ;

  updateSize();
  window.addEventListener("resize", updateSize);

  document.addEventListener("mousemove", (e) => {
    const v = new THREE.Vector3();
    camera.getWorldDirection(v);
    v.normalize();
    mousePlane.normal = v;
    mouse.x = (e.clientX / width) * 2 - 1;
    mouse.y = -(e.clientY / height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(mousePlane, mousePosition);
  });

  scene = new THREE.Scene();
  initLights();
  initPlane();
}

function initPlane() {
  const mat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  const segX = Math.round(wWidth / 2);
  const segY = Math.round(wHeight / 2);
  const geo = new THREE.PlaneBufferGeometry(
    wWidth,
    wHeight,
    Math.max(segX, 10),
    Math.max(segY, 10)
  );
  plane = new THREE.Mesh(geo, mat);
  plane.rotation.x = -Math.PI / 2 - 0.2;
  plane.position.y = -25;
  scene.add(plane);
  camera.position.z = 60;
}

function initLights() {
  const r = 30,
    y = 10,
    lightDistance = 500;
  light1 = new THREE.PointLight(
    conf.light1Color,
    conf.lightIntensity,
    lightDistance
  );
  light1.position.set(0, y, r);
  scene.add(light1);
  light2 = new THREE.PointLight(
    conf.light2Color,
    conf.lightIntensity,
    lightDistance
  );
  light2.position.set(0, -y, -r);
  scene.add(light2);
  light3 = new THREE.PointLight(
    conf.light3Color,
    conf.lightIntensity,
    lightDistance
  );
  light3.position.set(r, y, 0);
  scene.add(light3);
  light4 = new THREE.PointLight(
    conf.light4Color,
    conf.lightIntensity,
    lightDistance
  );
  light4.position.set(-r, y, 0);
  scene.add(light4);
}

function animate() {
  requestAnimationFrame(animate);
  animatePlane();
  animateLights();
  renderer.render(scene, camera);
}

function animatePlane() {
  if (!plane || !plane.geometry) return;
  const pos = plane.geometry.attributes.position.array;
  const time = Date.now() * 0.0002;
  for (let i = 0; i < pos.length; i += 3) {
    pos[i + 2] =
      simplex.noise4D(
        pos[i] / conf.xyCoef,
        pos[i + 1] / conf.xyCoef,
        time,
        mouse.x + mouse.y
      ) * conf.zCoef;
  }
  plane.geometry.attributes.position.needsUpdate = true;
}

function animateLights() {
  const time = Date.now() * 0.001;
  const d = 50;
  light1.position.x = Math.sin(time * 0.1) * d;
  light1.position.z = Math.cos(time * 0.2) * d;
  light2.position.x = Math.cos(time * 0.3) * d;
  light2.position.z = Math.sin(time * 0.4) * d;
  light3.position.x = Math.sin(time * 0.5) * d;
  light3.position.z = Math.sin(time * 0.6) * d;
  light4.position.x = Math.sin(time * 0.7) * d;
  light4.position.z = Math.cos(time * 0.8) * d;
}

function updateSize() {
  width = window.innerWidth;
  height = window.innerHeight;
  if (renderer && camera) {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const size = getRendererSize();
    wWidth = size[0];
    wHeight = size[1];
    if (plane) {
      scene.remove(plane);
      initPlane();
    }
  }
}

function getRendererSize() {
  const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
  const vFOV = (cam.fov * Math.PI) / 180;
  const h = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
  const w = h * cam.aspect;
  return [w, h];
}

// ---- Audio reactive mic ----
let audioCtx = null,
  analyser = null,
  micStream = null,
  dataArray = null,
  rafMeter = null;

async function startMic() {
  if (micStream) return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } catch (err) {
    console.error("Microphone access denied:", err);
    return;
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.fftSize);
  source.connect(analyser);
  startMeter();
}

function startMeter() {
  if (!analyser) return;
  function meterLoop() {
    analyser.getByteTimeDomainData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    if (conf.audioReactive) {
      conf.zCoef = 10 + rms * 50;
    }
    rafMeter = requestAnimationFrame(meterLoop);
  }
  rafMeter = requestAnimationFrame(meterLoop);
}

// Auto start mic
window.addEventListener("DOMContentLoaded", startMic);
