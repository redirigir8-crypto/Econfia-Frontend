import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Aterriza el enlace de invitación al equipo de una empresa.
export default function AceptarInvitacion() {
  const [msg, setMsg] = useState("Procesando invitación…");
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    const auth = localStorage.getItem("token");
    if (!token) { setMsg("Enlace de invitación inválido."); return; }
    if (!auth) {
      // Sin sesión: manda a login y vuelve aquí después.
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/login?next=${next}`, { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/wallet/empresa/equipo/aceptar/`, {
          method: "POST",
          headers: { Authorization: `Token ${auth}`, "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data.empresa_id) localStorage.setItem("wallet_empresa_id", String(data.empresa_id));
          setMsg(`¡Listo! Te uniste al equipo de ${data.razon_social || "la empresa"}. Redirigiendo…`);
          setTimeout(() => navigate("/e7c1a9d4", { replace: true }), 1600);
        } else {
          setMsg(data.error || "No se pudo aceptar la invitación.");
        }
      } catch {
        setMsg("Error de conexión. Intenta de nuevo.");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-content">
      <div className="text-center max-w-sm">
        <div className="text-3xl mb-3">🏢</div>
        <p className="text-lg font-semibold">{msg}</p>
      </div>
    </div>
  );
}
