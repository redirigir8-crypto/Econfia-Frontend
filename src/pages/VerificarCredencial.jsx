import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Página PÚBLICA (sin sesión) para verificar la autenticidad de una credencial
// emitida desde econfiaWallet. Lee ?codigo= y consulta el sello anti-manipulación.
export default function VerificarCredencial() {
  const [estado, setEstado] = useState("cargando"); // cargando | listo | error
  const [data, setData] = useState(null);

  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    if (!codigo) { setEstado("error"); return; }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/wallet/credencial/verificar/${encodeURIComponent(codigo)}/`);
        const d = await res.json();
        setData(d);
        setEstado("listo");
      } catch { setEstado("error"); }
    })();
  }, []);

  const wrap = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "#0b1220", fontFamily: "Segoe UI, system-ui, sans-serif" };
  const card = { width: "100%", maxWidth: 560, background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,.35)", color: "#111827" };

  if (estado === "cargando") {
    return <div style={wrap}><div style={card}><p style={{ margin: 0, color: "#6b7280" }}>Verificando credencial…</p></div></div>;
  }
  if (estado === "error" || !data) {
    return <div style={wrap}><div style={card}>
      <h1 style={{ fontSize: 20, margin: 0 }}>Enlace de verificación inválido</h1>
      <p style={{ color: "#6b7280" }}>No se pudo verificar la credencial. Revisa el enlace o el código QR.</p>
    </div></div>;
  }

  const valida = data.valida;
  const color = valida ? "#16a34a" : "#dc2626";
  const icono = valida ? "✓" : "✕";
  const titulo = valida ? "Credencial auténtica" : "Credencial NO válida";
  const motivo = data.motivo
    || (data.estado === "revocada" ? "La credencial fue revocada por el emisor."
      : data.integridad === false ? "El contenido no coincide con el sello: pudo ser alterada."
      : "");

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}18`, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800 }}>{icono}</div>
          <div>
            <h1 style={{ fontSize: 20, margin: 0, color }}>{titulo}</h1>
            {data.esquema && <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 13 }}>{data.esquema} · {data.organizacion}</p>}
          </div>
        </div>

        {motivo && <p style={{ marginTop: 14, color: "#b45309", background: "#fef3c7", padding: "10px 12px", borderRadius: 10, fontSize: 13 }}>{motivo}</p>}

        {data.esquema && (
          <div style={{ marginTop: 18, borderTop: "1px solid #e5e7eb", paddingTop: 14 }}>
            {data.sujeto && <p style={{ fontSize: 13, margin: "0 0 6px" }}>Titular: <strong>{data.sujeto}</strong></p>}
            {data.emitida && <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px" }}>Emitida el {new Date(data.emitida).toLocaleString("es-CO")}</p>}
            {(data.secciones || []).map((sec, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                {sec.grupo && <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#6b7280", margin: "10px 0 6px" }}>{sec.grupo}</div>}
                {sec.campos.map((c, j) => (
                  <div key={j} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ color: "#6b7280" }}>{c.etiqueta}</span>
                    <span style={{ fontWeight: 600, textAlign: "right" }}>{c.valor}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", fontFamily: "monospace" }}>Código: {data.codigo}</p>
        <p style={{ marginTop: 4, fontSize: 11, color: "#9ca3af" }}>Verificado por econfiaWallet.</p>
      </div>
    </div>
  );
}
