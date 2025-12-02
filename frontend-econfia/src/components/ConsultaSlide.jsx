// src/views/ConsultaSlide.jsx
import { useEffect, useMemo, useState } from "react";
import {
  IdCard, User2, Calendar, Venus, FileWarning, Activity,
  AlertTriangle, Gauge, Clock, BadgeCheck
} from "lucide-react";
import holoVideo from "../assets/ai-head.mp4";

const API_URL = process.env.REACT_APP_API_URL;

const ConsultaSlide = ({ consultaId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [consulta, setConsulta] = useState(null);
  const [riesgo, setRiesgo] = useState(null);
  const [burbujaRiesgo, setBurbujaRiesgo] = useState(null);

  const riskUI = useMemo(() => {
    const cat = (riesgo?.categoria || "").toLowerCase();
    if (cat.includes("alto"))
      return { ring: "from-red-500 to-orange-500", chip: "bg-red-500/20 text-red-200 border-red-500/40", glow: "shadow-[0_0_40px_5px_rgba(244,63,94,0.25)]" };
    if (cat.includes("medio"))
      return { ring: "from-amber-400 to-yellow-500", chip: "bg-yellow-400/15 text-yellow-200 border-yellow-400/40", glow: "shadow-[0_0_40px_5px_rgba(250,204,21,0.20)]" };
    if (cat.includes("bajo"))
      return { ring: "from-emerald-400 to-teal-500", chip: "bg-emerald-400/15 text-emerald-200 border-emerald-400/40", glow: "shadow-[0_0_40px_5px_rgba(16,185,129,0.20)]" };
    return { ring: "from-cyan-400 to-blue-600", chip: "bg-cyan-400/15 text-cyan-200 border-cyan-400/40", glow: "shadow-[0_0_40px_5px_rgba(34,211,238,0.18)]" };
  }, [riesgo]);

  useEffect(() => {
    if (!consultaId) return;
    let revokeBurbuja;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json", Authorization: `Token ${token}` };

        const consultaRes = await fetch(`${API_URL}/api/consultas/${consultaId}/`, { headers });
        if (!consultaRes.ok) throw new Error("Error al obtener la consulta");
        const consultaData = await consultaRes.json();
        setConsulta(consultaData);

        const riesgoRes = await fetch(`${API_URL}/api/calcular_riesgo/${consultaId}/`, { headers });
        if (!riesgoRes.ok) throw new Error("Error al obtener el riesgo");
        const riesgoData = await riesgoRes.json();
        setRiesgo(riesgoData);

        const burbujaRes = await fetch(`${API_URL}/api/burbuja-riesgo/${consultaId}/`, { headers });
        if (!burbujaRes.ok) throw new Error("Error al obtener la burbuja de riesgo");
        const burbujaBlob = await burbujaRes.blob();
        const burbujaURL = URL.createObjectURL(burbujaBlob);
        setBurbujaRiesgo(burbujaURL);
        revokeBurbuja = burbujaURL;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (revokeBurbuja) URL.revokeObjectURL(revokeBurbuja);
    };
  }, [consultaId]);

  if (loading) {
    return (
      <div className="relative h-[78vh] md:h-[82vh] rounded-2xl overflow-hidden">
        <SkeletonVideoRight />
        <div className="absolute inset-0 grid md:grid-cols-2">
          <div className="p-5 md:p-8">
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-200 border border-red-500/30">
          <AlertTriangle size={18} /> Error: {error}
        </div>
      </div>
    );
  }

  const nombreCompleto = `${consulta?.candidato?.nombre || ""} ${consulta?.candidato?.apellido || ""}`.trim();
  const fechaNac = consulta?.candidato?.fecha_nacimiento
    ? new Date(consulta.candidato.fecha_nacimiento).toLocaleDateString()
    : "—";
  const fechaConsulta = consulta?.fecha ? new Date(consulta.fecha).toLocaleString() : "—";

  return (
    <div className="relative h-[78vh] md:h-[82vh] rounded-2xl overflow-hidden bg-black">
      {/* VIDEO DERECHA */}
      <div className="absolute inset-0">
        <video
          className="absolute right-0 top-0 h-full object-cover"
          src={holoVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{
            WebkitMaskImage: "linear-gradient(270deg, rgba(0,0,0,1) 40%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.0) 70%)",
            maskImage: "linear-gradient(270deg, rgba(0,0,0,1) 40%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.0) 70%)",
            width: "72vw",
            minWidth: 640
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-screen opacity-40"
          style={{ backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,255,255,.05) 0, rgba(0,255,255,.05) 1px, transparent 2px)` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.10),_transparent_60%)]" />
      </div>

      {/* PANEL IZQUIERDA (contenido) */}
      <div className="relative z-10 h-full grid md:grid-cols-[minmax(460px,820px)_1fr]">
        {/* Columna izquierda con datos + burbuja (lado a lado) */}
        <div className="h-full p-5 md:p-8">
          <div className={`rounded-2xl p-[1px] bg-gradient-to-br ${riskUI.ring} ${riskUI.glow}`}>
            <div className="rounded-2xl h-[66vh] md:h-[68vh] bg-black/55 backdrop-blur-md border border-white/10 p-5 md:p-6 overflow-y-auto">
              
              {/* ====== GRID INTERNO 2 COLS ====== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna IZQ: encabezado, chips, info */}
                <div>
                  {/* encabezado */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-cyan-200/70">Expediente</p>
                      <h2 className="text-xl md:text-2xl font-semibold text-white drop-shadow">
                        {nombreCompleto || "—"}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200">
                      <BadgeCheck size={14} /> {consulta?.estado || "—"}
                    </span>
                  </div>

                  {/* chips */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    <Chip icon={<Activity size={14} />} className={riskUI.chip}>
                      {riesgo?.categoria || "—"}
                    </Chip>
                    <Chip icon={<Gauge size={14} />}>Prob: {riesgo?.probabilidad ?? "—"}</Chip>
                    <Chip icon={<Gauge size={14} />}>Cons: {riesgo?.consecuencia ?? "—"}</Chip>
                    <Chip icon={<AlertTriangle size={14} />}>Score: {riesgo?.riesgo ?? "—"}</Chip>
                    <Chip icon={<Clock size={14} />}>{fechaConsulta}</Chip>
                  </div>

                  {/* info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={<User2 size={16} />} label="Nombre" value={nombreCompleto || "—"} />
                    <InfoRow icon={<IdCard size={16} />} label="Cédula" value={consulta?.candidato?.cedula || "—"} />
                    <InfoRow icon={<Venus size={16} />} label="Sexo" value={consulta?.candidato?.sexo || "—"} />
                    <InfoRow icon={<FileWarning size={16} />} label="Tipo doc." value={consulta?.candidato?.tipo_doc || "—"} />
                    <InfoRow icon={<Calendar size={16} />} label="Nacimiento" value={fechaNac} />
                  </div>
                </div>

                {/* Columna DER: burbuja a la derecha */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-cyan-200/90 mb-2 tracking-wide">Burbuja de riesgo</h3>

                  {burbujaRiesgo ? (
                    <div className="relative rounded-xl overflow-hidden border p-2 bg-white/5 border-white/10">
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-cyan-400/20" />
                      <img
                        src={burbujaRiesgo}
                        alt="Burbuja de riesgo"
                        className="w-full h-auto max-h-[420px] object-contain rounded-lg"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 opacity-20"
                        style={{ backgroundImage: `repeating-linear-gradient(to bottom, rgba(59,130,246,.35) 0, rgba(59,130,246,.35) 1px, transparent 2px)` }}
                      />
                    </div>
                  ) : (
                    <EmptyBox />
                  )}
                </div>
              </div>
              {/* ====== /GRID INTERNO ====== */}

            </div>
          </div>
        </div>

        {/* Columna derecha (espacio del video, ya está absoluto detrás) */}
        <div className="hidden md:block" />
      </div>

      <GridOverlay />
    </div>
  );
};

/* ------- UI helpers ------- */
function Chip({ children, icon, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[11px] px-2 py-1 rounded-md border border-white/10 bg-white/5 text-gray-100 ${className}`}>
      {icon} {children}
    </span>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200">
      <span className="shrink-0 opacity-80">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[11px] uppercase tracking-wider text-gray-400">{label}</span>
        <span className="text-sm font-medium text-white">{String(value)}</span>
      </div>
    </div>
  );
}

function EmptyBox() {
  return (
    <div className="h-40 w-full rounded-xl bg-white/5 border border-white/10 grid place-items-center text-gray-400 text-sm">
      Sin imagen disponible
    </div>
  );
}

/* ------- Visual sugar ------- */
function GridOverlay() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(59,130,246,.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(59,130,246,.15) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen animate-[scan_7s_linear_infinite] bg-gradient-to-b from-transparent via-cyan-400/4 to-transparent" />
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-cyan-500/40 to-blue-600/40">
      <div className="rounded-2xl h-full bg-black/55 backdrop-blur-md border border-white/10 p-6">
        <div className="h-7 w-52 bg-white/10 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-white/10 rounded animate-pulse" />
          ))}
        </div>
        <div className="mt-6 h-44 bg-white/10 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonVideoRight() {
  return (
    <div className="absolute inset-0">
      <div className="absolute right-0 top-0 h-full w-[70vw] min-w-[640px] bg-gradient-to-b from-slate-900 to-black animate-pulse" />
    </div>
  );
}

export default ConsultaSlide;
