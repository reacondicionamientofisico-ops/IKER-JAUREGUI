import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="container">
      <div className="card policy">
        <div className="btn-row policy-top-actions">
          <Link className="btn secondary" to="/formulario">
            Volver al formulario
          </Link>
        </div>
        <h2 className="section-title">Política de protección de datos</h2>
        <p className="policy-intro">
          Información y consentimiento para clientes de Iker Jauregui ·
          Reacondicionamiento Físico y Salud.
        </p>

        <p>
          En cumplimiento del <strong>Reglamento (UE) 2016/679</strong> del
          Parlamento Europeo y del Consejo, de 27 de abril de 2016, General de
          Protección de Datos (RGPD), y de la <strong>Ley Orgánica 3/2018</strong>,
          de 5 de diciembre, de Protección de Datos Personales y garantía de
          los derechos digitales (LOPDGDD), se informa al Cliente de las
          condiciones en que serán tratados los datos personales que facilite
          con motivo de la contratación y prestación de los servicios de
          entrenamiento personal y reacondicionamiento físico.
        </p>

        <h3>01 Responsable del tratamiento</h3>
        <p>El responsable del tratamiento de sus datos personales es:</p>
        <table className="policy-table">
          <tbody>
            <tr>
              <th>Titular</th>
              <td>Iker Jauregui Tejido</td>
            </tr>
            <tr>
              <th>NIF</th>
              <td>16076482B</td>
            </tr>
            <tr>
              <th>Denominación comercial</th>
              <td>Iker Jauregui · Reacondicionamiento Físico y Salud</td>
            </tr>
            <tr>
              <th>Domicilio</th>
              <td>C/ Mateo Bidaurrazaga Alkatea, 3 — 48150 Sondika (Bizkaia)</td>
            </tr>
            <tr>
              <th>Correo electrónico</th>
              <td>iker.jau@gmail.com</td>
            </tr>
            <tr>
              <th>Teléfono</th>
              <td>628 454 455</td>
            </tr>
          </tbody>
        </table>

        <h3>02 Finalidades del tratamiento</h3>
        <p>
          Los datos personales facilitados serán tratados exclusivamente para
          las siguientes finalidades:
        </p>
        <ul>
          <li>
            Gestionar la relación contractual derivada de la prestación de
            los servicios de entrenamiento personal y reacondicionamiento
            físico.
          </li>
          <li>
            Realizar la valoración inicial del Cliente y elaborar, ejecutar y
            hacer seguimiento de programas de entrenamiento personalizados,
            adaptados a su estado de salud, condición física y objetivos.
          </li>
          <li>
            Gestionar la agenda de sesiones, reservas, cancelaciones y las
            comunicaciones operativas vinculadas al servicio.
          </li>
          <li>
            Emitir facturas y llevar a cabo la gestión administrativa,
            contable y fiscal de los servicios prestados.
          </li>
          <li>
            Remitir comunicaciones comerciales sobre servicios, promociones o
            novedades del estudio, únicamente cuando el Cliente lo haya
            autorizado expresamente.
          </li>
          <li>Atender las obligaciones legales aplicables a la actividad profesional.</li>
        </ul>
        <p>
          No se adoptarán decisiones individuales automatizadas ni se
          elaborarán perfiles con efectos jurídicos sobre el Cliente.
        </p>

        <h3>03 Categorías de datos tratados</h3>
        <ul>
          <li>
            <strong>Datos identificativos y de contacto:</strong> nombre y
            apellidos, DNI/NIE, domicilio, teléfono y correo electrónico.
          </li>
          <li>
            <strong>Datos de salud:</strong> estado físico, lesiones,
            patologías, alergias, medicación, antecedentes y cualquier otra
            información necesaria para valorar la aptitud del Cliente para la
            actividad física y adaptar el entrenamiento de forma segura.
          </li>
          <li>
            <strong>Datos de seguimiento:</strong> mediciones, tests de
            valoración funcional, registros de sesiones y evolución del
            rendimiento.
          </li>
          <li>
            <strong>Datos económicos y de pago:</strong> datos bancarios o de
            medios de pago necesarios para el cobro y la facturación.
          </li>
        </ul>
        <p className="policy-note">
          <strong>Datos de categoría especial.</strong> Los datos de salud
          tienen la consideración de categoría especial conforme al artículo
          9 del RGPD. Sólo se recaban con el consentimiento explícito del
          Cliente y resultan imprescindibles para prestar el servicio con
          garantías de seguridad. El Cliente se compromete a facilitar
          información veraz y a comunicar cualquier variación relevante de su
          estado de salud.
        </p>

        <h3>04 Base jurídica del tratamiento</h3>
        <ul>
          <li>
            <strong>Ejecución de un contrato:</strong> prestación de los
            servicios de entrenamiento personal solicitados por el Cliente
            (art. 6.1.b RGPD).
          </li>
          <li>
            <strong>Consentimiento explícito:</strong> tratamiento de datos
            de salud (art. 9.2.a RGPD) y, en su caso, envío de comunicaciones
            comerciales y captación de imágenes (art. 6.1.a RGPD).
          </li>
          <li>
            <strong>Obligación legal:</strong> cumplimiento de la normativa
            fiscal, contable y demás obligaciones aplicables (art. 6.1.c
            RGPD).
          </li>
        </ul>
        <p>
          La aportación de los datos identificativos y de salud es necesaria
          para la prestación del servicio; su no aportación impediría
          realizar el entrenamiento en condiciones de seguridad.
        </p>

        <h3>05 Plazo de conservación</h3>
        <p>
          Los datos se conservarán únicamente durante el tiempo necesario
          para cumplir la finalidad para la que fueron recabados y atender
          las responsabilidades legales derivadas del tratamiento.
          Transcurridos dichos plazos, serán suprimidos de forma segura o
          anonimizados.
        </p>
        <table className="policy-table">
          <thead>
            <tr>
              <th>Tipo de datos</th>
              <th>Plazo de conservación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Datos contractuales, identificativos y de facturación</td>
              <td>
                Duración de la relación y, después, 6 años (art. 30 Código de
                Comercio) y plazos de prescripción tributaria
              </td>
            </tr>
            <tr>
              <td>Datos de salud y seguimiento del entrenamiento</td>
              <td>
                Duración de la relación y, después, el plazo necesario para
                atender posibles responsabilidades (máx. 3 años)
              </td>
            </tr>
            <tr>
              <td>Datos para comunicaciones comerciales</td>
              <td>Hasta la retirada del consentimiento u oposición del Cliente</td>
            </tr>
          </tbody>
        </table>

        <h3>06 Destinatarios de los datos</h3>
        <p>
          Los datos no se cederán a terceros, salvo obligación legal. Para la
          prestación del servicio podrán acceder a ellos, en calidad de
          encargados del tratamiento, los siguientes proveedores:
        </p>
        <ul>
          <li>Entidades bancarias y plataformas de pago, para la gestión de cobros.</li>
          <li>Gestoría o asesoría, para el cumplimiento de las obligaciones fiscales y contables.</li>
          <li>Proveedores de herramientas tecnológicas de agenda, facturación, almacenamiento y comunicación.</li>
        </ul>
        <p>
          Todos ellos actúan bajo un contrato de encargo del tratamiento
          conforme al artículo 28 del RGPD. En caso de que algún proveedor
          tecnológico implique transferencias internacionales de datos fuera
          del Espacio Económico Europeo, éstas se realizarán únicamente con
          garantías adecuadas (decisiones de adecuación o cláusulas
          contractuales tipo de la Comisión Europea).
        </p>

        <h3>07 Derechos del Cliente</h3>
        <p>
          El Cliente puede ejercer en cualquier momento, de forma gratuita,
          los siguientes derechos:
        </p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos personales se están tratando.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
          <li><strong>Oposición:</strong> oponerse al tratamiento en determinadas circunstancias.</li>
          <li><strong>Limitación:</strong> solicitar la suspensión del tratamiento en los supuestos legalmente previstos.</li>
          <li>
            <strong>Portabilidad:</strong> recibir sus datos en un formato
            estructurado, de uso común y lectura mecánica, o solicitar su
            transmisión a otro responsable.
          </li>
          <li>
            <strong>Retirada del consentimiento:</strong> en cualquier
            momento, sin que ello afecte a la licitud del tratamiento previo.
          </li>
        </ul>
        <p className="policy-note">
          <strong>¿Cómo ejercer sus derechos?</strong> Mediante solicitud
          dirigida a <strong>iker.jau@gmail.com</strong> o por escrito al
          domicilio del responsable, indicando el derecho que desea ejercer y
          acompañando copia de su documento identificativo. Se responderá en
          el plazo máximo de un mes. Si considera que el tratamiento no se
          ajusta a la normativa, puede presentar una reclamación ante la
          Agencia Española de Protección de Datos (
          <strong>www.aepd.es</strong>).
        </p>

        <h3>08 Medidas de seguridad</h3>
        <p>
          El responsable aplica las medidas técnicas y organizativas
          adecuadas al riesgo para garantizar la confidencialidad, integridad
          y disponibilidad de los datos y evitar su alteración, pérdida o
          acceso no autorizado, entre ellas: acceso restringido a la
          información, uso de dispositivos y cuentas protegidos por
          contraseña y doble factor de autenticación, copias de seguridad
          periódicas y custodia segura de la documentación en papel.
        </p>

        <p className="policy-footer">
          C/ Mateo Bidaurrazaga Alkatea, 3 · Sondika (Bizkaia) ·
          iker.jau@gmail.com · 628 454 455
        </p>

        <div className="btn-row">
          <Link className="btn secondary" to="/formulario">
            Volver al formulario
          </Link>
        </div>
      </div>
    </div>
  );
}
