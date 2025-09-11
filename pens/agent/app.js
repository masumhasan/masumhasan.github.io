// ---- Config / state ----
const conf = {
  fov: 75,
  cameraZ: 75,
  xyCoef: 50,
  zCoef: 10,
  lightIntensity: 0.9,
  ambientColor: 0x000000,
  light1Color: 0x0e09dc,
  light2Color: 0x1cd1e1,
  light3Color: 0x18c02c,
  light4Color: 0xee3bcf,
  audioReactive: true, // Always ON
};

// elements
const canvas = document.getElementById("background");
const noiseRange = document.getElementById("noiseRange");
const heightRange = document.getElementById("heightRange");
const lblNoise = document.getElementById("lbl-noise");
const lblHeight = document.getElementById("lbl-height");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const vuFill = document.getElementById("vuFill");
const startMicBtn = document.getElementById("startMic");
const stopMicBtn = document.getElementById("stopMic");
const micStatus = document.getElementById("micStatus");
const listenBtn = document.getElementById("listenBtn");
const stopListenBtn = document.getElementById("stopListenBtn");
const transcriptEl = document.getElementById("transcript");
const autoReplyBtn = document.getElementById("autoReply");
const speakText = document.getElementById("speakText");
const speakBtn = document.getElementById("speakBtn");
const stopSpeakBtn = document.getElementById("stopSpeakBtn");
const randColor = document.getElementById("randColor");
const randomColorsCenter = document.getElementById("randomColorsCenter");
const toggleListen = document.getElementById("toggleListen");
const toggleSpeak = document.getElementById("toggleSpeak");

// init range defaults
noiseRange.value = 101 - conf.xyCoef;
heightRange.value = (conf.zCoef * 100) / 25;
lblNoise.textContent = noiseRange.value;
lblHeight.textContent = heightRange.value;

// ---------- Three.js scene ----------
let renderer, scene, camera, plane, light1, light2, light3, light4;
let width, height, wWidth, wHeight;
const simplex = new SimplexNoise();
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const mousePosition = new THREE.Vector3();

initThree();
animate();

function initPlane() {
  const geo = new THREE.PlaneBufferGeometry(
    wWidth,
    wHeight,
    Math.max(wWidth / 2, 10),
    Math.max(wHeight / 2, 10)
  );
  const mat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geo, mat);

  // Original orientation
  plane.rotation.x = -Math.PI / 2 - 0.2;
  plane.position.y = -25;

  // 🔥 Flip upside down horizontally
  plane.rotation.z = Math.PI;

  scene.add(plane);
}

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
  // update z values (every vertex step 3)
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
    // recreate plane geometry to better match new dimensions
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

// ---- UI wiring ----
noiseRange.addEventListener("input", () => {
  lblNoise.textContent = noiseRange.value;
  conf.xyCoef = 101 - parseFloat(noiseRange.value);
});
heightRange.addEventListener("input", () => {
  lblHeight.textContent = heightRange.value;
  conf.zCoef = (parseFloat(heightRange.value) * 25) / 100;
});

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
  sidebar.setAttribute("aria-hidden", sidebar.classList.contains("hidden"));
});
closeSidebar.addEventListener("click", () => {
  sidebar.classList.add("hidden");
  sidebar.setAttribute("aria-hidden", "true");
});

randColor.addEventListener("click", updateLightsColors);
randomColorsCenter.addEventListener("click", updateLightsColors);

function updateLightsColors() {
  conf.light1Color = chroma.random().hex();
  conf.light2Color = chroma.random().hex();
  conf.light3Color = chroma.random().hex();
  conf.light4Color = chroma.random().hex();
  light1.color = new THREE.Color(conf.light1Color);
  light2.color = new THREE.Color(conf.light2Color);
  light3.color = new THREE.Color(conf.light3Color);
  light4.color = new THREE.Color(conf.light4Color);
}

// ---- Audio (microphone) ----
let audioCtx = null;
let analyser = null;
let micStream = null;
let dataArray = null;
let rafMeter = null;
let gainNode = null;

async function startMic() {
  if (micStream) return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
  } catch (err) {
    alert("Microphone access denied or not available.");
    console.error(err);
    return;
  }
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaStreamSource(micStream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  dataArray = new Uint8Array(analyser.fftSize);
  gainNode = audioCtx.createGain();
  gainNode.gain.value = 1;
  source.connect(gainNode);
  gainNode.connect(analyser);

  startMeter();
  micStatus.textContent = "on";
  startMicBtn.disabled = true;
  stopMicBtn.disabled = false;
}

function stopMic() {
  if (!micStream) return;
  const tracks = micStream.getTracks();
  tracks.forEach((t) => t.stop());
  micStream = null;
  if (audioCtx && audioCtx.state !== "closed") audioCtx.close();
  audioCtx = null;
  analyser = null;
  dataArray = null;
  cancelAnimationFrame(rafMeter);
  vuFill.style.width = "0%";
  micStatus.textContent = "off";
  startMicBtn.disabled = false;
  stopMicBtn.disabled = true;
}

