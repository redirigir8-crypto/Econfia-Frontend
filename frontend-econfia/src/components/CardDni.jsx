// src/components/IDCard.jsx
export default function CardDni({ data }) {
  return (
    <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 uppercase">
            República de Colombia
          </h2>
          <p className="text-xs text-gray-500">
            {data?.tipo_doc === "CC" ? "Cédula de ciudadanía" : "Documento"}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-600">
          NUIP: {data?.cedula}
        </span>
      </div>

      {/* Foto + Datos */}
      <div className="flex gap-6">
        {/* Avatar */}
        <div className="w-28 h-36 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
          {data?.foto ? (
            <img
              src={data.foto}
              alt={`${data?.nombre} ${data?.apellido}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">FOTO</span>
          )}
        </div>

        {/* Datos */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-800">
          <span className="font-semibold">Apellidos:</span>
          <span>{data?.apellido}</span>
          <span className="font-semibold">Nombres:</span>
          <span>{data?.nombre}</span>

          <span className="font-semibold">Sexo:</span>
          <span>{data?.sexo}</span>

          <span className="font-semibold">Fecha Nac.:</span>
          <span>{data?.fecha_nacimiento}</span>

        </div>
      </div>

      {/* Fechas */}
      <div className="mt-4 text-xs text-gray-600">
        <p>
          <span className="font-semibold">Fecha de expedición:</span>{" "}
          {data?.fecha_expedicion}
        </p>
      </div>
    </div>
  );
}
