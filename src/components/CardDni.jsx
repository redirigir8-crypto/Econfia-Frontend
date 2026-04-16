function formatDate(value) {
  if (!value) return "No disponible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-CO");
}

function getInitials(nombre, apellido) {
  return `${String(nombre || "").trim().charAt(0)}${String(apellido || "").trim().charAt(0)}`
    .trim()
    .toUpperCase() || "ID";
}

export default function CardDni({ data }) {
  const apellido = data?.last_name || data?.apellido || "No registrado";
  const nombre = data?.first_name || data?.nombre || "No registrado";
  const cedula = data?.document || data?.cedula || "Sin NUIP";
  const sexo = data?.gender || data?.sexo || "No definido";
  const fechaNacimiento = data?.birth_date || data?.fecha_nacimiento || "";
  const tipoDoc = data?.doc_type || data?.tipo_doc || "";
  const fechaExpedicion = data?.fecha_expedicion || "";
  const documentoLabel = tipoDoc === "CC" ? "Cedula de ciudadania" : tipoDoc || "Documento";

  return (
    <div className="relative w-full max-w-[36rem] overflow-hidden rounded-[20px] border border-cyan-200/25 bg-[linear-gradient(180deg,#e7edf4_0%,#f5f7fa_44%,#dce4ee_100%)] shadow-[0_20px_48px_rgba(2,12,27,0.38)]">
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.11),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.10),transparent_24%)]" />
      <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(90deg,#0f2e4f_0%,#123c67_26%,#1c5d8f_52%,#0f436d_76%,#0b2f4d_100%)] opacity-90" />

      <div className="relative z-10 p-4 pt-[3.35rem] sm:p-5 sm:pt-[3.5rem]">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-400/15 pb-3">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-slate-500">
              Republica de Colombia
            </p>
            <h2 className="mt-1.5 text-[1.25rem] font-black uppercase tracking-tight text-slate-800 sm:text-[1.4rem]">
              {documentoLabel}
            </h2>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Documento nacional de identificacion
            </p>
          </div>

          <div className="min-w-[118px] self-start rounded-[10px] border border-cyan-100/35 bg-white/60 px-2.5 py-1.5 text-right shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400">NUIP</p>
            <p className="mt-0.5 whitespace-nowrap font-mono text-[13px] font-black tracking-[0.08em] text-slate-800 sm:text-[14px]">
              {cedula}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[132px_1fr]">
          <div className="space-y-2.5">
            <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-[10px] border border-slate-400/40 bg-[linear-gradient(180deg,#d0d8e3_0%,#eef2f6_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]">
              {data?.foto ? (
                <img
                  src={data.foto}
                  alt={`${nombre} ${apellido}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_55%)] text-slate-500">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white/40 text-lg font-bold">
                    {getInitials(nombre, apellido)}
                  </div>
                  <span className="mt-2.5 text-[10px] uppercase tracking-[0.25em]">Foto</span>
                </div>
              )}
            </div>

            <div className="rounded-[10px] border border-cyan-100/35 bg-white/45 px-3 py-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Fecha de expedicion
              </p>
              <p className="mt-1 text-[13px] font-bold text-slate-700">
                {formatDate(fechaExpedicion)}
              </p>
            </div>
          </div>

          <div className="grid content-start gap-2.5">
            <div className="grid gap-2.5 rounded-[12px] bg-white/30 p-3 sm:grid-cols-[104px_1fr] sm:p-3.5">
              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700">Apellidos</p>
              <p className="border-b border-slate-300/65 pb-1.5 text-[13px] font-medium uppercase tracking-wide text-slate-800 sm:text-sm">
                {apellido}
              </p>

              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700">Nombres</p>
              <p className="border-b border-slate-300/65 pb-1.5 text-[13px] font-medium uppercase tracking-wide text-slate-800 sm:text-sm">
                {nombre}
              </p>

              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700">Sexo</p>
              <p className="border-b border-slate-300/65 pb-1.5 text-[13px] font-medium uppercase tracking-wide text-slate-800 sm:text-sm">
                {sexo}
              </p>

              <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700">Fecha nac.</p>
              <p className="border-b border-slate-300/65 pb-1.5 text-[13px] font-medium uppercase tracking-wide text-slate-800 sm:text-sm">
                {formatDate(fechaNacimiento)}
              </p>
            </div>

            <div className="rounded-[12px] border border-cyan-200/25 bg-[linear-gradient(90deg,rgba(15,47,77,0.09),rgba(255,255,255,0.16),rgba(24,93,143,0.12))] px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                Identificacion valida para consulta
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-600">
                  Titular registrado
                </span>
                <span className="rounded-full border border-cyan-200/30 bg-white/50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-700">
                  Econfia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
