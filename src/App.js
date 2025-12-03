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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ChatWidgetTawk from "./components/ChatWidgetTawk";

// Estilos CSS para el efecto libro
const bookStyles = `
  .book-card:hover .book-cover {
    transform: rotateY(-80deg);
  }
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
    <div className="h-screen overflow-hidden">
      <Header />
      <Swiper
        modules={[Navigation, Keyboard]}
        navigation
        keyboard={{ enabled: true }}
        loop
        className="w-full h-full"
      >
        {/* Slide 1: Hero con grid de imágenes */}
        <SwiperSlide>
          <section className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
              <div className="transform-gpu origin-center md:scale-100 scale-[0.85]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center">
                  {/* Columna izquierda: texto */}
                  <div className="text-left flex flex-col gap-4">
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold leading-tight">
                      dinámicas de adversos<br />
                      <span className="text-cyan-400">Econfia.</span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                      Soluciones financieras inteligentes para un futuro seguro. Potenciamos tu crecimiento con estrategias personalizadas y tecnología de vanguardia.
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <a 
                        className="bg-white hover:bg-slate-100 text-slate-900 font-semibold py-2.5 px-6 rounded-full text-sm transition-all shadow-lg hover:shadow-xl"
                        href="/login"
                      >
                        Iniciar ahora
                      </a>
                      <a 
                        className="bg-transparent hover:bg-slate-800/50 text-white font-medium py-2.5 px-6 rounded-full text-sm transition-all border border-slate-600"
                        href="/precios"
                      >
                        Ver demo
                      </a>
                    </div>
                  </div>

                  {/* Columna derecha: grid de imágenes */}
                  <div className="grid grid-cols-1 gap-3 w-full max-w-md mx-auto">
                    {/* Imagen grande superior con efecto libro */}
                    <div className="relative aspect-video rounded-2xl" style={{ perspective: '2000px' }}>
                      <div className="book-card relative w-full h-full rounded-2xl overflow-hidden border border-cyan-400/30 shadow-2xl transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                        {/* Contenido interior */}
                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                          <p className="text-white text-xl font-bold">Contenido</p>
                        </div>
                        {/* Portada que rota */}
                        <div className="book-cover absolute inset-0 bg-cover bg-center rounded-2xl shadow-2xl transition-transform duration-500 cursor-pointer" 
                             style={{ 
                               backgroundImage: 'url(https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800)',
                               transformOrigin: 'left',
                               transformStyle: 'preserve-3d'
                             }}>
                          <div className="absolute inset-0 bg-blue-900/40"></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Imagen pequeña izquierda con efecto libro */}
                      <div className="relative aspect-square rounded-2xl" style={{ perspective: '2000px' }}>
                        <div className="book-card relative w-full h-full rounded-2xl overflow-hidden border border-cyan-400/30 shadow-xl transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                          {/* Contenido interior */}
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <p className="text-white text-sm font-bold">Contenido</p>
                          </div>
                          {/* Portada que rota */}
                          <div className="book-cover absolute inset-0 bg-cover bg-center rounded-2xl shadow-xl transition-transform duration-500 cursor-pointer" 
                               style={{ 
                                 backgroundImage: 'url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400)',
                                 transformOrigin: 'left',
                                 transformStyle: 'preserve-3d'
                               }}>
                            <div className="absolute inset-0 bg-blue-900/40"></div>
                          </div>
                        </div>
                      </div>

                      {/* Imagen pequeña derecha con efecto libro */}
                      <div className="relative aspect-square rounded-2xl" style={{ perspective: '2000px' }}>
                        <div className="book-card relative w-full h-full rounded-2xl overflow-hidden border border-cyan-400/30 shadow-xl transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
                          {/* Contenido interior */}
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <p className="text-white text-sm font-bold">Contenido</p>
                          </div>
                          {/* Portada que rota */}
                          <div className="book-cover absolute inset-0 bg-cover bg-center rounded-2xl shadow-xl transition-transform duration-500 cursor-pointer" 
                               style={{ 
                                 backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400)',
                                 transformOrigin: 'left',
                                 transformStyle: 'preserve-3d'
                               }}>
                            <div className="absolute inset-0 bg-blue-900/40"></div>
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                              Pausado
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SwiperSlide>

        {/* Slide 2: Servicios dinámicos (original) */}
        <SwiperSlide>
          <SlideDinamicLists onMore={() => window.location.assign("/profile")} />
        </SwiperSlide>

        {/* Slide 3: Vista contratista (original) */}
        <SwiperSlide>
          <ContratistaView />
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

function ChatMount() {
  const { pathname } = useLocation();
  const HIDE_ON = ["/login", "/register", "/forgot", "/reset"];
  const show = !HIDE_ON.includes(pathname);

  const currentUser = null;
  const name = currentUser?.name;
  const email = currentUser?.email;

  return show ? <ChatWidgetTawk name={name} email={email} /> : null;
}

export default function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <CardProvider>
        <Router>
          <ParticlesBackground />
          <ChatMount />
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
