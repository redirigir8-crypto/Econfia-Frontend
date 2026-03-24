// InformeAdminPDF.js
import jsPDF from "jspdf";
import { PDF_STYLE } from "./informe_usuario_pdf_style";
import logoEconfiaWhite from "../assets/logo-econfia.png";

export function generarInformeAdminPDF(users, adminName) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const C = PDF_STYLE.colors;
  const L = PDF_STYLE.layout;
  const F = PDF_STYLE.fonts;
  const fechaHoy = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });
  const horaHoy = new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

  /* ======================================================
     PÁGINA 1 — RESUMEN EJECUTIVO
  ====================================================== */

  // Fondo
  doc.setFillColor(...C.background);
  doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");

  // Header
  doc.setFillColor(...C.header);
  doc.rect(0, 0, L.pageWidth, 32, "F");
  doc.addImage(logoEconfiaWhite, "PNG", 12, 10, 32, 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Informe Administrativo — Usuarios", 52, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(186, 230, 253);
  doc.text(`Generado por: ${adminName || "Administrador"}`, 52, 22);
  doc.text(`${fechaHoy}  ·  ${horaHoy}`, 52, 27);

  // Badge "CONFIDENCIAL"
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(158, 12, 38, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("CONFIDENCIAL", 177, 17.5, { align: "center" });

  // ---- MÉTRICAS GLOBALES ----
  let y = 44;
  const totalUsuarios = users.length;
  const activos = users.filter(u => u.is_active).length;
  const inactivos = totalUsuarios - activos;
  const infinitos = users.filter(u => u.perfil?.consultas_infinitas).length;
  const totalConsumidas = users.reduce((acc, u) => acc + (u.perfil?.consultas_consumidas ?? 0), 0);
  const totalDisponibles = users.reduce((acc, u) => {
    if (u.perfil?.consultas_infinitas) return acc;
    return acc + (u.perfil?.consultas_disponibles ?? 0);
  }, 0);

  const metricas = [
    { label: "USUARIOS TOTALES", value: totalUsuarios, color: C.accent },
    { label: "ACTIVOS", value: activos, color: [34, 197, 94] },
    { label: "INACTIVOS", value: inactivos, color: [239, 68, 68] },
    { label: "PLAN ILIMITADO", value: infinitos, color: [168, 85, 247] },
    { label: "CONSULTAS CONSUMIDAS", value: totalConsumidas, color: [234, 179, 8] },
    { label: "CONSULTAS DISPONIBLES", value: totalDisponibles, color: [34, 211, 238] },
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

    // Barra de color izquierda
    doc.setFillColor(...m.color);
    doc.roundedRect(cx, cy, 3, cardH, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...m.color);
    doc.text(String(m.value), cx + cardW / 2 + 1, cy + 11, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.textMuted);
    doc.text(m.label, cx + cardW / 2 + 1, cy + 18, { align: "center" });
  });

  // ---- DISTRIBUCIÓN POR PLANES ----
  y += 58;
  sectionTitle(doc, "Distribución por plan", y, C, F);
  y += 9;

  const planCount = {};
  users.forEach(u => {
    (u.perfil?.planes || []).forEach(p => {
      const nombre = capitalize(p.nombre);
      planCount[nombre] = (planCount[nombre] || 0) + 1;
    });
  });

  const planEntries = Object.entries(planCount).sort((a, b) => b[1] - a[1]);
  const maxPlan = planEntries[0]?.[1] || 1;
  const barMaxW = 120;

  planEntries.forEach(([nombre, count], i) => {
    const barW = Math.max((count / maxPlan) * barMaxW, 2);
    const ry = y + i * 11;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.textPrimary);
    doc.text(nombre, 15, ry + 4);

    doc.setFillColor(30, 41, 59);
    doc.roundedRect(60, ry, barMaxW, 6, 2, 2, "F");

    doc.setFillColor(...C.accent);
    doc.roundedRect(60, ry, barW, 6, 2, 2, "F");

    doc.setFontSize(8);
    doc.setTextColor(...C.textMuted);
    doc.text(`${count} usuario${count !== 1 ? "s" : ""}`, 185, ry + 5, { align: "right" });
  });

  y += planEntries.length * 11 + 6;

  // ---- ESTADO GENERAL ----
  sectionTitle(doc, "Estado del sistema", y, C, F);
  y += 9;

  const tasaActividad = totalUsuarios > 0 ? Math.round((activos / totalUsuarios) * 100) : 0;

  doc.setFontSize(9);
  doc.setTextColor(...C.textPrimary);
  doc.text(`Tasa de actividad: ${tasaActividad}%`, 15, y);

  doc.setFillColor(30, 41, 59);
  doc.roundedRect(15, y + 3, 150, 5, 2, 2, "F");
  doc.setFillColor(...C.accent);
  doc.roundedRect(15, y + 3, (tasaActividad / 100) * 150, 5, 2, 2, "F");

  y += 16;
  doc.setFontSize(8);
  doc.setTextColor(...C.textMuted);
  const conPlan = users.filter(u => u.perfil?.planes?.length > 0);
  const sinPlan = users.filter(u => !u.perfil?.planes?.length);
  const usuariosInactivos = users.filter(u => !u.is_active);

  doc.text(`• Usuarios con plan asignado: ${conPlan.length} de ${totalUsuarios}`, 15, y);
  y += 5;
  conPlan.forEach(u => {
    if (y > 268) return;
    const nombre = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
    const planes = (u.perfil?.planes || []).map(p => capitalize(p.nombre)).join(", ");
    doc.setTextColor(...C.textPrimary);
    doc.text(`    – ${truncate(nombre, 22)}`, 15, y);
    doc.setTextColor(...C.accent);
    // Sin truncar — usar doc.splitTextToSize para líneas largas
    const planesLines = doc.splitTextToSize(planes, 110);
    doc.text(planesLines[0], 70, y);
    if (planesLines.length > 1) {
      y += 4;
      doc.text(planesLines[1], 70, y);
    }
    y += 5;
  });

  y += 2;
  doc.setTextColor(...C.textMuted);
  doc.text(`• Usuarios sin plan: ${sinPlan.length}`, 15, y);
  y += 5;
  sinPlan.forEach(u => {
    if (y > 270) return;
    const nombre = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
    doc.setTextColor(...C.textPrimary);
    doc.text(`    – ${nombre}`, 15, y);
    doc.setTextColor(239, 68, 68);
    doc.text("Sin plan", 70, y);
    y += 5;
  });

  y += 2;
  doc.setTextColor(...C.textMuted);
  doc.text(`• Usuarios inactivos: ${usuariosInactivos.length}`, 15, y);
  y += 5;
  usuariosInactivos.forEach(u => {
    if (y > 270) return;
    const nombre = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
    const planes = (u.perfil?.planes || []).map(p => capitalize(p.nombre)).join(", ") || "Sin plan";
    doc.setTextColor(...C.textPrimary);
    doc.text(`    – ${truncate(nombre, 22)}`, 15, y);
    doc.setTextColor(239, 68, 68);
    doc.text("Inactivo", 70, y);
    doc.setTextColor(...C.textMuted);
    doc.text(`  ·  ${truncate(planes, 30)}`, 90, y);
    y += 5;
  });

  y += 2;
  doc.setTextColor(...C.textMuted);
  doc.text(`• Usuarios staff/admin: ${users.filter(u => u.is_staff).length}`, 15, y);

  // Footer página 1
  renderFooter(doc, C, F, 1);

  /* ======================================================
     PÁGINA 2 — TABLA DE USUARIOS
  ====================================================== */
  doc.addPage();
  doc.setFillColor(...C.background);
  doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");

  // Mini header
  doc.setFillColor(...C.header);
  doc.rect(0, 0, L.pageWidth, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Listado completo de usuarios", 15, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(186, 230, 253);
  doc.text(fechaHoy, 195, 10, { align: "right" });

  // Encabezado de tabla
  y = 24;
  const cols2 = [
    { label: "#", x: 12, w: 8 },
    { label: "Usuario", x: 20, w: 30 },
    { label: "Nombre completo", x: 50, w: 45 },
    { label: "Email", x: 95, w: 50 },
    { label: "Plan(es)", x: 145, w: 35 },
    { label: "Consultas", x: 180, w: 22 },
  ];

  doc.setFillColor(...C.accent);
  doc.rect(10, y - 5, 190, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  cols2.forEach(c => doc.text(c.label, c.x, y - 0.5));

  y += 5;
  let pageNum = 2;

  users.forEach((u, i) => {
    // Nueva página si se acaba el espacio
    if (y > 272) {
      renderFooter(doc, C, F, pageNum);
      doc.addPage();
      pageNum++;
      doc.setFillColor(...C.background);
      doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");

      doc.setFillColor(...C.header);
      doc.rect(0, 0, L.pageWidth, 16, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("Listado completo de usuarios (cont.)", 15, 10);

      y = 24;
      doc.setFillColor(...C.accent);
      doc.rect(10, y - 5, 190, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      cols2.forEach(c => doc.text(c.label, c.x, y - 0.5));
      y += 5;
    }

    // Fila alternada
    if (i % 2 === 0) {
      doc.setFillColor(23, 33, 51);
      doc.rect(10, y - 4, 190, 8, "F");
    }

    const planes = (u.perfil?.planes || []).map(p => capitalize(p.nombre)).join(", ") || "Sin plan";
    const consultasText = u.perfil?.consultas_infinitas
      ? "Ilimitadas"
      : `${u.perfil?.consultas_disponibles ?? 0} disp.`;
    const nombre = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    // Color según estado
    const textColor = u.is_active ? C.textPrimary : [100, 116, 139];
    doc.setTextColor(...textColor);

    doc.text(String(i + 1), 12, y);
    doc.text(truncate(u.username || "—", 18), 20, y);
    doc.text(truncate(nombre, 26), 50, y);
    doc.text(truncate(u.email || "—", 30), 95, y);
    doc.text(truncate(planes, 20), 145, y);

    // Consultas con color
    if (u.perfil?.consultas_infinitas) {
      doc.setTextColor(168, 85, 247);
    } else if ((u.perfil?.consultas_disponibles ?? 0) === 0 && !u.perfil?.consultas_infinitas) {
      doc.setTextColor(...C.danger);
    } else {
      doc.setTextColor(...C.success);
    }
    doc.text(consultasText, 180, y);

    // Indicador activo/inactivo
    doc.setFillColor(...(u.is_active ? [34, 197, 94] : [239, 68, 68]));
    doc.circle(204, y - 1.5, 1.5, "F");

    y += 9;
  });

  renderFooter(doc, C, F, pageNum);

  /* ======================================================
     PÁGINAS SIGUIENTES — DESGLOSE POR USUARIO
  ====================================================== */
  users.forEach((u) => {
    const recargas = u.perfil?.historial_recargas || [];
    const consumos = u.perfil?.historial_consumos || [];

    pageNum++;
    doc.addPage();
    doc.setFillColor(...C.background);
    doc.rect(0, 0, L.pageWidth, L.pageHeight, "F");

    // Mini header con nombre del usuario
    doc.setFillColor(...C.header);
    doc.rect(0, 0, L.pageWidth, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const nombreUsuario = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username;
    doc.text(`Desglose: ${nombreUsuario}`, 15, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(186, 230, 253);
    doc.text(u.email || "", 195, 10, { align: "right" });

    let uy = 24;

    // Tarjetas resumen del usuario
    const uInfinitas = u.perfil?.consultas_infinitas;
    const uCargadas = uInfinitas ? "Ilimitado" : String(u.perfil?.consultas_cargadas_total ?? 0);
    const uConsumidas = String(u.perfil?.consultas_consumidas ?? 0);
    const uDisponibles = uInfinitas ? "Ilimitado" : String(u.perfil?.consultas_disponibles ?? 0);
    const uNumPlanes = (u.perfil?.planes || []).length;

    const uMetricas = [
      { label: "CARGADAS", value: uCargadas, color: uInfinitas ? [168, 85, 247] : C.accent },
      { label: "CONSUMIDAS", value: uConsumidas, color: [234, 179, 8] },
      { label: "DISPONIBLES", value: uDisponibles, color: uInfinitas ? [168, 85, 247] : [34, 197, 94] },
      { label: "PLANES ACTIVOS", value: String(uNumPlanes), color: C.accent },
    ];

    const uCardW = 44;
    const uCardH = 18;
    uMetricas.forEach((m, i) => {
      const cx = 12 + i * (uCardW + 4);
      doc.setFillColor(...C.card);
      doc.roundedRect(cx, uy, uCardW, uCardH, 3, 3, "F");
      doc.setFillColor(...m.color);
      doc.roundedRect(cx, uy, 2.5, uCardH, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...m.color);
      doc.text(truncate(m.value, 14), cx + uCardW / 2 + 1, uy + 9, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...C.textMuted);
      doc.text(m.label, cx + uCardW / 2 + 1, uy + 15, { align: "center" });
    });

    uy += 26;

    // ---- HISTORIAL DE RECARGAS ----
    sectionTitle(doc, "Historial de consultas cargadas", uy, C, F);
    uy += 8;

    if (recargas.length) {
      // Encabezado tabla recargas
      doc.setFillColor(...C.accent);
      doc.rect(12, uy - 4, 186, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text("Fecha", 14, uy);
      doc.text("Cantidad cargada", 65, uy);
      doc.text("Saldo antes", 110, uy);
      doc.text("Saldo después", 145, uy);
      doc.text("Tipo", 182, uy);
      uy += 6;

      recargas.forEach((r, i) => {
        if (uy > 272) return; // evitar overflow
        if (i % 2 === 0) {
          doc.setFillColor(23, 33, 51);
          doc.rect(12, uy - 4, 186, 7, "F");
        }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...C.textPrimary);
        const fecha = new Date(r.fecha_recarga).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
        const hora = new Date(r.fecha_recarga).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
        doc.text(`${fecha}  ${hora}`, 14, uy);
        doc.setTextColor(34, 197, 94);
        doc.text(`+${r.cantidad}`, 65, uy);
        doc.setTextColor(...C.textMuted);
        doc.text(String(r.saldo_antes), 110, uy);
        doc.text(String(r.saldo_despues), 145, uy);
        doc.setTextColor(...C.accent);
        doc.text(capitalize(r.tipo || "—"), 182, uy);
        uy += 8;
      });
    } else {
      doc.setFontSize(8);
      doc.setTextColor(...C.textMuted);
      doc.text("Sin recargas registradas.", 14, uy);
      uy += 8;
    }

    uy += 6;

    // ---- HISTORIAL DE CONSUMOS ----
    if (uy < 260) {
      sectionTitle(doc, "Historial de consultas consumidas", uy, C, F);
      uy += 8;

      if (consumos.length) {
        // Encabezado tabla consumos
        doc.setFillColor(234, 179, 8);
        doc.rect(12, uy - 4, 186, 6, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(255, 255, 255);
        doc.text("Fecha y hora", 14, uy);
        doc.text("Consultas descontadas", 65, uy);
        doc.text("Saldo antes", 120, uy);
        doc.text("Saldo después", 158, uy);
        uy += 6;

        consumos.forEach((c, i) => {
          if (uy > 272) return;
          if (i % 2 === 0) {
            doc.setFillColor(23, 33, 51);
            doc.rect(12, uy - 4, 186, 7, "F");
          }
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(...C.textPrimary);
          const fecha = new Date(c.fecha_consumo).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
          const hora = new Date(c.fecha_consumo).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
          doc.text(`${fecha}  ${hora}`, 14, uy);
          doc.setTextColor(239, 68, 68);
          doc.text(`-${c.cantidad}`, 65, uy);
          doc.setTextColor(...C.textMuted);
          doc.text(String(c.saldo_antes), 120, uy);
          doc.text(String(c.saldo_despues), 158, uy);
          uy += 8;
        });
      } else {
        doc.setFontSize(8);
        doc.setTextColor(...C.textMuted);
        doc.text("Sin consumos registrados.", 14, uy);
      }
    }

    renderFooter(doc, C, F, pageNum);
  });

  doc.save(`Informe_Admin_Usuarios_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ======================================================
   HELPERS
====================================================== */

function sectionTitle(doc, title, y, C, F) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(F.section);
  doc.setTextColor(...C.accent);
  doc.text(title, 15, y);
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.5);
  doc.line(15, y + 2, 195, y + 2);
}

function renderFooter(doc, C, F, pageNum) {
  doc.setFillColor(...C.footerBg);
  doc.rect(0, 282, 210, 15, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(F.small);
  doc.setTextColor(...C.footerText);
  doc.text("Documento confidencial · Econfia — Uso restringido a administradores autorizados.", 15, 289);
  doc.text(`Página ${pageNum}`, 195, 289, { align: "right" });
}

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function truncate(text, max) {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}
