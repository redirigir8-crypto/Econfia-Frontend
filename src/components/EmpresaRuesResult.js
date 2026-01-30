import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaBuilding, FaDownload, FaExpand } from "react-icons/fa";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const resultBox = {
  background: "rgba(0,224,255,0.08)",
  borderRadius: 12,
  padding: 18,
  marginTop: 24,
  color: "#fff",
  boxShadow: "0 2px 12px #00e0ff22"
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

const EmpresaRuesResult = () => {
  const { nit } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEmpresa = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/api/consultar-empresa-rues/?nit=${nit}`);
        setEmpresa(res.data);
      } catch (err) {
        setError("No se encontró la empresa o hubo un error.");
      }
      setLoading(false);
    };
    fetchEmpresa();
  }, [nit]);

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

  if (loading) return <div style={{color:'#b6eaff', marginTop:40}}>Cargando...</div>;
  if (error) return <div style={{color:'#ff6b6b', marginTop:40}}>{error}</div>;
  if (!empresa) return null;

  return (
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
  );
};

export default EmpresaRuesResult;
