// src/pages/SmsPoliticaPrivacidad.jsx
import LegalShell from "./LegalShell";

export default function SmsPoliticaPrivacidad() {
  return (
    <LegalShell
      eyebrow="Mensajeria SMS · econfiaWallet"
      title="Privacy Policy — Programa de Mensajes de Texto (SMS)"
      intro="Esta politica describe como ECONFIA (marca registrada de Grupo Soluciones) recopila, usa y protege la informacion asociada al programa de mensajeria SMS de econfiaWallet, incluyendo los datos de consentimiento (opt-in) de los numeros de telefono."
      updatedAt="23 de septiembre de 2026"
    >
      <section>
        <p>
          <strong>
            We do not sell or share your SMS opt-in data or personal information
            with third parties for marketing purposes.
          </strong>
        </p>
      </section>

      <section>
        <h2>1. Informacion que recopilamos</h2>
        <p>
          Cuando usted se suscribe voluntariamente al programa de mensajeria SMS
          de ECONFIA (por ejemplo, para recibir codigos de verificacion, alertas
          de estado de sus consultas o notificaciones de su cuenta en
          econfiaWallet), recopilamos:
        </p>
        <ul>
          <li>Su numero de telefono movil.</li>
          <li>La fecha, hora y metodo de su consentimiento (opt-in).</li>
          <li>
            El contenido y estado de entrega de los mensajes enviados y
            recibidos.
          </li>
          <li>
            Palabras clave de respuesta relacionadas con el programa (por
            ejemplo, STOP, HELP).
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Como usamos su informacion</h2>
        <p>Los datos recopilados a traves del programa SMS se usan exclusivamente para:</p>
        <ul>
          <li>
            Enviar los mensajes de texto que usted solicito o autorizo
            (verificacion de identidad, alertas transaccionales, notificaciones
            de cuenta).
          </li>
          <li>
            Confirmar y administrar su consentimiento de suscripcion y sus
            solicitudes de baja.
          </li>
          <li>
            Cumplir con obligaciones legales y requisitos de los operadores de
            telecomunicaciones y proveedores de mensajeria.
          </li>
        </ul>
        <p>
          No usamos sus datos de opt-in de SMS para publicidad ni mercadeo de
          terceros. Los numeros de telefono y el estado de consentimiento
          recopilados a traves de este programa nunca se comparten, alquilan ni
          venden a terceros con fines de marketing.
        </p>
      </section>

      <section>
        <h2>3. Con quien compartimos informacion</h2>
        <p>
          Los datos del programa SMS solo se comparten con los proveedores
          estrictamente necesarios para operar el servicio de mensajeria (por
          ejemplo, nuestro proveedor de mensajeria de texto), bajo acuerdos de
          confidencialidad, y unicamente para los fines descritos en esta
          politica. No se comparten con anunciantes, intermediarios de datos ni
          redes de marketing de terceros.
        </p>
      </section>

      <section>
        <h2>4. Como darse de baja</h2>
        <p>
          Usted puede darse de baja del programa de mensajeria SMS en cualquier
          momento respondiendo <strong>STOP</strong> a cualquier mensaje
          recibido. Recibira una confirmacion de que no se le enviaran mas
          mensajes. Para volver a suscribirse, responda{" "}
          <strong>START</strong>. Para obtener ayuda, responda{" "}
          <strong>HELP</strong> o escribanos a{" "}
          <a href="mailto:coordinaciondesarrollo@solutionsgroupcol.com">
            coordinaciondesarrollo@solutionsgroupcol.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>5. Retencion y seguridad de los datos</h2>
        <p>
          Conservamos los registros de consentimiento y el historial de mensajes
          durante el tiempo necesario para cumplir con obligaciones legales y de
          auditoria de los proveedores de mensajeria, y los protegemos mediante
          controles de acceso y almacenamiento cifrado acordes con nuestras
          practicas generales de seguridad de la informacion.
        </p>
      </section>

      <section>
        <h2>6. Sus derechos</h2>
        <p>
          Usted tiene derecho a solicitar acceso, correccion o eliminacion de
          los datos asociados a su numero de telefono en el programa SMS, asi
          como a revocar su consentimiento en cualquier momento. Para ejercer
          estos derechos, contactenos a traves de los datos indicados al final
          de este documento.
        </p>
      </section>

      <section>
        <h2>7. Cambios a esta politica</h2>
        <p>
          Podemos actualizar esta politica ocasionalmente para reflejar cambios
          en nuestras practicas o en requisitos legales aplicables. La fecha de
          la ultima actualizacion se indica en la parte superior de este
          documento.
        </p>
      </section>
    </LegalShell>
  );
}
