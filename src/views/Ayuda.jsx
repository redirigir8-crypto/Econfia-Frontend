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
				className="group flex items-center gap-3 rounded-xl border border-line/15 bg-surface-2/70 p-3 transition-all hover:border-brand/30 hover:bg-surface"
			>
				<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 transition-all group-hover:bg-cyan-500/25">
					<Mail size={17} />
				</span>
				<div>
					<p className="text-xs font-medium text-muted">Email</p>
					<p className="text-sm font-semibold text-content transition-colors group-hover:text-brand">coordinaciondesarrollo@solutionsgroupcol.com</p>
				</div>
			</a>
			<a
				href="tel:+573170815394"
				className="group flex items-center gap-3 rounded-xl border border-line/15 bg-surface-2/70 p-3 transition-all hover:border-brand/30 hover:bg-surface"
			>
				<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 transition-all group-hover:bg-cyan-500/25">
					<Phone size={17} />
				</span>
				<div>
					<p className="text-xs font-medium text-muted">Teléfono</p>
					<p className="text-sm font-semibold text-content transition-colors group-hover:text-brand">+57 (317) 081 5394</p>
				</div>
			</a>
			<div className="flex items-center gap-3 rounded-xl border border-line/15 bg-surface-2/70 p-3">
				<span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400">
					<MapPin size={17} />
				</span>
				<div>
					<p className="text-xs font-medium text-muted">Ubicación</p>
					<p className="text-sm font-semibold text-content">Bogotá, Colombia</p>
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
				"relative rounded-2xl border transition-all duration-300 shadow-xl shadow-black/5",
				open
					? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/15 via-surface to-blue-500/10 shadow-[0_18px_45px_rgba(34,211,238,0.12)]"
					: "border-line/15 bg-surface/85 hover:border-brand/30 hover:bg-surface",
				"overflow-hidden",
			].join(" ")}
		>
			{/* Cabecera */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				className={`relative w-full min-h-[68px] pl-5 pr-14 py-4 flex items-center justify-start text-left select-none transition-all duration-300 ${
					open ? "bg-cyan-500/10" : "hover:bg-surface-2/70"
				}`}
			>
				<div className="flex items-center gap-4">
					<span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
						open
							? "bg-cyan-400/25 text-brand shadow-[0_0_12px_rgba(34,211,238,0.25)]"
							: "bg-cyan-500/15 text-brand"
					}`}>
						{idx + 1}
					</span>
					<span className={`font-semibold text-base leading-snug transition-all duration-300 ${
						open ? "text-brand" : "text-content"
					}`}>
						{q}
					</span>
				</div>

				<ChevronDown
					className={`absolute right-5 top-1/2 -translate-y-1/2 size-5 transition-all duration-300 ${
						open ? "rotate-180 text-brand" : "text-muted"
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
						className="overflow-hidden border-t border-line/15"
					>
						<div className="h-full overflow-y-auto px-5 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(34,211,238,0.35)_rgba(148,163,184,0.12)]">
							{isContact ? (
								<ContactContent />
							) : (
								<p className="text-[0.95rem] leading-relaxed text-content/85">{a}</p>
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
		<section className="relative flex min-h-[80vh] w-screen items-center justify-center overflow-hidden p-0 text-content">
			<div className="pointer-events-none absolute left-[12%] top-[22%] h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
			<div className="pointer-events-none absolute right-[14%] top-[16%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
			<div className={["ayuda relative z-10 grid w-full max-w-[1220px] grid-rows-[auto_auto_1fr] gap-5 px-6", SAFE_TOP, SAFE_BOTTOM].join(" ")}>
				{/* Encabezado */}
				<div className="relative overflow-hidden rounded-[26px] border border-line/15 bg-surface/80 px-5 py-5 shadow-2xl shadow-black/5 backdrop-blur-xl md:px-7">
					<div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />
					<div className="pointer-events-none absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
					<div className="relative grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto]">
						<div className="text-center md:text-left">
							<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
								<HelpCircle size={14} />
								Soporte Econfia
							</div>
							<h1
								className="text-[clamp(2rem,4vw,3.2rem)] font-black leading-tight text-content"
								style={{ fontFamily: "poppins, sans-serif" }}
							>
								Centro de ayuda
							</h1>
							<p className="mt-2 max-w-2xl text-sm leading-6 text-muted md:text-base">
								Resuelve dudas frecuentes sobre consultas, cumplimiento, reportes y soporte operativo.
							</p>
						</div>

						<div className="grid grid-cols-3 gap-2 text-center">
							<div className="rounded-2xl border border-line/15 bg-surface-2/70 px-4 py-3">
								<div className="text-lg font-black text-content">{faqs.length}</div>
								<div className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Preguntas</div>
							</div>
							<div className="rounded-2xl border border-line/15 bg-surface-2/70 px-4 py-3">
								<div className="text-lg font-black text-brand">{page + 1}/{totalPages}</div>
								<div className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Página</div>
							</div>
							<div className="rounded-2xl border border-line/15 bg-surface-2/70 px-4 py-3">
								<div className="text-lg font-black text-emerald-500">24/7</div>
								<div className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">Ayuda</div>
							</div>
						</div>
					</div>
				</div>

				{/* Controles de paginación */}
				<div className="flex flex-wrap items-center justify-center gap-4">
					<button
						onClick={prev}
						disabled={page === 0}
						className={`inline-flex items-center gap-2 rounded-full border border-line/15 bg-surface/85 px-5 py-2 text-sm font-semibold text-content shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-200 hover:border-brand/35 hover:bg-surface-2/90 hover:text-brand active:scale-95 ${page === 0 ? "cursor-not-allowed opacity-40" : ""}`}
					>
						<ChevronLeft className="size-4" /> Anterior
					</button>

					<div className="flex items-center gap-2 rounded-full border border-line/15 bg-surface/70 px-3 py-2 shadow-lg shadow-black/5 backdrop-blur-xl">
						{Array.from({ length: totalPages }).map((_, i) => (
							<span
								key={i}
								className={["h-2.5 rounded-full transition-all duration-300", i === page ? "w-7 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.45)]" : "w-2.5 bg-muted/35"].join(" ")}
							/>
						))}
					</div>

					<button
						onClick={next}
						disabled={page === totalPages - 1}
						className={`inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-cyan-500/15 px-5 py-2 text-sm font-semibold text-content shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-200 hover:border-brand/60 hover:bg-cyan-500/25 hover:text-brand active:scale-95 ${page === totalPages - 1 ? "cursor-not-allowed opacity-40" : ""}`}
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
							className="grid w-full grid-cols-1 auto-rows-max items-start justify-items-center gap-5 lg:grid-cols-2"
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
