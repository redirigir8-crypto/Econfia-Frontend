// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ParticlesBackground from "./components/ParticlesBackground";
import "react-horizontal-scrolling-menu/dist/styles.css";
import React from 'react';
import { ConfigProvider } from 'antd';
import { antdTheme } from './theme/antdTheme';
import './theme/global.css';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Pricing from "./pages/Pricing";
import Consulta from "./views/Consulta";
import ConsultaContratista from "./views/ConsultaContratista";
import ConsultaMedida from "./views/ConsultaMedida";
import Resultados from "./views/Resultados";
import LogOut from "./views/LogOut";
import Ayuda from "./views/Ayuda";
import Profile from "./views/Profile";
import { CardProvider } from "./context/CardContext";
import Register from "./pages/Register";
import SlideDinamicLists from "./components/services/SlideDinamicLists";
import ContratistaView from "./components/services/ContratistaView";
import Nosotros from "./pages/Nosotros";
import Contacto from "./pages/Contacto";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ServicioEconfia from "./pages/ServicioEconfia";
import ServicioContratista from "./pages/ServicioContratista";
import ServicioSeguridad from "./pages/ServicioSeguridad";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import networkGif from "./assets/GIF by São Paulo City.gif";
import codingGif from "./assets/coding internet security GIF by Matthew Butler.gif";
import connectionGif from "./assets/GIF by TQI - Tecnologia, Qualidade em Informação.gif";

// Estilos CSS para el efecto libro
const bookStyles = `
  .book-card:hover .book-cover {
    transform: rotateY(-80deg);
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInScale {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.8s ease-out forwards;
  }
  
  .animate-fade-in-left {
    animation: fadeInLeft 0.8s ease-out forwards;
  }
  
  .animate-fade-in-right {
    animation: fadeInRight 0.8s ease-out forwards;
  }
  
  .animate-slide-in-scale {
    animation: slideInScale 0.8s ease-out forwards;
  }
  
  .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
  .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
  .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
  .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
  .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
`;

// Insertar estilos para el efecto libro
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = bookStyles;
  document.head.appendChild(styleTag);
}

