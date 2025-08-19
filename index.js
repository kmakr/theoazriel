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
let loadingOverlay, loadingText; // Loading UI elements

function initThreeJS() {
  const container = document.getElementById("threejs-container");
  const canvas = document.getElementById("threejs-canvas");
  loadingOverlay = document.getElementById("loading-overlay");
  loadingText = document.getElementById("loading-text");

  // Hide page content while loading
  document.body.classList.add("is-loading");

  // Create scene
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x0a0a0a);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 4);

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  // Cap pixel ratio for performance on high-DPI screens
  // renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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
  }

  // Handle window resize
  window.addEventListener("resize", onWindowResize);
}

function loadGLTFModel() {
  // Enable in-memory caching across reloads of the same assets
  if (THREE.Cache) {
    THREE.Cache.enabled = true;
  }

  const manager = new THREE.LoadingManager();

  manager.onStart = function () {
    if (loadingOverlay) loadingOverlay.style.display = "flex";
    if (loadingText) loadingText.textContent = "Loading…";
  };

  manager.onProgress = function (_url, itemsLoaded, itemsTotal) {
    if (!loadingText) return;
    if (itemsTotal > 0) {
      const percent = Math.round((itemsLoaded / itemsTotal) * 100);
      loadingText.textContent = percent + "%";
    } else {
      loadingText.textContent = "Loading…";
    }
  };

  manager.onLoad = function () {
    if (loadingOverlay) loadingOverlay.style.display = "none";
    document.body.classList.remove("is-loading");
  };

  const loader = new THREE.GLTFLoader(manager);
  // Setup DRACO decoder for compressed meshes
  if (typeof THREE.DRACOLoader !== "undefined") {
    const dracoLoader = new THREE.DRACOLoader();
    // Use CDN decoder path matching the loader version
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);
  }

  // Example with a test model - replace with your model path
  // loader.load('assets/your-model.gltf', ...)

  // For testing, let's use a fallback sphere
  console.log("GLTFLoader is ready. Replace with your model path.");

  // Uncomment and modify this when you have a GLTF file:
  loader.load(
    "assets/mossy.compressed.glb",
    function (gltf) {
      // Remove the fallback sphere
      if (model) {
        scene.remove(model);
      }

      model = gltf.scene;
      model.scale.setScalar(3.2);
      // model.position.set(0, -0.5, 1);
      model.position.set(0, -0.5, 1);

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
      if (loadingText) loadingText.textContent = "100%";
      if (loadingOverlay) loadingOverlay.style.display = "none";
    },
    undefined,
    function (error) {
      console.error("Error loading GLTF model:", error);
      // createFallbackSphere();
      if (loadingText) {
        loadingText.textContent = "Failed to load";
      }
      // Ensure page content becomes visible even on failure
      document.body.classList.remove("is-loading");
    }
  );
}

function createFallbackSphere() {
  // const geometry = new THREE.SphereGeometry(1, 32, 32);
  // const material = new THREE.MeshPhongMaterial({
  //   color: 0x00ff88,
  //   shininess: 100,
  //   transparent: true,
  //   opacity: 0.8,
  // });
  // model = new THREE.Mesh(geometry, material);
  // scene.add(model);
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
    model.rotation.y += 0.001;
  }

  renderer.render(scene, camera);
}

// Initialize Three.js as soon as DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  initThreeJS();
  animate();
});
