// fuentesCatalogo.js
// Catálogo "quemado" de descripciones de fuentes para el panel de análisis.
// Explica para qué sirve cada fuente y qué implica un hallazgo en ella.
//
// La coincidencia se hace por palabra clave sobre el slug (fuente_nombre),
// el nombre visible (fuente) y, como último recurso, la categoría (tipo_fuente).
// Así funciona aunque el resultado traiga el nombre bonito o el slug interno.

const norm = (v) =>
  String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

// Reglas específicas por fuente (orden = prioridad). La primera que haga match gana.
// `claves`: se busca que el slug/nombre CONTENGA alguna de estas cadenas.
const REGLAS = [
  // ---- Colombia · Judicial / penal / disciplinario ----
  {
    claves: ["tyba"],
    titulo: "Procesos judiciales (Tyba – Rama Judicial)",
    desc: "Sistema de gestión judicial de la Rama Judicial. Consulta procesos judiciales en los que la persona figura como parte.",
    hallazgo: "La persona aparece vinculada a uno o más procesos judiciales. Requiere revisar el tipo de proceso, el rol y su estado.",
  },
  {
    claves: ["rama_judicial", "consulta_procesos", "juzgado_"],
    titulo: "Procesos judiciales (Rama Judicial)",
    desc: "Consulta unificada de procesos en juzgados y tribunales del país.",
    hallazgo: "Se encontró un proceso judicial asociado a la persona. Debe validarse la materia (penal, civil, laboral) y su vigencia.",
  },
  {
    claves: ["procuraduria"],
    titulo: "Antecedentes disciplinarios (Procuraduría)",
    desc: "Certificado de antecedentes disciplinarios, fiscales y penales de la Procuraduría General de la Nación.",
    hallazgo: "Registra una sanción o inhabilidad disciplinaria. Puede impedir contratar con el Estado o ejercer cargos públicos.",
  },
  {
    claves: ["contraloria", "responsabilidad_fiscal", "antecedentes_fiscales"],
    titulo: "Responsabilidad fiscal (Contraloría)",
    desc: "Boletín de responsables fiscales de la Contraloría General de la República.",
    hallazgo: "La persona figura como responsable fiscal. Genera inhabilidad para contratar con el Estado hasta subsanar.",
  },
  {
    claves: ["policia_busqueda", "policia_nacional", "antecedentes", "policia_memorial"],
    titulo: "Antecedentes penales (Policía Nacional)",
    desc: "Consulta de antecedentes y requerimientos judiciales de la Policía Nacional de Colombia.",
    hallazgo: "Existe un antecedente penal o requerimiento judicial vigente. Requiere revisión inmediata.",
  },
  {
    claves: ["rnmc", "medidas_correctivas"],
    titulo: "Medidas correctivas (RNMC – Policía)",
    desc: "Registro Nacional de Medidas Correctivas del Código de Convivencia.",
    hallazgo: "Tiene medidas correctivas o comparendos pendientes de pago o cumplimiento.",
  },
  {
    claves: ["inpec"],
    titulo: "Situación penitenciaria (INPEC)",
    desc: "Consulta de personas privadas de la libertad en el sistema penitenciario.",
    hallazgo: "La persona registra en el sistema penitenciario. Verificar situación actual.",
  },
  {
    claves: ["inhabilidades", "delitos_sexuales", "sancione_sexuales"],
    titulo: "Inhabilidades por delitos sexuales contra menores",
    desc: "Registro de inhabilidades para trabajar con menores (Ley 1918 de 2018).",
    hallazgo: "Inscrito en el registro de inhabilidades. Impide vinculación laboral con menores de edad.",
  },
  {
    claves: ["sirna"],
    titulo: "Abogados sancionados (SIRNA)",
    desc: "Sistema de Registro Nacional de Abogados y sus sanciones disciplinarias.",
    hallazgo: "El abogado registra una sanción disciplinaria vigente o histórica.",
  },
  {
    claves: ["fiscalia", "boletin_fiscalia"],
    titulo: "Boletines de la Fiscalía",
    desc: "Comunicados y boletines de la Fiscalía General de la Nación.",
    hallazgo: "Aparición en boletines de la Fiscalía. Requiere revisión del contexto de la mención.",
  },
  {
    claves: ["personeria"],
    titulo: "Antecedentes (Personería)",
    desc: "Consulta de antecedentes en la Personería Municipal.",
    hallazgo: "Registra antecedente o sanción a nivel municipal.",
  },
  {
    claves: ["simit"],
    titulo: "Multas de tránsito (SIMIT)",
    desc: "Sistema Integrado de Información sobre Multas y Sanciones de tránsito.",
    hallazgo: "Tiene multas o comparendos de tránsito pendientes.",
  },

  // ---- Colombia · Identidad / registros ----
  {
    claves: ["estado_cedula", "registraduria", "registro_civil"],
    titulo: "Estado de la cédula (Registraduría)",
    desc: "Verifica la vigencia y estado del documento de identidad ante la Registraduría.",
    hallazgo: "La cédula presenta una novedad (cancelada, en trámite o con inconsistencia).",
  },
  { claves: ["runt"], titulo: "Tránsito y licencias (RUNT)", desc: "Registro Único Nacional de Tránsito: licencias y vehículos.", hallazgo: "Novedad en licencias de conducción o vehículos asociados." },
  { claves: ["rethus"], titulo: "Talento humano en salud (ReTHUS)", desc: "Registro de profesionales de la salud habilitados.", hallazgo: "Novedad en la habilitación del profesional de la salud." },
  { claves: ["rues"], titulo: "Registro mercantil (RUES)", desc: "Registro Único Empresarial y Social de las cámaras de comercio.", hallazgo: "Vínculos societarios o mercantiles relevantes a revisar." },
  { claves: ["secop", "colombiacompra", "paco_contratista"], titulo: "Contratación pública (SECOP)", desc: "Contratos y procesos con el Estado colombiano.", hallazgo: "Participación en contratación estatal a validar." },

  // ---- Internacional · Sanciones alto impacto ----
  {
    claves: ["ofac", "sdn", "treas"],
    titulo: "Sanciones OFAC (EE.UU. – Tesoro)",
    desc: "Lista SDN de la Oficina de Control de Activos Extranjeros del Tesoro de EE.UU.",
    hallazgo: "Coincidencia en lista OFAC: bloqueo de activos y prohibición de operar con EE.UU. Criticidad máxima.",
  },
  {
    claves: ["un_sc", "consolidated_list_onu", "onu"],
    titulo: "Lista consolidada ONU",
    desc: "Lista de sanciones del Consejo de Seguridad de Naciones Unidas.",
    hallazgo: "Coincidencia en sanciones de la ONU (terrorismo/proliferación). Criticidad máxima.",
  },
  {
    claves: ["interpol"],
    titulo: "Notificaciones Interpol",
    desc: "Circulares y notificaciones rojas de personas buscadas internacionalmente.",
    hallazgo: "La persona figura en notificaciones de Interpol. Requiere verificación urgente.",
  },
  { claves: ["eu_fin", "eeas", "eur_lex", "eu_fsf"], titulo: "Sanciones Unión Europea", desc: "Listas de sanciones financieras de la UE.", hallazgo: "Coincidencia en sanciones de la Unión Europea." },
  { claves: ["ofsi", "hmt", "uk_"], titulo: "Sanciones Reino Unido (OFSI)", desc: "Lista consolidada de sanciones financieras del Reino Unido.", hallazgo: "Coincidencia en sanciones del Reino Unido." },
  { claves: ["pep", "politically_exposed", "peps"], titulo: "Persona Expuesta Políticamente (PEP)", desc: "Bases de funcionarios públicos y altos cargos.", hallazgo: "La persona es o estuvo expuesta políticamente. Exige debida diligencia reforzada." },
  {
    claves: ["offshore", "pandora", "panama", "paradise", "leaks", "bahamas"],
    titulo: "Filtraciones offshore (adverse media)",
    desc: "Filtraciones de sociedades y estructuras offshore (Pandora/Panama/Paradise Papers).",
    hallazgo: "Aparición en filtraciones offshore. No es prueba de delito, pero requiere revisión reputacional.",
  },
  { claves: ["most_wanted", "mas_buscados", "buscados", "fugitive", "wanted", "fbi", "scj_mas_buscados", "cgfm"], titulo: "Listas de más buscados", desc: "Registros de personas buscadas por autoridades nacionales e internacionales.", hallazgo: "Coincidencia en listas de buscados. Verificación urgente." },
  { claves: ["debarred", "debarment", "ineligible", "exclusions", "denied", "enforcement", "sanction"], titulo: "Inhabilitados / enforcement internacional", desc: "Listas de proveedores inhabilitados y acciones de enforcement (bancos multilaterales, reguladores).", hallazgo: "Figura como inhabilitado o sancionado por un organismo internacional." },
];

