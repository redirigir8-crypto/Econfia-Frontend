import { useEffect, useMemo, useState } from "react";
import { Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";

function toArray(v) {
  return Array.isArray(v) ? v : [];
}
function fmtText(v) {
  if (v === null || v === undefined || v === "" || v === "null") return "—";
  return String(v);
}
function tipoDireccion(d) {
  if (d.tipoResidencia) return "Residencia";
  if (d.tipoLaboralOComercial) return "Laboral / Comercial";
  if (d.tipoCorrespondencia) return "Correspondencia";
  return fmtText(d.tipo);
}

function Section({ icon: Icon, title, count, children }) {
  return (
    <section className="rounded-[22px] border border-white/[0.08] bg-slate-950/60 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/[0.08] text-cyan-300">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-300">{count}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-1.5 text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function InfoCard({ titulo, badge, filas }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="truncate text-sm font-bold text-white">{titulo}</div>
        {badge && (
          <span className="shrink-0 rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-300">
            {badge}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
        {filas.filter((f) => f && f.value !== "—").map((f) => (
          <div key={f.label}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">{f.label}</div>
            <div className="mt-0.5 text-xs font-medium text-slate-100">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReconocerDetalleResultados({ consultaId }) {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/reconocer/consultas/${consultaId}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        const json = await response.json();
        if (!response.ok) throw new Error(json?.detail || `Error HTTP ${response.status}`);
        if (!cancelled) setDetalle(json);
      } catch (e) {
        if (!cancelled) setError(e.message || "No fue posible cargar Econfia Recognize.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [consultaId]);

  const rep = useMemo(() => {
    const root = detalle?.respuesta_json || {};
    return root.reporte || root;
  }, [detalle]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-t-cyan-400 border-slate-800" />
      </div>
    );
  }
  if (error) {
    return <div className="mx-auto max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-6 text-center text-sm text-rose-200">{error}</div>;
  }
  if (!detalle) return null;

  const basica = rep.informacionBasica || {};
  const edad = basica.rangoEdad ? `${basica.rangoEdad.min} - ${basica.rangoEdad.max} años` : "—";
  const direcciones = toArray(rep.direcciones);
  const celulares = toArray(rep.celulares);
  const telefonos = toArray(rep.telefonos);
  const emails = toArray(rep.emails);

  const fullName = basica.nombreCompleto || detalle.apellido_razon_social || "—";

  return (
    <div className="grid gap-4">
      {/* Encabezado */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950/70 p-6 backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Econfia Recognize
          </div>
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl">{fullName}</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-400">
          <span>Doc: {fmtText(basica.numeroIdentificacion || detalle.numero_identificacion)}</span>
          {basica.genero && <span>Género: {basica.genero === "M" ? "Masculino" : basica.genero === "F" ? "Femenino" : basica.genero}</span>}
          <span>Edad: {edad}</span>
          {rep.fechaConsulta && <span>Consulta: {String(rep.fechaConsulta).slice(0, 10)}</span>}
        </div>
      </div>

      {/* Identificación */}
      <Section icon={UserRound} title="Identificación">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Documento" value={fmtText(basica.numeroIdentificacion)} />
          <StatTile label="Estado documento" value={fmtText(basica.estadoDocumento)} />
          <StatTile label="Expedición" value={fmtText(basica.fechaExpedicion)} />
          <StatTile label="Lugar expedición" value={`${fmtText(basica.municipioExpedicion)}, ${fmtText(basica.departamentoExpedicion)}`} />
        </div>
      </Section>

      {/* Direcciones */}
      {direcciones.length > 0 && (
        <Section icon={MapPin} title="Direcciones" count={direcciones.length}>
          <div className="grid gap-2.5">
            {direcciones.map((d, i) => (
              <InfoCard
                key={i}
                titulo={fmtText(d.dato)}
                badge={tipoDireccion(d)}
                filas={[
                  { label: "Ciudad", value: `${fmtText(d.nombreCiudad)}, ${fmtText(d.nombreDepartamento)}` },
                  { label: "Reportado desde", value: fmtText(d.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(d.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(d.numReportes) },
                  { label: "N° entidades", value: fmtText(d.numeroEntidades) },
                  { label: "Antigüedad (meses)", value: fmtText(d.antiguedad) },
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Celulares */}
      {(celulares.length > 0 || telefonos.length > 0) && (
        <Section icon={Phone} title="Teléfonos y celulares" count={celulares.length + telefonos.length}>
          <div className="grid gap-2.5 md:grid-cols-2">
            {celulares.map((c, i) => (
              <InfoCard
                key={`cel-${i}`}
                titulo={fmtText(c.celular)}
                badge="Celular"
                filas={[
                  { label: "Reportado desde", value: fmtText(c.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(c.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(c.numReportes) },
                  { label: "N° entidades", value: fmtText(c.numeroEntidades) },
                ]}
              />
            ))}
            {telefonos.map((t, i) => (
              <InfoCard
                key={`tel-${i}`}
                titulo={fmtText(t.telefono || t.numero)}
                badge="Fijo"
                filas={[
                  { label: "Reportado desde", value: fmtText(t.reportadoDesde) },
                  { label: "Último reporte", value: fmtText(t.ultimoReporte) },
                  { label: "N° reportes", value: fmtText(t.numReportes) },
                ]}
              />
            ))}
          </div>
        </Section>
      )}

      {/* Emails */}
      {emails.length > 0 && (
        <Section icon={Mail} title="Correos electrónicos" count={emails.length}>
          <div className="grid gap-2 md:grid-cols-2">
            {emails.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{fmtText(e.email)}</div>
                  <div className="text-xs text-slate-400">
                    {fmtText(e.reportadoDesde)} → {fmtText(e.ultimoReporte)} · {fmtText(e.numReportes)} reportes
                  </div>
                </div>
                <Mail className="h-4 w-4 shrink-0 text-cyan-300" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* JSON crudo */}
      <div>
        <button type="button" onClick={() => setShowJson((v) => !v)} className="text-xs font-semibold text-cyan-300 hover:text-cyan-200">
          {showJson ? "Ocultar" : "Ver"} respuesta completa (JSON)
        </button>
        {showJson && (
          <pre className="mt-2 max-h-[28rem] overflow-auto rounded-xl border border-white/10 bg-[#02040a] p-4 text-[11px] leading-5 text-cyan-100/80">
            {JSON.stringify(detalle.respuesta_json, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
