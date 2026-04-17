import React from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaShieldAlt,
  FaSearch,
  FaFilePdf,
  FaGlobeAmericas,
  FaUserCheck,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";
import Header from "../components/Header";

export default function ServicioEconfia() {
  const fuentes = [
    "Procuraduría General de la Nación",
    "Contraloría General de la República",
    "Policía Nacional",
    "Registraduría y validaciones asociadas",
    "Superintendencias y fuentes regulatorias",
    "Listas restrictivas nacionales e internacionales",
    "Listas OFAC, ONU, Interpol y otras fuentes de riesgo",
    "Fuentes jurídicas, disciplinarias y de antecedentes",
  ];

  const beneficios = [
    "Centraliza múltiples consultas en una sola plataforma",
    "Reduce tiempos operativos en validaciones y debida diligencia",
    "Entrega reportes consolidados en PDF y estructuras exportables",
    "Mejora la trazabilidad y el respaldo del proceso de verificación",
    "Facilita procesos de contratación, vinculación y evaluación de terceros",
    "Permite decisiones más seguras con información organizada y verificable",
  ];

  const usos = [
    {
      icon: <FaUserCheck />,
      title: "Validación de personas",
      text: "Consulta antecedentes, alertas y hallazgos relevantes para procesos de vinculación, selección y análisis de riesgo.",
    },
    {
      icon: <FaBuilding />,
      title: "Análisis de empresas",
      text: "Apoya la revisión de proveedores, aliados, contratistas y terceros con información consolidada desde múltiples fuentes.",
    },
    {
      icon: <FaFilePdf />,
      title: "Reportes ejecutivos",
      text: "Genera resultados organizados, presentables y listos para auditoría, seguimiento interno o soporte documental.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <Header />

      {/* Fondo animado manteniendo tus colores */}
      <div className="absolute inset-0 -z-10">
        {/* Degradado base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900" />

        {/* Glows animados */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-10 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-sky-300/10 rounded-full blur-3xl animate-blob animation-delay-4000" />

        {/* Grid suave */}
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:40px_40px]" />

        {/* Puntos animados */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[15%] left-[20%] w-2 h-2 bg-cyan-300 rounded-full animate-float" />
          <div className="absolute top-[30%] left-[75%] w-2 h-2 bg-blue-300 rounded-full animate-float-slow" />
          <div className="absolute top-[60%] left-[15%] w-1.5 h-1.5 bg-sky-300 rounded-full animate-float" />
          <div className="absolute top-[70%] left-[80%] w-2 h-2 bg-cyan-200 rounded-full animate-float-slow" />
          <div className="absolute top-[45%] left-[50%] w-1.5 h-1.5 bg-white rounded-full animate-float" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
        {/* Hero */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 backdrop-blur-md mb-6">
            <FaShieldAlt />
            Plataforma de validación, consulta y análisis de riesgo
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Econfia
          </h1>

          <p className="max-w-4xl mx-auto text-lg md:text-2xl text-gray-300 leading-relaxed">
            Una plataforma diseñada para realizar{" "}
            <span className="text-cyan-400 font-semibold">
              consultas inteligentes
            </span>
            , validaciones y análisis de información en múltiples fuentes
            oficiales, regulatorias y restrictivas, facilitando procesos de
            debida diligencia, vinculación y verificación con mayor rapidez,
            respaldo y confiabilidad.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30"
            >
              Ingresar a Econfia
              <FaArrowRight />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Crear cuenta
            </Link>
          </div>
        </section>

        {/* Resumen */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="mb-4 text-cyan-400 text-2xl">
              <FaSearch />
            </div>
            <h3 className="text-xl font-semibold mb-2">Consultas centralizadas</h3>
            <p className="text-gray-300 leading-relaxed">
              Reúne múltiples validaciones en un solo entorno para evitar procesos manuales dispersos y repetitivos.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="mb-4 text-cyan-400 text-2xl">
              <FaGlobeAmericas />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cobertura amplia</h3>
            <p className="text-gray-300 leading-relaxed">
              Integra fuentes nacionales e internacionales para obtener una visión más completa del perfil consultado.
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
            <div className="mb-4 text-cyan-400 text-2xl">
              <FaFilePdf />
            </div>
            <h3 className="text-xl font-semibold mb-2">Resultados con respaldo</h3>
            <p className="text-gray-300 leading-relaxed">
              Organiza la evidencia y presenta reportes claros que apoyan auditorías, revisiones internas y toma de decisiones.
            </p>
          </div>
        </section>

        {/* Qué es Econfia */}
        <section className="mb-14">
          <div className="rounded-[28px] border border-cyan-400/20 bg-white/10 backdrop-blur-2xl p-8 md:p-10 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
            <h2 className="text-3xl md:text-4xl font-semibold text-cyan-300 mb-6">
              ¿Qué es Econfia?
            </h2>

            <div className="space-y-5 text-gray-200 text-lg leading-relaxed">
              <p>
                Econfia es una solución tecnológica orientada a la{" "}
                <span className="text-cyan-400 font-medium">
                  verificación, validación y consulta de información relevante
                </span>{" "}
                sobre personas naturales y jurídicas, a partir de diversas fuentes oficiales,
                públicas y especializadas.
              </p>

              <p>
                Su propósito es ayudar a empresas, áreas de cumplimiento, talento humano,
                compras, control interno y gestión de riesgo a realizar procesos de revisión
                con mayor orden, velocidad y trazabilidad, disminuyendo la carga operativa
                y fortaleciendo el soporte documental de cada consulta.
              </p>

              <p>
                Más que una búsqueda simple, Econfia permite consolidar hallazgos,
                estructurar resultados y facilitar una evaluación más clara del contexto
                del consultado, convirtiéndose en un apoyo clave para procesos de
                <span className="text-cyan-400 font-medium">
                  {" "}debida diligencia, conocimiento de terceros y análisis preventivo
                </span>.
              </p>
            </div>
          </div>
        </section>

        {/* Fuentes y beneficios */}
        <section className="grid md:grid-cols-2 gap-8 mb-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7">
            <h3 className="text-2xl md:text-3xl font-semibold mb-5 text-white">
              Fuentes y alcance de consulta
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Econfia puede apoyar procesos de verificación mediante la consulta de
              diversas fuentes relevantes para la gestión del riesgo, antecedentes,
              alertas, registros y validaciones complementarias.
            </p>

            <ul className="space-y-3">
              {fuentes.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <FaCheckCircle className="text-cyan-400 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7">
            <h3 className="text-2xl md:text-3xl font-semibold mb-5 text-white">
              Beneficios para tu operación
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              La plataforma está pensada para optimizar flujos de validación,
              mejorar tiempos de respuesta y brindar una base más sólida para la
              toma de decisiones.
            </p>

            <ul className="space-y-3">
              {beneficios.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <FaCheckCircle className="text-cyan-400 mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Casos de uso */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">
              ¿Para qué puede usarse Econfia?
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Econfia se adapta a distintos escenarios donde la validación de información,
              la revisión documental y la consulta preventiva son parte esencial del proceso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {usos.map((uso, index) => (
              <div
                key={index}
                className="rounded-3xl border border-cyan-400/15 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl p-7 hover:-translate-y-1 transition-all duration-300 shadow-xl"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-400/15 border border-cyan-400/20 flex items-center justify-center text-cyan-300 text-2xl mb-5">
                  {uso.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{uso.title}</h3>
                <p className="text-gray-300 leading-relaxed">{uso.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center">
          <div className="rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-2xl px-6 py-10 md:px-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Empieza a consultar con una experiencia más sólida y profesional
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-8">
              Accede a una plataforma pensada para optimizar consultas, consolidar
              información y fortalecer tus procesos de validación con mayor orden,
              rapidez y respaldo.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30"
              >
                Comenzar ahora
                <FaArrowRight />
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 font-semibold hover:bg-cyan-400/15 transition-all duration-300"
              >
                Crear una cuenta
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Animaciones */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -20px) scale(1.08);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.96);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-12px);
            opacity: 1;
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-18px);
            opacity: 0.9;
          }
        }

        .animate-blob {
          animation: blob 10s infinite ease-in-out;
        }

        .animate-float {
          animation: float 4s infinite ease-in-out;
        }

        .animate-float-slow {
          animation: floatSlow 6s infinite ease-in-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}