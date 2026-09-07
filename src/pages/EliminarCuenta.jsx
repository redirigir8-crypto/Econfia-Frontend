// src/pages/EliminarCuenta.jsx
import LegalShell from "./LegalShell";

export default function EliminarCuenta() {
  return (
    <LegalShell
      eyebrow="Control de tus datos"
      title="Eliminacion de cuenta y datos"
      intro="En ECONFIA puedes solicitar la eliminacion de tu cuenta y de los datos personales asociados. Aqui te explicamos los pasos y que informacion se elimina o se conserva."
      updatedAt="7 de septiembre de 2026"
    >
      <section>
        <h2>Como solicitar la eliminacion de tu cuenta</h2>
        <p>
          Para solicitar la eliminacion de tu cuenta de ECONFIA y de los datos
          personales asociados, sigue estos pasos:
        </p>
        <ul>
          <li>
            Envia un correo a{" "}
            <a href="mailto:coordinaciondesarrollo@solutionsgroupcol.com">
              coordinaciondesarrollo@solutionsgroupcol.com
            </a>{" "}
            desde el correo con el que te registraste.
          </li>
          <li>
            Escribe en el asunto: <strong>Eliminacion de cuenta ECONFIA</strong>.
          </li>
          <li>
            Indica tu nombre completo y el correo de la cuenta que deseas
            eliminar.
          </li>
        </ul>
        <p>
          Verificaremos tu identidad y procesaremos la solicitud en un plazo
          maximo de quince (15) dias habiles, conforme a la Ley 1581 de 2012.
        </p>
      </section>

      <section>
        <h2>Que datos se eliminan</h2>
        <p>
          Al aprobar tu solicitud, eliminamos de forma segura los datos
          personales asociados a tu cuenta, entre ellos:
        </p>
        <ul>
          <li>Nombre y datos de contacto.</li>
          <li>Correo electronico y credenciales de acceso.</li>
          <li>Historial de consultas realizadas con la cuenta.</li>
        </ul>
      </section>

      <section>
        <h2>Que datos se conservan y por cuanto tiempo</h2>
        <p>
          Es posible que conservemos cierta informacion durante un periodo
          adicional unicamente cuando exista una obligacion legal, contable o de
          seguridad que asi lo exija (por ejemplo, registros de facturacion o
          evidencias requeridas por la normativa). Dicha informacion se conserva
          por el tiempo que indique la ley y luego se elimina o anonimiza de forma
          segura.
        </p>
      </section>

      <section>
        <h2>Eliminacion parcial de datos</h2>
        <p>
          Si prefieres eliminar solo una parte de tus datos sin cerrar la cuenta,
          tambien puedes solicitarlo al mismo correo{" "}
          <a href="mailto:coordinaciondesarrollo@solutionsgroupcol.com">
            coordinaciondesarrollo@solutionsgroupcol.com
          </a>
          , indicando que informacion deseas suprimir.
        </p>
      </section>
    </LegalShell>
  );
}
