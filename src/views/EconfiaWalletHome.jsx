import { useEffect, useState } from "react";
import EconfiaWallet from "./EconfiaWallet";
import EconfiaWalletEmpresa from "./EconfiaWalletEmpresa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Punto de entrada del wallet. La FUENTE DE VERDAD del tipo de cuenta es el
// backend (mis-empresas → soy_empresa), NO el objeto "user" de localStorage,
// que otras vistas sobrescriben con formas que a veces no traen "perfil".
// - Cuenta empresa (persona jurídica) → SIEMPRE la vista de empresa.
// - Persona natural                   → wallet personal, con opción de saltar a
//   una empresa donde sea MIEMBRO (Fase 5).
export default function EconfiaWalletHome() {
  // Adivinanza inicial para evitar parpadeo; el backend la corrige.
  const guessEmpresa = (() => {
    try { return JSON.parse(localStorage.getItem("user"))?.perfil?.tipo_registro === "empresa"; }
    catch { return false; }
  })();

  const [soyEmpresa, setSoyEmpresa] = useState(guessEmpresa);
  const [empresas, setEmpresas] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [vista, setVista] = useState("personal"); // "personal" o id de empresa (miembro)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/wallet/empresa/mis-empresas/`, {
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) {
          setSoyEmpresa(!!data.soy_empresa);
          setEmpresas(data.empresas || []);
        }
      } catch { /* silencioso */ }
      setCargado(true);
    })();
  }, []);

  // Cuenta empresa: vista de empresa directa, sin selector personal.
  if (soyEmpresa) {
    try { localStorage.removeItem("wallet_empresa_id"); } catch { /* noop */ }
    return <EconfiaWalletEmpresa />;
  }

  const cambiar = (val) => {
    try {
      if (val === "personal") localStorage.removeItem("wallet_empresa_id");
      else localStorage.setItem("wallet_empresa_id", String(val));
    } catch { /* noop */ }
    setVista(val);
  };

  // Solo se muestra el selector si la persona pertenece a alguna empresa.
  const selector = cargado && empresas.length > 0 && (
    <div className="max-w-5xl mx-auto px-4 pt-2">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-muted font-semibold">Mis empresas:</span>
        <button
          onClick={() => cambiar("personal")}
          className={`px-3 py-1.5 rounded-lg font-semibold border ${vista === "personal" ? "bg-brand/20 border-brand/40 text-content" : "border-line/15 text-muted"}`}
        >Mi wallet personal</button>
        {empresas.map((e) => (
          <button
            key={e.empresa_id}
            onClick={() => cambiar(e.empresa_id)}
            className={`px-3 py-1.5 rounded-lg font-semibold border ${String(vista) === String(e.empresa_id) ? "bg-emerald-500/20 border-emerald-500/40 text-content" : "border-line/15 text-muted"}`}
          >🏢 {e.razon_social}</button>
        ))}
      </div>
    </div>
  );

  const esVistaEmpresa = vista !== "personal";

  return (
    <>
      {selector}
      {esVistaEmpresa
        ? <EconfiaWalletEmpresa key={vista} />
        : <EconfiaWallet />}
    </>
  );
}
