import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EconfiaWalletEmpresa from "./EconfiaWalletEmpresa";

jest.mock("../components/Toast", () => ({ message }) => <div role="status">{message}</div>);
const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

function setup() {
  const empresa = { razon_social: "Empresa SAS", nombre_comercial: "Marca", ciiu: "6201", tamano: "micro" };
  global.fetch = jest.fn(async (url, options = {}) => {
    if (url.endsWith("/estado/")) return { ok: true, json: async () => ({ empresa,
      documentos: [{ id: 1, tipo_label: "ISO 27001", grupo: "certificaciones", nombre_original: "iso.pdf" }],
      tipos_documento: [{ valor: "iso_27001", label: "Certificación ISO 27001", grupo: "certificaciones" }],
    }) };
    if (url.endsWith("/datos/")) return { ok: true, json: async () => ({ empresa: JSON.parse(options.body) }) };
    if (url.endsWith("/logo/")) return { ok: true, json: async () => ({ logo_url: "/media/logo.png" }) };
    return { ok: true, json: async () => ({ compartidas: [] }) };
  });
  render(<EconfiaWalletEmpresa />);
}

test("edita campos ampliados sin perder foco y guarda sus valores", async () => {
  setup();
  const nombre = await screen.findByLabelText("Nombre comercial");
  nombre.focus();
  fireEvent.change(nombre, { target: { value: "Nueva marca" } });
  expect(screen.getByLabelText("Nombre comercial")).toHaveFocus();
  fireEvent.change(screen.getByLabelText("CIIU principal"), { target: { value: "0111" } });
  fireEvent.change(screen.getByLabelText("Fecha de constitución"), { target: { value: "2020-05-10" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar datos" }));
  await screen.findByText("Datos de la empresa guardados.");
  const call = global.fetch.mock.calls.find(([url]) => url.endsWith("/datos/"));
  expect(JSON.parse(call[1].body)).toMatchObject({ nombre_comercial: "Nueva marca", ciiu: "0111", fecha_constitucion: "2020-05-10" });
  expect(screen.getByRole("heading", { name: "Certificaciones (1)" })).toBeInTheDocument();
});

test("sube el logo sin descartar los datos sin guardar", async () => {
  setup();
  fireEvent.change(await screen.findByLabelText("Nombre comercial"), { target: { value: "Pendiente de guardar" } });
  const file = new File(["imagen"], "logo.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText(/PNG, JPG o WEBP/), { target: { files: [file] } });
  await waitFor(() => expect(screen.getByAltText("Logo actual de la empresa")).toHaveAttribute("src", "/media/logo.png"));
  expect(screen.getByLabelText("Nombre comercial")).toHaveValue("Pendiente de guardar");
  const call = global.fetch.mock.calls.find(([url]) => url.endsWith("/logo/"));
  expect(call[1].body.get("logo")).toBe(file);
});
