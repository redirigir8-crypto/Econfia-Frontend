// src/pages/TerminosLegales.jsx
import LegalShell from "./LegalShell";
import { DefaultTermsContent } from "../components/Terminos";

export default function TerminosLegales() {
  return (
    <LegalShell
      eyebrow="Terminos de uso"
      title="Terminos y Condiciones"
      intro="Consulta las condiciones de uso del aplicativo ECONFIA, el alcance de la informacion y las reglas de tratamiento de datos antes de continuar con cualquier consulta."
      updatedAt="7 de septiembre de 2026"
    >
      <DefaultTermsContent />
    </LegalShell>
  );
}
