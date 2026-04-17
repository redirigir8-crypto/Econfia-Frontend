import jsPDF from "jspdf";
import logoEconfia from "../assets/logo-econfia.png";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_Y = 282;

const C = {
  navy: [2, 8, 24],
  navy2: [6, 18, 46],
  panel: [10, 27, 64],
  panel2: [17, 42, 92],
  glass: [20, 50, 110],
  line: [52, 92, 150],
  text: [235, 242, 250],
  muted: [140, 160, 188],
  white: [255, 255, 255],
  frost: [224, 244, 255],
  sky: [56, 189, 248],
  cyan: [34, 211, 238],
  blue: [59, 130, 246],
  emerald: [52, 211, 153],
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
    y: 22,
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

  doc.setFillColor(...C.panel);
  doc.roundedRect(MARGIN, 28, CONTENT_W, 62, 9, 9, "F");
  doc.setFillColor(...C.glass);
  doc.roundedRect(MARGIN + 4, 32, CONTENT_W - 8, 54, 8, 8, "F");
  doc.setFillColor(...C.cyan);
  doc.rect(MARGIN, 28, 4, 62, "F");
  doc.setFillColor(...C.violet);
  doc.circle(PAGE_W - MARGIN - 14, 40, 18, "F");
  doc.setFillColor(...C.blue);
  doc.circle(PAGE_W - MARGIN - 2, 76, 26, "F");

  drawLogoPlate(doc, MARGIN + 10, 40, 40, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...C.cyan);
  doc.text("FICHA INTELIGENTE DE EMPRESA", MARGIN + 58, 41);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, empresa.nombre || "Empresa consultada", MARGIN + 58, 52, 105);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.6);
  doc.setTextColor(...C.muted);
  doc.text(`NIT ${empresa.nit || "No disponible"}`, MARGIN + 58, 61);
  doc.text(`Camara ${empresa.camara_comercio || "No disponible"}  |  Matricula ${empresa.matricula || "No disponible"}`, MARGIN + 58, 68);
  doc.text(`Estado mercantil ${empresa.estado || perfil.estado_matricula || "No disponible"}`, MARGIN + 58, 75);

  drawStatusBadge(
    doc,
    PAGE_W - MARGIN - 58,
    35,
    alertaDian ? "ALERTA DIAN" : "VALIDADO DIAN",
    alertaDian ? C.amber : C.emerald
  );

  drawMetricGrid(ctx, [
    ["Estado matricula", empresa.estado || perfil.estado_matricula || "No disponible", C.emerald],
    ["Ano matricula", metricas.anio_fundacion || "Sin dato", C.sky],
    ["Antiguedad", metricas.antiguedad_anos != null ? `${metricas.antiguedad_anos} anos` : "Sin dato", C.violet],
    ["Actividades", metricas.total_actividades ?? 0, C.amber],
  ], 102);

  drawRiskPanel(ctx, alertaDian);

  const actividad = resumen.actividad_principal || {};
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
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  drawBackgroundPattern(doc);

  doc.setFillColor(...C.navy2);
  doc.roundedRect(8, 7, PAGE_W - 16, 13, 5, 5, "F");
  doc.setFillColor(...C.cyan);
  doc.rect(8, 19.2, PAGE_W - 16, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.text);
  doc.text(label, MARGIN, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Documento privado de uso interno", PAGE_W - MARGIN, 15, { align: "right" });

  drawFooter(ctx);
}

function drawBackgroundPattern(doc) {
  doc.setDrawColor(17, 48, 100);
  doc.setLineWidth(0.15);
  for (let x = 8; x < PAGE_W; x += 18) {
    doc.line(x, 26, x + 34, PAGE_H - 28);
  }

  doc.setFillColor(17, 42, 92);
  for (let i = 0; i < 42; i += 1) {
    const x = 10 + ((i * 37) % 190);
    const y = 30 + ((i * 53) % 235);
    doc.circle(x, y, i % 3 === 0 ? 0.55 : 0.28, "F");
  }

  doc.setFillColor(10, 32, 76);
  doc.circle(184, 58, 34, "F");
  doc.setFillColor(8, 22, 58);
  doc.circle(196, 248, 45, "F");
}

