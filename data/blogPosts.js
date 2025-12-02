// src/data/blogPosts.js
import portada1 from "../assets/justicia.jpg";
import portada2 from "../assets/justicia2.jpg";
import portada3 from "../assets/justicia3.jpg";

export const blogPosts = [
  {
    id: 1,
    slug: "por-que-automatizar-debida-diligencia",
    title: "¿Por qué automatizar la debida diligencia?",
    date: "2025-09-16",
    author: "Equipo eConfia",
    cover: portada1,
    excerpt:
      "La automatización reduce tiempos, errores humanos y mejora el cumplimiento normativo.",
    content: [
      "Automatizar queries en fuentes nacionales e internacionales permite resultados consistentes.",
      "Los reportes con evidencia aceleran auditorías y evitan multas.",
      "La integración con backend y colas de trabajo asegura escalabilidad.",
    ],
    tags: ["cumplimiento", "automatización"],
  },
  {
    id: 2,
    slug: "listas-restrictivas-internacionales-101",
    title: "Listas restrictivas internacionales 101",
    date: "2025-09-10",
    author: "Compliance Lab",
    cover: portada2,
    excerpt:
      "UN, OFAC, UE, bancos multilaterales… cómo interpretarlas y auditarlas.",
    content: [
      "No todas las listas tienen el mismo peso; define tu matriz de riesgo.",
      "Registra evidencias (screenshots) y conserva el historial.",
      "Actualiza catálogos de fuentes con versión y fecha.",
    ],
    tags: ["listas", "riesgo"],
  },
  {
    id: 3,
    slug: "mejores-practicas-reporte",
    title: "Mejores prácticas para reportes de riesgo",
    date: "2025-09-01",
    author: "DataOps",
    cover: portada3,
    excerpt:
      "Diseño de reportes claros: puntaje, semáforo, evidencia y trazabilidad.",
    content: [
      "Usa un score simple (10/6/2/0) con categorías Bajo/Medio/Alto.",
      "Anexa evidencia por fuente consultada para auditoría.",
      "Provee enlaces a las fuentes para verificación manual.",
    ],
    tags: ["reportes", "ux"],
  },
];
