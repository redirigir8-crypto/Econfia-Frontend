import { render, screen } from "@testing-library/react";
import WalletPublico from "./WalletPublico";

jest.mock("react-router-dom", () => ({ useParams: () => ({ token: "pase-prueba" }) }));

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

function abrir(data, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status === 200, status, json: async () => data,
  });
  render(<WalletPublico />);
}

test("muestra datos corporativos y documentos compartidos", async () => {
  abrir({
    es_empresa: true,
    empresa: { razon_social: "Empresa de prueba SAS", nit: "900123456", ciudad: "Bogotá", correo: "empresa@example.com" },
    representante: { nombre: "Representante de prueba", tipo_doc: "CC", num_doc: "123456" },
    atributos: ["datos", "representante", "documentos"],
    documentos: [{ tipo_label: "RUT", estado_label: "Pendiente", estado_verificacion: "pendiente", archivo_url: "https://example.com/rut.pdf" }],
  });
  expect(await screen.findByText("Empresa de prueba SAS")).toBeInTheDocument();
  expect(screen.getByText("900123456")).toBeInTheDocument();
  expect(screen.getByText("empresa@example.com")).toBeInTheDocument();
  expect(screen.getByText("Representante de prueba")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Ver documento" })).toHaveAttribute("href", "https://example.com/rut.pdf");
  expect(screen.queryByText("Antecedentes")).not.toBeInTheDocument();
});

test("permite compartir solo representante sin mostrar bloques no autorizados", async () => {
  abrir({ es_empresa: true, empresa: null, representante: { nombre: "Solo representante" }, atributos: ["representante"], documentos: [] });
  expect(await screen.findByText("Solo representante")).toBeInTheDocument();
  expect(screen.queryByText("Datos de la empresa")).not.toBeInTheDocument();
  expect(screen.queryByText("Documentos de la empresa")).not.toBeInTheDocument();
});

test("conserva la vista de persona natural", async () => {
  abrir({ es_empresa: false, persona: { nombre: "Persona de prueba", documento: "CC 456" }, atributos: ["persona", "documentos"], documentos: [] });
  expect(await screen.findByText("Persona de prueba")).toBeInTheDocument();
  expect(screen.getByText("CC 456")).toBeInTheDocument();
  expect(screen.getByText("Sin documentos.")).toBeInTheDocument();
  expect(screen.queryByText("Representante legal")).not.toBeInTheDocument();
});

test("un pase vencido no muestra datos", async () => {
  abrir({}, 410);
  expect(await screen.findByText("Pase no disponible")).toBeInTheDocument();
  expect(screen.queryByText("Datos de la empresa")).not.toBeInTheDocument();
});