// Fallback por categoría (tipo_fuente) cuando ninguna regla específica hace match.
const POR_CATEGORIA = [
  { claves: ["colegio", "regulador"], titulo: "Verificación profesional", desc: "Valida matrícula, tarjeta profesional o vigencia ante el colegio regulador.", hallazgo: "Novedad en la matrícula o tarjeta profesional (suspensión, vencimiento o no registro)." },
  { claves: ["inhabilitacion", "enforcement", "sancion", "restrictiv", "vinculante"], titulo: "Listas restrictivas y sanciones", desc: "Listas de control de personas y entidades sancionadas o inhabilitadas.", hallazgo: "Coincidencia en una lista restrictiva. Requiere revisión y debida diligencia." },
  { claves: ["judicial", "penal", "disciplinar", "fiscal", "policiv"], titulo: "Antecedentes judiciales y disciplinarios", desc: "Procesos y antecedentes ante autoridades judiciales, disciplinarias o de control.", hallazgo: "Se encontró un antecedente o proceso. Debe revisarse su tipo y vigencia." },
  { claves: ["media", "osint", "leak"], titulo: "Adverse media / OSINT", desc: "Menciones en medios y fuentes abiertas.", hallazgo: "Mención en medios o fuentes abiertas. Requiere validación manual del contexto." },
  { claves: ["pep", "funcionario"], titulo: "Persona Expuesta Políticamente", desc: "Bases de funcionarios y altos cargos públicos.", hallazgo: "La persona figura como PEP. Debida diligencia reforzada." },
  { claves: ["registro", "identidad", "afiliacion", "profesion"], titulo: "Registro complementario", desc: "Registros de identidad, afiliación o profesión.", hallazgo: "Novedad en el registro complementario consultado." },
];

const DEFAULT = {
  titulo: "Fuente de verificación",
  desc: "Fuente consultada dentro del proceso de debida diligencia.",
  hallazgo: "Se encontró una coincidencia que requiere revisión manual.",
};

export function describirFuente(item) {
  const slug = norm(item?.fuente_nombre);
  const nombre = norm(item?.fuente);
  const tipo = norm(item?.tipo_fuente);
  const objetivo = `${slug} ${nombre}`;

  for (const regla of REGLAS) {
    if (regla.claves.some((k) => objetivo.includes(k))) {
      return { titulo: regla.titulo, desc: regla.desc, hallazgo: regla.hallazgo };
    }
  }
  for (const regla of POR_CATEGORIA) {
    if (regla.claves.some((k) => tipo.includes(k) || objetivo.includes(k))) {
      return { titulo: regla.titulo, desc: regla.desc, hallazgo: regla.hallazgo };
    }
  }
  return DEFAULT;
}