function drawFooter(ctx) {
  const { doc, page } = ctx;
  doc.setFillColor(3, 13, 35);
  doc.roundedRect(8, FOOTER_Y, PAGE_W - 16, 9, 4, 4, "F");
  doc.setDrawColor(...C.line);
  doc.line(MARGIN, FOOTER_Y - 3, PAGE_W - MARGIN, FOOTER_Y - 3);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("Econfia Empresas | Informe de consulta mercantil y alertas", MARGIN, FOOTER_Y + 6);
  doc.setFillColor(...C.cyan);
  doc.circle(PAGE_W - MARGIN - 12, FOOTER_Y + 4.8, 2.2, "F");
  doc.setTextColor(...C.frost);
  doc.text(String(page), PAGE_W - MARGIN - 12, FOOTER_Y + 5.7, { align: "center" });
}

function ensureSpace(ctx, height) {
  if (ctx.y + height <= FOOTER_Y - 5) return;
  ctx.doc.addPage();
  ctx.page += 1;
  ctx.y = 22;
  drawShell(ctx, "Informe empresarial");
}

function sectionTitle(ctx, title, color = C.sky, size = 12) {
  ensureSpace(ctx, 12);
  const { doc } = ctx;
  ctx.section += 1;
  doc.setFillColor(8, 23, 55);
  doc.roundedRect(MARGIN, ctx.y - 6, CONTENT_W, 13, 5, 5, "F");
  doc.setFillColor(...color);
  doc.roundedRect(MARGIN + 4, ctx.y - 3.5, 12, 8, 3, 3, "F");
  doc.setTextColor(...C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(String(ctx.section).padStart(2, "0"), MARGIN + 10, ctx.y + 1.6, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, title, MARGIN + 20, ctx.y + 1, CONTENT_W - 24);
  ctx.y += 15;
}

function paragraph(ctx, text, options = {}) {
  const { doc } = ctx;
  const box = !!options.box;
  const accent = options.accent || C.line;
  const maxLines = options.maxLines || 999;
  const lines = doc.splitTextToSize(String(text || "No disponible"), box ? CONTENT_W - 14 : CONTENT_W);
  const visibleLines = lines.slice(0, maxLines);
  const height = visibleLines.length * 4.6 + (box ? 10 : 2);
  ensureSpace(ctx, height + 2);

  if (box) {
    doc.setFillColor(...C.panel2);
    doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 5, 5, "F");
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN + 1.5, ctx.y + 1.5, CONTENT_W - 3, height - 3, 4, 4, "F");
    doc.setFillColor(...accent);
    doc.roundedRect(MARGIN, ctx.y, 4, height, 3, 3, "F");
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
    doc.setFillColor(...C.panel2);
    doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 5, 5, "F");
    doc.setFillColor(...C.panel);
    doc.roundedRect(MARGIN + 1.3, ctx.y + 1.3, CONTENT_W - 2.6, height - 2.6, 4, 4, "F");
    doc.setFillColor(...color);
    doc.circle(MARGIN + 8, ctx.y + 7, 3.4, "F");
    doc.setTextColor(...C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.text(String(index + 1), MARGIN + 8, ctx.y + 8.7, { align: "center" });
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
  doc.setFillColor(...C.panel2);
  doc.roundedRect(x, y, w, 17, 3, 3, "F");
  doc.setFillColor(...C.panel);
  doc.roundedRect(x + 1, y + 1, w - 2, 15, 3, 3, "F");
  doc.setFillColor(...C.cyan);
  doc.rect(x + 1, y + 1, 2, 15, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...C.muted);
  drawSingleLine(doc, String(label || "Dato").toUpperCase(), x + 6, y + 5.5, w - 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, String(value || "No disponible"), x + 6, y + 12.2, w - 10);
}

