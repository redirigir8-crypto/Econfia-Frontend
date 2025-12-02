// src/components/RadarRiesgo.jsx
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, ResponsiveContainer
} from "recharts";

export default function RadarRiesgo({ data }) {
  if (!data?.detalle) return null;

  // --- Reestructurar datos para el radar ---
  const factores = [
    { key: "nivel_deficiencia", label: "Deficiencia" },
    { key: "nivel_exposicion", label: "Exposición" },
    { key: "nivel_consecuencia", label: "Consecuencia" },
    { key: "nivel_probabilidad", label: "Probabilidad" },
    { key: "puntaje_riesgo", label: "Puntaje Riesgo" },
  ];

  const radarData = factores.map(f => {
    const row = { factor: f.label };
    data.detalle.forEach(det => {
      row[det.tipo] = det[f.key];
    });
    return row;
  });

  // Colores para cada tipo
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#9333ea"];

  return (
    <div className="w-[1000px] h-[500px] bg-white rounded-xl shadow">
      <h2 className="text-lg font-bold mb-4 text-gray-700">Comparativa de Riesgos</h2>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="factor" />
          <PolarRadiusAxis />
          {data.detalle.map((det, idx) => (
            <Radar
              key={det.tipo}
              name={det.tipo}
              dataKey={det.tipo}
              stroke={colors[idx % colors.length]}
              fill={colors[idx % colors.length]}
              fillOpacity={0.4}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
