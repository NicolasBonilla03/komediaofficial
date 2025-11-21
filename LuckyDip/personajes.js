(function(){
  const cards = document.querySelectorAll('.char-card');
  const overlay = document.getElementById('charOverlay');
  const ovImg = document.getElementById('ovImg');
  const ovName = document.getElementById('ovName');
  const ovDesc = document.getElementById('ovDesc');
  const ovClose = document.getElementById('ovClose');
  const ovBackdrop = document.getElementById('ovBackdrop');
  const ov3d = document.getElementById('ov3d');

  // --- Estado del visor 3D (para limpiar al cerrar)
  let three = null;

  function mount3D(container, modelUrl){
    // Tamaños
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Escena
    const scene = new THREE.Scene();
    scene.background = null; // transparente (se ve el fondo del contenedor)

    const camera = new THREE.PerspectiveCamera(50, W/H, 0.1, 1000);
    camera.position.set(0.8, 0.8, 10.5);
    

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controles
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0.8, 0); // apunta a la cabeza aprox
    controls.minDistance = 1.2;
    controls.maxDistance = 10.5;
    controls.enablePan = true;

    // Luces
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 3, 2);
    dir.castShadow = true;
    scene.add(dir);

    // Carga modelo
    const loader = new THREE.GLTFLoader();
    let mixer = null;
    let modelRoot = null;

    loader.load(modelUrl, (gltf) => {
      modelRoot = gltf.scene;
      // Escala/centrado genericos (ajusta si tu modelo lo requiere)
      modelRoot.traverse((o)=>{
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
      });
      modelRoot.position.set(0, 0, 0);
      modelRoot.scale.set(0.2, 0.2, 0.2);
      modelRoot.rotation.y = 2
      scene.add(modelRoot);

      // Animaciones si existen
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(modelRoot);
        gltf.animations.forEach((clip)=> mixer.clipAction(clip).play());
      }
    });

    // Resize
    function onResize(){
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const resizeObs = new ResizeObserver(onResize);
    resizeObs.observe(container);

    // Loop
    let stop = false;
    let clock = new THREE.Clock();
    function tick(){
      if (stop) return;
      const dt = clock.getDelta();
      if (mixer) mixer.update(dt);
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
    tick();

    // Cleanup
    function destroy(){
      stop = true;
      resizeObs.disconnect();
      controls.dispose();
      renderer.dispose();

      // liberar texturas/geom
      scene.traverse((obj)=>{
        if (obj.isMesh){
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material){
            if (Array.isArray(obj.material)){
              obj.material.forEach(m=>m.dispose && m.dispose());
            } else obj.material.dispose && obj.material.dispose();
          }
        }
      });
      while(container.firstChild) container.removeChild(container.firstChild);
    }

    return { destroy };
  }

  function openOverlay(card){
    const name = card.dataset.name || 'PERSONAJE';
    const desc = card.dataset.desc || '';
    const img  = card.dataset.img || '';
    const color = card.dataset.color || '#ffb980';
    const modelUrl = card.dataset.model; // solo Koji de momento

    ovName.textContent = name;
    ovName.style.color = color;
    ovDesc.textContent = desc;

    // ¿Modelo 3D o imagen?
    if (modelUrl){
      ovImg.hidden = true;
      ov3d.hidden = false;

      // Montar viewer 3D
      three = mount3D(ov3d, modelUrl);
    } else {
      ov3d.hidden = true;
      ovImg.hidden = false;
      ovImg.src = img;
      ovImg.alt = name;
    }

    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function closeOverlay(){
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
    overlay.setAttribute('aria-hidden', 'true');

    // limpiar viewer 3D si existe
    if (three && typeof three.destroy === 'function'){
      three.destroy();
      three = null;
    }
  }

  cards.forEach(card => {
    const trigger = () => openOverlay(card);
    card.addEventListener('click', trigger);
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });
  });

  ovClose.addEventListener('click', closeOverlay);
  ovBackdrop.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closeOverlay();
  });
})();
