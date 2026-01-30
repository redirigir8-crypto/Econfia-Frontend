import React from "react";
import EmpresaRuesForm from "../components/EmpresaRuesForm";
import { FaBuilding } from "react-icons/fa";

const pageStyles = {
  maxWidth: 1100,
  margin: "40px auto",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "70vh",
};

const leftStyles = {
  flex: 1,
  padding: "40px 32px 40px 0",
  color: "#fff",
};

const badgeStyles = {
  display: "inline-block",
  background: "#00e0ff22",
  color: "#00e0ff",
  borderRadius: 20,
  padding: "6px 18px",
  fontWeight: 600,
  fontSize: 16,
  marginBottom: 18,
  letterSpacing: 1,
};

const titleStyles = {
  fontSize: 44,
  fontWeight: 800,
  margin: 0,
  marginBottom: 18,
  color: "#b6eaff",
  textShadow: "0 2px 8px #00e0ff33, 0 1px 0 #222",
};

const descStyles = {
  fontSize: 18,
  color: "#b6c2e8",
  marginBottom: 24,
  lineHeight: 1.5,
};

const listStyles = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  marginBottom: 24,
};

const listItemStyles = {
  display: "flex",
  alignItems: "center",
  fontSize: 16,
  marginBottom: 10,
  color: "#b6eaff",
};

const iconBoxStyles = {
  width: 60,
  height: 60,
  background: "#00e0ff22",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 24px auto",
  fontSize: 32,
  color: "#00e0ff",
  boxShadow: "0 2px 12px #00e0ff33",
};

const rightStyles = {
  flex: 1,
  background: "rgba(30, 34, 60, 0.95)",
  borderRadius: 18,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  border: "1px solid rgba(255,255,255,0.18)",
  backdropFilter: "blur(6px)",
  padding: 40,
  minWidth: 350,
  maxWidth: 420,
};

const EmpresaRuesPage = () => (
  <div style={pageStyles}>
    <div style={leftStyles}>
      <div style={badgeStyles}> <FaBuilding style={{marginRight: 8, marginBottom: -3}}/> Consulta Empresa</div>
      <h1 style={titleStyles}>Consulta de <span style={{color: '#fff'}}>Empresas</span></h1>
      <div style={descStyles}>
        Consulta información mercantil de empresas colombianas de forma segura y rápida.<br/>
        <br/>
        <ul style={listStyles}>
          <li style={listItemStyles}>• Interfaz moderna y accesible, optimizada para velocidad.</li>
          <li style={listItemStyles}>• Resultados claros y visualización de la captura oficial.</li>
          <li style={listItemStyles}>• Privacidad y seguridad en cada consulta.</li>
        </ul>
      </div>
    </div>
    <div style={rightStyles}>
      <div style={iconBoxStyles}><FaBuilding /></div>
      <EmpresaRuesForm />
    </div>
  </div>
);

export default EmpresaRuesPage;