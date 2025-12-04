import React from "react";
import { FaCheckCircle, FaArrowRight, FaUserShield, FaClipboardCheck, FaChartLine } from "react-icons/fa";
import Header from "../components/Header";

export default function ServicioSeguridad() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Econfia Estudios de Seguridad
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Estudios completos y personalizados para la selección de personal
          </p>
        </div>

        {/* Descripción principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-green-500/30">
          <h2 className="text-3xl font-semibold text-green-400 mb-6">
            ¿Qué es Econfia Estudios de Seguridad?
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed mb-6">
            Econfia Estudios de Seguridad es una plataforma especializada que facilita los procesos 
            de selección de personal mediante estudios de seguridad completos, detallados y personalizados 
            según las necesidades de tu organización.
          </p>
          <p className="text-gray-200 text-lg leading-relaxed">
            Realizamos verificaciones exhaustivas que van más allá de simples consultas, 
            proporcionando análisis profundos que te ayudan a tomar decisiones informadas 
            en tus procesos de contratación.
          </p>
        </div>

        {/* Tipos de estudios */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaClipboardCheck className="text-green-400" />
              Tipos de Estudios
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Estudio de Seguridad Básico
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Estudio de Seguridad Estándar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Estudio de Seguridad Premium
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Verificación de Referencias Laborales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Verificación de Referencias Personales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Visita Domiciliaria
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Estudios Personalizados
              </li>
            </ul>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20">
            <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
              <FaUserShield className="text-green-400" />
              Qué Incluye
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Consulta en bases de datos oficiales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Verificación de antecedentes judiciales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Validación de información académica
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Verificación de experiencia laboral
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Análisis de redes sociales
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Entrevistas y visitas domiciliarias
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                Informe detallado y recomendaciones
              </li>
            </ul>
          </div>
        </div>

        {/* Características */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 text-center">
            <FaUserShield className="text-green-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Confidencialidad</h3>
            <p className="text-gray-300">
              Manejo seguro y confidencial de toda la información
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 text-center">
            <FaClipboardCheck className="text-green-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Personalizado</h3>
            <p className="text-gray-300">
              Estudios adaptados a las necesidades específicas de tu empresa
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-green-500/20 text-center">
            <FaChartLine className="text-green-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Resultados Claros</h3>
            <p className="text-gray-300">
              Informes detallados con análisis y recomendaciones
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <a
            href="https://conecta.econfia.co/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-green-500 text-white font-semibold rounded-full hover:bg-green-400 transition transform hover:scale-105 shadow-lg shadow-green-500/50"
          >
            Visitar Econfia Estudios de Seguridad
            <FaArrowRight />
          </a>
          <p className="text-gray-400 mt-4">
            Plataforma externa especializada en estudios de seguridad
          </p>
        </div>
      </div>
    </div>
  );
}
