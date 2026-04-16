// src/views/Ayuda.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/** Zonas seguras (arriba mínimo; abajo amplio por taskbar) */
const SAFE_TOP = "pt-2 md:pt-3"; // antes: pt-3 md:pt-4
const SAFE_BOTTOM = "pb-64";

const faqs = [
	{ 
		q: "¿Qué es ECONFIA?", 
		a: "ECONFIA es una plataforma avanzada de due diligence y validación empresarial que consulta más de 200 fuentes de datos en tiempo real. Verifica información contra listas de sanciones internacionales, registros de personas políticamente expuestas (PEP), bases de datos de antecedentes penales, registros comerciales y fuentes OSINT especializadas. Ofrece reportes detallados, trazables y auditables para cumplimiento normativo en compliance, Know Your Customer (KYC) y Anti-Money Laundering (AML). Perfecta para instituciones financieras, empresas de seguros, bufetes legales y servicios corporativos." 
	},
	{ 
		q: "¿Cuántas fuentes consultan y cuáles son?", 
		a: "Consultamos más de 200 fuentes internacionales en tiempo real, incluyendo: Listas OFAC (EE.UU.), Europol, Interpol, registros PEP de cada país, bases de datos de sanciones de Naciones Unidas, listas restrictivas de gobiernos, registros de antecedentes penales, fallos judiciales, registros comerciales nacionales e internacionales, medios de prensa especializados, bases de datos de corrupción y fraude, registros de personas desaparecidas, y más. Las fuentes se actualizan automáticamente varias veces al día para garantizar información actual." 
	},
	{ 
		q: "¿Cuánto tardan los resultados y qué factores afectan la velocidad?", 
		a: "En promedio, los resultados se generan en 3-8 segundos. El tiempo puede variar según: (1) Disponibilidad de fuentes: algunas bases de datos pueden estar temporalmente lentificadas. (2) Complejidad del nombre: nombres comunes o genéricos requieren verificaciones adicionales. (3) Conexiones lentas de fuentes: algunas fuentes internacionales pueden requerir más tiempo. (4) Volumen de uso: en horarios pico, el tiempo puede aumentar ligeramente. Los planes ULTRA y MEGA tienen prioridad en cola, reduciendo el tiempo de espera." 
	},
	{ 
		q: "¿Qué información debo proporcionar para una validación?", 
		a: "Mínimo requerido: Nombre completo (nombre y apellido). Información adicional recomendada para mejorar precisión: Número de identificación (cédula, pasaporte, RUN, etc.), País de residencia/nacionalidad, Fecha de nacimiento, Razón social (si es empresa), Número de registro comercial. Para consultas de empresas: Nombre legal de la empresa, NIT/RUC/CUIT, País de constitución. Cuanta más información proporcionas, mayor precisión y menor riesgo de falsos positivos." 
	},
	{ 
		q: "¿Puedo exportar el reporte y en qué formatos?", 
		a: "Sí, todos nuestros planes permiten exportar reportes. Formatos disponibles: PDF (optimizado para impresión y presentaciones profesionales), JSON (para integración con sistemas), CSV (para análisis en Excel). El acceso a exportación varía por plan: CONSULTA por Consulta: máximo 3 exportaciones al mes. ILIMITADO: exportaciones ilimitadas. Los reportes incluyen: nombre, coincidencias encontradas, nivel de riesgo, fuentes consultadas, timestamp, ID de auditoría, y conclusiones analíticas." 
	},
	{ 
		q: "¿Cuáles son las diferencias entre los planes?", 
		a: "Plan POR CONSULTA: Ideal para consultas ocasionales con validaciones puntuales. Plan ILIMITADO MENSUAL: Consultas ilimitadas dentro del mes. Ideal para empresas con validaciones frecuentes. Plan ILIMITADO ANUAL: Incluye soporte prioritario y actualizaciones. Diferencias clave: velocidad de procesamiento, prioridad en cola, funciones de API, generación de reportes masivos, y acceso a análisis avanzados. Contacta con ventas para obtener detalles específicos de tu plan." 
	},
	{ 
		q: "¿Qué significa una coincidencia y cómo interpretar el nivel de riesgo?", 
		a: "Una coincidencia es un resultado donde los datos consultados coinciden con registros en nuestras bases de datos. Niveles de riesgo: RIESGO ALTO: Múltiples coincidencias o antecedentes graves. RIESGO MEDIO: Coincidencia con nombres similares o contextos parciales. RIESGO BAJO: Coincidencia débil o contexto dudoso. Importante: Una coincidencia NO confirma culpabilidad automáticamente. Nombres comunes pueden generar falsos positivos. Recomendamos análisis humano para tomar decisiones finales." 
	},
	{ 
		q: "¿Qué hago si una coincidencia no aplica o es un falso positivo?", 
		a: "Si encuentras una coincidencia que no es relevante: (1) Marca como 'No relevante' en el reporte. (2) Añade notas sobre por qué no aplica (ej: diferencia de edad, documento distinto, contexto diferente). (3) Contacta a soporte@econfia.com con el ID de la consulta y tu análisis. Nuestro equipo revisará y ajustará los criterios si es necesario. Datos sobre falsos positivos nos ayudan a mejorar la precisión del algoritmo constantemente." 
	},
	{ 
		q: "¿Cómo contacto a soporte y cuál es el tiempo de respuesta?", 
		a: "Canales de soporte: (1) Menú 'Contacto' dentro de la plataforma: ticket automático. (2) Email: soporte@econfia.com (incluye ID de consulta). (3) Chat en vivo: disponible en horario comercial (L-V 9am-6pm). (4) Teléfono: +57-1-XXXX-XXXX. Tiempos de respuesta: Crítico: 1 hora. Prioritario: 4 horas. Normal: 24 horas. Incluye ID de consulta, descripción de problema, y capturas para acelerar resolución." 
	},
	{ 
		q: "¿Qué tan segura es mi información en ECONFIA?", 
		a: "Seguridad de datos: (1) Encriptación de extremo a extremo (AES-256). (2) Cumplimiento GDPR, HIPAA y normativas locales. (3) Servidores en múltiples regiones con redundancia. (4) Auditorías de seguridad trimestrales por terceros. (5) Acceso restringido a datos (autenticación multifactor). (6) Logs de auditoría completos para todas las consultas. (7) Cumplimiento con regulaciones de protección de datos. No compartimos datos con terceros sin consentimiento explícito. Los datos se retienen según regulación local (típicamente 7 años para compliance)." 
	},
	{ 
		q: "¿Con qué frecuencia se actualizan las bases de datos?", 
		a: "Actualización de fuentes: (1) Fuentes críticas (OFAC, Europol, Interpol): actualización cada 6 horas. (2) Registros comerciales nacionales: actualización diaria. (3) Medios especializados y noticias: actualización cada 2-4 horas. (4) Bases de datos judicales: actualización cada 48 horas. (5) Registros PEP: actualización semanal. Recibimos alertas automáticas de cambios en listas restrictivas. Los resultados siempre reflejan el estado más reciente disponible. Puedes solicitar rescans de consultas previas en tu historial." 
	},
	{ 
		q: "¿Cuál es el caso de uso ideal para ECONFIA?", 
		a: "Casos de uso principales: (1) Instituciones financieras: KYC de clientes, AML, detección de fraude. (2) Seguros: validación de asegurados, evaluación de riesgo. (3) Bufetes legales: due diligence en fusiones y adquisiciones. (4) Servicios corporativos: validación de proveedores y socios. (5) Gobiernos: verificación de solicitantes para permisos/visas. (6) Comercio electrónico: lucha contra fraude de pagos. (7) Recursos humanos: background check de candidatos. (8) ONGs: validación de beneficiarios. Cualquier organización que requiera verificación rápida y confiable de terceros se beneficia de ECONFIA." 
	},
	{ 
		q: "¿Qué cumplimiento normativo cubre ECONFIA?", 
		a: "Cumplimiento regulatorio: (1) EE.UU.: OFAC, AML/KYC según regulaciones federales. (2) UE: Directiva AMLD5, GDPR, regulaciones de compliance. (3) Colombia: Resoluciones UIAF, SARLAFT. (4) LATAM: Regulaciones locales de cada país. (5) Estándares internacionales: FATF guidelines, Recomendaciones de Basel. (6) Auditorías: sometidos a auditorías externas anuales de compliance. ECONFIA está diseñado para soportar auditorías regulatorias. Todos los reportes son certificables y trazables para fines de demostración regulatoria." 
	},
];

