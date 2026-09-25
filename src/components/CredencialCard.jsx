import React from "react";

// Tarjeta que muestra cómo se ve una credencial (mismo look que el PDF).
// Se usa en la vista previa del constructor y en el modal de "ejemplo".
export default function CredencialCard({ nombre, descripcion, color, organizacion, sujeto, campos = [], valores = {}, ejemplo = false }) {
  const acento = /^#[0-9a-fA-F]{6}$/.test(color || "") ? color : "#10b981";

  const grupos = []; const idx = {};
  campos.forEach((c) => { const g = c.grupo || ""; if (!(g in idx)) { idx[g] = grupos.length; grupos.push({ g, campos: [] }); } grupos[idx[g]].campos.push(c); });

  const valorDe = (c) => {
    const v = valores[c.clave];
    const vacio = v == null || v === "";
    if (ejemplo && vacio) {
      return c.tipo === "booleano" ? "Sí" : c.tipo === "fecha" ? "2026-01-15" : c.tipo === "numero" ? "123" : `Ejemplo`;
    }
    if (c.tipo === "booleano") return v ? "Sí" : "No";
    return vacio ? "—" : String(v);
  };

  return (
    <div style={{ background: "#fff", color: "#111827", borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,.18)", fontFamily: "Segoe UI, system-ui, sans-serif" }}>
      <div style={{ borderBottom: `4px solid ${acento}`, padding: "16px 18px" }}>
        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: acento, fontWeight: 800 }}>{organizacion || "Econfia"}</div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{nombre || "Nombre de la credencial"}</div>
        {descripcion && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{descripcion}</div>}
        {sujeto && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>Titular: <strong>{sujeto}</strong></div>}
      </div>

      <div style={{ padding: "6px 18px 14px" }}>
        {campos.length === 0 && <p style={{ color: "#9ca3af", fontSize: 13 }}>Los campos aparecerán aquí.</p>}
        {grupos.map((sec, i) => (
          <div key={i}>
            {sec.g && <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: acento, margin: "12px 0 4px" }}>{sec.g}</div>}
            {sec.campos.map((c, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#6b7280" }}>{c.etiqueta || "(campo)"}</span>
                <span style={{ fontWeight: 600, textAlign: "right" }}>{valorDe(c)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: "#fafafa", borderTop: "1px solid #eee" }}>
        <div style={{ width: 52, height: 52, borderRadius: 8, background: "repeating-conic-gradient(#111 0 25%, #fff 0 50%) 50%/9px 9px", border: "1px solid #e5e7eb" }} />
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          <div style={{ fontWeight: 800, color: acento, textTransform: "uppercase", letterSpacing: ".5px" }}>Verificación de autenticidad</div>
          Escanea el código QR para confirmar que es auténtica y no fue alterada.
        </div>
      </div>
    </div>
  );
}
