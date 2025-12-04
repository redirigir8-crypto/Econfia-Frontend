import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaArrowRight, FaFileAlt, FaClock } from "react-icons/fa";
import Header from "../components/Header";

export default function ServicioContratista() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Econfia Contratista
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descarga todos los documentos necesarios para contratistas en un solo lugar
          </p>
        </div>

        {/* Descripción principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/30">
          <h2 className="text-3xl font-semibold text-purple-400 mb-6">
            ¿Qué es Econfia Contratista?
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed mb-6">
            Econfia Contratista es la solución perfecta para contratistas que necesitan obtener 
            rápidamente todos los certificados y documentos requeridos para procesos de contratación 
            con entidades públicas y privadas.
          </p>
          <p className="text-gray-200 text-lg leading-relaxed">
            Olvídate de visitar múltiples páginas web y de llenar formularios repetitivos. 
            Con Econfia Contratista obtienes todo en minutos.
          </p>
        </div>

        {/* Documentos disponibles */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 mb-12 border border-purple-500/20">
          <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <FaFileAlt className="text-purple-400" />
            Documentos Disponibles
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de Antecedentes Fiscales (Contraloría)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de Antecedentes Disciplinarios (Procuraduría)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de Antecedentes Judiciales (Policía)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de SIMIT</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de Medidas Correctivas</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">RUT actualizado</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Certificado de Afiliación a EPS</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400 mt-1">✓</span>
              <span className="text-gray-300">Y muchos más...</span>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 text-center">
            <FaClock className="text-purple-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Ahorra Tiempo</h3>
            <p className="text-gray-300">
              Obtén todos tus documentos en minutos, no en días
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 text-center">
            <FaFileAlt className="text-purple-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Todo en un Lugar</h3>
            <p className="text-gray-300">
              Un solo portal para todos tus certificados y documentos
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 text-center">
            <FaCheckCircle className="text-purple-400 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">Documentos Oficiales</h3>
            <p className="text-gray-300">
              Certificados válidos directamente de fuentes oficiales
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 bg-purple-500 text-white font-semibold rounded-full hover:bg-purple-400 transition transform hover:scale-105 shadow-lg shadow-purple-500/50"
          >
            Comenzar a usar Econfia Contratista
            <FaArrowRight />
          </Link>
          <p className="text-gray-400 mt-4">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-300">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
