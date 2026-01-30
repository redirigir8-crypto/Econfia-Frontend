import React, { useState } from "react";
import axios from "axios";
import { FaBuilding, FaSearch, FaDownload, FaExpand } from "react-icons/fa";

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

const resultBox = {
  background: "rgba(0,224,255,0.08)",
  borderRadius: 12,
  padding: 18,
  marginTop: 24,
  color: "#fff",
  boxShadow: "0 2px 12px #00e0ff22"
};

const labelStyles = {
  display: "block",
  color: "#b6eaff",
  fontWeight: 600,
  marginBottom: 8,
  fontSize: 16,
  textAlign: "left"
};

const iconCircle = {
  width: 54,
  height: 54,
  background: "#00e0ff33",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 18px auto",
  fontSize: 28,
  color: "#00e0ff",
  boxShadow: "0 2px 12px #00e0ff33"
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
};

const modalImg = {
  maxWidth: "90vw",
  maxHeight: "80vh",
  borderRadius: 12,
  boxShadow: "0 4px 32px #00e0ff77"
};

const EmpresaRuesView = () => {
  const [nit, setNit] = useState("");
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const consultarEmpresa = async () => {
    setLoading(true);
    setError("");
    setEmpresa(null);
    try {
      const res = await axios.get(`${API_URL}/api/consultar-empresa-rues/?nit=${nit}`);
      setEmpresa(res.data);
    } catch (err) {
      setError("No se encontró la empresa o hubo un error.");
    }
    setLoading(false);
  };

  const descargarCaptura = () => {
    if (empresa && empresa.captura_principal) {
      const link = document.createElement('a');
      link.href = empresa.captura_principal;
      link.download = empresa.captura_principal.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={formBox}>
      <div style={iconCircle}><FaBuilding /></div>
      <div style={{marginBottom: 18, fontWeight: 700, fontSize: 20, color: '#b6eaff'}}>Consulta de Empresa en RUES</div>
      <label style={labelStyles} htmlFor="nit">NIT de la empresa</label>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <input
          id="nit"
          type="text"
          value={nit}
          onChange={e => setNit(e.target.value)}
          placeholder="Ej: 9002145653"
          style={inputStyles}
          autoComplete="off"
        />
        <button onClick={consultarEmpresa} disabled={loading || !nit} style={buttonStyles}>
          {loading ? <FaSearch style={{verticalAlign: 'middle'}}/> : <FaSearch style={{verticalAlign: 'middle'}}/>}
        </button>
      </div>
      {error && <p style={{ color: "#ff6b6b", marginTop: 10 }}>{error}</p>}
      {empresa && (
        <div style={resultBox}>
          <h3 style={{color: '#00e0ff', marginBottom: 8}}>{empresa.nombre}</h3>
          <p><b>NIT:</b> {empresa.nit}</p>
          <p><b>Estado:</b> {empresa.estado}</p>
          <p><b>Cámara de Comercio:</b> {empresa.camara_comercio}</p>
          <p><b>Matrícula:</b> {empresa.matricula}</p>
          {empresa.captura_principal && (
            <div style={{marginTop: 16}}>
              <b>Captura oficial:</b>
              <br />
              <img
                src={empresa.captura_principal}
                alt="Captura empresa"
                style={{ maxWidth: 320, marginTop: 10, border: "2px solid #00e0ff33", borderRadius: 8, boxShadow: "0 2px 12px #00e0ff33", cursor: 'pointer' }}
                onClick={() => setShowModal(true)}
              />
              <div style={{marginTop: 10, display: 'flex', justifyContent: 'center', gap: 16}}>
                <button onClick={descargarCaptura} style={{...buttonStyles, padding: '8px 18px', fontSize: 16}} title="Descargar captura">
                  <FaDownload style={{verticalAlign: 'middle'}}/> Descargar
                </button>
                <button onClick={() => setShowModal(true)} style={{...buttonStyles, padding: '8px 18px', fontSize: 16, background: '#00e0ff55'}} title="Ver grande">
                  <FaExpand style={{verticalAlign: 'middle'}}/> Ampliar
                </button>
              </div>
              {showModal && (
                <div style={modalOverlay} onClick={() => setShowModal(false)}>
                  <img
                    src={empresa.captura_principal}
                    alt="Captura empresa grande"
                    style={modalImg}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmpresaRuesView;