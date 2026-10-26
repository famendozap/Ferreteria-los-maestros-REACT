import FormularioContacto from '../componentes/organismos/FormularioContacto';

const UBICACION_LOCAL = 'Av. Francisco de Aguirre 123, La Serena, Chile';
const URL_MAPA = `https://www.google.com/maps?q=${encodeURIComponent(UBICACION_LOCAL)}&output=embed`;
const URL_INDICACIONES = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(UBICACION_LOCAL)}`;

export default function Contacto() {
  return (
    <div className="container py-5">
      <div className="section-header mb-4 text-center">
        <h1 className="h2">Contáctanos</h1>
        <p className="text-muted">¿Tienes dudas sobre stock, cotizaciones o despacho? Escríbenos.</p>
      </div>
      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Formulario de contacto">
          <FormularioContacto />
        </section>
        <section className="col-lg-5" aria-labelledby="ubicacion-titulo">
          <h2 id="ubicacion-titulo" className="h4">
            Visítanos en La Serena
          </h2>
          <p className="text-muted mb-3">{UBICACION_LOCAL}</p>
          <div className="ratio ratio-4x3 overflow-hidden rounded border">
            <iframe
              src={URL_MAPA}
              title="Mapa de ubicación de Ferretería Los Maestros"
              loading="lazy"
              allowFullScreen
            />
          </div>
          <a
            className="btn btn-outline-dark mt-3"
            href={URL_INDICACIONES}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-geo-alt-fill me-2" aria-hidden="true" />
            Cómo llegar
          </a>
        </section>
      </div>
    </div>
  );
}
