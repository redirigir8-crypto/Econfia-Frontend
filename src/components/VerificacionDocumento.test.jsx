import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { VerificarCedulaModal } from "./VerificacionIdentidadModal";
import { evaluarCalidadCaptura } from "../utils/calidadImagen";

jest.mock("../utils/calidadImagen", () => ({
  evaluarCalidadCaptura: jest.fn(() => ({ aceptable: true, motivos: [] })),
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/" }),
}), { virtual: true });

const originalFetch = global.fetch;
let stop;
beforeEach(() => {
  stop = jest.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true, value: { getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [{ stop }] }) },
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", { configurable: true, get: () => 1920 });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", { configurable: true, get: () => 1080 });
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: jest.fn() });
  jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/jpeg;base64,YQ==");
  evaluarCalidadCaptura.mockReturnValue({ aceptable: true, motivos: [] });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true, json: async () => ({ documento: { id: 1, estado_verificacion: "verificado" } }),
  });
});
afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = originalFetch;
});

async function abrir(tipo) {
  const props = { onClose: jest.fn(), onVerificado: jest.fn(), setToast: jest.fn() };
  render(<VerificarCedulaModal {...props} />);
  fireEvent.click(screen.getByRole("button", { name: tipo }));
  fireEvent.click(screen.getByRole("button", { name: /Tomar fotos/ }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled());
  return props;
}

test.each([["Pasaporte", "PA"], ["Visa", "VISA"]])("%s envía una sola imagen y el tipo elegido", async (nombre, tipo) => {
  await abrir(nombre);
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  expect(screen.queryByText(/Ahora enfoque el reverso/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: new RegExp("Verificar " + nombre, "i") }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  const body = global.fetch.mock.calls[0][1].body;
  expect(body.get("tipo_doc")).toBe(tipo);
  expect(body.has("archivo")).toBe(true);
  expect(body.has("archivo_reverso")).toBe(false);
});

test("CC conserva la captura de frente y reverso", async () => {
  await abrir("Cédula de Ciudadanía");
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  expect(screen.getByText(/Ahora enfoque el reverso/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  fireEvent.click(screen.getByRole("button", { name: /Verificar cédula/ }));
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  expect(global.fetch.mock.calls[0][1].body.has("archivo_reverso")).toBe(true);
});

test("mala calidad no avanza ni envía una captura", async () => {
  await abrir("Pasaporte");
  evaluarCalidadCaptura.mockReturnValue({ aceptable: false, motivos: ["Imagen desenfocada"] });
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  expect(screen.getByText("Imagen desenfocada")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Capturar" })).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("revisión requerida no inicia polling ni se anuncia como verificada", async () => {
  global.fetch.mockResolvedValue({
    ok: true, json: async () => ({ documento: {
      id: 1, estado_verificacion: "pendiente",
      detalle_verificacion: { resultado: "revision_requerida", mensaje: "No se pudo confirmar la vigencia." },
    } }),
  });
  const props = await abrir("Visa");
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  fireEvent.click(screen.getByRole("button", { name: /Verificar visa/ }));
  await waitFor(() => expect(props.onClose).toHaveBeenCalled());
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(props.setToast).toHaveBeenCalledWith({ type: "info", message: "No se pudo confirmar la vigencia." });
});

test("PP de una cara no solicita reverso", async () => {
  render(<VerificarCedulaModal onClose={jest.fn()} setToast={jest.fn()} onVerificado={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Permiso de Permanencia" }));
  fireEvent.click(screen.getByRole("radio", { name: "No, una cara" }));
  fireEvent.click(screen.getByRole("button", { name: /Tomar fotos/ }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Capturar" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Capturar" }));
  expect(screen.getByRole("button", { name: /Verificar permiso/ })).toBeInTheDocument();
  expect(screen.queryByText(/Ahora enfoque el reverso/)).not.toBeInTheDocument();
});
