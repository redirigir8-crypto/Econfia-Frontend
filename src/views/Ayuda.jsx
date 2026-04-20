// src/views/Ayuda.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronLeft, ChevronRight, Mail, Phone, MapPin } from "lucide-react";

/** Zonas seguras (arriba mínimo; abajo amplio por taskbar) */
const SAFE_TOP = "pt-2 md:pt-3";
const SAFE_BOTTOM = "pb-64";

const faqs = [
	{
		q: "¿Qué es ECONFIA?",
		a: "ECONFIA es una plataforma avanzada de due diligence y validación empresarial que consulta más de 200 fuentes de datos en tiempo real. Verifica información contra listas de sanciones internacionales, registros de personas políticamente expuestas (PEP), bases de datos de antecedentes penales, registros comerciales y fuentes OSINT especializadas. Ofrece reportes detallados, trazables y auditables para cumplimiento normativo en compliance, Know Your Customer (KYC) y Anti-Money Laundering (AML). Perfecta para instituciones financieras, empresas de seguros, bufetes legales y servicios corporativos."
	},
	{
		q: "¿Cómo puedes comunicarte con nosotros?",
		a: null,
		isContact: true,
	},
	{
		q: "¿Qué es SARLAFT?",
		a: "SARLAFT (Sistema de Administración del Riesgo de Lavado de Activos y Financiación del Terrorismo) es el marco regulatorio colombiano que obliga a ciertas entidades a implementar controles para prevenir que sean utilizadas como instrumento en actividades de lavado de activos o financiación del terrorismo. Aplica principalmente a entidades vigiladas por la Superintendencia Financiera de Colombia, como bancos, aseguradoras y cooperativas. ECONFIA apoya el cumplimiento del SARLAFT al proporcionar herramientas de consulta y validación en tiempo real contra listas restrictivas, PEP y fuentes internacionales, generando reportes auditables que documentan el proceso de debida diligencia exigido por la norma."
	},
	{
		q: "¿Qué es SAGRILAFT?",
		a: "SAGRILAFT (Sistema de Autocontrol y Gestión del Riesgo Integral de Lavado de Activos, Financiación del Terrorismo y Financiamiento de la Proliferación de Armas de Destrucción Masiva) es la normativa colombiana emitida por la Superintendencia de Sociedades que aplica a empresas del sector real que superan ciertos umbrales de activos o ingresos. A diferencia del SARLAFT (enfocado en sector financiero), el SAGRILAFT está orientado a empresas comerciales, industriales y de servicios. ECONFIA facilita el cumplimiento del SAGRILAFT permitiendo realizar consultas masivas y generar reportes trazables de validación de contrapartes, clientes, proveedores y empleados, tal como lo exige la Circular Externa 100-000016 de la Supersociedades."
	},
	{
		q: "¿Cuántas fuentes consultan y cuáles son?",
		a: "Consultamos más de 200 fuentes internacionales en tiempo real, incluyendo: Listas OFAC (EE.UU.), Europol, Interpol, registros PEP de cada país, bases de datos de sanciones de Naciones Unidas, listas restrictivas de gobiernos, registros de antecedentes penales, fallos judiciales, registros comerciales nacionales e internacionales, medios de prensa especializados, bases de datos de corrupción y fraude, registros de personas desaparecidas, y más. Las fuentes se actualizan automáticamente varias veces al día para garantizar información actual."
	},
	{
		q: "¿Qué información debo proporcionar para una validación?",
		a: "Mínimo requerido: Nombre completo (nombre y apellido). Información adicional recomendada para mejorar precisión: Número de identificación (cédula, pasaporte, RUN, etc.), País de residencia/nacionalidad, Fecha de nacimiento, Razón social (si es empresa), Número de registro comercial. Para consultas de empresas: Nombre legal de la empresa, NIT/RUC/CUIT, País de constitución. Cuanta más información proporcionas, mayor precisión y menor riesgo de falsos positivos."
	},
	{
		q: "¿Cuál es el caso de uso ideal para ECONFIA?",
		a: "Casos de uso principales: (1) Instituciones financieras: KYC de clientes, AML, detección de fraude. (2) Seguros: validación de asegurados, evaluación de riesgo. (3) Bufetes legales: due diligence en fusiones y adquisiciones. (4) Servicios corporativos: validación de proveedores y socios. (5) Gobiernos: verificación de solicitantes para permisos/visas. (6) Comercio electrónico: lucha contra fraude de pagos. (7) Recursos humanos: background check de candidatos. (8) ONGs: validación de beneficiarios. Cualquier organización que requiera verificación rápida y confiable de terceros se beneficia de ECONFIA."
	},
	{
		q: "¿Cuáles son las diferencias entre los planes?",
		a: "Plan POR CONSULTA: Ideal para consultas ocasionales con validaciones puntuales. Plan ILIMITADO MENSUAL: Consultas ilimitadas dentro del mes. Ideal para empresas con validaciones frecuentes. Plan ILIMITADO ANUAL: Incluye soporte prioritario y actualizaciones. Diferencias clave: velocidad de procesamiento, prioridad en cola, funciones de API, generación de reportes masivos, y acceso a análisis avanzados. Contacta con ventas para obtener detalles específicos de tu plan."
	},
	{
		q: "¿Cuánto tardan los resultados y qué factores afectan la velocidad?",
		a: "En promedio, los resultados se generan en 15-30 segundos. El tiempo puede variar según: (1) Disponibilidad de fuentes: algunas bases de datos pueden estar temporalmente lentificadas. (2) Complejidad del nombre: nombres comunes o genéricos requieren verificaciones adicionales. (3) Conexiones lentas de fuentes: algunas fuentes internacionales pueden requerir más tiempo. (4) Volumen de uso: en horarios pico, el tiempo puede aumentar ligeramente. Los planes ULTRA y MEGA tienen prioridad en cola, reduciendo el tiempo de espera."
	},
	{
		q: "¿Puedo exportar el reporte y en qué formatos?",
		a: "Sí, todos nuestros planes permiten exportar reportes. Formatos disponibles: PDF (optimizado para impresión y presentaciones profesionales), JSON (para integración con sistemas), CSV (para análisis en Excel). El acceso a exportación varía por plan: CONSULTA por Consulta: máximo 3 exportaciones al mes. ILIMITADO: exportaciones ilimitadas. Los reportes incluyen: nombre, coincidencias encontradas, nivel de riesgo, fuentes consultadas, timestamp, ID de auditoría, y conclusiones analíticas."
	},
	{
		q: "¿Qué significa una coincidencia y cómo interpretar el nivel de riesgo?",
		a: "Una coincidencia es un resultado donde los datos consultados coinciden con registros en nuestras bases de datos. Niveles de riesgo: RIESGO ALTO: Múltiples coincidencias o antecedentes graves. RIESGO MEDIO: Coincidencia con nombres similares o contextos parciales. RIESGO BAJO: Coincidencia débil o contexto dudoso. Importante: Una coincidencia NO confirma culpabilidad automáticamente. Nombres comunes pueden generar falsos positivos. Recomendamos análisis humano para tomar decisiones finales."
	},
	{
		q: "¿Qué tan segura es mi información en ECONFIA?",
		a: "Seguridad de datos: (1) Encriptación de extremo a extremo (AES-256). (2) Cumplimiento GDPR, HIPAA y normativas locales. (3) Servidores en múltiples regiones con redundancia. (4) Auditorías de seguridad trimestrales por terceros. (5) Acceso restringido a datos (autenticación multifactor). (6) Logs de auditoría completos para todas las consultas. (7) Cumplimiento con regulaciones de protección de datos. No compartimos datos con terceros sin consentimiento explícito. Los datos se retienen según regulación local (típicamente 7 años para compliance)."
	},
	{
		q: "¿Qué cumplimiento normativo cubre ECONFIA?",
		a: "Cumplimiento regulatorio: (1) EE.UU.: OFAC, AML/KYC según regulaciones federales. (2) UE: Directiva AMLD5, GDPR, regulaciones de compliance. (3) Colombia: Resoluciones UIAF, SARLAFT. (4) LATAM: Regulaciones locales de cada país. (5) Estándares internacionales: FATF guidelines, Recomendaciones de Basel. (6) Auditorías: sometidos a auditorías externas anuales de compliance. ECONFIA está diseñado para soportar auditorías regulatorias. Todos los reportes son certificables y trazables para fines de demostración regulatoria."
	},
];

