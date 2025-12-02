// src/pages/Dashboard.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";
import Taskbar from "../components/TaskBar";
import RadioBubble from "../components/RadioBubble";

export default function Dashboard() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col pt-8">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.35 }}
          className="flex-1 w-full"
        >
          {/* Aquí se renderizan las rutas hijas definidas en App.jsx */}
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <RadioBubble />
      <Taskbar />
    </div>
  );
}
