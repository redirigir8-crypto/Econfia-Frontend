import jsPDF from "jspdf";
import logoEconfia from "../assets/logo-econfia.png";

const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN_X = 14;
const CONTENT_W = PAGE_W - (MARGIN_X * 2);
const HEADER_Y = 43;
const FOOTER_LIMIT = 184;

const THEME = {
  bg: [5, 11, 20],
  surface: [10, 21, 39],
  surfaceSoft: [15, 29, 50],
  panel: [22, 42, 70],
  panelSoft: [26, 51, 84],
  line: [48, 82, 132],
  primary: [61, 168, 255],
  primarySoft: [194, 229, 255],
  text: [235, 242, 250],
  muted: [145, 165, 190],
  success: [67, 179, 125],
  warning: [233, 171, 74],
  danger: [214, 92, 103],
  white: [255, 255, 255],
};

const PLAN_LABELS = {
  econfiafast: "EconfiaFast",
  "essencial-express": "Essencial Express",
  "essential-express": "Essential Express",
  "basic-element": "Basic Element",
  "basic-elemnt": "Basic Element",
  essential: "Essential",
  empresa: "Empresa",
  "validacion-titulos": "Validacion Titulos",
  titulo_urosario: "Titulo Urosario",
  contratista: "Contratista",
  ecorefull: "E-corefull",
};

