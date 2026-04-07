// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { clearSession, isInactive } from "../utils/session";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isInactive()) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return children;
}
