// EconfiaPrincipal.jsx
// Héroe a pantalla completa con fondo TRANSPARENTE.
// Izquierda: video con bordes redondeados y título "Bienvenido a eConfia" debajo.
// Derecha: Canvas 3D con modelo GLTF/GLB rotando continuamente (three + @react-three/fiber + @react-three/drei).
// - 100% responsive, sin desbordes (overflow-hidden)
// - Canvas con alpha para fondo transparente
// - Rotación suave, luces y Environment
// - Fallback a un icosaedro si no se pasa modelUrl

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Html, useGLTF } from "@react-three/drei";

/**
 * Modelo genérico con rotación continua
 */
function SpinningModel({ url, scale = 1, rotationSpeed = 0.6 }) {
  const group = useRef();
  const { scene } = useGLTF(url);

  // Normaliza el modelo (opcional): centrado/autoScale simple
  const model = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * rotationSpeed;
  });

  return <primitive ref={group} object={model} scale={scale} />;
}

/**
 * Fallback si no hay GLTF
 */
function SpinningIcosahedron({ scale = 1.1, rotationSpeed = 0.6 }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * rotationSpeed;
    ref.current.rotation.x += delta * 0.15;
  });
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <icosahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial metalness={0.3} roughness={0.35} />
    </mesh>
  );
}

export default function EconfiaPrincipal({
  title = "Bienvenido a eConfia",
  videoSrc = "/videos/econfia-welcome.mp4",
  videoPoster = "/videos/econfia-welcome.jpg",
  modelUrl = "/models/econfia-bot.glb", // GLB/GLTF en public/
  modelScale = 1.2,
  rotationSpeed = 0.6,
}) {
  // Pre-carga no bloqueante
  useEffect(() => {
    if (modelUrl) {
      try { useGLTF.preload(modelUrl); } catch {}
    }
  }, [modelUrl]);

  return (
    <section
      className="relative w-screen h-screen overflow-hidden bg-transparent"
      aria-label="Sección principal eConfia"
    >
      {/* Grid responsiva: en móvil apila, en md+ divide 2 columnas */}
      <div className="absolute inset-0 grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-2 gap-6 p-4 md:p-8">
        {/* Columna izquierda: Video + título */}
        <div className="w-full h-full flex flex-col items-center md:items-start justify-center">
          <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black/40">
            <video
              className="w-full h-full object-cover"
              src={videoSrc}
              poster={videoPoster}
              playsInline
              controls
              preload="metadata"
            />
          </div>
          <h1 className="mt-4 text-center md:text-left text-white text-3xl md:text-5xl font-semibold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            {title}
          </h1>
        </div>

        {/* Columna derecha: 3D full-area, sin desbordes */}
        <div className="w-full h-full">
          <Canvas
            className="w-full h-full"
            dpr={[1, 2]}
            shadows
            gl={{ antialias: true, alpha: true }} // fondo transparente
            camera={{ position: [2.4, 1.6, 3.2], fov: 45 }}
          >
            {/* Luces */}
            <ambientLight intensity={0.8} />
            <directionalLight
              position={[4, 6, 5]}
              intensity={1.2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />

            <Suspense
              fallback={
                <Html center>
                  <div className="px-4 py-2 rounded-xl bg-black/60 text-white text-sm">
                    Cargando modelo…
                  </div>
                </Html>
              }
            >
              {modelUrl ? (
                <SpinningModel url={modelUrl} scale={modelScale} rotationSpeed={rotationSpeed} />
              ) : (
                <SpinningIcosahedron scale={1.2} rotationSpeed={rotationSpeed} />
              )}

              {/* Entorno suave */}
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>
      </div>

      {/* Borde de seguridad invisible para evitar fugas visuales (todo transparente) */}
      <div className="pointer-events-none absolute inset-0" />
    </section>
  );
}

/**
 * USO:
 *
 * import EconfiaPrincipal from "./EconfiaPrincipal";
 *
 * export default function App() {
 *   return (
 *     <EconfiaPrincipal
 *       title="Bienvenido a eConfia"
 *       videoSrc="/videos/econfia-welcome.mp4"
 *       videoPoster="/videos/econfia-welcome.jpg"
 *       modelUrl="/models/econfia-bot.glb"
 *       modelScale={1.1}
 *       rotationSpeed={0.7}
 *     />
 *   );
 * }
 *
 * Dependencias necesarias:
 *   npm i three @react-three/fiber @react-three/drei
 */