function FaqItem({ q, a, idx }) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className={[
				"w-full",
				"relative rounded-2xl border-2 transition-all duration-300",
				open 
					? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 shadow-[0_0_30px_rgba(34,211,238,0.3)]" 
					: "border-white/10 bg-white/5 shadow-3xl hover:border-white/20",
				"overflow-hidden",
			].join(" ")}
		>
			{/* Cabecera */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className={`relative w-full h-16 md:h-[72px] pl-5 pr-14 flex items-center justify-start text-left select-none transition-all duration-300 ${
					open ? "bg-cyan-900/20" : "hover:bg-white/5"
				}`}
			>
				<div className="flex items-center gap-4">
					<span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold transition-all duration-300 ${
						open 
							? "bg-cyan-400/40 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.4)]" 
							: "bg-cyan-500/15 text-cyan-300"
					}`}>
						{idx + 1}
					</span>
					<span className={`font-semibold leading-snug transition-all duration-300 ${
						open ? "text-cyan-100 text-lg" : "text-white"
					}`}>
						{q}
					</span>
				</div>

				<ChevronDown
					className={`absolute right-6 top-1/2 -translate-y-1/2 size-5 transition-all duration-300 ${
						open ? "rotate-180 text-cyan-300 drop-shadow-lg" : "text-gray-400"
					}`}
				/>
			</button>

			{/* Contenido con alto máximo + scroll interno */}
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						key="content"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 240 }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.3 }}
						className="px-5 pb-5 text-cyan-50 text-[0.98rem] leading-relaxed overflow-hidden border-t border-cyan-400/20"
					>
						<div className="h-full overflow-y-auto pr-2 space-y-2 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.4)_rgba(255,255,255,0.05)]">
							{a}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function Ayuda() {
	const perPage = 4;
	const totalPages = Math.ceil(faqs.length / perPage); // = 3 pages (12 preguntas)
	const [page, setPage] = useState(0);
	const [dir, setDir] = useState(1); // 1 -> derecha, -1 -> izquierda

	const start = page * perPage;
	const items = faqs.slice(start, start + perPage);

	const next = () => {
		if (page < totalPages - 1) {
			setDir(1);
			setPage((p) => p + 1);
		}
	};
	const prev = () => {
		if (page > 0) {
			setDir(-1);
			setPage((p) => p - 1);
		}
	};

	// --- ONLY KEEP THE NEW DESIGN BELOW ---
	return (
		<section className="w-screen h-[80vh] text-white flex items-center justify-center overflow-hidden p-0 relative">
			{/* Elimina todos los gradientes y fondos personalizados, solo fondo global */}
			{/* <div className="absolute inset-0 z-0 pointer-events-none"> ... </div> */}
			<div className={["ayuda max-w-[1200px] w-full px-6 relative z-10","grid grid-rows-[auto_auto_1fr] gap-8",SAFE_TOP,SAFE_BOTTOM,].join(" ")}>
				{/* Encabezado elegante */}
				<div className="grid grid-cols-1 md:grid-cols-2 items-center text-center md:text-left gap-4">
					<p className="text-cyan-200/80 text-lg font-medium drop-shadow-lg animate-fade-in">Resuelve dudas frecuentes. Toca una pregunta para ver la respuesta.</p>
					<div className="flex items-center justify-center md:justify-end gap-3">
						<HelpCircle className="text-cyan-400 animate-pulse" size={32} />
						<h1 className="text-[clamp(2.2rem,3vw,2.8rem)] font-black leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-gradient-x" style={{ fontFamily: "poppins, sans-serif" }}>
							Centro de ayuda
						</h1>
					</div>
				</div>

				{/* Controles de paginación llamativos */}
				<div className="flex items-center justify-center gap-4 mt-2">
					<button
						onClick={prev}
						disabled={page === 0}
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 text-cyan-300 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30 ${page === 0? "opacity-40 cursor-not-allowed":"hover:bg-cyan-500/20"}`}
					>
						<ChevronLeft className="size-5" /> Anterior
					</button>

					<div className="flex items-center gap-2">
						{Array.from({ length: totalPages }).map((_, i) => (
							<span key={i} className={["h-3 w-3 rounded-full transition-all duration-300", i === page ? "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-white/20"].join(" ")} />
						))}
					</div>

					<button
						onClick={next}
						disabled={page === totalPages - 1}
						className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 text-cyan-300 font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/30 ${page === totalPages - 1? "opacity-40 cursor-not-allowed":"hover:bg-cyan-500/20"}`}
					>
						Siguiente <ChevronRight className="size-5" />
					</button>
				</div>

				{/* Contenido FAQ con animación y tarjetas glassmorphism */}
				<div className="relative min-h-0 overflow-visible flex justify-center">
					<AnimatePresence mode="wait" initial={false} custom={dir}>
						<motion.div
							key={page}
							custom={dir}
							initial={{ x: dir === 1 ? 40 : -40, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: dir === 1 ? -40 : 40, opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="grid grid-cols-1 lg:grid-cols-2 auto-rows-max gap-7 w-full justify-items-center items-start"
						>
							{items.map((item, i) => (
								<FaqItem key={item.q} q={item.q} a={item.a} idx={start + i} />
							))}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
