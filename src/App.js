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
    <>
      <Header />
      <Swiper
        modules={[Navigation, Keyboard]}
        navigation
        keyboard={{ enabled: true }}
        loop
        className="w-full"
      >
        <SwiperSlide>
          <SlideDinamicLists onMore={() => window.location.assign("/profile")} />
        </SwiperSlide>
        <SwiperSlide>
          <ContratistaView />
        </SwiperSlide>
      </Swiper>
    </>
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