function startMeter() {
  if (!analyser) return;
  function meterLoop() {
    analyser.getByteTimeDomainData(dataArray);
    // compute RMS
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / dataArray.length); // 0..~1
    // update VU meter
    const percent = Math.min(1, rms * 5); // scale a bit for visibility
    vuFill.style.width = percent * 100 + "%";

    // if reactive mode enabled, map rms to conf.zCoef (height)
    if (conf.audioReactive) {
      // map rms (0..0.6 typical) to a heightCoefficient range
      // baseHeight pulled from manual slider but modulated by audio:
      const manual = (parseFloat(heightRange.value) * 25) / 100;
      // make audio add/subtract proportionally
      conf.zCoef = manual + percent * 40; // tune multiplier as needed
    }

    // loop
    rafMeter = requestAnimationFrame(meterLoop);
  }
  rafMeter = requestAnimationFrame(meterLoop);
}

startMicBtn.addEventListener("click", startMic);
stopMicBtn.addEventListener("click", stopMic);

// ---- Speech recognition (listening / agent) ----
let recognition = null;
let listening = false;
let autoReply = false;

// Check for SpeechRecognition
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.addEventListener("result", (evt) => {
    let interim = "";
    let final = "";
    for (let i = 0; i < evt.results.length; i++) {
      const res = evt.results[i];
      if (res.isFinal) final += res[0].transcript;
      else interim += res[0].transcript;
    }
    transcriptEl.innerText = "Interim: " + interim + "\n\nFinal: " + final;
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
    if (final && autoReply) {
      // basic auto reply rules — can be expanded
      setTimeout(() => {
        const response = generateAgentReply(final);
        speak(response);
      }, 250);
    }
  });

  recognition.addEventListener("end", () => {
    listening = false;
    listenBtn.innerText = "Start Listening";
    stopListenBtn.disabled = true;
  });

  recognition.addEventListener("error", (e) => {
    console.warn("Recognition error", e);
  });
} else {
  listenBtn.disabled = true;
  stopListenBtn.disabled = true;
  transcriptEl.innerText =
    "SpeechRecognition not supported in this browser. Use Chrome/Edge.";
}

listenBtn.addEventListener("click", () => {
  if (!recognition) return;
  try {
    recognition.start();
    listening = true;
    listenBtn.innerText = "Listening...";
    stopListenBtn.disabled = false;
  } catch (e) {
    console.warn(e);
  }
});
stopListenBtn.addEventListener("click", () => {
  if (!recognition) return;
  recognition.stop();
  listening = false;
  listenBtn.innerText = "Start Listening";
  stopListenBtn.disabled = true;
});

autoReplyBtn.addEventListener("click", () => {
  autoReply = !autoReply;
  autoReplyBtn.innerText = "Auto-reply: " + (autoReply ? "On" : "Off");
});

// Simple rule-based agent reply generator (replace with API call if you want)
function generateAgentReply(userText) {
  const t = userText.toLowerCase();
  if (t.includes("hello") || t.includes("hi"))
    return "Hello! How can I help you today?";
  if (t.includes("name")) return "I am your 3D Audio Agent.";
  if (t.includes("visual") || t.includes("wave"))
    return "I can change the plane based on the microphone level.";
  if (t.includes("color")) {
    updateLightsColors();
    return "I changed the colors.";
  }
  return (
    "I heard you say: " +
    userText +
    ". I can respond, change colors, or speak any text you type."
  );
}

// ---- Text-to-Speech (speaking) ----
let utter = null;
let speaking = false;
function speak(text) {
  if (!("speechSynthesis" in window)) {
    alert("Speech Synthesis not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.onstart = () => {
    speaking = true;
    stopSpeakBtn.disabled = false;
  };
  utter.onend = () => {
    speaking = false;
    stopSpeakBtn.disabled = true;
  };
  window.speechSynthesis.speak(utter);
}

speakBtn.addEventListener("click", () => {
  const text = speakText.value.trim() || "Hello, I am your 3D audio agent.";
  speak(text);
});
stopSpeakBtn.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  stopSpeakBtn.disabled = true;
});

// UI center toggles
toggleListen.addEventListener("click", () => {
  if (listening) {
    if (recognition) recognition.stop();
  } else {
    if (recognition) recognition.start();
  }
});
toggleSpeak.addEventListener("click", () => {
  const t =
    speakText.value.trim() || "This is a demo of the speaking AI agent.";
  speak(t);
});

// ---- small UX: clicking center random colors as well ----
document
  .getElementById("randomColorsCenter")
  .addEventListener("click", updateLightsColors);

// ---- small safety / fallback: on page hide stop audio ----
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    // optionally pause speech
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }
});

// ---- finishing touches ----
// Provide keyboard shortcut: S toggles settings
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "s") {
    sidebar.classList.toggle("hidden");
  }
});

// expose a global for quick dev debug (optional)
window._agentState = { conf };

// MIC default ON
window.addEventListener("DOMContentLoaded", () => {
  startMic();
});

// Listening default ON
window.addEventListener("DOMContentLoaded", () => {
  if (recognition) {
    try {
      recognition.start();
      listening = true;
      listenBtn.innerText = "Listening...";
      stopListenBtn.disabled = false;
    } catch (e) {
      console.warn(e);
    }
  }
});
