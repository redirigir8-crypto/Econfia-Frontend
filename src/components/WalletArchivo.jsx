import { useState } from "react";

export default function WalletArchivo({ documento }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  if (!documento.archivo_url) return null;
  if (!documento.archivo_protegido) return <a href={documento.archivo_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 underline">Ver</a>;
  const descargar = async () => {
    setCargando(true); setError("");
    try {
      const res = await fetch(documento.archivo_url, { headers: { Authorization: `Token ${localStorage.getItem("token")}` } });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.detail || "No se pudo descargar el archivo.");
      }
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url; link.download = documento.nombre_original || "documento";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e.message); }
    finally { setCargando(false); }
  };
  return <span className="inline-flex flex-col items-end gap-1">
    <button type="button" disabled={cargando} onClick={descargar} className="text-xs text-emerald-400 underline disabled:opacity-50">{cargando ? "Descargando…" : "Descargar"}</button>
    {error && <span role="alert" className="text-xs text-red-400 max-w-xs whitespace-normal">{error}</span>}
  </span>;
}
