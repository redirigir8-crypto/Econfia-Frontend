import jsPDF from "jspdf";
import logoEconfia from "../assets/logo-econfia.png";

const PAGE_W = 297;
const PAGE_H = 210;
const MARGIN_X = 14;
const CONTENT_W = PAGE_W - (MARGIN_X * 2);
const HEADER_Y = 43;
const FOOTER_Y = 198;
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
  violet: [150, 112, 255],
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

export function generarInformeAdminPDF(users, adminName, consultasPorUsuario = {}) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const safeUsers = Array.isArray(users) ? users : [];
  const generatedDate = new Date();
  const fechaHoy = generatedDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaHoy = generatedDate.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totals = computeAdminMetrics(safeUsers, consultasPorUsuario);

  drawAdminOverviewPage(doc, {
    pageNumber: 1,
    adminName: adminName || "Administrador",
    fechaHoy,
    horaHoy,
    totals,
    users: safeUsers,
  });

  let pageNumber = 1;
  if (safeUsers.length) {
    pageNumber += 1;
    pageNumber = drawUserTableSection(doc, pageNumber, safeUsers);
  }

  safeUsers.forEach((user) => {
    pageNumber += 1;
    pageNumber = drawUserDetailSection(doc, pageNumber, user, consultasPorUsuario[user.id] || []);
  });

  doc.save(`Informe_Admin_Usuarios_${generatedDate.toISOString().slice(0, 10)}.pdf`);
}

export function generarInformeAdminIndividualPDF(user, adminName, consultas = []) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const generatedDate = new Date();
  const fechaHoy = generatedDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const horaHoy = generatedDate.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  drawIndividualUserOverviewPage(doc, {
    pageNumber: 1,
    user,
    adminName: adminName || "Administrador",
    fechaHoy,
    horaHoy,
    consultas,
  });

  const hasDetailData = (user?.perfil?.historial_recargas || []).length > 0
    || (user?.perfil?.historial_consumos || []).length > 0
    || consultas.length > 0;

  if (hasDetailData) {
    drawUserDetailSection(doc, 2, user, consultas);
  }

  const userSlug = slugify(getUserDisplayName(user) || user?.username || "usuario");
  doc.save(`Informe_Individual_${userSlug}_${generatedDate.toISOString().slice(0, 10)}.pdf`);
}

function drawAdminOverviewPage(doc, data) {
  drawPageShell(doc, data.pageNumber, "Reporte administrativo de usuarios");
  drawHero(doc, "Informe administrativo de usuarios", data.adminName, data.fechaHoy, data.horaHoy);

  drawMetricGrid(doc, [
    { label: "Usuarios totales", value: String(data.totals.totalUsuarios), color: THEME.primary },
    { label: "Usuarios activos", value: String(data.totals.activos), color: THEME.success },
    { label: "Usuarios inactivos", value: String(data.totals.inactivos), color: THEME.danger },
    { label: "Planes ilimitados", value: String(data.totals.infinitos), color: THEME.violet },
    { label: "Consultas consumidas", value: String(data.totals.totalConsumidas), color: THEME.warning },
    { label: "Consultas disponibles", value: String(data.totals.totalDisponibles), color: THEME.primarySoft },
  ], 54);

  const topY = 112;
  drawSummaryPanel(doc, topY, data.totals);
  drawPlanDistributionPanel(doc, topY, data.totals.planEntries);
  drawActivitySnapshotPanel(doc, 164, data.totals);
}

