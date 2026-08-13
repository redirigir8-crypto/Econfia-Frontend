// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import logoIcon from "../assets/logo-econfia-icon.png";
import { Link, NavLink} from "react-router-dom";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { FaEnvelope } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";

const linkBase = "flex items-center gap-2 hover:text-cyan-300 transition";
const linkActive = "text-cyan-400";

export default function Header() {
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const serviciosRef = useRef(null);

  // Cerrar el menú de servicios si se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        serviciosRef.current &&
        !serviciosRef.current.contains(event.target)
      ) {
        setIsServiciosOpen(false);
      }
    }
    if (isServiciosOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isServiciosOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-[1rem] bg-surface/70 border-b border-line/15 h-16 md:h-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 md:gap-3 cursor-pointer"
          >
            <img
              src={logoIcon}
              alt="Logo Econfia"
              className="h-9 md:h-11 w-auto object-contain"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="text-content font-bold tracking-[-0.045em] text-lg md:text-2xl">
                ECONFIA
              </span>
              <span className="text-muted tracking-[0.18em] text-[7px] md:text-[9px] -mt-0.5 whitespace-nowrap">
                UNA MARCA DE GRUPO SOLUCIONES
              </span>
            </div>
          </Link>
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 text-content text-sm font-medium">
          {/* Dropdown Servicios */}
          <div
            className="relative"
            ref={serviciosRef}
          >
            <button
              onClick={() => setIsServiciosOpen((open) => !open)}
              className={`flex items-center gap-1 hover:text-cyan-300 transition ${isServiciosOpen ? 'text-cyan-400' : ''}`}
              type="button"
            >
              Servicios <ChevronDown size={16} />
            </button>
            {isServiciosOpen && (
              <div className="absolute left-0 bg-surface text-content mt-2 rounded-lg shadow-xl w-72 z-[100] border border-line/15">
                <Link
                  to="/servicio-econfia"
                  className="block px-4 py-3 hover:bg-brand/10 rounded-t-lg transition"
                  onClick={() => setIsServiciosOpen(false)}
                >
                  <span className="font-semibold">Econfia</span>
                  <p className="text-xs text-muted mt-1">
                    Consulta de lista dinámica de adversos
                  </p>
                </Link>
                <Link
                  to="/contacto"
                  className="block px-4 py-3 hover:bg-brand/10 transition border-t border-line/10"
                  onClick={() => setIsServiciosOpen(false)}
                >
                  <span className="font-semibold">Econfia Contratista</span>
                  <p className="text-xs text-muted mt-1">
                    Documentos para contratistas
                  </p>
                </Link>
                <Link
                  to="/servicio-seguridad"
                  className="block px-4 py-3 hover:bg-brand/10 transition border-t border-line/10"
                  onClick={() => setIsServiciosOpen(false)}
                >
                  <span className="font-semibold">Econfia Estudios de seguridad</span>
                  <p className="text-xs text-muted mt-1">
                    Selección de personal especializada
                  </p>
                </Link>
                <Link
                  to="/contacto"
                  className="block px-4 py-3 hover:bg-brand/10 rounded-b-lg transition border-t border-line/10"
                  onClick={() => setIsServiciosOpen(false)}
                >
                  <span className="font-semibold">Econfia Títulos</span>
                  <p className="text-xs text-muted mt-1">
                    Validación documental y soportes académicos
                  </p>
                </Link>
              </div>
            )}
          </div>

          <NavLink
            to="/beneficios"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Beneficios
          </NavLink>

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
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line/20 bg-surface-2/70 text-content transition hover:border-brand/40 hover:text-brand"
            aria-label="Cambiar tema"
            title={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            to="/login"
            className="px-4 py-2 rounded-full text-content hover:text-brand transition text-sm font-medium"
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
          className="lg:hidden text-content p-2 hover:bg-content/10 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-surface/95 backdrop-blur-xl border-b border-line/15 shadow-2xl max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5rem)] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-3">
            {/* Servicios móvil */}
            <div ref={serviciosRef}>
              <button
                onClick={() => setIsServiciosOpen((open) => !open)}
                className="w-full flex items-center justify-between text-content font-medium py-2"
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
                    className="block text-muted hover:text-brand transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia</span>
                    <p className="text-xs text-muted/80 mt-1">Consulta de adversos</p>
                  </Link>
                  <Link
                    to="/contacto"
                    className="block text-muted hover:text-brand transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia Contratista</span>
                    <p className="text-xs text-muted/80 mt-1">Documentos</p>
                  </Link>
                  <Link
                    to="/servicio-seguridad"
                    className="block text-muted hover:text-brand transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia Seguridad</span>
                    <p className="text-xs text-muted/80 mt-1">Estudios de personal</p>
                  </Link>
                  <Link
                    to="/contacto"
                    className="block text-muted hover:text-brand transition py-2"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsServiciosOpen(false);
                    }}
                  >
                    <span className="font-semibold">Econfia Títulos</span>
                    <p className="text-xs text-muted/80 mt-1">Validación documental</p>
                  </Link>
                </div>
              )}
            </div>

            <NavLink
              to="/beneficios"
              className={({ isActive }) =>
                `text-content font-medium py-2 ${isActive ? 'text-cyan-400' : 'hover:text-cyan-300'} transition`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Beneficios
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `text-content font-medium py-2 ${isActive ? 'text-cyan-400' : 'hover:text-cyan-300'} transition`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </NavLink>

            <Link
              to="/nosotros"
              className="text-content font-medium py-2 hover:text-cyan-300 transition"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Nosotros
            </Link>

            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `text-content font-medium py-2 ${isActive ? 'text-cyan-400' : 'hover:text-cyan-300'} transition flex items-center gap-2`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaEnvelope /> Contacto
            </NavLink>

            {/* Botones móvil */}
            <div className="pt-4 border-t border-line/15 space-y-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-line/20 bg-surface-2/70 px-4 py-3 text-content transition hover:border-brand/40 hover:text-brand font-medium"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                {theme === "dark" ? "Tema claro" : "Tema oscuro"}
              </button>
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
