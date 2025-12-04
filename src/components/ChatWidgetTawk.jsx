import { useEffect } from "react";

/**
 * Widget de Tawk.to (funciona en localhost también)
 * ID provisto: 68ca30cafa5b1a1927be6351/1j5ast647
 */
export default function ChatWidgetTawk({ name, email }) {
  useEffect(() => {
    // evita doble carga si el componente se monta más de una vez
    if (document.getElementById("tawk-script")) return;

    // API global opcional
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement("script");
    s1.id = "tawk-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/68ca30cafa5b1a1927be6351/1j5ast647";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    s0.parentNode.insertBefore(s1, s0);

    // setear datos del visitante y personalizar estilos cuando el widget cargue
    const trySetVisitor = () => {
      try {
        // Personalizar colores del chat
        if (window.Tawk_API?.customize) {
          window.Tawk_API.customize({
            displayMode: "bubble",
            placement: "br", // bottom-right
            theme: "dark"
          });
        }

        // Cambiar color del bubble a cyan/azul oscuro
        if (window.Tawk_API?.updateVisitorChat) {
          const style = document.createElement("style");
          style.innerHTML = `
            #tawk-bubble-frame {
              background-color: #1a3a52 !important;
              border: 1px solid #00D9FF !important;
            }
            .tawk-chat-container {
              background-color: #0f1f2e !important;
            }
            .tawk-message {
              background-color: #1a3a52 !important;
            }
          `;
          document.head.appendChild(style);
        }

        if ((name || email) && window.Tawk_API?.setAttributes) {
          window.Tawk_API.setAttributes(
            { name: name || undefined, email: email || undefined },
            (err) => err && console.warn("Tawk setAttributes error:", err)
          );
        }
      } catch {}
    };

    // Tawk expone eventos al estar listo
    const iv = setInterval(() => {
      if (window.Tawk_API && typeof window.Tawk_API.onLoad === "function") {
        clearInterval(iv);
        window.Tawk_API.onLoad = trySetVisitor;
      }
    }, 200);

    return () => {
      clearInterval(iv);
      // si quisieras desmontarlo completamente al cambiar de vista:
      // document.getElementById("tawk-script")?.remove();
      // window.Tawk_API?.hideWidget?.();
    };
  }, [name, email]);

  return null;
}