function drawIndividualUserOverviewPage(doc, data) {
  const user = data.user || {};
  const planNames = getPlanNames(user);
  const consultas = data.consultas || [];

  drawPageShell(doc, data.pageNumber, "Informe individual de usuario");
  drawHero(doc, "Informe individual de usuario", getUserDisplayName(user), data.fechaHoy, data.horaHoy);

  drawMetricGrid(doc, [
    { label: "Consultas cargadas", value: getConsultasCargadasLabel(user), color: user?.perfil?.consultas_infinitas ? THEME.violet : THEME.primary },
    { label: "Consultas consumidas", value: String(user?.perfil?.consultas_consumidas ?? 0), color: THEME.warning },
    { label: "Saldo disponible", value: getConsultasDisponiblesLabel(user), color: user?.perfil?.consultas_infinitas ? THEME.violet : THEME.success },
    { label: "Consultas registradas", value: String(consultas.length), color: THEME.primarySoft },
    { label: "Estado", value: user?.is_active ? "Activo" : "Inactivo", color: user?.is_active ? THEME.success : THEME.danger },
    { label: "Perfil", value: user?.is_superuser ? "Super" : user?.is_staff ? "Staff" : "Usuario", color: THEME.primary },
  ], 54);

  drawUserIdentityPanel(doc, user, data.adminName, 112, planNames);
  if (consultas.length) {
    drawIndividualQuerySnapshot(doc, consultas, 164);
  } else {
    drawEmptyStatePanel(doc, 170, "Este usuario aun no tiene consultas registradas en el sistema.");
  }
}

function drawUserTableSection(doc, startPageNumber, users) {
  const columns = [
    { label: "#", width: 10, align: "center" },
    { label: "Usuario", width: 26 },
    { label: "Nombre completo", width: 50 },
    { label: "Correo", width: 54 },
    { label: "Planes", width: 48 },
    { label: "Estado", width: 18, align: "center" },
    { label: "Consultas", width: 26, align: "center" },
    { label: "Consumidas", width: 24, align: "center" },
    { label: "Perfil", width: 13, align: "center" },
  ];

  const rows = users.map((user, index) => ([
    String(index + 1),
    user.username || "-",
    getUserDisplayName(user),
    user.email || "-",
    getPlanSummary(user),
    user.is_active ? "Activo" : "Inactivo",
    getConsultasDisponiblesLabel(user),
    String(user.perfil?.consultas_consumidas ?? 0),
    user.is_staff ? "Staff" : "User",
  ]));

  return drawTableSection(doc, startPageNumber, {
    title: "Base consolidada de usuarios",
    subtitle: `${users.length} usuarios cargados`,
    footerNote: "Vision general del estado, los planes y el saldo disponible por usuario.",
    accent: THEME.primary,
    columns,
    rows,
    totalIndex: null,
  });
}

