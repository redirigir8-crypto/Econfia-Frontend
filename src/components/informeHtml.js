// Generador del "Informe de Análisis de Riesgo" (estilo AML / HUD oscuro).
// Produce un HTML autónomo (Tailwind CDN + config propia + fuentes + CSS) poblado
// con los DATOS REALES de la consulta. Se renderiza a pantalla completa en un iframe.
//
// NOTA: es una vista-informe de los resultados (no el archivo PDF). Se omiten
// metadatos auditables inventados (IP/hash/token falsos) para no mostrar datos
// que no son reales; se conserva toda la estética.

const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const esImagen = (archivo) =>
  typeof archivo === "string" && /\.(png|jpe?g|webp|gif)$/i.test(archivo.trim());

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Paleta por categoría de riesgo
function riesgoTheme(categoria) {
  const c = (categoria || "").toLowerCase();
  if (c.includes("alto"))
    return { hex: "#ff3d00", tw: "red", dict: "RIESGO ALTO", chip: "text-red-400 bg-red-950/50 border-red-500/30", gauge: "#ff3d00", badgeBg: "bg-red-500", badgeTx: "text-white" };
  if (c.includes("medio"))
    return { hex: "#ffd600", tw: "amber", dict: "RIESGO MEDIO", chip: "text-amber-300 bg-amber-950/50 border-amber-500/30", gauge: "#ffd600", badgeBg: "bg-amber-400", badgeTx: "text-slate-900" };
  // bajo / default
  return { hex: "#00e676", tw: "emerald", dict: "RIESGO BAJO VALIDADO", chip: "text-emerald-400 bg-emerald-950/50 border-emerald-500/30", gauge: "#00e676", badgeBg: "bg-brand-emerald", badgeTx: "text-brand-navy" };
}

// Color por BANDAS (grupos) con degradé interno de cada color:
//   1-4 verde · 5-9 amarillo · 10-14 naranja · 15-25 rojo.
// Dentro de cada banda varía la luminosidad para el degradé del grupo.
function heatColor(v) {
  let hue, t;
  if (v <= 4) { hue = 140; t = (v - 1) / 3; }        // verde
  else if (v <= 9) { hue = 52; t = (v - 5) / 4; }    // amarillo
  else if (v <= 14) { hue = 28; t = (v - 10) / 4; }  // naranja
  else { hue = 0; t = (v - 15) / 10; }               // rojo
  const light = 54 - Math.min(1, Math.max(0, t)) * 16; // más oscuro al subir dentro del grupo
  return `hsl(${hue}, 85%, ${light}%)`;
}

// Matriz de calor 5x5 con el punto en (probabilidad, consecuencia)
function matrizHeatmap(prob, cons) {
  const p = Math.min(5, Math.max(1, num(prob) || 1));
  const co = Math.min(5, Math.max(1, num(cons) || 1));
  let rows = "";
  for (let row = 5; row >= 1; row--) {
    let cells = "";
    for (let col = 1; col <= 5; col++) {
      const val = row * col;
      const here = col === p && row === co;
      const dot = here
        ? `<span class="w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-white shadow-lg animate-ping absolute"></span>
           <span class="w-3.5 h-3.5 rounded-full bg-cyan-200 border-2 border-white shadow-lg relative z-10"></span>`
        : `${val}`;
      const bg = heatColor(val);
      const txt = val <= 9 ? "#07140a" : "#ffffff";
      cells += `<div class="h-9 rounded flex items-center justify-center relative ${here ? "ring-2 ring-white z-10" : ""}" style="background:${bg};color:${txt}">${dot}</div>`;
    }
    rows += `<div class="grid grid-cols-5 gap-1 text-[10px] font-mono font-bold text-center">${cells}</div>`;
  }
  return rows;
}