function ContactContent() {
	return (
		<div className="space-y-4 pt-1">
			<a
				href="mailto:coordinaciondesarrollo@solutionsgroupcol.com"
				className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 transition-all group"
			>
				<span className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
					<Mail size={17} />
				</span>
				<div>
					<p className="text-cyan-300/70 text-xs font-medium">Email</p>
					<p className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">coordinaciondesarrollo@solutionsgroupcol.com</p>
				</div>
			</a>
			<a
				href="tel:+573170815394"
				className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 transition-all group"
			>
				<span className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0 group-hover:bg-cyan-500/30 transition-all">
					<Phone size={17} />
				</span>
				<div>
					<p className="text-cyan-300/70 text-xs font-medium">Teléfono</p>
					<p className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors">+57 (317) 081 5394</p>
				</div>
			</a>
			<div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
				<span className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
					<MapPin size={17} />
				</span>
				<div>
					<p className="text-cyan-300/70 text-xs font-medium">Ubicación</p>
					<p className="text-white font-semibold text-sm">Bogotá, Colombia</p>
				</div>
			</div>
		</div>
	);
}

function FaqItem({ q, a, idx, isContact }) {
	const [open, setOpen] = useState(false);

	const contentHeight = isContact ? 210 : 220;

	return (
		<div
			className={[
				"w-full",
				"relative rounded-2xl border-2 transition-all duration-300",
				open
					? "border-cyan-400/60 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
					: "border-white/15 bg-white/[0.06] hover:border-cyan-400/30 hover:bg-white/[0.09]",
				"overflow-hidden",
			].join(" ")}
		>
			{/* Cabecera */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className={`relative w-full min-h-[68px] pl-5 pr-14 py-4 flex items-center justify-start text-left select-none transition-all duration-300 ${
					open ? "bg-cyan-900/20" : "hover:bg-white/5"
				}`}
			>
				<div className="flex items-center gap-4">
					<span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
						open
							? "bg-cyan-400/40 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.4)]"
							: "bg-cyan-500/20 text-cyan-300"
					}`}>
						{idx + 1}
					</span>
					<span className={`font-semibold text-base leading-snug transition-all duration-300 ${
						open ? "text-cyan-200" : "text-white/95"
					}`}>
						{q}
					</span>
				</div>

				<ChevronDown
					className={`absolute right-5 top-1/2 -translate-y-1/2 size-5 transition-all duration-300 ${
						open ? "rotate-180 text-cyan-400" : "text-white/40"
					}`}
				/>
			</button>

			{/* Contenido */}
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						key="content"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: contentHeight }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.28 }}
						className="overflow-hidden border-t border-cyan-400/20"
					>
						<div className="px-5 py-4 h-full overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.35)_rgba(255,255,255,0.05)]">
							{isContact ? (
								<ContactContent />
							) : (
								<p className="text-white/90 text-[0.95rem] leading-relaxed">{a}</p>
							)}
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

	return (
		<section className="w-screen h-[80vh] text-white flex items-center justify-center overflow-hidden p-0 relative">
			<div className={["ayuda max-w-[1200px] w-full px-6 relative z-10","grid grid-rows-[auto_auto_1fr] gap-6",SAFE_TOP,SAFE_BOTTOM,].join(" ")}>
				{/* Encabezado */}
				<div className="grid grid-cols-1 md:grid-cols-2 items-center text-center md:text-left gap-3">
					<p className="text-white/70 text-base font-normal">
						Resuelve dudas frecuentes. Toca una pregunta para ver la respuesta.
					</p>
					<div className="flex items-center justify-center md:justify-end gap-3">
						<HelpCircle className="text-cyan-400" size={28} />
						<h1
							className="text-[clamp(1.8rem,3vw,2.5rem)] font-black leading-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
							style={{ fontFamily: "poppins, sans-serif" }}
						>
							Centro de ayuda
						</h1>
					</div>
				</div>

				{/* Controles de paginación */}
				<div className="flex items-center justify-center gap-4">
					<button
						onClick={prev}
						disabled={page === 0}
						className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-white font-semibold text-sm shadow-md transition-all duration-200 hover:bg-cyan-500/20 hover:border-cyan-400/70 active:scale-95 ${page === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
					>
						<ChevronLeft className="size-4" /> Anterior
					</button>

					<div className="flex items-center gap-2">
						{Array.from({ length: totalPages }).map((_, i) => (
							<span
								key={i}
								className={["h-2.5 w-2.5 rounded-full transition-all duration-300", i === page ? "bg-cyan-400 scale-110 shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "bg-white/25"].join(" ")}
							/>
						))}
					</div>

					<button
						onClick={next}
						disabled={page === totalPages - 1}
						className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 text-white font-semibold text-sm shadow-md transition-all duration-200 hover:bg-cyan-500/20 hover:border-cyan-400/70 active:scale-95 ${page === totalPages - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
					>
						Siguiente <ChevronRight className="size-4" />
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
								<FaqItem key={item.q} q={item.q} a={item.a} idx={start + i} isContact={!!item.isContact} />
							))}
						</motion.div>
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