function drawUserDetailSection(doc, startPageNumber, user, consultas) {
  let pageNumber = startPageNumber;
  let y = HEADER_Y;
  const userName = getUserDisplayName(user);
  const planNames = getPlanNames(user);
  const recargas = user?.perfil?.historial_recargas || [];
  const consumos = user?.perfil?.historial_consumos || [];

  const paintPage = (continued = false) => {
    doc.addPage("a4", "landscape");
    drawPageShell(doc, pageNumber, "Detalle administrativo por usuario");
    drawSectionHeader(
      doc,
      continued ? `Desglose de usuario (cont.)` : "Desglose de usuario",
      userName,
      user.email || user.username || "Sin correo",
      THEME.primary
    );
    if (continued) {
      y = 48;
    } else {
      drawUserHeroCards(doc, user, consultas);
      y = 72;
    }
    return y;
  };

  y = paintPage(false);

  const blocks = [];
  if (recargas.length) {
    blocks.push({
      title: "Historial de consultas cargadas",
      accent: THEME.primary,
      columns: [
        { label: "Fecha y hora", width: 46 },
        { label: "Consultas cargadas", width: 34, align: "center" },
        { label: "Saldo anterior", width: 30, align: "center" },
        { label: "Saldo actual", width: 30, align: "center" },
        { label: "Tipo de carga", width: 34, align: "center" },
      ],
      rows: recargas.map((item) => ([
        formatDateTime(item.fecha_recarga),
        `+${item.cantidad ?? 0}`,
        String(item.saldo_antes ?? 0),
        String(item.saldo_despues ?? 0),
        capitalize(item.tipo || "Sin definir"),
      ])),
      totalIndex: 1,
    });
  }

  if (consumos.length) {
    blocks.push({
      title: "Historial de consultas consumidas",
      accent: THEME.warning,
      columns: [
        { label: "Fecha y hora", width: 38 },
        { label: "Cedula", width: 24 },
        { label: "Persona", width: 58 },
        { label: "Tipo consulta", width: 36 },
        { label: "Descontadas", width: 22, align: "center" },
        { label: "Saldo anterior", width: 28, align: "center" },
        { label: "Saldo actual", width: 28, align: "center" },
      ],
      rows: consumos.map((item) => ([
        formatDateTime(item.fecha_consumo),
        item.cedula || "No disponible",
        item.nombre_completo || "Consulta historica",
        formatPlanLabel(item.tipo_consulta),
        `-${item.cantidad ?? 0}`,
        String(item.saldo_antes ?? 0),
        String(item.saldo_despues ?? 0),
      ])),
      totalIndex: 4,
    });
  }

  if (consultas.length) {
    blocks.push({
      title: "Consultas registradas del usuario",
      accent: THEME.success,
      columns: [
        { label: "Cedula", width: 28 },
        { label: "Tipo doc", width: 16, align: "center" },
        { label: "Nombre consultado", width: 74 },
        { label: "Fecha", width: 34 },
        { label: "Estado", width: 28, align: "center" },
        { label: "Tipo consulta", width: 44 },
      ],
      rows: consultas.map((consulta) => ([
        consulta.cedula || "-",
        consulta.tipo_doc || "-",
        consulta.nombre_completo || getConsultaFullName(consulta),
        formatShortDate(consulta.fecha),
        formatEstadoLabel(consulta.estado),
        formatPlanLabel(consulta.tipo_consulta),
      ])),
      totalIndex: null,
    });
  }

  if (!blocks.length) {
    drawEmptyStatePanel(doc, y + 12, "Este usuario no tiene movimientos ni consultas registradas.");
    return pageNumber;
  }

  blocks.forEach((block, blockIndex) => {
    if (y > FOOTER_LIMIT - 24) {
      pageNumber += 1;
      paintPage(true);
    }

    y = drawSubsectionTable(doc, y, block, () => {
      pageNumber += 1;
      return paintPage(true);
    });

    if (blockIndex < blocks.length - 1) {
      y += 6;
      if (y > FOOTER_LIMIT - 20) {
        pageNumber += 1;
        paintPage(true);
      }
    }
  });

  if (planNames.length) {
    drawPlanFootnote(doc, planNames);
  }

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
  doc.text("Econfia | Informe administrativo consolidado", MARGIN_X, PAGE_H - 4.5);
  doc.setTextColor(...THEME.primarySoft);
  doc.text(`Pag. ${pageNumber}`, PAGE_W - MARGIN_X, PAGE_H - 4.5, { align: "right" });
}

function drawHero(doc, title, subtitle, fechaHoy, horaHoy) {
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
  doc.setFontSize(18);
  doc.setTextColor(...THEME.text);
  doc.text(title, MARGIN_X + 56, heroY + 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, subtitle, MARGIN_X + 56, heroY + 17, 110);
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

function drawSummaryPanel(doc, startY, totals) {
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, startY, 128, 46, 5, 5, "F");
  drawBlockTitle(doc, "Resumen ejecutivo", MARGIN_X + 6, startY + 8);

  const rows = [
    ["Administrador", totals.adminLabel || "Administrador"],
    ["Usuarios con plan", `${totals.conPlan} de ${totals.totalUsuarios}`],
    ["Usuarios sin plan", String(totals.sinPlan)],
    ["Usuarios staff", String(totals.staff)],
    ["Consultas registradas", String(totals.totalConsultasRegistradas)],
  ];

  let y = startY + 16;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, `${label}:`, MARGIN_X + 6, y, 38);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, value, MARGIN_X + 45, y, 75);
    y += 6.5;
  });
}

