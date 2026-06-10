export const EXPERIAN_DOCUMENT_OPTIONS = [
  { value: "1", label: "Cédula de ciudadanía" },
  { value: "2", label: "Cédula de extranjería" },
  { value: "3", label: "NIT" },
  { value: "4", label: "Tarjeta de identidad" },
  { value: "5", label: "Pasaporte" },
  { value: "6", label: "PEP" },
  { value: "7", label: "PPT" },
];

export function getExperianSubjectField(tipoIdentificacion) {
  const normalized = String(tipoIdentificacion || "").trim().toUpperCase();
  const isNit = normalized === "3" || normalized === "NIT";

  if (isNit) {
    return {
      key: "apellidoRazonSocial",
      label: "Razón social",
      placeholder: "Ingrese la razón social",
      persona: "pj",
    };
  }

  return {
    key: "apellidoRazonSocial",
    label: "Primer apellido",
    placeholder: "Ingrese el primer apellido",
    persona: "pn",
  };
}

export function isExperianConsulta(item) {
  const source = String(item?.source || "").trim().toLowerCase();
  const tipo = String(item?.tipo_consulta || item?.tipo || "").trim().toLowerCase();
  return source === "experian" || tipo === "experian";
}

export function normalizeExperianConsulta(item) {
  return {
    ...item,
    id: item.id,
    row_id: `experian-${item.id}`,
    source: "experian",
    tipo: item.tipo_resultado === "pj" ? "EMPRESA" : "PERSONA",
    tipo_consulta: "experian",
    cedula: item.numero_identificacion || "",
    nit: item.numero_identificacion || "",
    nombre: item.apellido_razon_social || "",
    fecha: item.created_at || item.updated_at || null,
    consulta_original_id: item.id,
  };
}
