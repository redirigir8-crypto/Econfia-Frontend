import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import WalletSolicitudes from "./WalletSolicitudes";
import WalletArchivo from "./WalletArchivo";

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; localStorage.clear(); });
const solicitud = {
  codigo: "REQ-ABCD", empresa: "Empresa de prueba", destinatario: "Persona de prueba",
  motivo: "Proceso de contratación", estado: "pendiente", vence: "2026-10-01T00:00:00Z",
  detalles: [{ id: 1, tipo: "cedula", label: "Cédula" }],
};
function mockApi({ empresa = false, estado = "pendiente", opciones = true } = {}) {
  let actual = estado;
  global.fetch = jest.fn(async (url, options = {}) => {
    if (options.method === "POST") {
      const body = JSON.parse(options.body);
      actual = url.endsWith("/revocar/") ? "revocada" : body.decision === "rechazar" ? "rechazada" : "autorizada";
      return { ok: true, json: async () => ({ codigo: "REQ-ABCD" }) };
    }
    return { ok: true, json: async () => ({
      solicitudes: empresa ? [] : [{ ...solicitud, estado: actual }],
      tipos: [{ valor: "cedula", label: "Cédula" }],
      archivos_disponibles: opciones ? { cedula: [{ origen: "documento", id: 12, nombre: "mi-cedula.pdf" }] } : {},
    }) };
  });
}

test("la empresa solicita documentos con correo y motivo", async () => {
  mockApi({ empresa: true });
  render(<WalletSolicitudes empresa />);
  fireEvent.change(screen.getByLabelText("Correo de la persona"), { target: { value: "persona@example.com" } });
  fireEvent.change(screen.getByLabelText("Motivo de la solicitud"), { target: { value: "Contratación" } });
  fireEvent.click(await screen.findByLabelText("Cédula"));
  fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
  expect(await screen.findByText(/Solicitud REQ-ABCD enviada/)).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([, opts]) => opts.method === "POST");
  expect(JSON.parse(options.body)).toEqual({ correo: "persona@example.com", motivo: "Contratación", tipos: ["cedula"] });
});

test("autorizar requiere selección y consentimiento y envía solo el archivo elegido", async () => {
  mockApi(); render(<WalletSolicitudes />);
  const selector = await screen.findByLabelText("Cédula");
  const button = screen.getByRole("button", { name: "Autorizar archivos" });
  expect(button).toBeDisabled();
  fireEvent.change(selector, { target: { value: "documento:12" } });
  expect(button).toBeDisabled();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(button);
  await screen.findByText("Autorizada");
  const [, options] = global.fetch.mock.calls.find(([, opts]) => opts.method === "POST");
  expect(JSON.parse(options.body)).toEqual({ decision: "autorizar", selecciones: [{ detalle_id: 1, origen: "documento", archivo_id: 12 }] });
});

test("puede rechazar aunque falten archivos", async () => {
  mockApi({ opciones: false }); render(<WalletSolicitudes />);
  fireEvent.click(await screen.findByRole("button", { name: "Rechazar solicitud" }));
  await screen.findByText("Rechazada");
  expect(screen.queryByRole("button", { name: "Autorizar archivos" })).not.toBeInTheDocument();
});

test("puede revocar el acceso autorizado", async () => {
  mockApi({ estado: "autorizada" }); render(<WalletSolicitudes />);
  fireEvent.click(await screen.findByRole("button", { name: "Revocar acceso" }));
  await screen.findByText("Revocada");
  expect(global.fetch.mock.calls.some(([url, opts]) => url.endsWith("/REQ-ABCD/revocar/") && opts.method === "POST")).toBe(true);
});

test("muestra error del servidor sin presentar autorización como exitosa", async () => {
  mockApi(); render(<WalletSolicitudes />);
  await screen.findByRole("button", { name: "Rechazar solicitud" });
  global.fetch.mockImplementationOnce(async () => ({ ok: false, json: async () => ({ error: "La solicitud expiró." }) }));
  fireEvent.click(screen.getByRole("button", { name: "Rechazar solicitud" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("La solicitud expiró.");
  expect(screen.getByText("Pendiente")).toBeInTheDocument();
});

test("la descarga usa autenticación y muestra revocación", async () => {
  localStorage.setItem("token", "token-prueba");
  global.fetch = jest.fn(async () => ({ ok: false, json: async () => ({ error: "El acceso expiró o fue revocado." }) }));
  render(<WalletArchivo documento={{ archivo_url: "https://example.com/api/archivo/", archivo_protegido: true }} />);
  fireEvent.click(screen.getByRole("button", { name: "Descargar" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("revocado"));
  expect(global.fetch).toHaveBeenCalledWith("https://example.com/api/archivo/", { headers: { Authorization: "Token token-prueba" } });
});
