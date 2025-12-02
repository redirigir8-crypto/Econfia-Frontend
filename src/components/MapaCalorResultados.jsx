import { useEffect, useState } from "react";

export default function CandidatoMapa({ consultaId }) {
  const [candidato, setCandidato] = useState(null);
  const [mapaUrl, setMapaUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL;
  const fetchDatos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Info candidato
      const resCandidato = await fetch(`${API_URL}api/calcular_riesgo/${consultaId}/`, {
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` }
      });
      const jsonCandidato = await resCandidato.json();
      setCandidato(jsonCandidato.candidato || null);

      // Mapa de calor como imagen
      const resMapa = await fetch(`${API_URL}/api/mapa-riesgo/${consultaId}/`, {
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` }
      });
      const blob = await resMapa.blob();
      setMapaUrl(URL.createObjectURL(blob));

    } catch (error) {
      console.error(error);
      setCandidato(null);
      setMapaUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultaId) fetchDatos();
    return () => mapaUrl && URL.revokeObjectURL(mapaUrl);
  }, [consultaId]);

  if (loading) return <p className="text-center text-gray-300 text-xs">Cargando...</p>;

  return (
    <div className="mt-4 w-full text-white text-xs">
      {candidato && (
        <div className="mb-2 p-2 bg-gray-800 rounded text-xs">
          <h3 className="font-semibold mb-1">Candidato</h3>
          <div className="grid grid-cols-2 gap-1">
            <p><strong>Cédula:</strong> {candidato.cedula}</p>
            <p><strong>Tipo Doc:</strong> {candidato.tipo_doc}</p>
            <p><strong>Nombre:</strong> {candidato.nombre}</p>
            <p><strong>Apellido:</strong> {candidato.apellido}</p>
            <p><strong>F. Nac:</strong> {candidato.fecha_nacimiento}</p>
            <p><strong>F. Exp:</strong> {candidato.fecha_expedicion}</p>
            <p><strong>Tipo Persona:</strong> {candidato.tipo_persona}</p>
            <p><strong>Sexo:</strong> {candidato.sexo}</p>
          </div>
        </div>
      )}

      {mapaUrl && (
        <div className="mt-2">
          <img
            src={mapaUrl}
            alt={`Mapa de calor - Consulta ${consultaId}`}
            className="w-full max-w-md mx-auto rounded shadow-md"
          />
        </div>
      )}
    </div>
  );
}