function drawPlanDistributionPanel(doc, startY, planEntries) {
  const x = MARGIN_X + 134;
  const width = CONTENT_W - 134;
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(x, startY, width, 46, 5, 5, "F");
  drawBlockTitle(doc, "Distribucion por plan", x + 6, startY + 8);

  if (!planEntries.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...THEME.muted);
    doc.text("No hay planes activos registrados.", x + 6, startY + 22);
    return;
  }

  const visible = planEntries.slice(0, 4);
  const maxCount = visible[0][1] || 1;
  let y = startY + 16;

  visible.forEach(([plan, count]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.6);
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, plan, x + 6, y, 44);

    doc.setFillColor(...THEME.panel);
    doc.roundedRect(x + 50, y - 3.5, 68, 4.6, 2, 2, "F");
    doc.setFillColor(...THEME.primary);
    doc.roundedRect(x + 50, y - 3.5, Math.max(6, (count / maxCount) * 68), 4.6, 2, 2, "F");

    doc.setTextColor(...THEME.primarySoft);
    doc.text(String(count), x + width - 8, y, { align: "right" });
    y += 7;
  });

  if (planEntries.length > visible.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...THEME.muted);
    doc.text(`+${planEntries.length - visible.length} planes adicionales`, x + width - 8, startY + 40, { align: "right" });
  }
}

function drawUserIdentityPanel(doc, user, adminName, startY, planNames) {
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, startY, 128, 46, 5, 5, "F");
  drawBlockTitle(doc, "Ficha del usuario", MARGIN_X + 6, startY + 8);

  const rows = [
    ["Nombre", getUserDisplayName(user)],
    ["Usuario", user?.username || "Sin usuario"],
    ["Correo", user?.email || "Sin correo"],
    ["Tipo", user?.perfil?.tipo_registro === "empresa" ? "Empresa" : "Persona natural"],
    ["Generado por", adminName || "Administrador"],
  ];

  let y = startY + 16;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, `${label}:`, MARGIN_X + 6, y, 34);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, String(value || "No disponible"), MARGIN_X + 42, y, 78);
    y += 6.5;
  });

  const x = MARGIN_X + 134;
  const width = CONTENT_W - 134;
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(x, startY, width, 46, 5, 5, "F");
  drawBlockTitle(doc, "Planes y contexto", x + 6, startY + 8);

  const details = [
    ["Planes", planNames.length ? planNames.join(", ") : "Sin plan"],
    ["Empresa", user?.perfil?.nombre_empresa || "No aplica"],
    ["NIT", user?.perfil?.nit || "No aplica"],
    ["Consultas masivas", user?.perfil?.consultas_masivas ? "Habilitadas" : "No"],
  ];

  let detailY = startY + 16;
  details.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, `${label}:`, x + 6, detailY, 32);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, String(value || "No disponible"), x + 38, detailY, width - 46);
    detailY += 6.5;
  });
}

function drawIndividualQuerySnapshot(doc, consultas, startY) {
  const states = {};
  consultas.forEach((consulta) => {
    const key = formatEstadoLabel(consulta?.estado);
    states[key] = (states[key] || 0) + 1;
  });

  const entries = Object.entries(states).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const blockH = 34;
  const barX = MARGIN_X + 74;
  const barW = CONTENT_W - 99;
  const max = entries[0]?.[1] || 1;

  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, startY, CONTENT_W, blockH, 5, 5, "F");
  drawBlockTitle(doc, "Estados de consulta", MARGIN_X + 6, startY + 8);

  let y = startY + 11.5;
  entries.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, label, MARGIN_X + 6, y + 3.2, 56);

    doc.setFillColor(...THEME.panel);
    doc.roundedRect(barX, y, barW, 4.8, 2, 2, "F");
    doc.setFillColor(...getEstadoColor(label));
    doc.roundedRect(barX, y, Math.max(4, (value / max) * barW), 4.8, 2, 2, "F");

    doc.setTextColor(...THEME.muted);
    doc.text(String(value), PAGE_W - MARGIN_X - 4, y + 3.2, { align: "right" });
    y += 7.4;
  });
}

