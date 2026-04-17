import jsPDF from "jspdf";
import logoEconfia from "../assets/logo-econfia (1).png";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 282;

const C = {
  navy: [2, 8, 24],
  navy2: [5, 18, 41],
  deep: [1, 6, 22],
  headerGreen: [10, 143, 64],
  headerDark: [7, 33, 52],
  footerBlue: [8, 39, 124],
  brandStart: [12, 146, 83],
  brandMid: [8, 97, 112],
  brandEnd: [5, 20, 44],
  bgTop: [1, 12, 34],
  bgMid: [2, 22, 49],
  bgBottom: [2, 6, 23],
  panelStart: [12, 36, 75],
  panelEnd: [6, 20, 48],
  footerStart: [7, 47, 137],
  footerEnd: [8, 22, 77],
  panel: [8, 25, 55],
  panel2: [10, 30, 64],
  glass: [12, 35, 73],
  card: [7, 22, 51],
  line: [34, 67, 112],
  softLine: [27, 57, 103],
  text: [240, 249, 255],
  muted: [184, 208, 236],
  white: [255, 255, 255],
  frost: [219, 234, 254],
  sky: [147, 197, 253],
  cyan: [125, 211, 252],
  blue: [59, 130, 246],
  emerald: [34, 197, 94],
  amber: [245, 158, 11],
  red: [248, 113, 113],
  violet: [167, 139, 250],
  pink: [244, 114, 182],
};

