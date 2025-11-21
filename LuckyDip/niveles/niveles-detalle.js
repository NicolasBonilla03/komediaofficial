// Barra de progreso
(function(){
  const bar = document.getElementById('scrollBar');
  function onScroll(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Reveal on scroll
(function(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .15 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ===== HERO 3D MODELOS DE MAPAS =====
function initMapModel(containerId, modelPath){
  const container = document.getElementById(containerId);
  if(!container) return;

  // Escena
  const scene = new THREE.Scene();
  scene.background = null; // mantiene transparencia
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 80, 6);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Luz
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(3, 5, 5);
  scene.add(ambient, dirLight);

  // Cargar modelo GLTF
  const loader = new THREE.GLTFLoader();
  loader.load(modelPath, (gltf)=>{
    const model = gltf.scene;

    if(containerId === "bar-hero-3d"){
      model.scale.set(1.5, 1.5, 1.5);
    }
    if(containerId === "ascensor-hero-3d"){
      model.scale.set(9.5, 9.5, 9.5);
    }
    if(containerId === "lobby-hero-3d"){
      model.scale.set(1.5, 1.5, 1.5);
    }
    model.position.set(0, -1.2, 0);
    scene.add(model);
  });

  // Responsivo
  window.addEventListener('resize', ()=>{
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Render loop
  function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// ===== CARGAR MODELOS SEGÚN LA PÁGINA =====
window.addEventListener("DOMContentLoaded", ()=>{
  if(document.getElementById("bar-hero-3d")){
    initMapModel("bar-hero-3d", "/ModelosMapas/Bar/BarPaAnimar.gltf");
    model.scale.set(1.5, 1.5, 1.5);
  }
  if(document.getElementById("ascensor-hero-3d")){
    initMapModel("ascensor-hero-3d", "/ModelosMapas/Ascensor/Elelevador.gltf");
    model.scale.set(5.5, 5.5, 5.5);
  }
  if(document.getElementById("lobby-hero-3d")){
    initMapModel("lobby-hero-3d", "/ModelosMapas/Lobby/ModeladoElLobby.gltf");
    model.scale.set(1, 1, 1);
  }
});