function card(ctx, title, body, color) {
  const { doc } = ctx;
  const bodyLines = doc.splitTextToSize(String(body || "No disponible"), CONTENT_W - 28);
  const height = Math.max(20, bodyLines.length * 4.4 + 14);
  ensureSpace(ctx, height + 2);

  doc.setFillColor(...C.panel2);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, height, 5, 5, "F");
  doc.setFillColor(...C.panel);
  doc.roundedRect(MARGIN + 1.5, ctx.y + 1.5, CONTENT_W - 3, height - 3, 4, 4, "F");
  doc.setFillColor(...color);
  doc.roundedRect(MARGIN + 5, ctx.y + 5, 9, 9, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...color);
  drawSingleLine(doc, title || "Registro", MARGIN + 19, ctx.y + 8, CONTENT_W - 25);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  doc.text(bodyLines, MARGIN + 19, ctx.y + 14);

  ctx.y += height + 4;
}

function drawMetricGrid(ctx, metrics, startY) {
  const { doc } = ctx;
  const boxW = (CONTENT_W - 9) / 4;
  ctx.y = startY;

  metrics.forEach(([label, value, color], index) => {
    const x = MARGIN + index * (boxW + 3);
    doc.setFillColor(...C.panel2);
    doc.roundedRect(x, ctx.y, boxW, 31, 6, 6, "F");
    doc.setFillColor(7, 18, 46);
    doc.roundedRect(x + 1.4, ctx.y + 1.4, boxW - 2.8, 28.2, 5, 5, "F");
    doc.setFillColor(...color);
    doc.roundedRect(x + 4, ctx.y + 4, 10, 10, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    doc.setTextColor(...C.text);
    drawSingleLine(doc, value, x + 17, ctx.y + 12, boxW - 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...C.muted);
    drawSingleLine(doc, label.toUpperCase(), x + 6, ctx.y + 23, boxW - 12);
  });

  ctx.y += 40;
}

function drawRiskPanel(ctx, alertaDian) {
  const { doc } = ctx;
  ensureSpace(ctx, 32);
  const accent = alertaDian ? C.amber : C.emerald;
  const title = alertaDian ? "Coincidencia tributaria sensible" : "Sin coincidencia DIAN en proveedor ficticio";
  const body = alertaDian
    ? "Prioridad alta: revisar soportes fiscales, autorizaciones, facturas y trazabilidad comercial antes de aprobar operaciones."
    : "Lectura favorable: no se encontraron coincidencias en el listado consultado. Mantener verificacion periodica y debida diligencia documental.";

  doc.setFillColor(8, 22, 52);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, 28, 7, 7, "F");
  doc.setFillColor(...accent);
  doc.roundedRect(MARGIN + 6, ctx.y + 6, 16, 16, 5, 5, "F");
  doc.setTextColor(...C.navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(alertaDian ? "!" : "OK", MARGIN + 14, ctx.y + 16.7, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...C.text);
  drawSingleLine(doc, title, MARGIN + 28, ctx.y + 11, 115);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(doc.splitTextToSize(body, 128), MARGIN + 28, ctx.y + 18);

  drawSignalDots(doc, PAGE_W - MARGIN - 37, ctx.y + 9, alertaDian);
  ctx.y += 36;
}

function drawSignalDots(doc, x, y, alertaDian) {
  const colors = alertaDian ? [C.red, C.amber, C.line] : [C.line, C.sky, C.emerald];
  colors.forEach((color, index) => {
    doc.setFillColor(...color);
    doc.circle(x + index * 10, y, 3, "F");
  });
}

function drawStatusBadge(doc, x, y, text, color) {
  doc.setFillColor(...color);
  doc.roundedRect(x, y, 52, 12, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.navy);
  doc.text(text, x + 26, y + 7.7, { align: "center" });
}

function drawLogoPlate(doc, x, y, w, h) {
  doc.setFillColor(...C.white);
  doc.roundedRect(x, y, w, h, 4, 4, "F");
  try {
    const props = doc.getImageProperties(logoEconfia);
    const ratio = props.width / props.height;
    let logoW = w - 8;
    let logoH = logoW / ratio;
    if (logoH > h - 6) {
      logoH = h - 6;
      logoW = logoH * ratio;
    }
    doc.addImage(logoEconfia, "PNG", x + (w - logoW) / 2, y + (h - logoH) / 2, logoW, logoH);
  } catch (error) {
    doc.setTextColor(...C.navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ECONFIA", x + w / 2, y + h / 2 + 2, { align: "center" });
  }
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
