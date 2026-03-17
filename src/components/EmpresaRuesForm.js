import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const formBox = {
  background: "rgba(30, 34, 60, 0.95)",
  borderRadius: 18,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: 32,
  minWidth: 320,
  maxWidth: 420,
  textAlign: "center",
};

const inputStyles = {
  width: "80%",
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #00e0ff55",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 18,
  marginBottom: 18,
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 8px #00e0ff22"
};

const buttonStyles = {
  padding: "12px 28px",
  borderRadius: 8,
  border: "none",
  background: "linear-gradient(90deg, #00e0ff 0%, #3a8dde 100%)",
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
  cursor: "pointer",
  boxShadow: "0 2px 12px #00e0ff44",
  marginLeft: 10,
  transition: "background 0.2s, box-shadow 0.2s"
};

const labelStyles = {
  display: "block",
  color: "#b6eaff",
  fontWeight: 600,
  marginBottom: 8,
  fontSize: 16,
  textAlign: "left"
};

const EmpresaRuesForm = () => {
  const [nit, setNit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Solo navega, el resultado se carga en la vista de resultados
      navigate(`/8f5c3a1b/${nit}`);
    } catch (err) {
      setError("Error al consultar la empresa.");
    }
    setLoading(false);
  };

  return (
    <div style={formBox}>
      <label style={labelStyles} htmlFor="nit">NIT de la empresa</label>
      <form onSubmit={handleSubmit} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <input
          id="nit"
          type="text"
          value={nit}
          onChange={e => setNit(e.target.value)}
          placeholder="Ej: 9002145653"
          style={inputStyles}
          autoComplete="off"
        />
        <button type="submit" disabled={loading || !nit} style={buttonStyles}>
          {loading ? <FaSearch style={{verticalAlign: 'middle'}}/> : <FaSearch style={{verticalAlign: 'middle'}}/>}
        </button>
      </form>
      {error && <p style={{ color: "#ff6b6b", marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default EmpresaRuesForm;
