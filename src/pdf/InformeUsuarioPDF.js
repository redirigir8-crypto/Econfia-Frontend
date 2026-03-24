// InformeUsuarioPDF.js — Midnight Blue Premium
import jsPDF from "jspdf";
import { PDF_STYLE } from "./informe_usuario_pdf_style";
import logoEconfiaWhite from "../assets/logo-econfia.png";

export function generarInformeUsuarioPDF(profile, stats) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const C = PDF_STYLE.colors;
  const L = PDF_STYLE.layout;
  const F = PDF_STYLE.fonts;

  const fechaHoy  = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  const horaHoy   = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  const nombreCompleto = profile?.full_name || profile?.username || "Usuario";
  const estaInfinito   = !!profile?.perfil?.consultas_infinitas;

  const recargas  = profile?.perfil?.historial_recargas  || [];
  const consumos  = profile?.perfil?.historial_consumos  || [];
  const planes    = profile?.perfil?.planes || [];
  const disponibles = profile?.perfil?.consultas_disponibles ?? 0;
  const consumidas  = profile?.perfil?.consultas_consumidas  ?? 0;
  const cargadas    = profile?.perfil?.consultas_cargadas_total ?? 0;

  const estados       = stats?.estadisticas?.consultas?.por_estado || [];
  const completadas   = estados.find(e => e.estado === "completado")?.total ?? 0;
  const pendientes    = estados.find(e => e.estado === "pendiente")?.total  ?? 0;
  const enProceso     = estados.find(e => e.estado === "en_proceso")?.total ?? 0;
  const totalConsultas = completadas + pendientes + enProceso;

  let pageNum = 1;

  /* ================================================================
     PÁGINA 1 — RESUMEN PERSONAL
  ================================================================ */
  pBg(doc, C);
  pHeader(doc, C, F, logoEconfiaWhite, nombreCompleto, fechaHoy, horaHoy);

  let y = 46;

  /* ── MÉTRICAS (2 filas × 3 cols) ── */
  const metricas = [
    { label: "CONSULTAS REALIZADAS",  value: String(totalConsultas),              color: C.accent },
    { label: "COMPLETADAS",           value: String(completadas),                  color: C.success },
    { label: "SALDO DISPONIBLE",      value: estaInfinito ? "Ilimitado" : String(disponibles), color: estaInfinito ? C.purple : C.accent },
    { label: "CONSUMIDAS",            value: String(consumidas),                   color: C.warning },
    { label: "CARGADAS",              value: estaInfinito ? "Ilimitado" : String(cargadas), color: estaInfinito ? C.purple : C.accentDark },
    { label: "PLANES ACTIVOS",        value: String(planes.length),               color: C.purple },
  ];

  const cW = 58, cH = 24, cGap = 4, cStartX = 14;
  metricas.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const cx = cStartX + col * (cW + cGap);
    const cy = y + row * (cH + cGap);
    /* fondo card */
    doc.setFillColor(...C.card);
    doc.roundedRect(cx, cy, cW, cH, 4, 4, "F");
    /* borde superior de color */
    doc.setFillColor(...m.color);
    doc.roundedRect(cx, cy, cW, 2.5, 1, 1, "F");
    /* valor */
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...m.color);
    doc.text(m.value, cx + cW / 2, cy + 13, { align: "center" });
    /* etiqueta */
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...C.textMuted);
    doc.text(m.label, cx + cW / 2, cy + 20, { align: "center" });
  });

  y += 2 * (cH + cGap) + 8;

  /* ── DATOS PERSONALES ── */
  sTitle(doc, "Datos del titular", y, C, F); y += 8;
  const datosPers = [
    ["Nombre completo",  nombreCompleto],
    ["Usuario",          profile?.username || "—"],
    ["Correo",           profile?.email    || "—"],
    ["Tipo de perfil",   capitalize(profile?.perfil?.tipo_perfil || "Usuario")],
    ["Fecha del informe",`${fechaHoy}  ·  ${horaHoy}`],
  ];
  datosPers.forEach(([label, val]) => {
    doc.setFontSize(9); doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.textMuted);
    doc.text(`${label}:`, 14, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textPrimary);
    doc.text(val, 62, y);
    /* línea guía muy sutil */
    doc.setDrawColor(...C.divider); doc.setLineWidth(0.2);
    doc.line(14, y + 1.5, 196, y + 1.5);
    y += 7;
  });

  y += 4;

  /* ── PLANES ── */
  sTitle(doc, "Planes contratados", y, C, F); y += 8;
  if (planes.length) {
    const pW = 58, pH = 9, pGapX = 4, pGapY = 4, pStep = pW + pGapX;
    planes.forEach((p, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const px = 14 + col * pStep;
      const py = y + row * (pH + pGapY);
      doc.setFillColor(...C.accentDark);
      doc.roundedRect(px, py, pW, pH, 3, 3, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
      doc.setTextColor(...C.textOnAccent);
      const label = doc.splitTextToSize(capitalize(p.nombre), pW - 4);
      doc.text(label[0], px + pW / 2, py + 6, { align: "center" });
    });
    y += Math.ceil(planes.length / 3) * (pH + pGapY) + 4;
  } else {
    doc.setFontSize(8); doc.setTextColor(...C.textMuted);
    doc.text("Sin planes activos.", 14, y); y += 8;
  }

  y += 4;

  /* ── ACTIVIDAD POR ESTADO ── */
  sTitle(doc, "Actividad de consultas", y, C, F); y += 9;
  const barMaxW = 130, totalBar = totalConsultas || 1;
  [
    { label: "Completadas", value: completadas, color: C.success },
    { label: "Pendientes",  value: pendientes,  color: C.warning },
    { label: "En proceso",  value: enProceso,   color: C.accent },
  ].forEach(b => {
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textPrimary);
    doc.text(b.label, 14, y + 3.5);
    /* barra fondo */
    doc.setFillColor(...C.card);
    doc.roundedRect(58, y, barMaxW, 6, 2, 2, "F");
    /* barra progreso */
    const bw = Math.max((b.value / totalBar) * barMaxW, b.value > 0 ? 3 : 0);
    if (bw > 0) { doc.setFillColor(...b.color); doc.roundedRect(58, y, bw, 6, 2, 2, "F"); }
    /* valor */
    doc.setFontSize(7); doc.setTextColor(...C.textMuted);
    doc.text(String(b.value), 196, y + 4.5, { align: "right" });
    y += 10;
  });

  /* plan ilimitado badge */
  if (estaInfinito) {
    y += 2;
    doc.setFillColor(88, 28, 135);
    doc.roundedRect(14, y, 90, 8, 3, 3, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5);
    doc.setTextColor(216, 180, 254);
    doc.text("Plan Ilimitado activo — sin restricción de consultas", 59, y + 5, { align: "center" });
    y += 12;
  }

  pFooter(doc, C, F, pageNum);

  /* ================================================================
     PÁGINA 2 — HISTORIAL COMPLETO DE RECARGAS
  ================================================================ */
  pageNum++;
  doc.addPage(); pBg(doc, C);
  pMiniHeader(doc, C, F, "Historial de consultas cargadas", nombreCompleto, fechaHoy);
  y = 24;

  if (recargas.length) {
    /* encabezado tabla */
    doc.setFillColor(...C.accentDark);
    doc.rect(10, y - 5, 190, 7, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(239, 246, 255);
    ["#", "Fecha y hora", "Cargadas", "Saldo antes", "Saldo después", "Tipo"].forEach((h, i) => {
      doc.text(h, [12,20,78,110,145,178][i], y);
    });
    y += 6;

    recargas.forEach((r, i) => {
      if (y > 272) { pFooter(doc, C, F, pageNum); pageNum++; doc.addPage(); pBg(doc, C); pMiniHeader(doc, C, F, "Historial de consultas cargadas (cont.)", nombreCompleto, fechaHoy); y = 30; }
      if (i % 2 === 0) { doc.setFillColor(...C.card); doc.rect(10, y - 4, 190, 7.5, "F"); }
      const fd = fmt(r.fecha_recarga);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);  doc.text(String(i + 1), 12, y);
      doc.setTextColor(...C.textPrimary); doc.text(fd, 20, y);
      doc.setTextColor(...C.success);    doc.text(`+${r.cantidad}`, 78, y);
      doc.setTextColor(...C.textMuted);  doc.text(String(r.saldo_antes), 110, y);
      doc.text(String(r.saldo_despues), 145, y);
      doc.setTextColor(...C.accent);     doc.text(capitalize(r.tipo || "—"), 178, y);
      y += 8;
    });

    y += 4;
    doc.setFillColor(...C.card); doc.roundedRect(10, y, 190, 11, 3, 3, "F");
    doc.setFillColor(...C.accentDark); doc.roundedRect(10, y, 3, 11, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.accent);
    const tot = estaInfinito ? "Ilimitado" : recargas.reduce((a, r) => a + r.cantidad, 0);
    doc.text(`Total registros: ${recargas.length}   ·   Total cargado: ${tot}`, 105, y + 6.5, { align: "center" });
  } else {
    doc.setFontSize(9); doc.setTextColor(...C.textMuted);
    doc.text("No se registran recargas aún.", 14, y + 6);
  }

  pFooter(doc, C, F, pageNum);

  /* ================================================================
     PÁGINA(S) — HISTORIAL COMPLETO DE CONSUMOS
  ================================================================ */
  pageNum++;
  doc.addPage(); pBg(doc, C);
  pMiniHeader(doc, C, F, "Historial de consultas consumidas", nombreCompleto, fechaHoy);
  y = 24;

  if (consumos.length) {
    doc.setFillColor(180, 120, 10); doc.rect(10, y - 5, 190, 7, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(255, 247, 200);
    ["#", "Fecha y hora", "Descontadas", "Saldo antes", "Saldo después"].forEach((h, i) => {
      doc.text(h, [12,20,80,120,158][i], y);
    });
    y += 6;

    consumos.forEach((c, i) => {
      if (y > 272) { pFooter(doc, C, F, pageNum); pageNum++; doc.addPage(); pBg(doc, C); pMiniHeader(doc, C, F, "Historial de consultas consumidas (cont.)", nombreCompleto, fechaHoy); y = 30; }
      if (i % 2 === 0) { doc.setFillColor(...C.card); doc.rect(10, y - 4, 190, 7.5, "F"); }
      const fd = fmt(c.fecha_consumo);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);  doc.text(String(i + 1), 12, y);
      doc.setTextColor(...C.textPrimary); doc.text(fd, 20, y);
      doc.setTextColor(...C.danger);     doc.text(`-${c.cantidad}`, 80, y);
      doc.setTextColor(...C.textMuted);  doc.text(String(c.saldo_antes), 120, y);
      doc.text(String(c.saldo_despues), 158, y);
      y += 8;
    });

    y += 4;
    doc.setFillColor(...C.card); doc.roundedRect(10, y, 190, 11, 3, 3, "F");
    doc.setFillColor(180, 40, 40); doc.roundedRect(10, y, 3, 11, 1, 1, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...C.danger);
    const totC = consumos.reduce((a, c) => a + c.cantidad, 0);
    doc.text(`Total registros: ${consumos.length}   ·   Total consumido: ${totC}`, 105, y + 6.5, { align: "center" });
  } else {
    doc.setFontSize(9); doc.setTextColor(...C.textMuted);
    doc.text("No se registran consumos aún.", 14, y + 6);
  }

  pFooter(doc, C, F, pageNum);
  doc.save(`Informe_Personal_Econfia_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ================================================================
   HELPERS
================================================================ */

function pBg(doc, C) {
  doc.setFillColor(...C.background);
  doc.rect(0, 0, 210, 297, "F");
}

function pHeader(doc, C, F, logo, nombre, fecha, hora) {
  /* fondo degradado header (simulado con dos rectángulos) */
  doc.setFillColor(...C.header);
  doc.rect(0, 0, 210, 34, "F");
  /* franja accent inferior */
  doc.setFillColor(...C.accentDark);
  doc.rect(0, 32, 210, 2, "F");

  doc.addImage(logo, "PNG", 12, 9, 34, 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(239, 246, 255);
  doc.text("Informe Personal de Actividad", 54, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(147, 197, 253);
  doc.text(`Titular: ${nombre}`, 54, 22);
  doc.text(`${fecha}  ·  ${hora}`, 54, 27);

  /* badge */
  doc.setFillColor(...C.accentDark);
  doc.roundedRect(158, 10, 40, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(239, 246, 255);
  doc.text("DOCUMENTO PRIVADO", 178, 15.5, { align: "center" });
}

function pMiniHeader(doc, C, F, titulo, nombre, fecha) {
  doc.setFillColor(...C.header);
  doc.rect(0, 0, 210, 17, "F");
  doc.setFillColor(...C.accentDark);
  doc.rect(0, 15.5, 210, 1.5, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(239, 246, 255);
  doc.text(titulo, 14, 10);
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(147, 197, 253);
  doc.text(fecha, 196, 10, { align: "right" });
}

function pFooter(doc, C, F, pageNum) {
  doc.setFillColor(...C.footerBg);
  doc.rect(0, 281, 210, 16, "F");
  doc.setFillColor(...C.footerBorder);
  doc.rect(0, 281, 210, 1, "F");
  doc.setFont("helvetica", "italic"); doc.setFontSize(F.small); doc.setTextColor(...C.footerText);
  doc.text("Documento personal y confidencial · Econfia · Uso exclusivo del titular.", 14, 288);
  doc.setFont("helvetica", "bold"); doc.setTextColor(...C.accent);
  doc.text(`Pág. ${pageNum}`, 196, 288, { align: "right" });
}

function sTitle(doc, title, y, C, F) {
  /* línea izquierda de acento */
  doc.setFillColor(...C.accent);
  doc.rect(14, y - 4, 3, 10, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(F.section); doc.setTextColor(...C.accent);
  doc.text(title, 20, y);
  /* línea separadora */
  doc.setDrawColor(...C.divider); doc.setLineWidth(0.4);
  doc.line(20, y + 2, 196, y + 2);
}

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}  ${d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`;
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
