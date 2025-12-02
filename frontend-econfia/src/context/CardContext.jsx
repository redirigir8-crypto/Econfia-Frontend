// src/context/CardContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import CardDni from "../components/CardDni";

const CardContext = createContext();

export function useCard() {
  return useContext(CardContext);
}

export function CardProvider({ children }) {
  const [cardData, setCardData] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!cardData?.consultaId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/resultados/${cardData.consultaId}/`);
        const data = await res.json();

        // Si la consulta ya está completada, eliminamos la card
        if (data.estado === "completado") {
          setCardData(null);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error consultando estado de la consulta:", error);
      }
    }, 5000); // revisa cada 5 segundos

    // Limpiar el interval cuando la cardData cambie o el componente se desmonte
    return () => clearInterval(interval);
  }, [cardData, API_URL]);

  return (
    <CardContext.Provider value={{ cardData, setCardData }}>
      {children}

      {cardData &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-50">
            <CardDni 
              data={cardData} 
              className="bg-transparent shadow-none border-none" 
            />
          </div>,
          document.body
        )}
    </CardContext.Provider>
  );
}