function drawActivitySnapshotPanel(doc, startY, totals) {
  const blockH = 34;
  const barX = MARGIN_X + 70;
  const barW = CONTENT_W - 95;
  const rows = [
    { label: "Activos", value: totals.activos, max: totals.totalUsuarios || 1, color: THEME.success },
    { label: "Con plan", value: totals.conPlan, max: totals.totalUsuarios || 1, color: THEME.primary },
    { label: "Inactivos", value: totals.inactivos, max: totals.totalUsuarios || 1, color: THEME.danger },
  ];

  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, startY, CONTENT_W, blockH, 5, 5, "F");
  drawBlockTitle(doc, "Estado operativo", MARGIN_X + 6, startY + 8);

  let y = startY + 11.5;
  rows.forEach((row) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...THEME.text);
    drawSingleLineText(doc, row.label, MARGIN_X + 6, y + 3.2, 52);

    doc.setFillColor(...THEME.panel);
    doc.roundedRect(barX, y, barW, 4.8, 2, 2, "F");
    doc.setFillColor(...row.color);
    doc.roundedRect(barX, y, Math.max(4, (row.value / row.max) * barW), 4.8, 2, 2, "F");

    doc.setTextColor(...THEME.muted);
    doc.text(String(row.value), PAGE_W - MARGIN_X - 4, y + 3.2, { align: "right" });
    y += 7.4;
  });
}

function drawUserHeroCards(doc, user, consultas) {
  const metrics = [
    { label: "Consultas cargadas", value: getConsultasCargadasLabel(user), color: user?.perfil?.consultas_infinitas ? THEME.violet : THEME.primary },
    { label: "Consultas consumidas", value: String(user?.perfil?.consultas_consumidas ?? 0), color: THEME.warning },
    { label: "Saldo disponible", value: getConsultasDisponiblesLabel(user), color: user?.perfil?.consultas_infinitas ? THEME.violet : THEME.success },
    { label: "Consultas registradas", value: String((consultas || []).length), color: THEME.primarySoft },
  ];

  const cardHeight = 18;
  const gap = 5;
  const cardWidth = (CONTENT_W - (gap * 3)) / 4;
  const startY = 48;

  metrics.forEach((metric, index) => {
    const x = MARGIN_X + index * (cardWidth + gap);
    doc.setFillColor(...THEME.surface);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 4, 4, "F");
    doc.setFillColor(...metric.color);
    doc.rect(x, startY, 3, cardHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...metric.color);
    drawSingleLineText(doc, metric.value, x + 7, startY + 8.4, cardWidth - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.4);
    doc.setTextColor(...THEME.muted);
    drawSingleLineText(doc, metric.label.toUpperCase(), x + 7, startY + 14, cardWidth - 12);
  });
}

function drawSectionHeader(doc, title, subtitle, note, accentColor) {
  doc.setFillColor(...THEME.surfaceSoft);
  doc.roundedRect(MARGIN_X, 24, CONTENT_W, 15, 4, 4, "F");
  doc.setFillColor(...accentColor);
  doc.rect(MARGIN_X, 24, 3, 15, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...THEME.text);
  drawSingleLineText(doc, title, MARGIN_X + 8, 30.8, 118);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, subtitle, PAGE_W - MARGIN_X - 96, 30.2, 96, "right");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(...THEME.muted);
  drawSingleLineText(doc, note, PAGE_W - MARGIN_X - 96, 35.1, 96, "right");
}