export async function generarInformeEmpresaPDF(resultadoEmpresa) {
  if (!resultadoEmpresa) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const ctx = {
    doc,
    page: 1,
    y: 45,
    empresa: resultadoEmpresa,
    section: 0,
  };

  drawShell(ctx, "Informe empresarial");
  drawCover(ctx);
  drawExecutiveRead(ctx);
  drawGeneralInfo(ctx);
  drawActivities(ctx);
  drawCamaraAfiliados(ctx);
  drawDianProviders(ctx);
  drawRepresentante(ctx);
  drawEstablecimientos(ctx);
  drawHistoria(ctx);
  drawClosingNote(ctx);

  const name = slug(resultadoEmpresa.nombre || resultadoEmpresa.nit || "empresa");
  doc.save(`Informe_Empresa_${name}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function drawCover(ctx) {
  const { doc, empresa } = ctx;
  const resumen = empresa.empresa_resumen || {};
  const metricas = resumen.metricas || {};
  const perfil = resumen.perfil || {};
  const proveedores = empresa.proveedores_ficticios_dian || {};
  const alertaDian = !!proveedores.aparece;

  const nombre = String(empresa.nombre || "Empresa consultada").toUpperCase();
  const estado = empresa.estado || perfil.estado_matricula || "No disponible";
  const actividad = resumen.actividad_principal || {};

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.text);
  drawCenteredSpacedText(doc, nombre, PAGE_W / 2, 56, CONTENT_W - 8);

  doc.setDrawColor(...C.line);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 18, 63, PAGE_W - MARGIN - 18, 63);

  const infoY = 80;
  const accent = alertaDian ? C.amber : C.emerald;

  doc.setDrawColor(...accent);
  doc.setLineWidth(1.8);
  doc.circle(MARGIN + 22, infoY + 23, 13, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...accent);
  doc.text(alertaDian ? "!" : "1", MARGIN + 22, infoY + 27, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("NIVEL EMPRESA", MARGIN + 22, infoY + 44, { align: "center" });
  drawStatusBadge(doc, MARGIN + 11, infoY + 49, alertaDian ? "REVISION" : "BAJO", accent, 22);

  doc.setDrawColor(...accent);
  doc.setLineWidth(2);
  doc.circle(PAGE_W / 2, infoY + 25, 26, "S");
  drawGradientCircle(doc, PAGE_W / 2, infoY + 25, 22, [2, 22, 30], [7, 73, 36], 18);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...accent);
  doc.text("ECONFIA", PAGE_W / 2, infoY + 22, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("EMPRESAS", PAGE_W / 2, infoY + 30, { align: "center" });

  const rightX = PAGE_W - MARGIN - 58;
  drawFactLine(doc, rightX, infoY + 2, "NIT", empresa.nit || "No disponible");
  drawFactLine(doc, rightX, infoY + 10, "Camara", empresa.camara_comercio || "No disponible");
  drawFactLine(doc, rightX, infoY + 18, "Matricula", empresa.matricula || "No disponible");
  drawFactLine(doc, rightX, infoY + 26, "Estado", estado);
  drawFactLine(doc, rightX, infoY + 34, "Actividades", metricas.total_actividades ?? 0);
  drawFactLine(doc, rightX, infoY + 42, "DIAN", alertaDian ? "Con alerta" : "Sin alerta");

  drawMetricGrid(ctx, [
    ["Estado matricula", estado, accent],
    ["Ano matricula", metricas.anio_fundacion || "Sin dato", C.sky],
    ["Antiguedad", metricas.antiguedad_anos != null ? `${metricas.antiguedad_anos} anos` : "Sin dato", C.sky],
    ["Actividad", actividad.codigo || "Sin codigo", C.sky],
  ], 145);

  drawRiskPanel(ctx, alertaDian);

  sectionTitle(ctx, "Actividad principal", C.sky);
  paragraph(
    ctx,
    `${actividad.codigo || "Sin codigo"} - ${actividad.descripcion || "No hay actividad principal disponible en la respuesta."}`,
    { box: true }
  );

  sectionTitle(ctx, "Resumen ejecutivo", C.emerald);
  const dianText = alertaDian
    ? "La empresa registra coincidencia en el listado de proveedores ficticios DIAN consultado. Este hallazgo requiere revision tributaria y documental antes de continuar cualquier relacion comercial."
    : "La empresa no registra coincidencia en el listado de proveedores ficticios DIAN consultado. La validacion no reemplaza verificaciones periodicas ni revision documental interna.";
  paragraph(
    ctx,
    `Este informe consolida la informacion mercantil disponible en RUES, la actividad economica, representacion legal, establecimientos y validacion DIAN. ${dianText}`,
    { box: true }
  );
}

function drawExecutiveRead(ctx) {
  const { empresa } = ctx;
  const proveedores = empresa.proveedores_ficticios_dian || {};
  sectionTitle(ctx, "Como interpretar este informe", C.violet);

  const bullets = [
    "Informacion general: identifica estado mercantil, matricula, camara de comercio y fechas de renovacion.",
    "Actividades economicas: describe los codigos CIIU reportados en RUES y ayuda a validar coherencia operativa.",
    "Representante legal: muestra los cargos, nombres e identificaciones extraidos del texto registral.",
    "Proveedores ficticios DIAN: senala si el NIT aparece en el listado consultado y muestra resolucion, publicacion y articulo cuando aplica.",
  ];

  if (proveedores.aparece) {
    bullets.unshift("Alerta prioritaria: existe coincidencia DIAN, por lo que se recomienda revision fiscal antes de aprobar operaciones.");
  }

  bulletList(ctx, bullets, C.violet);
}

function drawGeneralInfo(ctx) {
  const entries = Object.entries(ctx.empresa.informacion_general || {});
  sectionTitle(ctx, "Informacion general RUES", C.sky);
  if (!entries.length) {
    paragraph(ctx, "No hay informacion general disponible.", { box: true });
    return;
  }
  keyValueGrid(ctx, entries);
}

function drawActivities(ctx) {
  const actividades = ctx.empresa.actividad_economica || [];
  sectionTitle(ctx, "Actividades economicas", C.emerald);
  if (!actividades.length) {
    paragraph(ctx, "No hay actividades economicas disponibles.", { box: true });
    return;
  }

  actividades.forEach((item, index) => {
    card(ctx, `${index === 0 ? "Principal" : `Actividad ${index + 1}`} | ${item.codigo || "Sin codigo"}`, item.descripcion || "Sin descripcion", C.emerald);
  });
}

function drawCamaraAfiliados(ctx) {
  const data = ctx.empresa.camara_comercio_afiliados || {};
  const registros = data.registros || [];
  sectionTitle(ctx, "Afiliados Camara de Comercio", data.aparece ? C.sky : C.violet);
  paragraph(ctx, data.mensaje || "Validacion de afiliados Camara no disponible.", { box: true, accent: data.aparece ? C.sky : C.violet });

  registros.forEach((item, index) => {
    sectionTitle(ctx, `Registro Camara ${index + 1}`, C.sky, 10);
    keyValueGrid(ctx, [
      ["NIT", item.nit],
      ["Razon social", item.razon_social],
      ["Matricula mercantil", item.matricula_mercantil],
      ["Tipo organizacion", item.tipo_organizacion],
      ["Representante legal", item.perfil?.representante_legal],
      ["Fecha afiliacion", item.perfil?.fecha_afiliacion],
      ["Fecha renovacion", item.perfil?.fecha_renovacion],
      ["Direccion", item.contacto?.direccion],
      ["Ciudad", item.contacto?.ciudad],
      ["Correo comercial", item.contacto?.correo_comercial],
      ["Ingresos actividad ordinaria", item.financiero?.ingresos_actividad_ordinaria],
      ["Patrimonio", item.financiero?.patrimonio],
      ["Utilidad neta", item.financiero?.utilidad_neta],
      ["Personal ocupado", item.financiero?.personas_ocupadas],
    ]);

    if ((item.actividades || []).length) {
      sectionTitle(ctx, "Actividades registradas en Camara", C.emerald, 9);
      (item.actividades || []).forEach((actividad, actividadIndex) => {
        card(
          ctx,
          `${actividadIndex === 0 ? "Principal" : `Actividad ${actividadIndex + 1}`} | ${actividad.codigo || "Sin codigo"}`,
          actividad.descripcion || "Sin descripcion",
          C.emerald
        );
      });
    }
  });
}

function drawDianProviders(ctx) {
  const proveedores = ctx.empresa.proveedores_ficticios_dian || {};
  const registros = proveedores.registros || [];
  const accent = proveedores.aparece ? C.amber : C.emerald;

  sectionTitle(ctx, "Validacion proveedores ficticios DIAN", accent);
  paragraph(ctx, proveedores.mensaje || "Validacion DIAN no disponible.", { box: true, accent });

  if (proveedores.fundamento) paragraph(ctx, `Fundamento: ${proveedores.fundamento}`);
  if (proveedores.recomendacion) paragraph(ctx, `Recomendacion: ${proveedores.recomendacion}`);

  if (proveedores.aparece) {
    sectionTitle(ctx, "Por que es relevante", C.red, 10);
    bulletList(ctx, [
      "Los costos, gastos o IVA descontable asociados a estos proveedores pueden ser rechazados fiscalmente.",
      "El adquiriente puede quedar expuesto a auditorias, requerimientos y revision de soportes tributarios.",
      "La coincidencia exige validar facturas, capacidad operativa, trazabilidad del servicio y sustancia economica.",
    ], C.red);
  }

  registros.forEach((item, index) => {
    sectionTitle(ctx, `Registro DIAN ${index + 1}`, C.amber, 10);
    keyValueGrid(ctx, [
      ["NIT", item.nit],
      ["Razon social", item.nombre_razon_social],
      ["Ano", item.anio],
      ["Resolucion", item.numero_resolucion],
      ["Fecha resolucion", item.fecha_resolucion],
      ["Publicacion", item.medio_publicacion],
      ["Articulo", item.articulo],
      ["Direccion seccional", item.direccion_seccional],
    ]);
  });
}

function drawRepresentante(ctx) {
  const representante = ctx.empresa.representante_legal || {};
  const registros = representante.registros || [];
  sectionTitle(ctx, "Representante legal", C.sky);

  if (!registros.length && !representante.mensaje) {
    paragraph(ctx, "Informacion no disponible.", { box: true });
    return;
  }

  registros.forEach((item) => {
    card(
      ctx,
      item.cargo || item.etiqueta || "Cargo",
      `${item.nombre || item.valor || "No disponible"}${item.identificacion ? ` | ${item.identificacion}` : ""}`,
      C.sky
    );
  });

  if (representante.mensaje) {
    sectionTitle(ctx, "Texto registral", C.muted, 9);
    paragraph(ctx, representante.mensaje, { box: true, maxLines: 20 });
  }
}

function drawEstablecimientos(ctx) {
  const data = ctx.empresa.propietario_establecimiento || {};
  const registros = data.registros || [];
  sectionTitle(ctx, "Propietario / Establecimientos", C.amber);

  if (!registros.length) {
    paragraph(ctx, data.mensaje || "No hay informacion de establecimientos disponible.", { box: true, accent: C.amber });
    return;
  }

  registros.forEach((item, index) => {
    sectionTitle(ctx, item.titulo || `Establecimiento ${index + 1}`, C.amber, 10);
    keyValueGrid(ctx, Object.entries(item.campos || {}));
  });
}

function drawHistoria(ctx) {
  const historia = ctx.empresa.empresa_resumen?.historia_empresarial || [];
  sectionTitle(ctx, "Historia registral", C.violet);

  if (!historia.length) {
    paragraph(ctx, "No hay historia registral disponible.", { box: true });
    return;
  }

  historia.forEach((item) => {
    card(ctx, item.titulo, `${item.valor || "Sin dato"} | ${item.detalle || "Sin detalle"}`, C.violet);
  });
}

function drawClosingNote(ctx) {
  sectionTitle(ctx, "Nota de uso", C.blue);
  paragraph(
    ctx,
    "Este documento organiza informacion obtenida de fuentes consultadas y registros disponibles para apoyar procesos internos de validacion. No reemplaza certificados oficiales, conceptos tributarios ni analisis legal especializado.",
    { box: true }
  );
}

function drawShell(ctx, label) {
  const { doc } = ctx;
  drawPageBackground(doc);

  drawGradientRect(doc, 0, 0, PAGE_W, 39, C.brandStart, C.brandEnd, 36, "horizontal");
  doc.setFillColor(5, 18, 41);
  doc.rect(PAGE_W - 45, 0, 45, 39, "F");
  doc.setDrawColor(89, 209, 170);
  doc.setLineWidth(0.35);
  doc.line(0, 38.6, PAGE_W, 38.6);

  drawLogoPlate(doc, MARGIN + 6, 8, 33, 17);

  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  drawCenteredSpacedText(doc, label.toUpperCase(), PAGE_W / 2, 16, 78);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...C.frost);
  doc.text("RUES / Validacion comercial / Debida diligencia", PAGE_W / 2, 22, { align: "center" });

  drawQrLikeBox(doc, PAGE_W - MARGIN - 20, 6, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.6);
  doc.setTextColor(...C.frost);
  doc.text(formatDateShort(), PAGE_W - MARGIN - 11.5, 29, { align: "center" });

  drawFooter(ctx);
}

function drawPageBackground(doc) {
  drawGradientRect(doc, 0, 0, PAGE_W, 155, C.bgTop, C.bgMid, 34, "vertical");
  drawGradientRect(doc, 0, 155, PAGE_W, PAGE_H - 155, C.bgMid, C.bgBottom, 34, "vertical");
}

function drawFooter(ctx) {
  const { doc, page } = ctx;
  drawGradientRect(doc, 0, FOOTER_Y - 2, PAGE_W, 19, C.footerStart, C.footerEnd, 28, "horizontal");
  doc.setDrawColor(...C.softLine);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, FOOTER_Y + 13.2, PAGE_W - MARGIN, FOOTER_Y + 13.2);

  drawQrLikeBox(doc, MARGIN, FOOTER_Y + 1, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...C.frost);
  doc.text(`Fecha de generacion: ${formatDateShort()}`, MARGIN + 62, FOOTER_Y + 5);
  doc.text("Tipo de reporte: Informe Empresarial", MARGIN + 62, FOOTER_Y + 10);
  doc.text(`Documento: ${ctx.empresa.nit || "No disponible"}`, PAGE_W - MARGIN - 58, FOOTER_Y + 5);
  doc.text(`Pagina: ${page}`, PAGE_W - MARGIN - 58, FOOTER_Y + 10);
  doc.setFontSize(5.2);
  doc.setTextColor(191, 219, 254);
  doc.text("Aviso Legal: Los resultados son obtenidos a partir de fuentes publicas y externas. El uso e interpretacion de este reporte es responsabilidad exclusiva del usuario.", PAGE_W / 2, FOOTER_Y + 16.5, { align: "center" });
}

function ensureSpace(ctx, height) {
  if (ctx.y + height <= FOOTER_Y - 5) return;
  ctx.doc.addPage();
  ctx.page += 1;
  ctx.y = 45;
  drawShell(ctx, "Informe empresarial");
}

function sectionTitle(ctx, title, color = C.sky, size = 12) {
  ensureSpace(ctx, 12);
  const { doc } = ctx;
  ctx.section += 1;
  drawGradientRect(doc, MARGIN, ctx.y - 6, CONTENT_W, 14, C.panelStart, C.panelEnd, 14, "horizontal");
  doc.setDrawColor(...C.softLine);
  doc.setLineWidth(0.16);
  doc.roundedRect(MARGIN, ctx.y - 6, CONTENT_W, 14, 4, 4, "S");
  doc.setTextColor(...C.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(String(ctx.section).padStart(2, "0"), MARGIN + 8, ctx.y + 1.3, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, title, MARGIN + 16, ctx.y + 1.3, CONTENT_W - 20);
  ctx.y += 16;
}

function paragraph(ctx, text, options = {}) {
  const { doc } = ctx;
  const box = !!options.box;
  const maxLines = options.maxLines || 999;
  const lines = doc.splitTextToSize(String(text || "No disponible"), box ? CONTENT_W - 14 : CONTENT_W);
  const visibleLines = lines.slice(0, maxLines);
  const height = visibleLines.length * 4.6 + (box ? 10 : 2);
  ensureSpace(ctx, height + 2);

  if (box) {
    drawGradientRect(doc, MARGIN, ctx.y, CONTENT_W, height, C.panelStart, C.panelEnd, 18, "vertical");
    doc.setDrawColor(...C.softLine);
    doc.setLineWidth(0.16);
    doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 6, 6, "S");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(...C.text);
  doc.text(visibleLines, box ? MARGIN + 8 : MARGIN, ctx.y + (box ? 7 : 1));

  if (lines.length > maxLines) {
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text("Texto completo disponible en la ficha consultada.", MARGIN + 8, ctx.y + height - 3);
  }

  ctx.y += height + 5;
}

function bulletList(ctx, items, color) {
  items.forEach((item, index) => {
    const { doc } = ctx;
    const lines = doc.splitTextToSize(String(item), CONTENT_W - 12);
    const height = Math.max(13, lines.length * 4.5 + 7);
    ensureSpace(ctx, height);
    drawGradientRect(doc, MARGIN, ctx.y, CONTENT_W, height, C.panelStart, C.panelEnd, 14, "horizontal");
    doc.setDrawColor(...C.softLine);
    doc.setLineWidth(0.16);
    doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 5, 5, "S");
    doc.setFillColor(...C.glass);
    doc.roundedRect(MARGIN + 5, ctx.y + 4, 8, 8, 2, 2, "F");
    doc.setTextColor(...C.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(String(index + 1), MARGIN + 9, ctx.y + 9.2, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(...C.text);
    doc.text(lines, MARGIN + 15, ctx.y + 6.8);
    ctx.y += height + 3;
  });
}

function keyValueGrid(ctx, entries) {
  const clean = entries.filter(([label]) => label);
  const colW = (CONTENT_W - 5) / 2;
  const rowH = 17;

  for (let i = 0; i < clean.length; i += 2) {
    ensureSpace(ctx, rowH + 2);
    drawKvCell(ctx, clean[i][0], clean[i][1], MARGIN, ctx.y, colW);
    if (clean[i + 1]) drawKvCell(ctx, clean[i + 1][0], clean[i + 1][1], MARGIN + colW + 5, ctx.y, colW);
    ctx.y += rowH + 4;
  }
}

function drawKvCell(ctx, label, value, x, y, w) {
  const { doc } = ctx;
  drawGradientRect(doc, x, y, w, 17, C.panelStart, C.panelEnd, 10, "horizontal");
  doc.setDrawColor(...C.softLine);
  doc.setLineWidth(0.16);
  doc.roundedRect(x, y, w, 17, 4, 4, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...C.muted);
  drawSingleLine(doc, String(label || "Dato").toUpperCase(), x + 5, y + 5.5, w - 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, String(value || "No disponible"), x + 5, y + 12.2, w - 9);
}

function card(ctx, title, body, color) {
  const { doc } = ctx;
  const bodyLines = doc.splitTextToSize(String(body || "No disponible"), CONTENT_W - 28);
  const height = Math.max(20, bodyLines.length * 4.4 + 14);
  ensureSpace(ctx, height + 2);

  drawGradientRect(doc, MARGIN, ctx.y, CONTENT_W, height, C.panelStart, C.panelEnd, 18, "horizontal");
  doc.setDrawColor(...C.softLine);
  doc.setLineWidth(0.16);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 6, 6, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, title || "Registro", MARGIN + 7, ctx.y + 8, CONTENT_W - 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(bodyLines, MARGIN + 7, ctx.y + 14);

  ctx.y += height + 4;
}

function drawMetricGrid(ctx, metrics, startY) {
  const { doc } = ctx;
  const boxW = (CONTENT_W - 9) / 4;
  ctx.y = startY;

  metrics.forEach(([label, value], index) => {
    const x = MARGIN + index * (boxW + 3);
    drawGradientRect(doc, x, ctx.y, boxW, 31, C.panelStart, C.panelEnd, 12, "vertical");
    doc.setDrawColor(...C.softLine);
    doc.setLineWidth(0.16);
    doc.roundedRect(x, ctx.y, boxW, 31, 6, 6, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...C.text);
    drawSingleLine(doc, value, x + 6, ctx.y + 13, boxW - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...C.muted);
    drawSingleLine(doc, label.toUpperCase(), x + 6, ctx.y + 24, boxW - 12);
  });

  ctx.y += 40;
}

function drawRiskPanel(ctx, alertaDian) {
  const { doc } = ctx;
  ensureSpace(ctx, 32);
  const title = alertaDian ? "Coincidencia tributaria sensible" : "Sin coincidencia DIAN en proveedor ficticio";
  const body = alertaDian
    ? "Prioridad alta: revisar soportes fiscales, autorizaciones, facturas y trazabilidad comercial antes de aprobar operaciones."
    : "Lectura favorable: no se encontraron coincidencias en el listado consultado. Mantener verificacion periodica y debida diligencia documental.";

  drawGradientRect(doc, MARGIN, ctx.y, CONTENT_W, 30, C.panelStart, C.panelEnd, 18, "horizontal");
  doc.setDrawColor(...(alertaDian ? C.amber : C.softLine));
  doc.setLineWidth(0.18);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, 30, 7, 7, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...(alertaDian ? C.amber : C.text));
  drawSingleLine(doc, title, MARGIN + 8, ctx.y + 11, 125);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(doc.splitTextToSize(body, 140), MARGIN + 8, ctx.y + 18);

  ctx.y += 38;
}

function drawGradientRect(doc, x, y, w, h, from, to, steps = 18, direction = "horizontal") {
  const total = Math.max(2, steps);
  for (let i = 0; i < total; i += 1) {
    const t = total === 1 ? 0 : i / (total - 1);
    const color = mixColor(from, to, t);
    doc.setFillColor(...color);
    if (direction === "vertical") {
      const stepH = h / total + 0.15;
      doc.rect(x, y + (h / total) * i, w, stepH, "F");
    } else {
      const stepW = w / total + 0.15;
      doc.rect(x + (w / total) * i, y, stepW, h, "F");
    }
  }
}

function drawGradientCircle(doc, cx, cy, radius, outer, inner, steps = 18) {
  const total = Math.max(2, steps);
  for (let i = total; i >= 1; i -= 1) {
    const t = (total - i) / (total - 1);
    doc.setFillColor(...mixColor(outer, inner, t));
    doc.circle(cx, cy, (radius * i) / total, "F");
  }
}

function mixColor(from, to, t) {
  return from.map((channel, index) => Math.round(channel + (to[index] - channel) * t));
}

function drawStatusBadge(doc, x, y, text, color, width = 52) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, width, 8, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(...C.white);
  doc.text(text, x + width / 2, y + 5.5, { align: "center" });
}

function drawLogoPlate(doc, x, y, w, h) {
  try {
    const props = doc.getImageProperties(logoEconfia);
    const ratio = props.width / props.height;
    let logoW = w;
    let logoH = logoW / ratio;
    if (logoH > h) {
      logoH = h;
      logoW = logoH * ratio;
    }
    doc.addImage(logoEconfia, "PNG", x + (w - logoW) / 2, y + (h - logoH) / 2, logoW, logoH);
  } catch (error) {
    doc.setTextColor(...C.white);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("ECONFIA", x + w / 2, y + h / 2 + 2, { align: "center" });
  }
}

function drawQrLikeBox(doc, x, y, size) {
  doc.setFillColor(...C.white);
  doc.roundedRect(x, y, size, size, 1.4, 1.4, "F");
  doc.setFillColor(...C.navy);
  const cell = size / 7;
  const cells = [
    [1, 1], [2, 1], [5, 1], [1, 2], [3, 2], [5, 2],
    [1, 3], [2, 3], [4, 3], [6, 3], [3, 4], [5, 4],
    [1, 5], [4, 5], [5, 5], [2, 6], [6, 6],
  ];
  cells.forEach(([cx, cy]) => {
    doc.rect(x + cx * cell, y + cy * cell, cell * 0.78, cell * 0.78, "F");
  });
}

function drawFactLine(doc, x, y, label, value) {
  doc.setFont("times", "bold");
  doc.setFontSize(6.3);
  doc.setTextColor(...C.frost);
  doc.text(`${label}:`, x, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, String(value || "No disponible"), x + 22, y, 35);
}

function drawCenteredSpacedText(doc, text, centerX, y, maxW) {
  const spaced = String(text || "")
    .split("")
    .join(" ")
    .replace(/\s{3,}/g, "   ");
  let value = spaced;
  while (value.length > 3 && doc.getTextWidth(value) > maxW) {
    value = value.slice(0, -2).trim();
  }
  doc.text(value, centerX, y, { align: "center" });
}

function formatDateShort() {
  return new Date().toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function drawSingleLine(doc, text, x, y, maxW) {
  doc.text(truncate(doc, text, maxW), x, y);
}

function truncate(doc, text, maxW) {
  const safe = String(text ?? "No disponible");
  if (doc.getTextWidth(safe) <= maxW) return safe;
  let value = safe;
  while (value.length > 3 && doc.getTextWidth(`${value}...`) > maxW) {
    value = value.slice(0, -1);
  }
  return `${value}...`;
}

function slug(value) {
  return String(value || "empresa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}