// Tarjeta de una fuente/resultado
function resultadoCard(r, i, total, mediaBase) {
  const fuente = esc(r?.fuente_nombre || r?.fuente || "Fuente");
  const tipo = esc(r?.tipo_fuente || r?.tipo || "");
  const estado = (r?.estado || "").toString();
  const estadoLow = estado.toLowerCase();
  const ok = ["validado", "validada", "completado", "finalizado"].includes(estadoLow);
  const estadoChip = ok
    ? "bg-emerald-950/80 text-brand-emerald border-brand-emerald/40"
    : (["sin validar", "sin_validar", "error"].includes(estadoLow)
        ? "bg-rose-950/70 text-rose-300 border-rose-500/40"
        : "bg-amber-950/70 text-amber-300 border-amber-500/40");
  const score = r?.score != null ? esc(r.score) : "—";
  const mensaje = esc(r?.mensaje || "Sin mensaje.");
  const hasImg = esImagen(r?.archivo);
  const imgUrl = hasImg
    ? `${mediaBase}${String(r.archivo).replace(/^.*?media[\\/]/, "")}`
    : "";

  const evidencia = hasImg
    ? `
    <div class="bg-brand-card/60 rounded-xl border border-brand-border p-4 mt-4">
      <div class="flex items-center gap-2 text-xs font-mono text-slate-300 mb-3">
        <svg class="w-4 h-4 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        <span class="font-bold uppercase tracking-wider text-white">Evidencia capturada</span>
      </div>
      <div class="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
        <div class="bg-[#111827] px-4 py-2 flex items-center gap-2 border-b border-slate-700/80">
          <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span class="ml-3 text-[11px] font-mono text-slate-400 truncate">${fuente}</span>
        </div>
        <div class="bg-slate-950 p-3 flex justify-center">
          <img src="${esc(imgUrl)}" alt="Evidencia ${fuente}" loading="lazy" class="w-full max-w-3xl h-auto rounded-lg border border-slate-700" />
        </div>
      </div>
    </div>`
    : "";

  return `
  <section class="bg-brand-surface rounded-2xl border border-brand-border/90 overflow-hidden shadow-hud">
    <div class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 px-6 py-3 flex items-center justify-between gap-2">
      <div class="flex items-center gap-3 min-w-0">
        <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        <span class="font-mono font-bold text-white text-sm tracking-wide truncate">${fuente}</span>
      </div>
      <span class="hidden md:inline text-emerald-100 text-xs font-mono shrink-0">Resultado ${i} de ${total}</span>
    </div>
    <div class="p-5 sm:p-6">
      <div class="bg-brand-card rounded-xl border border-brand-border p-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-brand-border/70 pb-4 mb-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-brand-emerald"></span>
              <h4 class="text-base font-bold text-white font-mono truncate">${fuente}</h4>
            </div>
            ${tipo ? `<p class="text-xs text-slate-400 font-mono mt-0.5">${tipo}</p>` : ""}
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="px-3 py-1 text-xs font-mono font-semibold bg-blue-950/70 text-blue-300 border border-blue-700/50 rounded-lg">Score: ${score}</span>
            <span class="px-3 py-1 text-xs font-mono font-bold border rounded-lg ${estadoChip}">Estado: ${esc(estado || "—")}</span>
          </div>
        </div>
        <div class="bg-brand-navy/60 p-3 rounded-lg border border-brand-border">
          <span class="text-slate-400 block text-[10px] uppercase font-mono">Resultado del análisis</span>
          <p class="text-sm text-slate-200 mt-1 font-sans whitespace-pre-wrap break-words">${mensaje}</p>
        </div>
        ${evidencia}
      </div>
    </div>
  </section>`;
}

