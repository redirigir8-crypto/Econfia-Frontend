// src/components/three/EconfiaHead3D.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"; // opcional

export default function EconfiaHead3D({
  url = "/models/free_head.obj",          // tu .obj
  mtl = null,                              // opcional: "/models/free_head.mtl"
  background = "transparent",
  autoRotateSpeed = 0.6,
  initialDistance = 3.2,
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, initialDistance);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: background === "transparent" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(
      background === "transparent" ? 0x000000 : new THREE.Color(background),
      background === "transparent" ? 0 : 1
    );
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 4, 4);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = autoRotateSpeed;
    controlsRef.current = controls;

    // --- CARGA OBJ (+ MTL opcional) ---
    const objLoader = new OBJLoader();

    const onLoaded = (obj) => {
      // centrar + escalar
      const bbox = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      obj.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 2.0;
      if (maxDim > 0) obj.scale.setScalar(targetSize / maxDim);

      scene.add(obj);
      modelRef.current = obj;
    };

    if (mtl) {
      // si tienes .mtl
      const mtlLoader = new MTLLoader();
      mtlLoader.load(mtl, (materials) => {
        materials.preload();
        objLoader.setMaterials(materials);
        objLoader.load(url, onLoaded, undefined, (e) => console.error("Error cargando OBJ:", e));
      }, undefined, (e) => console.error("Error cargando MTL:", e));
    } else {
      objLoader.load(url, onLoaded, undefined, (e) => console.error("Error cargando OBJ:", e));
    }

    const resize = () => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 400;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose?.();
          const m = child.material;
          if (Array.isArray(m)) m.forEach((mm) => mm?.dispose?.());
          else m?.dispose?.();
        }
      });
      renderer.domElement?.remove();
    };
  }, [url, mtl, background, autoRotateSpeed, initialDistance]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden"
      style={{ position: "relative" }}
    />
  );
}
