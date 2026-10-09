import { buildInformeHtml } from "./informeHtml";

describe("buildInformeHtml trazabilidad", () => {
  test("muestra fecha, URL oficial y enlaza la evidencia", () => {
    const url = "https://procesos.ramajudicial.gov.co/consulta";
    const html = buildInformeHtml({
      consulta: {
        fecha: "2026-10-09T13:56:22-05:00",
        candidato: { nombre: "Persona", apellido: "Prueba", cedula: "123" },
      },
      riesgo: { categoria: "Bajo", riesgo: 1, probabilidad: 1, consecuencia: 1 },
      resultados: [{
        fuente: "Rama Judicial",
        tipo_fuente: "Procesos judiciales",
        estado: "validado",
        score: 1,
        mensaje: "Sin coincidencias",
        archivo: "resultados/evidencia.png",
        fuente_url: url,
        fecha_inicio_fuente: "2026-10-09T13:56:20-05:00",
        fecha_fin_fuente: "2026-10-09T13:56:23-05:00",
      }],
      apiUrl: "https://api.econfia.co",
      qrUrl: "",
      verifyUrl: "",
      burbujaUrl: "",
    });

    expect(html).toContain("Nota de consulta:");
    expect(html).toContain("09/10/2026");
    expect(html).toContain("13:56:20");
    expect(html).toContain("13:56:23");
    expect(html).toContain(`href="${url}"`);
    expect(html).toContain("Selecciona la evidencia para abrir la página oficial");
  });

  test("no convierte esquemas inseguros en enlaces", () => {
    const unsafeUrl = ["java", "script:alert(1)"].join("");
    const html = buildInformeHtml({
      consulta: { fecha: "2026-10-09T13:56:22-05:00", candidato: {} },
      riesgo: {},
      resultados: [{
        fuente: "Prueba",
        mensaje: "Resultado",
        archivo: "resultados/evidencia.png",
        fuente_url: unsafeUrl,
      }],
      apiUrl: "https://api.econfia.co",
    });

    expect(html).not.toContain(`href="${unsafeUrl}`);
    expect(html).toContain("URL oficial:</strong> no registrada");
  });

  test("muestra el nombre real de la fuente y no el nombre genérico de su tipo", () => {
    const html = buildInformeHtml({
      consulta: { fecha: "2026-10-09T13:56:22-05:00", candidato: {} },
      riesgo: {},
      resultados: [{
        fuente: "ADRES – Administradora de Recursos del Sistema de Salud",
        fuente_nombre: "adres",
        tipo_fuente: "Registros Complementarios",
        estado: "validado",
        mensaje: "Información Básica:\nTIPO DE IDENTIFICACIÓN: CC\nNÚMERO DE IDENTIFICACIÓN: 123",
      }],
      apiUrl: "https://api.econfia.co",
    });

    expect(html).toContain("ADRES – Administradora de Recursos del Sistema de Salud");
    expect(html).toContain("Registros Complementarios");
    expect(html).not.toContain(">Registro complementario</span>");
    expect(html).toContain("TIPO DE IDENTIFICACIÓN");
    expect(html).toContain("NÚMERO DE IDENTIFICACIÓN");
  });
});
