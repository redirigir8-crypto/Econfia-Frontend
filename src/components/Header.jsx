// src/components/Header.jsx
import React, { useState } from "react";
import logo from "../assets/logo-econfia (1).png";
import { Link, NavLink} from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { FaEnvelope } from "react-icons/fa";

const linkBase = "flex items-center gap-2 hover:text-cyan-300 transition";
const linkActive = "text-cyan-400";

export default function Header() {
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-[1rem] bg-white/5 border-b border-white/10 h-16 md:h-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src={logo}
              alt="Logo Econfia"
              className="h-10 md:h-12 w-auto object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-white text-sm font-medium">
          {/* Dropdown Servicios */}
          <div 
            className="relative"
            onMouseLeave={() => setIsServiciosOpen(false)}
          >
            <button 
              onClick={() => setIsServiciosOpen(!isServiciosOpen)}
              className={`flex items-center gap-1 hover:text-cyan-300 transition ${isServiciosOpen ? 'text-cyan-400' : ''}`}
            >
              Servicios <ChevronDown size={16} />
            </button>
            {isServiciosOpen && (
              <div className="absolute left-0 bg-white text-black mt-2 rounded-lg shadow-xl w-72 z-[100] border border-gray-200">
              <Link
                to="/servicio-econfia"
                className="block px-4 py-3 hover:bg-gray-100 rounded-t-lg transition"
                onClick={() => setIsServiciosOpen(false)}
              >
                <span className="font-semibold">Econfia</span>
                <p className="text-xs text-gray-600 mt-1">
                  Consulta de lista dinámica de adversos
                </p>
              </Link>
              <Link
                to="/servicio-contratista"
                className="block px-4 py-3 hover:bg-gray-100 transition border-t border-gray-100"
                onClick={() => setIsServiciosOpen(false)}
              >
                <span className="font-semibold">Econfia Contratista</span>
                <p className="text-xs text-gray-600 mt-1">
                  Documentos para contratistas
                </p>
              </Link>
              <Link
                to="/servicio-seguridad"
                className="block px-4 py-3 hover:bg-gray-100 rounded-b-lg transition border-t border-gray-100"
                onClick={() => setIsServiciosOpen(false)}
              >
                <span className="font-semibold">Econfia Estudios de seguridad</span>
                <p className="text-xs text-gray-600 mt-1">
                  Selección de personal especializada
                </p>
              </Link>
            </div>
            )}
          </div>

          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Blog
          </NavLink>

          <Link 
            to="/nosotros" 
            className="hover:text-cyan-300 transition"
          >
            Nosotros
          </Link>
          
          <NavLink
            to="/contacto"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            <FaEnvelope /> Contacto
          </NavLink>
        </nav>

        {/* Botones Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-white hover:text-cyan-300 transition text-sm font-medium"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full bg-cyan-500 text-black border border-transparent hover:bg-transparent hover:border-cyan-500 hover:text-cyan-500 transition font-medium text-sm"
          >
            Registrarse
          </Link>
        </div>

        {/* Botón menú móvil */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-3">
            {/* Servicios móvil */}
            <div>
              <button
                onClick={() => setIsServiciosOpen(!isServiciosOpen)}
                className="w-full flex items-center justify-between text-white font-medium py-2"
              >
                Servicios
                <ChevronDown 
                  size={20} 
                  className={`transition-transform ${isServiciosOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isServiciosOpen && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-cyan-500/30 pl-4">
                  <Link
                    to="/servicio-econfia"
                    className="block text-white/80 hover:text-cyan-300 transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia</span>
                    <p className="text-xs text-white/60 mt-1">Consulta de adversos</p>
                  </Link>
                  <Link
                    to="/servicio-contratista"
                    className="block text-white/80 hover:text-cyan-300 transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia Contratista</span>
                    <p className="text-xs text-white/60 mt-1">Documentos</p>
                  </Link>
                  <Link
                    to="/servicio-seguridad"
                    className="block text-white/80 hover:text-cyan-300 transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia Seguridad</span>
                    <p className="text-xs text-white/60 mt-1">Estudios de personal</p>
                  </Link>
                </div>
              )}
            </div>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `text-white font-medium py-2 ${isActive ? 'text-cyan-400' : 'hover:text-cyan-300'} transition`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </NavLink>

            <Link
              to="/nosotros"
              className="text-white font-medium py-2 hover:text-cyan-300 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nosotros
            </Link>

            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `text-white font-medium py-2 ${isActive ? 'text-cyan-400' : 'hover:text-cyan-300'} transition flex items-center gap-2`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaEnvelope /> Contacto
            </NavLink>

            {/* Botones móvil */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-3 rounded-full border border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 transition font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-3 rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
