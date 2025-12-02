// src/components/Jarvis3D.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Jarvis3D({ playAudio }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    // 🔥 limpiar cualquier canvas previo
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // --- Setup básico Three.js ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.fog = new THREE.Fog(0x000000, 12, 20);

    const jarvis = new THREE.Group();
    scene.add(jarvis);

    const CYAN = 0x00ffff;
    const CYAN_DARK = 0x00aac6;
    const radiusBase = 1.6;

    // ---- CAPA 1: Partículas ----
    function makeParticlesSphere(radius, count = 2000) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = radius * Math.random() * 0.8;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);
        positions.set([x, y, z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const m = new THREE.PointsMaterial({
        color: CYAN,
        size: 0.02,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      return new THREE.Points(g, m);
    }
    const particles = makeParticlesSphere(radiusBase, 2200);
    jarvis.add(particles);

    // ---- CAPA 2: Fragmentos ----
    function makeShards(radius, count = 70) {
      const baseGeo = new THREE.CircleGeometry(0.14, 5);
      const opacities = new Float32Array(count);
      for (let i = 0; i < count; i++) opacities[i] = 0.1 + Math.random() * 0.9;

      const mat = new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      mat.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          "#include <common>\nattribute float instanceOpacity;\nvarying float vOpacity;"
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          "vOpacity = instanceOpacity;\n#include <begin_vertex>"
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <common>",
          "#include <common>\nvarying float vOpacity;"
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          "gl_FragColor = vec4( diffuse, opacity );",
          "gl_FragColor = vec4( diffuse, opacity * vOpacity );"
        );
      };

      const mesh = new THREE.InstancedMesh(baseGeo, mat, count);
      const dummy = new THREE.Object3D();
      const offset = Math.PI / count;
      const increment = Math.PI * (3 - Math.sqrt(5));
      const points = [];

      for (let i = 0; i < count; i++) {
        const y = i * offset - 1 + offset / 2;
        const r = Math.sqrt(1 - y * y);
        const phi = i * increment;
        const x = Math.cos(phi) * r;
        const z = Math.sin(phi) * r;
        points.push(new THREE.Vector3(x, y, z).multiplyScalar(radius * 1.01));
      }

      for (let i = 0; i < count; i++) {
        const p = points[i];
        const n = p.clone().normalize();
        dummy.position.copy(p);
        dummy.up.set(0, 0, 1);
        dummy.lookAt(n.clone().multiplyScalar(radius * 0.9));
        const s = 0.8 + Math.random() * 1.6;
        dummy.scale.set(s, s, 1);
        dummy.rotateZ(Math.random() * Math.PI * 2);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }

      mesh.geometry.setAttribute(
        "instanceOpacity",
        new THREE.InstancedBufferAttribute(opacities, 1)
      );
      return mesh;
    }
    const shards = makeShards(radiusBase * 1.02, 70);
    jarvis.add(shards);

    // ---- CAPA 3: Líneas ----
    function makeLines(radius, groups = 36, segPerLine = 20, arcLen = 1.0) {
      const group = new THREE.Group();
      function fibonacciSphere(samples, r) {
        const points = [];
        const offset = 2 / samples;
        const increment = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < samples; i++) {
          const y = i * offset - 1 + offset / 2;
          const rr = Math.sqrt(1 - y * y);
          const phi = i * increment;
          const x = Math.cos(phi) * rr;
          const z = Math.sin(phi) * rr;
          points.push(new THREE.Vector3(x, y, z).multiplyScalar(r));
        }
        return points;
      }
      const lineOffset = 1.15;
      const startPoints = fibonacciSphere(groups, radius * lineOffset);
      for (let g = 0; g < groups; g++) {
        const base = startPoints[g].clone().normalize();
        let t = new THREE.Vector3(1, 0, 0);
        if (Math.abs(base.dot(t)) > 0.9) t.set(0, 1, 0);
        t = t.sub(base.clone().multiplyScalar(base.dot(t))).normalize();
        const positions = [];
        for (let i = 0; i <= segPerLine; i++) {
          const a = (i / segPerLine - 0.1) * arcLen;
          const q = new THREE.Quaternion().setFromAxisAngle(t, a);
          const p = base.clone().applyQuaternion(q).multiplyScalar(
            radius * (lineOffset + Math.random() * 0.01)
          );
          positions.push(p);
        }
        const geom = new THREE.BufferGeometry().setFromPoints(positions);
        const mat = new THREE.PointsMaterial({
          color: CYAN_DARK,
          size: 0.05,
          transparent: true,
          opacity: 0.3,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        group.add(new THREE.Points(geom, mat));
      }
      return group;
    }
    const lines = makeLines(radiusBase * 1.06, 36, 20, 1.2);
    jarvis.add(lines);

    // Core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(radiusBase * 0.22, 100, 32),
      new THREE.MeshBasicMaterial({
        color: CYAN,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      })
    );
    jarvis.add(core);

    // Luz
    scene.add(new THREE.AmbientLight(0x004d5c, 0.6));

    // --- Audio ---
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    const tdData = new Uint8Array(analyser.fftSize);

    // lista de sonidos
    const sounds = [
      "/sounds/econfia-bot/econfia-1.wav",
      "/sounds/econfia-bot/econfia-2.wav",
      "/sounds/econfia-bot/econfia-3.wav",
      "/sounds/econfia-bot/econfia-4.wav",
    ];

    let currentIndex = 0;
    let audio = new Audio(sounds[currentIndex]);
    audio.crossOrigin = "anonymous";
    let track = audioCtx.createMediaElementSource(audio);
    track.connect(analyser);
    analyser.connect(audioCtx.destination);

    let intervalId;

    if (playAudio) {
      audio.play().catch(console.error);

      // cada 5s cambiar sonido
      intervalId = setInterval(() => {
        audio.pause();
        audio.currentTime = 0;
        currentIndex = (currentIndex + 1) % sounds.length;
        audio = new Audio(sounds[currentIndex]);
        audio.crossOrigin = "anonymous";
        track = audioCtx.createMediaElementSource(audio);
        track.connect(analyser);
        analyser.connect(audioCtx.destination);
        audio.play().catch(console.error);
      }, 5000);
    }

    // --- Animación ---
    let targetAmp = 0,
      smoothAmp = 0;
    let t = 0;

    function getLevel() {
      analyser.getByteTimeDomainData(tdData);
      let sum = 0;
      for (let i = 0; i < tdData.length; i++) {
        const v = (tdData[i] - 128) / 128;
        sum += v * v;
      }
      return Math.min(1, Math.sqrt(sum / tdData.length) * 2.5);
    }

    function animate() {
      requestAnimationFrame(animate);
      t += 0.01;
      jarvis.rotation.y += 0.0025;
      jarvis.rotation.x = Math.sin(t * 0.25) * 0.05;

      targetAmp = getLevel();
      smoothAmp += (targetAmp - smoothAmp) * 0.12;

      const sParticles = 1 + smoothAmp * 0.65;
      const sShards = 1 + smoothAmp * 0.95;
      const sLines = 1 + smoothAmp * 1.2;
      particles.scale.setScalar(sParticles);
      shards.scale.setScalar(sShards);
      lines.scale.setScalar(sLines);
      core.scale.setScalar(1 + smoothAmp * 0.35);

      jarvis.scale.setScalar(1 + Math.sin(t * 0.7) * 0.02);

      particles.material.opacity = 0.65 + smoothAmp * 0.35;
      shards.material.opacity = 0.15 + smoothAmp * 0.25;
      lines.traverse((obj) => {
        if (obj.isPoints) obj.material.opacity = 0.1 + smoothAmp * 0.2;
      });

      renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      audio.pause();
      if (intervalId) clearInterval(intervalId);
    };
  }, [playAudio]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
