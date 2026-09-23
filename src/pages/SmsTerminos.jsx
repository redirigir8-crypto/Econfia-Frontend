// src/pages/SmsTerminos.jsx
import LegalShell from "./LegalShell";

export default function SmsTerminos() {
  return (
    <LegalShell
      eyebrow="Mensajeria SMS · econfiaWallet"
      title="SMS Terms & Conditions — Programa de Mensajes de Texto"
      intro="Estos terminos regulan el uso del programa de mensajeria SMS operado por ECONFIA (marca registrada de Grupo Soluciones) dentro de econfiaWallet. Al suscribirse, usted acepta las condiciones descritas a continuacion."
      updatedAt="23 de septiembre de 2026"
    >
      <section>
        <p>
          <strong>Message and data rates may apply.</strong> El operador de su
          celular puede cobrar tarifas de mensajes y datos segun su plan.
        </p>
      </section>

      <section>
        <h2>SMS Terms — Condiciones especificas del programa SMS</h2>
        <p>
          Al proporcionar su numero de telefono y aceptar recibir mensajes de
          texto de ECONFIA, usted da su consentimiento expreso (opt-in) para
          recibir mensajes relacionados con:
        </p>
        <ul>
          <li>
            Codigos de verificacion y autenticacion de su cuenta en
            econfiaWallet (OTP).
          </li>
          <li>Alertas sobre el estado de sus consultas o solicitudes.</li>
          <li>Notificaciones transaccionales y de seguridad de su cuenta.</li>
        </ul>
        <p>
          La frecuencia de los mensajes varia segun su actividad en la
          plataforma (mensajeria transaccional, no periodica). Aplican tarifas
          de mensajes y datos de su operador (message and data rates may
          apply). ECONFIA no cobra ningun valor adicional por el envio de estos
          mensajes.
        </p>
        <ul>
          <li>
            <strong>STOP:</strong> cancela su suscripcion de inmediato. No
            recibira mas mensajes.
          </li>
          <li>
            <strong>START:</strong> reactiva su suscripcion al programa de
            mensajeria.
          </li>
          <li>
            <strong>HELP:</strong> recibe informacion de ayuda y datos de
            contacto por SMS.
          </li>
        </ul>
        <p>
          Los operadores de telecomunicaciones no son responsables por mensajes
          retrasados o no entregados.
        </p>
      </section>

      <section>
        <h2>1. Aceptacion de estos terminos</h2>
        <p>
          El uso del programa de mensajeria SMS de ECONFIA implica la
          aceptacion de estos terminos y de nuestra{" "}
          <a href="/sms-privacy-policy">Politica de Privacidad de SMS</a>, que
          describe como se recopila y protege la informacion asociada a su
          numero de telefono.
        </p>
      </section>

      <section>
        <h2>2. Elegibilidad</h2>
        <p>
          El programa esta dirigido a usuarios mayores de edad, residentes en
          Colombia, que cuenten con una linea movil activa y hayan dado su
          consentimiento expreso para recibir mensajes de ECONFIA.
        </p>
      </section>

      <section>
        <h2>3. Como darse de baja y soporte</h2>
        <p>
          Puede darse de baja en cualquier momento respondiendo{" "}
          <strong>STOP</strong> a cualquier mensaje recibido, o
          contactandonos directamente a traves de los datos indicados al
          final de este documento. El soporte para el programa de mensajeria
          no tiene ningun costo adicional distinto a las tarifas estandar de
          su operador.
        </p>
      </section>

      <section>
        <h2>4. Cambios en el servicio</h2>
        <p>
          ECONFIA puede modificar, suspender o descontinuar el programa de
          mensajeria SMS en cualquier momento, asi como actualizar estos
          terminos para reflejar cambios en el servicio o en requisitos
          legales aplicables. Los cambios sustanciales se reflejaran con una
          nueva fecha de actualizacion en este documento.
        </p>
      </section>

      <section>
        <h2>5. Limitacion de responsabilidad</h2>
        <p>
          ECONFIA no garantiza la entrega ininterrumpida o libre de errores de
          los mensajes de texto, ya que esta depende de terceros (operadores
          de telecomunicaciones y proveedores de mensajeria) fuera de nuestro
          control directo.
        </p>
      </section>

      <section>
        <h2>6. Relacion con los Terminos generales</h2>
        <p>
          Estos terminos especificos de SMS complementan, y no reemplazan, los{" "}
          <a href="/terminos">Terminos y Condiciones generales</a> de uso de la
          plataforma ECONFIA.
        </p>
      </section>
    </LegalShell>
  );
}