function drawTableSection(doc, startPageNumber, config) {
  const rowHeight = 8;
  let y = HEADER_Y;
  let pageNumber = startPageNumber;

  const paintPage = (continued = false) => {
    doc.addPage("a4", "landscape");
    drawPageShell(doc, pageNumber, config.title);
    drawSectionHeader(
      doc,
      continued ? `${config.title} (cont.)` : config.title,
      config.subtitle,
      config.footerNote,
      config.accent
    );
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

  if (config.totalIndex !== null) {
    if (y + 12 > FOOTER_LIMIT) {
      pageNumber += 1;
      paintPage(true);
    }
    drawTableSummary(doc, config.rows.length, totalSigned(config.rows, config.totalIndex), y + 3, config.accent);
  }

  return pageNumber;
}

function drawSubsectionTable(doc, y, block, onPageBreak) {
  const rowHeight = 8;
  let rowIndex = 0;
  let continued = false;

  const paintBlockHeader = () => {
    drawSubsectionTitle(doc, continued ? `${block.title} (cont.)` : block.title, y, block.accent);
    y += 14;
    drawTableHeader(doc, block.columns, y, block.accent);
    y += 8;
  };

  if (y > FOOTER_LIMIT - 24) {
    y = onPageBreak();
  }

  paintBlockHeader();

  block.rows.forEach((row) => {
    if (y + rowHeight > FOOTER_LIMIT) {
      continued = true;
      y = onPageBreak();
      paintBlockHeader();
    }
    drawTableRow(doc, block.columns, row, y, rowIndex, block.accent);
    y += rowHeight;
    rowIndex += 1;
  });

  if (block.totalIndex !== null) {
    if (y + 12 > FOOTER_LIMIT) {
      continued = true;
      y = onPageBreak();
      paintBlockHeader();
    }
    drawTableSummary(doc, block.rows.length, totalSigned(block.rows, block.totalIndex), y + 2, block.accent);
    y += 14;
  }

  return y;
}

function drawSubsectionTitle(doc, title, y, accentColor) {
  doc.setFillColor(...THEME.surfaceSoft);
  doc.roundedRect(MARGIN_X, y - 4.5, CONTENT_W, 11, 4, 4, "F");
  doc.setFillColor(...accentColor);
  doc.rect(MARGIN_X, y - 4.5, 3, 11, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, title, MARGIN_X + 8, y + 2.6, 180);
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
    const color = getCellColor(column.label, value, accentColor);
    doc.setFont("helvetica", columnIndex === 2 ? "bold" : "normal");
    doc.setFontSize(7);
    doc.setTextColor(...color);
    drawCellText(doc, String(value), x, y, column.width, column.align || "left");
    x += column.width;
  });
}

function drawTableSummary(doc, totalRows, totalValue, y, accentColor) {
  const boxY = Math.min(y, FOOTER_Y - 2);
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, boxY, CONTENT_W, 10, 3, 3, "F");
  doc.setFillColor(...accentColor);
  doc.rect(MARGIN_X, boxY, 3, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accentColor);
  doc.text(`Total registros: ${totalRows} | Total movimientos: ${totalValue}`, PAGE_W / 2, boxY + 6.3, { align: "center" });
}

function drawEmptyStatePanel(doc, y, message) {
  doc.setFillColor(...THEME.surface);
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 18, 4, 4, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...THEME.muted);
  doc.text(message, PAGE_W / 2, y + 10.5, { align: "center" });
}

function drawPlanFootnote(doc, plans) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.1);
  doc.setTextColor(...THEME.muted);
  drawSingleLineText(doc, `Planes activos: ${plans.join(", ")}`, MARGIN_X, PAGE_H - 15, 180);
}

function drawBlockTitle(doc, title, x, y) {
  doc.setFillColor(...THEME.primary);
  doc.rect(x, y - 4.5, 2.5, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...THEME.primarySoft);
  drawSingleLineText(doc, title, x + 5, y, 90);
}

