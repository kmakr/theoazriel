function removeSecretClass() {
  const el = document.querySelector("#secret");
  console.log(el);
  console.log("clicked");
  el.classList.remove("secret");
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Three.js Scene Setup
let scene, camera, renderer, model;
let mixer; // For animations

function initThreeJS() {
  const container = document.getElementById("threejs-container");
  const canvas = document.getElementById("threejs-canvas");

  // Create scene
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x0a0a0a);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  // Load GLTF Model or create fallback
  if (typeof THREE.GLTFLoader !== "undefined") {
    loadGLTFModel();
  } else {
    console.log("GLTFLoader not available, using fallback sphere");
    createFallbackSphere();
  }

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

function loadGLTFModel() {
  const loader = new THREE.GLTFLoader();

  // Example with a test model - replace with your model path
  // loader.load('assets/your-model.gltf', ...)

  // For testing, let's use a fallback sphere
  console.log("GLTFLoader is ready. Replace with your model path.");
  createFallbackSphere();

  // Uncomment and modify this when you have a GLTF file:
  loader.load(
    "assets/model.gltf",
    function (gltf) {
      // Remove the fallback sphere
      if (model) {
        scene.remove(model);
      }

      model = gltf.scene;
      model.scale.setScalar(1);
      model.position.set(0, 0, 0);

      model.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).play();
        });
      }

      console.log("GLTF model loaded successfully");
    },
    function (progress) {
      console.log(
        "Loading progress: ",
        (progress.loaded / progress.total) * 100 + "%"
      );
    },
    function (error) {
      console.error("Error loading GLTF model:", error);
      createFallbackSphere();
    }
  );
}

function createFallbackSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ff88,
    shininess: 100,
    transparent: true,
    opacity: 0.8,
  });
  model = new THREE.Mesh(geometry, material);
  scene.add(model);
  console.log("Fallback sphere created");
}

function onWindowResize() {
  const container = document.getElementById("threejs-container");
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update animations
  if (mixer) {
    mixer.update(delta);
  }

  // Rotate the model slowly
  if (model) {
    model.rotation.y += 0.005;
  }

  renderer.render(scene, camera);
}

// Initialize Three.js when the page loads
window.addEventListener("load", () => {
  initThreeJS();
  animate();
});

// Keep your existing functions
function removeSecretClass() {
  // Your existing function here
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
