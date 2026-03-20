// InformeUsuarioPDF.js
import jsPDF from "jspdf";
import { PDF_STYLE } from "./informe_usuario_pdf_style";
import logoEconfiaWhite from "../assets/logo-econfia.png";

export function generarInformeUsuarioPDF(profile, stats) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const C = PDF_STYLE.colors;
  const L = PDF_STYLE.layout;
  const F = PDF_STYLE.fonts;

  const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  const horaHoy = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  const nombreCompleto = profile?.full_name || profile?.username || "Usuario";
  const estaInfinito = profile?.perfil?.consultas_infinitas;

  let pageNum = 1;

  /* ======================================================
     PÁGINA 1 — RESUMEN PERSONAL
  ====================================================== */
  renderBackground(doc, C, L);
  renderHeader(doc, C, F, L, logoEconfiaWhite, "Informe Personal de Actividad", nombreCompleto, fechaHoy, horaHoy);

  let y = 44;

  // ---- TARJETAS MÉTRICAS ----
  const consumidas = profile?.perfil?.consultas_consumidas ?? 0;
  const cargadas = profile?.perfil?.consultas_cargadas_total ?? 0;
  const disponibles = profile?.perfil?.consultas_disponibles ?? 0;
  const planes = profile?.perfil?.planes || [];
  const recargas = profile?.perfil?.historial_recargas || [];
  const consumos = profile?.perfil?.historial_consumos || [];

  const estados = stats?.estadisticas?.consultas?.por_estado || [];
  const completadas = estados.find(e => e.estado === "completado")?.total ?? 0;
  const pendientes = estados.find(e => e.estado === "pendiente")?.total ?? 0;
  const enProceso = estados.find(e => e.estado === "en_proceso")?.total ?? 0;
  const totalConsultas = completadas + pendientes + enProceso;

  const metricas = [
    { label: "CONSULTAS REALIZADAS", value: String(totalConsultas), color: C.accent },
    { label: "COMPLETADAS", value: String(completadas), color: [34, 197, 94] },
    { label: estaInfinito ? "SALDO" : "DISPONIBLES", value: estaInfinito ? "Ilimitado" : String(disponibles), color: estaInfinito ? [168, 85, 247] : [34, 211, 238] },
    { label: "CONSUMIDAS", value: String(consumidas), color: [234, 179, 8] },
    { label: estaInfinito ? "CARGADAS" : "CARGADAS", value: estaInfinito ? "Ilimitado" : String(cargadas), color: estaInfinito ? [168, 85, 247] : C.accent },
    { label: "PLANES ACTIVOS", value: String(planes.length), color: [168, 85, 247] },
  ];

  const cols = 3;
  const cardW = 58;
  const cardH = 22;
  const gapX = 6;
  const startX = 12;

  metricas.forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = y + row * (cardH + 4);
    doc.setFillColor(...C.card);
    doc.roundedRect(cx, cy, cardW, cardH, 4, 4, "F");
    doc.setFillColor(...m.color);
    doc.roundedRect(cx, cy, 3, cardH, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...m.color);
    doc.text(m.value, cx + cardW / 2 + 1, cy + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(m.label, cx + cardW / 2 + 1, cy + 17, { align: "center" });
  });

  y += 58;

  // ---- DATOS PERSONALES ----
  sectionTitle(doc, "Datos del titular", y, C, F);
  y += 9;

  infoRow(doc, "Nombre completo", nombreCompleto, y, C, F); y += 7;
  infoRow(doc, "Usuario", profile?.username || "—", y, C, F); y += 7;
  infoRow(doc, "Correo electrónico", profile?.email || "—", y, C, F); y += 7;
  infoRow(doc, "Tipo de perfil", capitalize(profile?.perfil?.tipo_perfil || "Usuario"), y, C, F); y += 7;
  infoRow(doc, "Fecha del informe", `${fechaHoy}  ·  ${horaHoy}`, y, C, F); y += 10;

  // ---- PLANES ACTIVOS ----
  sectionTitle(doc, "Planes contratados", y, C, F);
  y += 9;
  if (planes.length) {
    planes.forEach((p, i) => {
      const px = startX + (i % 3) * 66;
      const py = y + Math.floor(i / 3) * 10;
      doc.setFillColor(...C.card);
      doc.roundedRect(px, py - 5, 62, 8, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.accent);
      doc.text(capitalize(p.nombre), px + 31, py, { align: "center" });
    });
    y += Math.ceil(planes.length / 3) * 10 + 4;
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text("Sin planes activos.", startX, y);
    y += 8;
  }

  // ---- ACTIVIDAD POR ESTADO ----
  y += 4;
  sectionTitle(doc, "Actividad de consultas", y, C, F);
  y += 9;

  const barMaxW = 140;
  const totalBar = totalConsultas || 1;
  const barData = [
    { label: "Completadas", value: completadas, color: [34, 197, 94] },
    { label: "Pendientes", value: pendientes, color: [234, 179, 8] },
    { label: "En proceso", value: enProceso, color: [59, 130, 246] },
  ];
  barData.forEach(b => {
    doc.setFontSize(8);
    doc.setTextColor(...C.textPrimary);
    doc.text(b.label, startX, y + 3);
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(55, y - 1, barMaxW, 6, 2, 2, "F");
    const bw = Math.max((b.value / totalBar) * barMaxW, b.value > 0 ? 3 : 0);
    if (bw > 0) { doc.setFillColor(...b.color); doc.roundedRect(55, y - 1, bw, 6, 2, 2, "F"); }
    doc.setFontSize(7);
    doc.setTextColor(...C.textMuted);
    doc.text(String(b.value), 198, y + 3, { align: "right" });
    y += 10;
  });

  // Plan ilimitado badge
  if (estaInfinito) {
    y += 2;
    doc.setFillColor(88, 28, 135);
    doc.roundedRect(startX, y, 80, 8, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(216, 180, 254);
    doc.text("Plan Ilimitado activo — sin restricción de consultas", startX + 40, y + 5, { align: "center" });
    y += 12;
  }

  renderFooter(doc, C, F, pageNum);

  /* ======================================================
     PÁGINA 2 — HISTORIAL DE RECARGAS (COMPLETO)
  ====================================================== */
  pageNum++;
  doc.addPage();
  renderBackground(doc, C, L);
  renderMiniHeader(doc, C, F, "Historial de consultas cargadas", nombreCompleto, fechaHoy);

  y = 24;
  if (recargas.length) {
    // Encabezado tabla
    doc.setFillColor(...C.accent);
    doc.rect(10, y - 5, 190, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(11, 18, 32);
    doc.text("#", 12, y);
    doc.text("Fecha y hora", 20, y);
    doc.text("Cantidad cargada", 80, y);
    doc.text("Saldo antes", 120, y);
    doc.text("Saldo después", 152, y);
    doc.text("Tipo", 184, y);
    y += 6;

    recargas.forEach((r, i) => {
      if (y > 272) {
        renderFooter(doc, C, F, pageNum);
        pageNum++;
        doc.addPage();
        renderBackground(doc, C, L);
        renderMiniHeader(doc, C, F, "Historial de consultas cargadas (cont.)", nombreCompleto, fechaHoy);
        y = 24;
        doc.setFillColor(...C.accent);
        doc.rect(10, y - 5, 190, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(11, 18, 32);
        doc.text("#", 12, y); doc.text("Fecha y hora", 20, y);
        doc.text("Cantidad cargada", 80, y); doc.text("Saldo antes", 120, y);
        doc.text("Saldo después", 152, y); doc.text("Tipo", 184, y);
        y += 6;
      }
      if (i % 2 === 0) { doc.setFillColor(23, 33, 51); doc.rect(10, y - 4, 190, 7, "F"); }
      const fecha = new Date(r.fecha_recarga).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
      const hora = new Date(r.fecha_recarga).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text(String(i + 1), 12, y);
      doc.setTextColor(...C.textPrimary);
      doc.text(`${fecha}  ${hora}`, 20, y);
      doc.setTextColor(34, 197, 94);
      doc.text(`+${r.cantidad}`, 80, y);
      doc.setTextColor(...C.textMuted);
      doc.text(String(r.saldo_antes), 120, y);
      doc.text(String(r.saldo_despues), 152, y);
      doc.setTextColor(...C.accent);
      doc.text(capitalize(r.tipo || "—"), 184, y);
      y += 8;
    });

    // Resumen al final
    y += 4;
    doc.setFillColor(...C.card);
    doc.roundedRect(10, y, 190, 12, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...C.accent);
    const totalCargado = recargas.reduce((acc, r) => acc + r.cantidad, 0);
    doc.text(`Total registros: ${recargas.length}   ·   Total consultas cargadas: ${estaInfinito ? "Ilimitado" : totalCargado}`, 105, y + 7, { align: "center" });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...C.textMuted);
    doc.text("No se registran recargas aún.", startX, y + 6);
  }

  renderFooter(doc, C, F, pageNum);

  /* ======================================================
     PÁGINA(S) — HISTORIAL DE CONSUMOS (COMPLETO)
  ====================================================== */
  pageNum++;
  doc.addPage();
  renderBackground(doc, C, L);
  renderMiniHeader(doc, C, F, "Historial de consultas consumidas", nombreCompleto, fechaHoy);

  y = 24;
  if (consumos.length) {
    doc.setFillColor(234, 179, 8);
    doc.rect(10, y - 5, 190, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(11, 18, 32);
    doc.text("#", 12, y);
    doc.text("Fecha y hora", 20, y);
    doc.text("Consultas descontadas", 80, y);
    doc.text("Saldo antes", 128, y);
    doc.text("Saldo después", 162, y);
    y += 6;

    consumos.forEach((c, i) => {
      if (y > 272) {
        renderFooter(doc, C, F, pageNum);
        pageNum++;
        doc.addPage();
        renderBackground(doc, C, L);
        renderMiniHeader(doc, C, F, "Historial de consultas consumidas (cont.)", nombreCompleto, fechaHoy);
        y = 24;
        doc.setFillColor(234, 179, 8);
        doc.rect(10, y - 5, 190, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(11, 18, 32);
        doc.text("#", 12, y); doc.text("Fecha y hora", 20, y);
        doc.text("Consultas descontadas", 80, y);
        doc.text("Saldo antes", 128, y); doc.text("Saldo después", 162, y);
        y += 6;
      }
      if (i % 2 === 0) { doc.setFillColor(23, 33, 51); doc.rect(10, y - 4, 190, 7, "F"); }
      const fecha = new Date(c.fecha_consumo).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
      const hora = new Date(c.fecha_consumo).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.textMuted);
      doc.text(String(i + 1), 12, y);
      doc.setTextColor(...C.textPrimary);
      doc.text(`${fecha}  ${hora}`, 20, y);
      doc.setTextColor(239, 68, 68);
      doc.text(`-${c.cantidad}`, 80, y);
      doc.setTextColor(...C.textMuted);
      doc.text(String(c.saldo_antes), 128, y);
      doc.text(String(c.saldo_despues), 162, y);
      y += 8;
    });

    y += 4;
    doc.setFillColor(...C.card);
    doc.roundedRect(10, y, 190, 12, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(239, 68, 68);
    const totalConsumido = consumos.reduce((acc, c) => acc + c.cantidad, 0);
    doc.text(`Total registros: ${consumos.length}   ·   Total consultas consumidas: ${totalConsumido}`, 105, y + 7, { align: "center" });
  } else {
    doc.setFontSize(9);
    doc.setTextColor(...C.textMuted);
    doc.text("No se registran consumos aún.", startX, y + 6);
  }

  renderFooter(doc, C, F, pageNum);

  doc.save(`Informe_Personal_Econfia_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ======================================================
   HELPERS
====================================================== */

function renderBackground(doc, C, L) {
  doc.setFillColor(...C.background);
  doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");
}

function renderHeader(doc, C, F, L, logo, titulo, nombre, fecha, hora) {
  doc.setFillColor(...C.header);
  doc.rect(0, 0, L.pageWidth, 32, "F");
  doc.addImage(logo, "PNG", 12, 10, 32, 11);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(titulo, 52, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(186, 230, 253);
  doc.text(`Titular: ${nombre}`, 52, 23);
  doc.text(`${fecha}  ·  ${hora}`, 52, 28);
  // Badge PRIVADO
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(158, 12, 38, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.accent);
  doc.text("DOCUMENTO PRIVADO", 177, 17.5, { align: "center" });
}

function renderMiniHeader(doc, C, F, titulo, nombre, fecha) {
  doc.setFillColor(...C.header);
  doc.rect(0, 0, 210, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(titulo, 15, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(186, 230, 253);
  doc.text(fecha, 195, 10, { align: "right" });
}

function renderFooter(doc, C, F, pageNum) {
  doc.setFillColor(...C.footerBg);
  doc.rect(0, 282, 210, 15, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(F.small);
  doc.setTextColor(...C.footerText);
  doc.text("Documento personal y confidencial · Generado por Econfia · Solo para uso del titular.", 15, 289);
  doc.text(`Página ${pageNum}`, 195, 289, { align: "right" });
}

function sectionTitle(doc, title, y, C, F) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(F.section);
  doc.setTextColor(...C.accent);
  doc.text(title, 15, y);
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, 195, y + 2);
}

function infoRow(doc, label, value, y, C, F) {
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...C.textMuted);
  doc.text(`${label}:`, 15, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.textPrimary);
  doc.text(value, 65, y);
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
