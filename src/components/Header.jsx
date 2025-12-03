// src/components/Header.jsx
import React from "react";
import logo from "../assets/logo-econfia (1).png";
import { Link, NavLink} from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { FaDollarSign, FaEnvelope, FaSearch, FaUser } from "react-icons/fa";

const linkBase = "flex items-center gap-2 hover:text-cyan-300 transition";
const linkActive = "text-cyan-400";
export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-[1rem] bg-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        {/* Logo con link al inicio */}
        <div className="flex items-center space-x-4">
          <Link to="/">
            <img
              src={logo}
              alt="Logo eConfia"
              className="h-auto w-[8rem] object-contain cursor-pointer"
            />
          </Link>
        </div>

        {/* Navegación */}
        <nav className="hidden md:flex items-center space-x-8 text-white text-sm font-medium">

          {/* Dropdown Servicios */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-cyan-300 transition">
              Servicios <ChevronDown size={16} />
            </button>
            <div className="absolute hidden group-hover:block bg-white text-black mt-2 rounded-lg shadow-lg w-72 z-[100]">
              <Link
                to="/consulta"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                <span className="font-semibold">Econfia</span>
                <p className="text-xs text-gray-600">
                  Una herramienta completa para consulta de lista dinámica de adversos
                </p>
              </Link>
              <Link
                to="/consulta-contratista"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                <span className="font-semibold">Econfia Contratista</span>
                <p className="text-xs text-gray-600">
                  Una herramienta para descargar los documentos necesarios para los contratistas
                </p>
              </Link>
              <Link
                to="https://conecta.econfia.co/"
                className="block px-4 py-3 hover:bg-gray-100"
              >
                <span className="font-semibold">Econfia Estudios de seguridad</span>
                <p className="text-xs text-gray-600">
                  Una herramienta para facilitar la selección de personal con estudios completos y personalizados
                </p>
              </Link>

            </div>
          </div>

          {/* Blog */}
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            Blog
          </NavLink>

            <NavLink
            to="/precios"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            <FaDollarSign /> Planes
          </NavLink>

          {/* Nosotros */}
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

        {/* Botón Contactar a ventas */}
        <div className="hidden md:flex">
          <Link
            to="/contacto-ventas"
            className="px-5 py-2 rounded-full bg-cyan-500 text-black border border-transparent hover:bg-transparent hover:border-cyan-500 hover:text-cyan-500 transition"
          >
            Contactar a ventas
          </Link>
        </div>
      </div>
    </header>
  );
}
