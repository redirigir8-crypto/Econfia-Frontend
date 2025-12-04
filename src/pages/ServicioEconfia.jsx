import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import Header from "../components/Header";

export default function ServicioEconfia() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Econfia
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plataforma completa de consulta de listas dinámicas de adversos
          </p>
        </div>

        {/* Descripción principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-cyan-500/30">
          <h2 className="text-3xl font-semibold text-cyan-400 mb-6">
            ¿Qué es Econfia?
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed mb-6">
            Econfia es una herramienta avanzada que te permite realizar consultas exhaustivas 
            en múltiples fuentes oficiales colombianas e internacionales para verificar antecedentes, 
            sanciones y registros de personas naturales y jurídicas.
          </p>
          <p className="text-gray-200 text-lg leading-relaxed">
            Ideal para procesos de debida diligencia, contratación de personal, y verificación 
            de proveedores o socios comerciales.
          </p>
        </div>

        {/* Características */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20">
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-cyan-400" />
              Fuentes Consultadas
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Procuraduría General de la Nación
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Contraloría General de la República
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Policía Nacional
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Registraduría Nacional
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Superintendencia Financiera
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Listas OFAC, ONU, Interpol y más
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/20">
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-cyan-400" />
              Beneficios
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Consulta automatizada en más de 50 fuentes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Resultados consolidados en un solo PDF
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Ahorro de tiempo y recursos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Información actualizada en tiempo real
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Trazabilidad completa de consultas
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                Soporte técnico especializado
              </li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-500 text-black font-semibold rounded-full hover:bg-cyan-400 transition transform hover:scale-105 shadow-lg shadow-cyan-500/50"
          >
            Comenzar a usar Econfia
            <FaArrowRight />
          </Link>
          <p className="text-gray-400 mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
