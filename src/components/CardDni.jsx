// src/components/IDCard.jsx
export default function CardDni({ data }) {
  // Mapeo alternativo para campos del backend
  const apellido = data?.last_name || data?.apellido || "";
  const nombre = data?.first_name || data?.nombre || "";
  const cedula = data?.document || data?.cedula || "";
  const sexo = data?.gender || data?.sexo || "";
  const fechaNacimiento = data?.birth_date || data?.fecha_nacimiento || "";
  const tipoDoc = data?.doc_type || data?.tipo_doc || "";
  const fechaExpedicion = data?.fecha_expedicion || "";
  return (
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 uppercase">
            República de Colombia
          </h2>
          <p className="text-xs text-gray-500">
            {tipoDoc === "CC" ? "Cédula de ciudadanía" : "Documento"}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-600">
          NUIP: {cedula}
        </span>
      </div>

      {/* Foto + Datos */}
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="w-28 h-36 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
          {data?.foto ? (
            <img
              src={data.foto}
              alt={`${nombre} ${apellido}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">FOTO</span>
          )}
        </div>

        {/* Datos */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-800">
          <span className="font-semibold">Apellidos:</span>
          <span>{apellido}</span>
          <span className="font-semibold">Nombres:</span>
          <span>{nombre}</span>

          <span className="font-semibold">Sexo:</span>
          <span>{sexo}</span>

          <span className="font-semibold">Fecha Nac.:</span>
          <span>{fechaNacimiento ? new Date(fechaNacimiento).toLocaleDateString() : "—"}</span>

        </div>
      </div>

      {/* Fechas */}
      <div className="mt-4 text-xs text-gray-600">
        <p>
          <span className="font-semibold">Fecha de expedición:</span>{" "}
          {fechaExpedicion}
        </p>
      </div>
    </div>
  );
}
