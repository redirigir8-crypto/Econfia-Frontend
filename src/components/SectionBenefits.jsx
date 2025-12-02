// src/components/SectionBenefits.jsx
import React from "react";

export default function SectionBenefits() {
  const benefits = [
    { t: "Decisiones informadas", d: "Mejor visión del grupo de candidatos." },
    { t: "Ahorro de costos", d: "Menos rotación y riesgos operativos." },
    { t: "Agilidad", d: "Reportes claros que aceleran contratación." },
    { t: "Cumplimiento", d: "Alineado a normativas y listas restrictivas." },
    { t: "Escalabilidad", d: "Natural y jurídica, individuos o grupos." },
    { t: "Valor continuo", d: "Útil antes y después de contratar." },
  ];

  return (
    <section className="w-screen text-white" id="beneficios">
      {/* Alto visible = pantalla - header (≈80px); padding superior/inferior amplio */}
      <div className="mx-auto max-w-[1200px] px-6 min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-12 pb-16 lg:pt-14 lg:pb-20">
        {/* Texto (izquierda) */}
        <div className="lg:col-span-6">
          <div className="rounded-2xl p-6 lg:p-8 backdrop-blur-[2px] shadow-3xl">
            <h2
              className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight"
              style={{ fontFamily: "poppins, sans-serif" }}
            >
              Precisión y <span className="text-cyan-400">Confiabilidad</span>
            </h2>

            <div
              className="mt-4 space-y-4 text-[clamp(1rem,1.05vw,1.05rem)] text-gray-200 leading-relaxed"
              style={{ fontFamily: "poppins, sans-serif" }}
            >
              <p>
                <span className="font-semibold text-white">¿ECONFIA es preciso?</span> Sí. Mide comportamientos
                contraproducentes a través de validaciones en múltiples fuentes, identificando actuaciones indebidas y
                ofreciendo una apreciación de credibilidad por solicitante.
              </p>
              <p>
                <span className="font-semibold text-white">¿ECONFIA es confiable?</span> Sí. Su confiabilidad proviene
                de consistencias y respuestas en tiempo real. Precio, tiempo y calidad del informe se correlacionan para
                dar una fiabilidad sólida y cumplimiento normativo.
              </p>
            </div>

            <p
              className="mt-6 text-[0.97rem] text-gray-300"
              style={{ fontFamily: "poppins, sans-serif" }}
            >
              Al usar ECONFIA se obtiene información detallada y valiosa de personas o empresas, optimizando recursos y
              relaciones con un proceso más transparente y seguro.
            </p>
          </div>
        </div>

        {/* Tarjetas (derecha) */}
        <div className="lg:col-span-6">
          <h3
            className="text-[clamp(1.2rem,2.2vw,1.6rem)] font-semibold mb-4"
            style={{ fontFamily: "poppins, sans-serif" }}
          >
            Beneficios clave
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((card) => (
              <div
                key={card.t}
                className="
                  rounded-xl bg-white/5 border border-white/10 p-4
                  transition-all duration-300 cursor-default
                  hover:shadow-[0_0_28px_rgba(34,211,238,0.22)]
                  hover:border-cyan-300/40 hover:ring-2 hover:ring-cyan-300/35
                "
              >
                <div className="text-[1rem] font-semibold text-white leading-tight">
                  {card.t}
                </div>
                <div className="text-[0.92rem] text-gray-300 mt-1 leading-snug">
                  {card.d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