export function buildInformeHtml({ consulta, riesgo, resultados, apiUrl, qrUrl, verifyUrl, burbujaUrl }) {
  const mediaBase = `${apiUrl}/media/`;
  const cand = consulta?.candidato || {};
  const nombre =
    `${cand.first_name || cand.nombre || ""} ${cand.last_name || cand.apellido || ""}`.trim() ||
    consulta?.nombre || "—";
  const cedula = cand.document || cand.cedula || consulta?.cedula || "—";
  const sexo = cand.gender || cand.sexo || "—";
  const tipoDoc = cand.doc_type || cand.tipo_doc || "CC";
  const estadoCedula = cand.estado_cedula || cand.estado || "—";
  const birth = cand.birth_date || cand.fecha_nacimiento || null;
  const anio = birth ? new Date(birth).getFullYear() : null;
  const edad = anio ? Math.max(0, new Date().getFullYear() - anio) : "—";
  const fechaExp = cand.fecha_expedicion ? new Date(cand.fecha_expedicion).toLocaleDateString() : "—";
  const lugarExp = [cand.municipio_expedicion, cand.departamento_expedicion].filter(Boolean).join(" (") + (cand.departamento_expedicion ? ")" : "") || "—";
  const fecha = consulta?.fecha ? new Date(consulta.fecha).toLocaleString() : new Date().toLocaleString();

  const cat = riesgo?.categoria || "—";
  const prob = riesgo?.probabilidad ?? "—";
  const cons = riesgo?.consecuencia ?? "—";
  const score = riesgo?.riesgo ?? "—";
  const th = riesgoTheme(cat);

  // Mismas imágenes que usa el PDF (estáticas del backend): avatar por color de
  // riesgo + sexo, semáforo y logo. (Se sirven en STATIC_URL = /django_static/.)
  const catLow = (cat || "").toLowerCase();
  const colorMap = { extremo: "rojo", alto: "rojo", medio: "amarillo", bajo: "verde" };
  const color = colorMap[catLow] || "";
  const sexoLow = (sexo || "").toLowerCase();
  const esFem = ["femenino", "f", "mujer"].includes(sexoLow);
  const avatarFile = esFem
    ? (color ? `placeholder_${color}_femenino.png` : "placeholder_femenino_gris.png")
    : (color ? `placeholder_${color}.png` : "placeholder.png");
  const semaforoFile = `semaforo_${color || "gris"}.png`;
  const staticBase = `${apiUrl}/django_static/img/`;
  const logoUrl = `${staticBase}logo-removebg-preview.png`;
  const avatarUrl = `${staticBase}${avatarFile}`;
  const semaforoUrl = `${staticBase}${semaforoFile}`;

  // Gauge: fracción score/5
  const frac = Math.min(1, Math.max(0, (num(score) || 0) / 5));
  const CIRC = 263.89;
  const dashoffset = (CIRC * (1 - frac)).toFixed(2);

  const items = Array.isArray(resultados) ? resultados.filter((r) => r?.mensaje || r?.score != null || r?.archivo) : [];
  const totalFuentes = items.length;
  const cards = items.map((r, idx) => resultadoCard(r, idx + 1, totalFuentes, mediaBase)).join("\n");

  return `<!DOCTYPE html>
<html class="dark" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>ECONFIA - Informe de Análisis de Riesgo</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet"/>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: { extend: {
      colors: { brand: { navy:'#050914', surface:'#0a1024', card:'#0f1733', border:'#1b284f', accent:'#00ff88', emerald:'#00e676', cyan:'#00e5ff', blueBar:'#152b5c' } },
      fontFamily: { sans:['"Plus Jakarta Sans"','sans-serif'], mono:['"Space Grotesk"','monospace'] },
      boxShadow: { 'neon-green':'0 0 25px -3px rgba(0,255,136,0.35)', 'neon-glow':'0 0 40px -5px rgba(0,230,118,0.25)', 'hud':'0 8px 32px 0 rgba(0,0,0,0.45)' }
    }}
  }
</script>
<style>
  .bg-grid-cyber { background-size:32px 32px; background-image:linear-gradient(to right, rgba(27,40,79,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,40,79,0.25) 1px, transparent 1px); }
  html,body{ margin:0; }
</style>
</head>
<body class="bg-brand-navy text-slate-200 font-sans antialiased min-h-screen bg-grid-cyber">
<div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-6">

  <!-- Header -->
  <header class="bg-brand-surface/90 backdrop-blur-md rounded-2xl p-5 border border-brand-border/80 shadow-hud flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-5">
      <div class="h-14 px-3 rounded-xl bg-gradient-to-br from-emerald-400/10 via-brand-card to-cyan-500/5 border border-brand-emerald/40 flex items-center justify-center shadow-neon-green">
        <img src="${esc(logoUrl)}" alt="Econfia" class="h-10 w-auto object-contain" onerror="this.style.display='none'"/>
      </div>
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-extrabold tracking-wider text-white uppercase font-mono">ECONFIA</h1>
          <span class="text-[11px] font-semibold tracking-widest uppercase bg-emerald-950/80 text-brand-emerald border border-brand-emerald/40 px-2.5 py-0.5 rounded-full">INFORME DE RIESGO</span>
        </div>
        <p class="text-xs font-semibold text-slate-300 tracking-wide mt-0.5">INFORME DE ANÁLISIS DE RIESGO</p>
        <p class="text-[11px] text-slate-400 font-mono">Due Diligence — Fuentes públicas y privadas</p>
      </div>
    </div>
    <div class="flex items-center gap-6 px-6 py-2.5 rounded-xl bg-brand-card/80 border border-brand-border">
      <div class="text-right">
        <p class="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Fecha de emisión</p>
        <p class="text-sm font-bold text-white font-mono flex items-center gap-2 justify-end"><span class="w-2 h-2 rounded-full bg-brand-emerald animate-ping"></span>${esc(fecha)}</p>
      </div>
      <div class="h-8 w-px bg-brand-border"></div>
      <div class="text-left">
        <p class="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Dictamen</p>
        <span class="inline-flex items-center px-2 py-0.5 text-xs font-bold rounded border ${th.chip}">${esc(th.dict)}</span>
      </div>
    </div>
  </header>

  <!-- Person banner -->
  <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#081229] via-[#0d1d45] to-[#081229] border border-brand-border/80 px-8 py-5 shadow-hud text-center">
    <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-20 bg-brand-emerald/15 blur-3xl rounded-full pointer-events-none"></div>
    <p class="text-[11px] font-mono tracking-[0.28em] text-brand-emerald uppercase font-bold mb-1">Sujeto objeto de evaluación</p>
    <h2 class="text-2xl md:text-4xl font-extrabold tracking-wider text-white uppercase drop-shadow font-mono">${esc(nombre)}</h2>
    <div class="mt-2 flex items-center justify-center gap-4 text-xs font-mono text-slate-300 flex-wrap">
      <span>${esc(tipoDoc)}: <strong class="text-white font-bold tracking-wider">${esc(cedula)}</strong></span>
      <span class="text-slate-600">•</span>
      <span class="text-brand-emerald font-semibold">ESTADO: ${esc(estadoCedula)}</span>
      <span class="text-slate-600">•</span>
      <span>JURISDICCIÓN: COLOMBIA</span>
    </div>
    <div class="w-48 h-0.5 bg-gradient-to-r from-transparent via-brand-emerald to-transparent mx-auto mt-3"></div>
  </div>

  <!-- Dashboard grid -->
  <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
    <!-- Biometrics -->
    <section class="xl:col-span-5 bg-brand-surface rounded-2xl border border-brand-border/90 p-6 flex flex-col shadow-hud relative overflow-hidden">
      <div class="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
      <div class="flex items-center gap-2 border-b border-brand-border/60 pb-3 mb-6">
        <span class="w-2.5 h-2.5 rounded-full bg-brand-emerald shadow-neon-green"></span>
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">Identificación & Score</h3>
      </div>
      <div class="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
        <div class="flex flex-col items-center">
          <div class="relative w-28 h-28 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full border-2 border-brand-emerald/20 animate-pulse"></div>
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="#1b284f" stroke-width="6"></circle>
              <circle cx="50" cy="50" fill="transparent" r="42" stroke="${th.gauge}" stroke-dasharray="${CIRC}" stroke-dashoffset="${dashoffset}" stroke-linecap="round" stroke-width="6"></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="text-4xl font-extrabold font-mono text-white tracking-tight">${esc(score)}</span>
              <span class="text-[9px] uppercase tracking-widest text-slate-400 font-mono">PUNTAJE</span>
            </div>
          </div>
          <p class="text-[11px] uppercase tracking-wider text-slate-400 font-mono mt-2">NIVEL DE RIESGO</p>
          <span class="mt-1 px-4 py-1 text-xs font-bold font-mono tracking-widest uppercase ${th.badgeBg} ${th.badgeTx} rounded-full shadow-neon-green">${esc(cat)}</span>
        </div>
        <div class="relative flex flex-col items-center">
          <div class="w-36 h-36 rounded-full p-1.5 border-2 shadow-neon-green overflow-hidden bg-[#040914]" style="border-color:${th.hex}">
            <img src="${esc(avatarUrl)}" alt="Perfil de riesgo" class="w-full h-full object-contain rounded-full" onerror="this.style.visibility='hidden'"/>
          </div>
          <img src="${esc(semaforoUrl)}" alt="Semáforo de riesgo" class="h-14 mt-3 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" onerror="this.style.display='none'"/>
        </div>
      </div>
      <div class="mt-6 bg-brand-card/70 rounded-xl p-4 border border-brand-border divide-y divide-brand-border/60 text-xs font-mono">
        ${row("Sexo", sexo)}
        ${row("Año de nacimiento", anio || "—")}
        ${row("Edad", edad)}
        ${row("Fecha de expedición", fechaExp)}
        ${row("Lugar de expedición", lugarExp)}
        ${row("Estado de cédula", estadoCedula)}
        ${row("Cupo numérico", cedula)}
      </div>
    </section>

    <!-- Risk matrix -->
    <section class="xl:col-span-7 bg-brand-surface rounded-2xl border border-brand-border/90 p-6 flex flex-col shadow-hud">
      <div class="flex items-center gap-2 border-b border-brand-border/60 pb-3 mb-5">
        <svg class="w-4 h-4 text-brand-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
        <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">Evaluación de Riesgo (Matriz 5x5)</h3>
      </div>
      <div class="bg-brand-card/90 rounded-xl p-4 border border-brand-border">
        <div class="flex items-stretch gap-1">
          <div class="flex items-center justify-center"><span class="-rotate-90 text-[9px] uppercase font-mono text-slate-400 tracking-wider whitespace-nowrap">CONSECUENCIA</span></div>
          <div class="flex-1 space-y-1">${matrizHeatmap(prob, cons)}</div>
        </div>
        <div class="text-center mt-2 text-[9px] uppercase font-mono text-slate-400 tracking-wider">PROBABILIDAD →</div>
        <div class="mt-3 pt-2 border-t border-slate-700/50 flex justify-between items-center text-[10px] font-mono text-slate-300 flex-wrap gap-2">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-300 inline-block"></span> Posición (P:${esc(prob)} · C:${esc(cons)})</span>
          <span class="font-bold" style="color:${th.hex}">${esc(cat)}</span>
        </div>
        <div class="mt-4 p-3 rounded-xl bg-brand-card/60 border border-brand-border text-[11px] font-mono">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-slate-400 font-semibold uppercase text-[10px]">Severidad</span>
            <span class="text-slate-400 text-[10px]">Bajo → Crítico</span>
          </div>
          <div class="grid grid-cols-4 gap-1 h-2.5 rounded overflow-hidden">
            <div style="background:linear-gradient(90deg,hsl(140,85%,54%),hsl(140,85%,40%))"></div>
            <div style="background:linear-gradient(90deg,hsl(52,85%,54%),hsl(52,85%,40%))"></div>
            <div style="background:linear-gradient(90deg,hsl(28,85%,54%),hsl(28,85%,40%))"></div>
            <div style="background:linear-gradient(90deg,hsl(0,85%,54%),hsl(0,85%,40%))"></div>
          </div>
          <div class="grid grid-cols-4 gap-1 mt-1 text-[9px] text-slate-400 text-center">
            <span>1-4 Bajo</span><span>5-9 Medio</span><span>10-14 Alto</span><span>15-25 Crítico</span>
          </div>
        </div>
      </div>
    </section>
  </div>

  ${burbujaUrl ? `
  <!-- Diagrama de burbujas de riesgo -->
  <section class="bg-brand-surface rounded-2xl border border-brand-border/90 p-6 shadow-hud">
    <div class="flex items-center gap-2 border-b border-brand-border/60 pb-3 mb-4">
      <span class="w-2.5 h-2.5 rounded-full bg-brand-emerald shadow-neon-green"></span>
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">Diagrama de burbujas de riesgo</h3>
    </div>
    <div class="rounded-xl overflow-hidden border border-brand-border bg-brand-card/50 p-3 flex justify-center">
      <img src="${esc(burbujaUrl)}" alt="Diagrama de burbujas de riesgo" class="max-w-full h-auto max-h-[500px] object-contain rounded-lg" onerror="this.closest('section').style.display='none'"/>
    </div>
  </section>` : ""}

  <!-- Resultados por fuente -->
  <div class="space-y-6">
    <div class="flex items-center gap-3 px-1">
      <span class="w-2.5 h-2.5 rounded-full bg-brand-emerald shadow-neon-green"></span>
      <h3 class="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">Resultados por fuente — ${totalFuentes} consultada${totalFuentes === 1 ? "" : "s"}</h3>
    </div>
    ${cards || `<p class="text-sm text-slate-400 font-mono px-1 py-6">No hay resultados para mostrar.</p>`}
  </div>

  <!-- Verificación: QR + link público -->
  <section class="bg-brand-blueBar rounded-2xl p-5 border border-blue-900/60 shadow-hud flex flex-col sm:flex-row items-center gap-5">
    ${qrUrl ? `<div class="p-2 bg-white rounded-xl shadow-md shrink-0"><img src="${esc(qrUrl)}" alt="QR de verificación" class="w-24 h-24 object-contain" onerror="this.closest('div').style.display='none'"/></div>` : ""}
    <div class="min-w-0 flex-1 text-center sm:text-left">
      <p class="text-[11px] font-mono tracking-widest text-brand-emerald uppercase font-bold mb-1">Verificación del informe</p>
      <p class="text-sm text-slate-200 font-sans">Escanea el QR o abre el enlace para verificar la autenticidad de este reporte.</p>
      ${verifyUrl ? `<a href="${esc(verifyUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-brand-emerald border border-brand-emerald/40 font-mono text-xs font-bold transition">Verificar este informe →</a>
      <p class="text-[11px] text-slate-400 font-mono mt-2 break-all">${esc(verifyUrl)}</p>` : ""}
    </div>
  </section>

  <footer class="text-center py-4 text-xs font-mono text-slate-500 space-y-1">
    <p>© ${new Date().getFullYear()} ECONFIA — Plataforma de Cumplimiento AML / SARLAFT / SAGRILAFT.</p>
    <p class="text-[10px] text-slate-600">Resultados obtenidos de fuentes públicas y privadas. El uso e interpretación es responsabilidad del usuario.</p>
  </footer>

</div>
</body></html>`;
}

function row(label, value) {
  return `<div class="flex justify-between py-2 items-center gap-3"><span class="text-slate-400 uppercase tracking-wide">${esc(label)}:</span><span class="font-bold text-white tracking-wider text-right break-words">${esc(value)}</span></div>`;
}
