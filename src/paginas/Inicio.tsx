import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Producto } from '../datos/productos';
import { listarProductosApi } from '../servicios/ferreteriaApi';
import { CONTENIDOS } from '../datos/contenidos';
import CardProducto from '../componentes/moleculas/CardProducto';
import { useCarritoContexto } from '../hooks/CarritoContexto';

export default function Inicio() {
  const { agregar } = useCarritoContexto();
  const [destacados, setDestacados] = useState<Producto[]>([]);
    useEffect(() => {
      listarProductosApi()
        .then((lista) => setDestacados(lista.slice(0, 4)))
        .catch(() => setDestacados([]));
    }, []);
  const recientes = CONTENIDOS.slice(0, 2);

  return (
    <div>
      <section className="home-hero py-5 mb-5">
        <div className="container text-center">
          <h1 className="display-5 fw-bold">22 años abasteciendo a La Serena y Coquimbo</h1>
          <p className="lead text-muted">
            Materiales de construcción, herramientas, pinturas y jardín — stock real, precios claros.
          </p>
          <Link to="/catalogo" className="btn btn-lm-primary btn-lg mt-2">
            Ver catálogo completo
          </Link>
        </div>
      </section>

      <section className="container mb-5">
        <div className="section-header d-flex justify-content-between align-items-end mb-3">
          <h2 className="h4 mb-0">Productos destacados</h2>
          <Link to="/catalogo" className="small">
            Ver todos →
          </Link>
        </div>
        <div className="row g-3">
          {destacados.map((p) => (
            <div className="col-sm-6 col-lg-3" key={p.codigo}>
              <CardProducto producto={p} onAgregar={(codigo) => agregar(codigo, 1)} />
            </div>
          ))}
        </div>
      </section>

      <section className="container mb-5">
        <div className="section-header d-flex justify-content-between align-items-end mb-3">
          <h2 className="h4 mb-0">Consejos y novedades</h2>
          <Link to="/contenidos" className="small">
            Ver todos →
          </Link>
        </div>
        <div className="row g-3">
          {recientes.map((c) => (
            <div className="col-md-6" key={c.id}>
              <div className="card h-100 blog-card">
                <div className="card-body">
                  <span className="badge text-bg-light mb-2">{c.categoria}</span>
                  <h5 className="card-title">{c.titulo}</h5>
                  <p className="card-text text-muted">{c.resumen}</p>
                  <Link to={`/contenidos/${c.id}`} className="small">
                    Leer más →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mb-5">
        <div className="section-header mb-3">
          <h2 className="h4 mb-0">Quiénes somos</h2>
        </div>
        <p className="text-muted">
          Ferretería Los Maestros es un negocio familiar de La Serena con más de 22 años de trayectoria,
          atendiendo a contratistas, maestros y vecinos del sector.{' '}
          <Link to="/nosotros">Conoce más sobre nosotros →</Link>
        </p>
      </section>
    </div>
  );
}