function computeAdminMetrics(users, consultasPorUsuario) {
  const totalUsuarios = users.length;
  const activos = users.filter((user) => user.is_active).length;
  const inactivos = totalUsuarios - activos;
  const infinitos = users.filter((user) => user.perfil?.consultas_infinitas).length;
  const totalConsumidas = users.reduce((acc, user) => acc + (user.perfil?.consultas_consumidas ?? 0), 0);
  const totalDisponibles = users.reduce((acc, user) => {
    if (user.perfil?.consultas_infinitas) return acc;
    return acc + (user.perfil?.consultas_disponibles ?? 0);
  }, 0);
  const conPlan = users.filter((user) => (user.perfil?.planes || []).length > 0).length;
  const sinPlan = totalUsuarios - conPlan;
  const staff = users.filter((user) => user.is_staff).length;
  const totalConsultasRegistradas = Object.values(consultasPorUsuario || {}).reduce((acc, arr) => acc + ((arr || []).length), 0);

  const planCount = {};
  users.forEach((user) => {
    (user.perfil?.planes || []).forEach((plan) => {
      const label = formatPlanLabel(plan?.nombre);
      planCount[label] = (planCount[label] || 0) + 1;
    });
  });

  return {
    totalUsuarios,
    activos,
    inactivos,
    infinitos,
    totalConsumidas,
    totalDisponibles,
    conPlan,
    sinPlan,
    staff,
    totalConsultasRegistradas,
    planEntries: Object.entries(planCount).sort((a, b) => b[1] - a[1]),
    adminLabel: "Administrador",
  };
}

function getUserDisplayName(user) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return fullName || user?.username || "Usuario";
}

function getPlanNames(user) {
  return (user?.perfil?.planes || []).map((plan) => formatPlanLabel(plan?.nombre));
}

function getPlanSummary(user) {
  const plans = getPlanNames(user);
  if (!plans.length) return "Sin plan";
  if (plans.length === 1) return plans[0];
  return `${plans[0]} +${plans.length - 1}`;
}

function getConsultasDisponiblesLabel(user) {
  if (user?.perfil?.consultas_infinitas) return "Ilimitado";
  return String(user?.perfil?.consultas_disponibles ?? 0);
}

function getConsultasCargadasLabel(user) {
  if (user?.perfil?.consultas_infinitas) return "Ilimitado";
  return String(user?.perfil?.consultas_cargadas_total ?? 0);
}

function getConsultaFullName(consulta) {
  const raw = [consulta?.nombre, consulta?.apellido].filter(Boolean).join(" ").trim();
  return raw || "-";
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

function formatShortDate(value) {
  if (!value) return "No disponible";
  const date = new Date(value);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEstadoLabel(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return "Sin estado";
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEstadoColor(label = "") {
  const normalized = String(label || "").toLowerCase();
  if (normalized.includes("completado") || normalized.includes("activo")) return THEME.success;
  if (normalized.includes("inactivo") || normalized.includes("no encontrado")) return THEME.danger;
  if (normalized.includes("proceso") || normalized.includes("pendiente")) return THEME.warning;
  return THEME.primary;
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

function totalSigned(rows, index) {
  return rows.reduce((accumulator, row) => {
    const raw = String(row[index] || "0").replace(/[^\d-]/g, "");
    const parsed = Number.parseInt(raw, 10);
    return accumulator + (Number.isNaN(parsed) ? 0 : parsed);
  }, 0);
}

function slugify(value = "") {
  return String(value || "usuario")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    || "usuario";
}

function getCellColor(label, value, accentColor) {
  const normalizedValue = String(value || "").toLowerCase();
  if (label.includes("Consultas cargadas")) return THEME.success;
  if (label.includes("Descontadas")) return THEME.danger;
  if (label.includes("Estado")) {
    if (normalizedValue.includes("activo") || normalizedValue.includes("completado")) return THEME.success;
    if (normalizedValue.includes("inactivo") || normalizedValue.includes("no encontrado")) return THEME.danger;
    if (normalizedValue.includes("proceso") || normalizedValue.includes("pendiente")) return THEME.warning;
    return THEME.primarySoft;
  }
  if (label.includes("Tipo")) return accentColor;
  if (label.includes("Consultas") || label.includes("Consumidas") || label.includes("Perfil")) return THEME.primarySoft;
  return THEME.text;
}