function WordSlide({ word, bg }) {
  return (
    <div
      className="relative w-full h-[90vh] md:h-[100vh] flex items-center justify-center text-white"
      style={{ backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <h2 className="relative z-10 text-5xl md:text-6xl font-semibold drop-shadow-lg">
        {word}
      </h2>
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Swiper
        modules={[Navigation, Keyboard]}
        navigation
        keyboard={{ enabled: true }}
        loop
        className="w-full"
        style={{ height: 'auto' }}
      >
        {/* Slide 1: Hero mejorado */}
        <SwiperSlide>
          <section className="relative w-full min-h-screen flex items-center justify-center pt-20 md:pt-24">
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/40" />
            
            {/* Elementos decorativos animados */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full">
              <div className="transform-gpu origin-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
                  {/* Columna izquierda: texto mejorado */}
                  <div className="text-left flex flex-col gap-4 md:gap-5">
                    {/* Badge superior */}
                    <div className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 animate-fade-in-down">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                      </span>
                      <span className="text-cyan-300 text-sm font-medium">Verificación en tiempo real</span>
                    </div>

                    <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white animate-fade-in-left animation-delay-100" >
                      Verifica en <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">segundos</span>,
                      <br />decide con <span className="text-cyan-400">confianza</span>
                    </h1>
                    
                    <p className="text-sm md:text-base lg:text-lg text-slate-300 max-w-xl leading-relaxed animate-fade-in-left animation-delay-200">
                      Plataforma líder en Colombia para verificación de antecedentes y análisis de riesgo. 
                      <span className="text-cyan-300 font-semibold"> Más de 200 fuentes oficiales</span> en una sola consulta.
                    </p>

                    {/* Características destacadas */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in-up animation-delay-250">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/40 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110">
                          <span className="text-cyan-400 group-hover:text-cyan-300 text-base md:text-lg transition-colors">⚡</span>
                        </div>
                        <span className="text-white text-xs md:text-sm font-medium group-hover:text-cyan-300 transition-colors">Resultados instantáneos</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/40 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110">
                          <span className="text-cyan-400 group-hover:text-cyan-300 text-base md:text-lg transition-colors">🛡️</span>
                        </div>
                        <span className="text-white text-xs md:text-sm font-medium group-hover:text-cyan-300 transition-colors">100% Verificable</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/40 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110">
                          <span className="text-cyan-400 group-hover:text-cyan-300 text-base md:text-lg transition-colors">📊</span>
                        </div>
                        <span className="text-white text-xs md:text-sm font-medium group-hover:text-cyan-300 transition-colors">Reportes claros</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/40 flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110">
                          <span className="text-cyan-400 group-hover:text-cyan-300 text-base md:text-lg transition-colors">🔒</span>
                        </div>
                        <span className="text-white text-xs md:text-sm font-medium group-hover:text-cyan-300 transition-colors">Datos seguros</span>
                      </div>
                    </div>

                    <div className="mt-2 md:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 animate-fade-in-up animation-delay-300">
                      <a 
                        className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-3 md:py-3.5 px-6 md:px-8 rounded-full text-sm md:text-base transition-all border border-white/20 hover:border-cyan-400/50 text-center"
                        href="/precios"
                      >
                        Ver planes
                      </a>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-4 md:mt-6 flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-slate-400 animate-fade-in-up animation-delay-400">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <span className="text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">✓</span>
                        <span className="group-hover:text-white transition-colors">Fuentes oficiales</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <span className="text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">✓</span>
                        <span className="group-hover:text-white transition-colors">GDPR Compliant</span>
                      </div>
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <span className="text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">✓</span>
                        <span className="group-hover:text-white transition-colors">ISO 27001</span>
                      </div>
                    </div>
                  </div>

                  {/* Columna derecha: grid de imágenes mejorado */}
                  <div className="grid grid-cols-1 gap-3 md:gap-4 w-full max-w-md lg:max-w-lg mx-auto">
                    {/* GIF grande superior con efecto libro y borde brillante */}
                    <div className="relative aspect-video rounded-xl md:rounded-2xl animate-fade-in-right animation-delay-200" style={{ perspective: '2000px' }}>
                      <div className="book-card relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-cyan-400/60 hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-blue-900/50 flex items-center justify-center">
                          <div className="text-center px-4">
                            <p className="text-white text-xl md:text-2xl font-bold mb-1 md:mb-2">Red Global</p>
                            <p className="text-cyan-300 text-xs md:text-sm">Conexión en tiempo real</p>
                          </div>
                        </div>
                        <div className="book-cover absolute inset-0 rounded-xl md:rounded-2xl shadow-2xl transition-transform duration-500 cursor-pointer border-2 border-cyan-500/30" 
                             style={{ 
                               transformOrigin: 'left',
                               transformStyle: 'preserve-3d'
                             }}>
                          <img
                            className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                            src={networkGif}
                            alt="Network animation"
                            style={{ filter: 'brightness(1.3) contrast(1.1)' }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {/* Imagen pequeña izquierda mejorada */}
                      <div className="relative aspect-square rounded-xl md:rounded-2xl animate-fade-in-left animation-delay-300" style={{ perspective: '2000px' }}>
                        <div className="book-card relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-cyan-400/50 hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center p-2 md:p-4">
                            <div className="text-center">
                              <p className="text-white text-sm md:text-lg font-bold mb-0.5 md:mb-1">Seguridad</p>
                              <p className="text-purple-300 text-[10px] md:text-xs">Encriptación total</p>
                            </div>
                          </div>
                          <div className="book-cover absolute inset-0 rounded-xl md:rounded-2xl shadow-xl transition-transform duration-500 cursor-pointer border-2 border-purple-500/30" 
                               style={{ 
                                 transformOrigin: 'left',
                                 transformStyle: 'preserve-3d'
                               }}>
                            <img
                              className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                              src={codingGif}
                              alt="Security animation"
                              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      </div>

                      {/* Imagen pequeña derecha mejorada */}
                      <div className="relative aspect-square rounded-xl md:rounded-2xl animate-fade-in-right animation-delay-400" style={{ perspective: '2000px' }}>
                        <div className="book-card relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-cyan-400/50 hover:scale-105" style={{ transformStyle: 'preserve-3d' }}>
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center p-2 md:p-4">
                            <div className="text-center">
                              <p className="text-white text-sm md:text-lg font-bold mb-0.5 md:mb-1">Conexiones</p>
                              <p className="text-blue-300 text-[10px] md:text-xs">Multi-fuente</p>
                            </div>
                          </div>
                          <div className="book-cover absolute inset-0 rounded-xl md:rounded-2xl shadow-xl transition-transform duration-500 cursor-pointer border-2 border-blue-500/30" 
                               style={{ 
                                 transformOrigin: 'left',
                                 transformStyle: 'preserve-3d'
                               }}>
                            <img
                              className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                              src={connectionGif}
                              alt="Connection network animation"
                              style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estadísticas flotantes */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 animate-fade-in-up animation-delay-500">
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-center hover:bg-white/10 transition-all">
                        <p className="text-xl md:text-2xl font-bold text-cyan-400">200+</p>
                        <p className="text-[10px] md:text-xs text-slate-400">Fuentes</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-center hover:bg-white/10 transition-all">
                        <p className="text-xl md:text-2xl font-bold text-cyan-400">&lt;5 Min</p>
                        <p className="text-[10px] md:text-xs text-slate-400">Respuesta</p>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl p-2 md:p-3 text-center hover:bg-white/10 transition-all">
                        <p className="text-xl md:text-2xl font-bold text-cyan-400">99.9%</p>
                        <p className="text-[10px] md:text-xs text-slate-400">Precisión</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SwiperSlide>

        {/* Slide 2: Servicios dinámicos (innovador) */}
        <SwiperSlide>
          <section className="relative w-full min-h-screen flex items-center justify-center pt-20 md:pt-24">
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/40" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col items-center justify-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center animate-fade-in-down">Servicios Econfiá</h2>
              <div className="flex flex-wrap justify-center gap-10 w-full">
                <div className="bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-80 hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-100">
                  <span className="text-cyan-400 text-5xl mb-4 animate-pulse">🔍</span>
                  <h3 className="text-xl font-bold text-white mb-2">Consulta de antecedentes</h3>
                  <p className="text-slate-200 text-center mb-4">Verifica antecedentes en segundos con fuentes oficiales.</p>
                  <a href="/consulta" className="px-8 py-3 rounded-full bg-cyan-500 text-white font-semibold shadow-lg hover:bg-cyan-600 transition">Consultar</a>
                </div>
                <div className="bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-80 hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-200">
                  <span className="text-blue-400 text-5xl mb-4 animate-pulse">📊</span>
                  <h3 className="text-xl font-bold text-white mb-2">Reportes y análisis</h3>
                  <p className="text-slate-200 text-center mb-4">Obtén reportes claros y análisis de riesgo personalizados.</p>
                  <a href="/resultados" className="px-8 py-3 rounded-full bg-blue-500 text-white font-semibold shadow-lg hover:bg-blue-600 transition">Ver reportes</a>
                </div>
              </div>
            </div>
          </section>
        </SwiperSlide>

        {/* Slide 3: Vista contratista (innovador) */}
        <SwiperSlide>
          <section className="relative w-full min-h-screen flex items-center justify-center pt-20 md:pt-24">
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/20 to-black/40" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 w-full flex flex-col items-center justify-center">
              <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center animate-fade-in-down">Para contratistas</h2>
              <div className="flex flex-wrap justify-center gap-10 w-full">
                <div className="bg-gradient-to-tr from-green-400/30 to-blue-500/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-80 hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-100">
                  <span className="text-green-400 text-5xl mb-4 animate-pulse">🧑‍💼</span>
                  <h3 className="text-xl font-bold text-white mb-2">Verificación contratista</h3>
                  <p className="text-slate-200 text-center mb-4">Soluciones especializadas para contratistas y empresas.</p>
                  <a href="/consulta-contratista" className="px-8 py-3 rounded-full bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600 transition">Consultar</a>
                </div>
                <div className="bg-gradient-to-tr from-yellow-400/30 to-blue-500/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center w-80 hover:scale-105 transition-transform duration-300 animate-fade-in-up animation-delay-200">
                  <span className="text-yellow-400 text-5xl mb-4 animate-pulse">💼</span>
                  <h3 className="text-xl font-bold text-white mb-2">Gestión de perfil</h3>
                  <p className="text-slate-200 text-center mb-4">Administra tu perfil y accede a tus reportes fácilmente.</p>
                  <a href="/profile" className="px-8 py-3 rounded-full bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-600 transition">Ir al perfil</a>
                </div>
              </div>
            </div>
          </section>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <CardProvider>
        <Router>
          <ParticlesBackground />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/precios" element={<Pricing />} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/forgot" element={<ForgotPassword />} />
            <Route path="/reset" element={<ResetPassword />} />
            
            {/* Páginas de servicios públicas */}
            <Route path="/servicio-econfia" element={<ServicioEconfia />} />
            <Route path="/servicio-contratista" element={<ServicioContratista />} />
            <Route path="/servicio-seguridad" element={<ServicioSeguridad />} />

            {/* Protegidas (Dashboard como layout) */}
            <Route element={<PrivateRoute><Dashboard /></PrivateRoute>}>

              {/* Hijas protegidas */}
              <Route path="/consulta" element={<Consulta />} />
              <Route path="/consulta-medida" element={<ConsultaMedida />} />
              <Route path="/consulta-contratista" element={<ConsultaContratista />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/logout" element={<LogOut />} />
              <Route path="/ayuda" element={<Ayuda />} />
            </Route>
          </Routes>
        </Router>
      </CardProvider>
    </ConfigProvider>
  );
}