export function generarInformeUsuarioPDF(profile, stats) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaHoy = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const nombreCompleto = profile?.full_name || profile?.username || "Usuario";
  const username = profile?.username || "Sin usuario";
  const email = profile?.email || "Sin correo";
  const tipoPerfil = capitalize(profile?.perfil?.tipo_perfil || "Usuario");
  const estaInfinito = !!profile?.perfil?.consultas_infinitas;

  const recargas = profile?.perfil?.historial_recargas || [];
  const consumos = profile?.perfil?.historial_consumos || [];
  const planes = profile?.perfil?.planes || [];
  const disponibles = profile?.perfil?.consultas_disponibles ?? 0;
  const consumidas = profile?.perfil?.consultas_consumidas ?? 0;
  const cargadas = profile?.perfil?.consultas_cargadas_total ?? 0;

  const estados = stats?.estadisticas?.consultas?.por_estado || [];
  const completadas = estados.find((item) => item.estado === "completado")?.total ?? 0;
  const pendientes = estados.find((item) => item.estado === "pendiente")?.total ?? 0;
  const enProceso = estados.find((item) => item.estado === "en_proceso")?.total ?? 0;
  const totalConsultas = completadas + pendientes + enProceso;

  drawOverviewPage(doc, {
    pageNumber: 1,
    nombreCompleto,
    username,
    email,
    tipoPerfil,
    fechaHoy,
    horaHoy,
    estaInfinito,
    planes,
    disponibles,
    consumidas,
    cargadas,
    totalConsultas,
    completadas,
    pendientes,
    enProceso,
  });

  const sections = [
    recargas.length
      ? {
          title: "Historial de consultas cargadas",
          subtitle: nombreCompleto,
          footerNote: "Movimiento de recargas y renovaciones aplicadas al perfil.",
          columns: [
            { label: "#", width: 10, align: "center" },
            { label: "Fecha y hora", width: 44 },
            { label: "Consultas cargadas", width: 40, align: "center" },
            { label: "Saldo anterior", width: 34, align: "center" },
            { label: "Saldo actual", width: 34, align: "center" },
            { label: "Tipo de carga", width: 44, align: "center" },
          ],
          rows: recargas.map((item, index) => ([
            String(index + 1),
            formatDateTime(item.fecha_recarga),
            `+${item.cantidad ?? 0}`,
            String(item.saldo_antes ?? 0),
            String(item.saldo_despues ?? 0),
            capitalize(item.tipo || "Sin definir"),
          ])),
          accent: THEME.primary,
          totalIndex: 2,
        }
      : null,
    consumos.length
      ? {
          title: "Historial de consultas gastadas",
          subtitle: nombreCompleto,
          footerNote: "Cada registro identifica la consulta que desconto saldo del perfil.",
          columns: [
            { label: "#", width: 10, align: "center" },
            { label: "Fecha y hora", width: 34 },
            { label: "Cedula", width: 26 },
            { label: "Persona", width: 62 },
            { label: "Tipo de consulta", width: 44 },
            { label: "Descontadas", width: 24, align: "center" },
            { label: "Saldo anterior", width: 28, align: "center" },
            { label: "Saldo actual", width: 28, align: "center" },
          ],
          rows: consumos.map((item, index) => ([
            String(index + 1),
            formatDateTime(item.fecha_consumo),
            item.cedula || "No disponible",
            item.nombre_completo || "Consulta historica",
            formatPlanLabel(item.tipo_consulta),
            `-${item.cantidad ?? 0}`,
            String(item.saldo_antes ?? 0),
            String(item.saldo_despues ?? 0),
          ])),
          accent: THEME.warning,
          totalIndex: 5,
        }
      : null,
  ].filter(Boolean);

  let pageNumber = 1;
  sections.forEach((section) => {
    pageNumber += 1;
    pageNumber = drawTableSection(doc, pageNumber, section);
  });

  doc.save(`Informe_Personal_Econfia_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function drawOverviewPage(doc, data) {
  drawPageShell(doc, data.pageNumber, "Reporte personal de actividad");
  drawHero(doc, data.nombreCompleto, data.fechaHoy, data.horaHoy);
  drawMetricGrid(doc, [
    { label: "Consultas realizadas", value: String(data.totalConsultas), color: THEME.primary },
    { label: "Completadas", value: String(data.completadas), color: THEME.success },
    { label: "Saldo disponible", value: data.estaInfinito ? "Ilimitado" : String(data.disponibles), color: THEME.primarySoft },
    { label: "Consultas consumidas", value: String(data.consumidas), color: THEME.warning },
    { label: "Consultas cargadas", value: data.estaInfinito ? "Ilimitado" : String(data.cargadas), color: THEME.primary },
    { label: "Planes activos", value: String(data.planes.length), color: THEME.primarySoft },
  ], 54);

  const detailTop = 112;
  if (data.planes.length) {
    drawProfileBlock(doc, data, MARGIN_X, detailTop, 128);
    drawPlansBlock(doc, data.planes, MARGIN_X + 134, detailTop, CONTENT_W - 134);
  } else {
    drawProfileBlock(doc, data, MARGIN_X, detailTop, CONTENT_W);
  }

  if (data.totalConsultas > 0) {
    drawActivityBlock(doc, data, 160);
  }
}

function drawTableSection(doc, startPageNumber, config) {
  const rowHeight = 8;
  let y = HEADER_Y;
  let pageNumber = startPageNumber;

  const paintPage = (continued = false) => {
    doc.addPage("a4", "landscape");
    drawPageShell(doc, pageNumber, config.title);
    drawSectionHeader(doc, continued ? `${config.title} (cont.)` : config.title, config.subtitle, config.footerNote, config.accent);
    y = HEADER_Y;
    drawTableHeader(doc, config.columns, y, config.accent);
    y += 8;
  };

  paintPage(false);

  config.rows.forEach((row, index) => {
    if (y + rowHeight > FOOTER_LIMIT) {
      pageNumber += 1;
      paintPage(true);
    }
    drawTableRow(doc, config.columns, row, y, index, config.accent);
    y += rowHeight;
  });

  if (y + 12 > FOOTER_LIMIT) {
    pageNumber += 1;
    paintPage(true);
  }

  drawTableSummary(doc, config.rows.length, totalSigned(config.rows, config.totalIndex), y + 3, config.accent);
  return pageNumber;
}

function drawPageShell(doc, pageNumber, label) {
  doc.setFillColor(...THEME.bg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  doc.setFillColor(...THEME.surface);
  doc.rect(0, 0, PAGE_W, 18, "F");
  doc.setFillColor(...THEME.panel);
  doc.rect(0, 18, PAGE_W, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...THEME.text);
  doc.text(label, MARGIN_X, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...THEME.muted);
  doc.text("Documento privado de uso interno", PAGE_W - MARGIN_X, 11, { align: "right" });

  doc.setFillColor(...THEME.surface);
  doc.rect(0, PAGE_H - 12, PAGE_W, 12, "F");
  doc.setDrawColor(...THEME.line);
  doc.line(0, PAGE_H - 12, PAGE_W, PAGE_H - 12);
  doc.setTextColor(...THEME.muted);
  doc.text("Econfia | Seguimiento de actividad del titular", MARGIN_X, PAGE_H - 4.5);
  doc.setTextColor(...THEME.primarySoft);
  doc.text(`Pag. ${pageNumber}`, PAGE_W - MARGIN_X, PAGE_H - 4.5, { align: "right" });
}

function drawHero(doc, nombreCompleto, fechaHoy, horaHoy) {
  const heroY = 24;
  const heroH = 24;
  const plateX = MARGIN_X + 5;
  const plateY = heroY + 4;
  const plateW = 42;
  const plateH = 16;

  doc.setFillColor(...THEME.surfaceSoft);
  doc.roundedRect(MARGIN_X, heroY, CONTENT_W, heroH, 6, 6, "F");

  doc.setFillColor(...THEME.white);
  doc.roundedRect(plateX, plateY, plateW, plateH, 4, 4, "F");
  drawLogo(doc, plateX, plateY, plateW, plateH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...THEME.text);
  doc.text("Informe personal del titular", MARGIN_X + 56, heroY + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, nombreCompleto, MARGIN_X + 56, heroY + 17, 110);
  drawSingleLineText(doc, `${fechaHoy} | ${horaHoy}`, PAGE_W - MARGIN_X - 78, heroY + 17, 78, "right");
}

function drawLogo(doc, x, y, maxW, maxH) {
  let width = 28;
  let height = 10;

  try {
    const props = doc.getImageProperties(logoEconfia);
    const ratio = props.width / props.height;
    width = maxW - 8;
    height = width / ratio;
    if (height > maxH - 4) {
      height = maxH - 4;
      width = height * ratio;
    }
  } catch (error) {
    width = Math.min(width, maxW - 8);
    height = Math.min(height, maxH - 4);
  }

  const drawX = x + ((maxW - width) / 2);
  const drawY = y + ((maxH - height) / 2);
  doc.addImage(logoEconfia, "PNG", drawX, drawY, width, height);
}

function drawMetricGrid(doc, metrics, startY) {
  const cardHeight = 22;
  const gap = 6;
  const cardWidth = (CONTENT_W - (gap * 2)) / 3;

  metrics.forEach((metric, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = MARGIN_X + (col * (cardWidth + gap));
    const y = startY + (row * (cardHeight + gap));

    doc.setFillColor(...THEME.surface);
    doc.roundedRect(x, y, cardWidth, cardHeight, 5, 5, "F");
    doc.setFillColor(...metric.color);
    doc.rect(x, y, 3, cardHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...metric.color);
    drawSingleLineText(doc, metric.value, x + 8, y + 10, cardWidth - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, metric.label.toUpperCase(), x + 8, y + 16.8, cardWidth - 14);
  });
}

function drawProfileBlock(doc, data, x, startY, width) {
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(x, startY, width, 46, 5, 5, "F");
  drawBlockTitle(doc, "Datos del titular", x + 6, startY + 8);

  const rows = [
    ["Nombre completo", data.nombreCompleto],
    ["Usuario", data.username],
    ["Correo", data.email],
    ["Tipo de perfil", data.tipoPerfil],
    ["Fecha del informe", `${data.fechaHoy} | ${data.horaHoy}`],
  ];

  let y = startY + 16;
  rows.forEach(([label, value]) => {
    const labelWidth = Math.min(35, width * 0.26);
    const valueX = x + 8 + labelWidth;
    const valueWidth = width - labelWidth - 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, `${label}:`, x + 6, y, labelWidth);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, String(value || "No disponible"), valueX, y, valueWidth);
    y += 6.5;
  });
}

function drawPlansBlock(doc, planes, x, startY, width) {
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(x, startY, width, 46, 5, 5, "F");
  drawBlockTitle(doc, "Planes activos", x + 6, startY + 8);

  const innerX = x + 6;
  const innerY = startY + 14;
  const innerW = width - 12;
  const gap = 4;
  const columns = innerW > 90 ? 2 : 1;
  const itemW = (innerW - (gap * (columns - 1))) / columns;
  const itemH = 10;
  const maxRows = 2;
  const visible = planes.slice(0, columns * maxRows);

  visible.forEach((plan, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const itemX = innerX + (col * (itemW + gap));
    const itemY = innerY + (row * (itemH + gap));

    doc.setFillColor(...THEME.panelSoft);
    doc.roundedRect(itemX, itemY, itemW, itemH, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.1);
    doc.setTextColor(...THEME.primarySoft);
    drawSingleLineText(doc, formatPlanLabel(plan?.nombre), itemX + 3, itemY + 6, itemW - 6);
  });

  if (planes.length > visible.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.4);
    doc.setTextColor(...THEME.muted);
    doc.text(`+${planes.length - visible.length} planes adicionales`, x + width - 6, startY + 40, { align: "right" });
  }
}

function drawActivityBlock(doc, data, startY) {
  const blockH = 34;
  const barX = MARGIN_X + 60;
  const barW = CONTENT_W - 84;
  const barHeight = 4.8;
  const rowGap = 7.4;

  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, startY, CONTENT_W, blockH, 5, 5, "F");
  drawBlockTitle(doc, "Actividad de consultas", MARGIN_X + 6, startY + 8);

  const bars = [
    { label: "Completadas", value: data.completadas, color: THEME.success },
    { label: "Pendientes", value: data.pendientes, color: THEME.warning },
    { label: "En proceso", value: data.enProceso, color: THEME.primary },
  ];

  const total = Math.max(data.totalConsultas, 1);
  let y = startY + 11.5;

  bars.forEach((bar) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, bar.label, MARGIN_X + 6, y + 3.2, 46);

    doc.setFillColor(...THEME.panel);
    doc.roundedRect(barX, y, barW, barHeight, 2, 2, "F");

    const barWidth = Math.max(4, (bar.value / total) * barW);
    doc.setFillColor(...bar.color);
    doc.roundedRect(barX, y, Math.min(barWidth, barW), barHeight, 2, 2, "F");

    doc.setTextColor(...THEME.muted);
    doc.text(String(bar.value), PAGE_W - MARGIN_X - 4, y + 3.2, { align: "right" });
    y += rowGap;
  });
}

function drawSectionHeader(doc, title, subtitle, note, accentColor) {
  doc.setFillColor(...THEME.surfaceSoft);
  doc.roundedRect(MARGIN_X, 24, CONTENT_W, 13, 4, 4, "F");
  doc.setFillColor(...accentColor);
  doc.rect(MARGIN_X, 24, 3, 13, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...THEME.text);
  drawSingleLineText(doc, title, MARGIN_X + 8, 31.5, 110);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(...THEME.muted);
  drawSingleLineText(doc, subtitle, PAGE_W - MARGIN_X - 80, 29.5, 80, "right");
  drawSingleLineText(doc, note, PAGE_W - MARGIN_X - 105, 33.5, 105, "right");
}

function drawTableHeader(doc, columns, y, accentColor) {
  let x = MARGIN_X;
  doc.setFillColor(...accentColor);
  doc.roundedRect(MARGIN_X, y - 5, CONTENT_W, 7, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.1);
  doc.setTextColor(...THEME.white);

  columns.forEach((column) => {
    drawCellText(doc, column.label, x, y, column.width, column.align || "left", true);
    x += column.width;
  });
}

function drawTableRow(doc, columns, row, y, index, accentColor) {
  let x = MARGIN_X;
  const fill = index % 2 === 0 ? THEME.surface : THEME.surfaceSoft;
  doc.setFillColor(...fill);
  doc.rect(MARGIN_X, y - 5, CONTENT_W, 7, "F");
  doc.setDrawColor(...THEME.line);
  doc.line(MARGIN_X, y + 2.2, PAGE_W - MARGIN_X, y + 2.2);

  columns.forEach((column, columnIndex) => {
    const value = row[columnIndex] ?? "-";
    const color = column.label.includes("Descontadas")
      ? THEME.danger
      : column.label.includes("Consultas cargadas")
        ? THEME.success
        : column.label.includes("Tipo de consulta") || column.label.includes("Tipo de carga")
          ? accentColor
          : column.align === "center" && columnIndex > 4
            ? THEME.primarySoft
            : THEME.text;

    doc.setFont("helvetica", columnIndex === 3 ? "bold" : "normal");
    doc.setFontSize(7);
    doc.setTextColor(...color);
    drawCellText(doc, String(value), x, y, column.width, column.align || "left");
    x += column.width;
  });
}

function drawTableSummary(doc, totalRows, totalValue, y, accentColor) {
  const boxY = Math.min(y, 186);
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, boxY, CONTENT_W, 10, 3, 3, "F");
  doc.setFillColor(...accentColor);
  doc.rect(MARGIN_X, boxY, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accentColor);
  doc.text(`Total registros: ${totalRows} | Total movimientos: ${totalValue}`, PAGE_W / 2, boxY + 6.3, { align: "center" });
}

function drawBlockTitle(doc, title, x, y) {
  doc.setFillColor(...THEME.primary);
  doc.rect(x, y - 4.5, 2.5, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, title, x + 5, y, 80);
}

function drawCellText(doc, text, x, y, width, align = "left", isHeader = false) {
  const padding = isHeader ? 2.5 : 2;
  const value = truncateText(doc, text, width - (padding * 2));
  if (align === "center") {
    doc.text(value, x + (width / 2), y, { align: "center" });
    return;
  }
  if (align === "right") {
    doc.text(value, x + width - padding, y, { align: "right" });
    return;
  }
  doc.text(value, x + padding, y);
}

function drawSingleLineText(doc, text, x, y, width, align = "left") {
  const value = truncateText(doc, text, width);
  if (align === "right") {
    doc.text(value, x + width, y, { align: "right" });
    return;
  }
  if (align === "center") {
    doc.text(value, x + (width / 2), y, { align: "center" });
    return;
  }
  doc.text(value, x, y);
}

function truncateText(doc, text, maxWidth) {
  const safe = String(text || "No disponible");
  if (doc.getTextWidth(safe) <= maxWidth) {
    return safe;
  }

  let trimmed = safe;
  while (trimmed.length > 1 && doc.getTextWidth(`${trimmed}...`) > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }
  return `${trimmed}...`;
}

function formatDateTime(value) {
  if (!value) return "No disponible";
  const date = new Date(value);
  return `${date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} ${date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function formatPlanLabel(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return PLAN_LABELS[normalized] || capitalizeWords(normalized.replace(/[-_]/g, " ")) || "Sin definir";
}

function capitalize(value = "") {
  if (!value) return "Sin definir";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function capitalizeWords(value = "") {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(" ");
}

function totalSigned(rows, index) {
  return rows.reduce((accumulator, row) => {
    const raw = String(row[index] || "0").replace(/[^\d-]/g, "");
    const parsed = Number.parseInt(raw, 10);
    return accumulator + (Number.isNaN(parsed) ? 0 : parsed);
  }, 0);
}
