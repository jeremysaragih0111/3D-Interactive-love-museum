/* ============================================================
   THREE.JS SCENE — shared crystal heart + floating petals
   Used only on pages that contain #three-canvas.
   Single renderer per page. Graceful fallback if WebGL missing.
   ============================================================ */
(function () {
  "use strict";

  function hasWebGL() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (_) { return false; }
  }

  function init(canvas) {
    if (!window.THREE) { return null; }
    if (!hasWebGL()) { return null; }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Lights
    const ambient = new THREE.AmbientLight(0xffd6e8, 0.6);
    scene.add(ambient);
    const key = new THREE.PointLight(0xff5c8a, 2.2, 20);
    key.position.set(3, 3, 4);
    scene.add(key);
    const fill = new THREE.PointLight(0x9b6bff, 1.6, 20);
    fill.position.set(-4, -2, 2);
    scene.add(fill);

    // Crystal heart (octahedron stretched — heart-like)
    const heartGroup = new THREE.Group();
    const geo = new THREE.IcosahedronGeometry(1.15, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xff7aa8,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.75,
      thickness: 1.2,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: 0x5b0f2a,
      emissiveIntensity: 0.35
    });
    const mesh = new THREE.Mesh(geo, mat);
    // Scale to look like a heart (top pointed slightly)
    mesh.scale.set(1, 1.15, 1);
    heartGroup.add(mesh);

    // Wireframe halo
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.45, 1),
      new THREE.MeshBasicMaterial({ color: 0xffc6dd, wireframe: true, transparent: true, opacity: 0.18 })
    );
    heartGroup.add(wire);

    scene.add(heartGroup);

    // Floating petals (instanced-lite)
    const petalCount = prefersReduced ? 12 : 34;
    const petalGeo = new THREE.PlaneGeometry(0.18, 0.26);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xff8fb6,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const petals = [];
    for (let i = 0; i < petalCount; i++) {
      const p = new THREE.Mesh(petalGeo, petalMat.clone());
      p.material.opacity = 0.25 + Math.random() * 0.4;
      p.position.set((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 3 - 1);
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      p.userData = {
        vy: -0.004 - Math.random() * 0.01,
        rx: (Math.random() - 0.5) * 0.01,
        rz: (Math.random() - 0.5) * 0.01
      };
      scene.add(p);
      petals.push(p);
    }

    // Resize
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    window.addEventListener("resize", resize, { passive: true });

    // Animate
    let raf = null;
    let t0 = performance.now();
    function animate(now) {
      const t = (now - t0) / 1000;
      heartGroup.rotation.y = t * 0.35;
      heartGroup.rotation.x = Math.sin(t * 0.4) * 0.12;
      heartGroup.position.y = Math.sin(t * 0.9) * 0.08;

      for (const p of petals) {
        p.position.y += p.userData.vy;
        p.rotation.x += p.userData.rx;
        p.rotation.z += p.userData.rz;
        if (p.position.y < -3.5) {
          p.position.y = 3.5;
          p.position.x = (Math.random() - 0.5) * 9;
        }
      }
      renderer.render(scene, camera);
      if (!document.hidden) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(animate); }
      else if (raf) { cancelAnimationFrame(raf); raf = null; }
    });

    return {
      dispose() {
        if (raf) cancelAnimationFrame(raf);
        renderer.dispose();
        geo.dispose(); mat.dispose(); petalGeo.dispose();
        petals.forEach((p) => p.material.dispose());
      }
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("three-canvas");
    if (!canvas) return;
    const instance = init(canvas);
    if (!instance) {
      // Fallback: ensure CSS placeholder heart is visible
      canvas.classList.add("three-fallback");
      const fb = document.getElementById("three-fallback");
      if (fb) fb.hidden = false;
    }
    window.addEventListener("beforeunload", () => instance && instance.dispose(), { once: true });
  });

  window.LoveThree = { init };
})();