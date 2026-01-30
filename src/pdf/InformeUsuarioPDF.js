// InformeUsuarioPDF.js
import jsPDF from "jspdf";
import { PDF_STYLE } from "./informe_usuario_pdf_style";
import logoEconfiaWhite from "../assets/logo-econfia.png";

export function generarInformeUsuarioPDF(profile, stats) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const C = PDF_STYLE.colors;
  const L = PDF_STYLE.layout;
  const F = PDF_STYLE.fonts;

  let y = 0;

  /* ================= FONDO ================= */
  doc.setFillColor(...C.background);
  doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");

  /* ================= HEADER ================= */
  doc.setFillColor(...C.header);
  doc.rect(0, 0, L.pageWidth, 28, "F");

  doc.addImage(logoEconfiaWhite, "PNG", 15, 10, 30, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(F.title);
  doc.setTextColor(255, 255, 255);
  doc.text("Informe De Usuario", 60, 18);

  doc.setFontSize(F.text);
  doc.setFont("helvetica", "normal");
  doc.text(
    new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
    195,
    18,
    { align: "right" }
  );

  /* ================= RESUMEN ================= */
  y = 40;
  doc.setFillColor(...C.card);
  doc.roundedRect(15, y, 180, 36, L.cardRadius, L.cardRadius, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(F.section);
  doc.setTextColor(...C.accent);
  doc.text("Resumen del usuario", 20, y + 9);

  const resumen = [
    { label: "DISPONIBLES", value: profile?.perfil?.consultas_disponibles ?? 0, x: 45 },
    { label: "CONSUMIDAS", value: profile?.perfil?.consultas_consumidas ?? 0, x: 105 },
    { label: "PLANES ACTIVOS", value: profile?.perfil?.planes?.length ?? 0, x: 165 }
  ];

  resumen.forEach(item => {
    doc.setFontSize(F.metric);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...C.textPrimary);
    doc.text(String(item.value), item.x, y + 22, { align: "center" });

    doc.setFontSize(F.small);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textMuted);
    doc.text(item.label, item.x, y + 29, { align: "center" });
  });

  // Separadores verticales (detalle premium)
  doc.setDrawColor(...C.divider);
  doc.setLineWidth(0.3);
  doc.line(75, y + 8, 75, y + 32);
  doc.line(135, y + 8, 135, y + 32);

  /* ================= DATOS USUARIO ================= */
  y += 52;
  sectionTitle(doc, "Datos del usuario", y);
  y += 8;

  infoLine(doc, "Nombre", profile?.full_name || "-", y); y += 6;
  infoLine(doc, "Usuario", profile?.username || "-", y); y += 6;
  infoLine(doc, "Correo", profile?.email || "-", y);

  /* ================= ACTIVIDAD ================= */
  y += 14;
  sectionTitle(doc, "Actividad de consultas", y);
  y += 10;

  // Corregir para leer de por_estado
  const estados = stats?.estadisticas?.consultas?.por_estado || [];
  const pendientes = estados.find(e => e.estado === "pendiente")?.total ?? 0;
  const completadas = estados.find(e => e.estado === "completado")?.total ?? 0;
  const total = pendientes + completadas || 1;

  doc.setFontSize(F.text);
  doc.setTextColor(...C.textPrimary);
  doc.text(`Completadas: ${completadas}`, 15, y);
  doc.text(`Pendientes: ${pendientes}`, 15, y + 6);

  // Barra elegante
  const barWidth = 150;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(15, y + 14, barWidth, 6, 3, 3, "F");

  doc.setFillColor(...C.success);
  doc.roundedRect(
    15,
    y + 14,
    (completadas / total) * barWidth,
    6,
    3,
    3,
    "F"
  );

  /* ================= HISTORIAL DE RECARGAS ================= */
  y += 32;
  sectionTitle(doc, "Historial de recargas", y);
  y += 8;
  const recargas = profile?.perfil?.historial_recargas || [];
  if (recargas.length) {
    recargas.slice(0, 5).forEach((r, i) => {
      doc.setFontSize(F.text);
      doc.setTextColor(...C.textPrimary);
      doc.text(`• ${new Date(r.fecha_recarga).toLocaleDateString()} | +${r.cantidad} | Antes: ${r.saldo_antes} | Después: ${r.saldo_despues} | ${r.tipo}`,
        18, y + i * 6);
    });
    if (recargas.length > 5) {
      doc.setFontSize(F.small);
      doc.setTextColor(...C.textMuted);
      doc.text(`...y ${recargas.length - 5} más`, 18, y + 5 * 6);
    }
    y += Math.min(recargas.length, 5) * 6 + (recargas.length > 5 ? 6 : 0);
  } else {
    doc.setTextColor(...C.textMuted);
    doc.text("Sin recargas registradas", 18, y);
    y += 6;
  }

  /* ================= HISTORIAL DE CONSUMOS ================= */
  y += 8;
  sectionTitle(doc, "Historial de consumos", y);
  y += 8;
  const consumos = profile?.perfil?.historial_consumos || [];
  if (consumos.length) {
    consumos.slice(0, 5).forEach((c, i) => {
      doc.setFontSize(F.text);
      doc.setTextColor(...C.textPrimary);
      doc.text(`• ${new Date(c.fecha_consumo).toLocaleDateString()} | -${c.cantidad} | Antes: ${c.saldo_antes} | Después: ${c.saldo_despues}`,
        18, y + i * 6);
    });
    if (consumos.length > 5) {
      doc.setFontSize(F.small);
      doc.setTextColor(...C.textMuted);
      doc.text(`...y ${consumos.length - 5} más`, 18, y + 5 * 6);
    }
    y += Math.min(consumos.length, 5) * 6 + (consumos.length > 5 ? 6 : 0);
  } else {
    doc.setTextColor(...C.textMuted);
    doc.text("Sin consumos registrados", 18, y);
    y += 6;
  }

  /* ================= PLANES ================= */
  y += 32;
  sectionTitle(doc, "Planes activos", y);
  y += 8;

  if (profile?.perfil?.planes?.length) {
    profile.perfil.planes.forEach((p, i) => {
      doc.setFontSize(F.text);
      doc.setTextColor(...C.textPrimary);
      doc.text(`• ${capitalize(p.nombre)}`, 18, y + i * 6);
    });
  } else {
    doc.setTextColor(...C.textMuted);
    doc.text("Sin planes activos", 18, y);
  }

  /* ================= FOOTER ================= */
  doc.setFillColor(...C.footerBg);
  doc.rect(0, 282, L.pageWidth, 15, "F");

  doc.setFontSize(F.small);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...C.footerText);
  doc.text("Documento confidencial · Generado por Econfia", 15, 290);
  doc.text(
    "Uso restringido a usuarios autorizados.",
    15,
    294,
    { maxWidth: 180 }
  );

  doc.save("Informe_Usuario_Econfia.pdf");
}

/* ================= HELPERS ================= */

function sectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(34, 211, 238);
  doc.text(title, 15, y);
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.8);
  doc.line(15, y + 2, 80, y + 2);
}

function infoLine(doc, label, value, y) {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(226, 232, 240);
  doc.text(`${label}:`, 15, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(value, 45, y);
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
