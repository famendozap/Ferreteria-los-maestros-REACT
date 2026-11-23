import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Producto } from '../datos/productos';
import { obtenerProductoApi } from '../servicios/ferreteriaApi';
import { formatearCLP } from '../utils/validaciones';
import StockPill from '../componentes/atomos/StockPill';
import Boton from '../componentes/atomos/Boton';
import { useCarritoContexto } from '../hooks/CarritoContexto';
import ProductoImagen from '../componentes/moleculas/ProductoImagen';

export default function ProductoDetalle() {
  const { codigo } = useParams<{ codigo: string }>();
  const [producto, setProducto] = useState<Producto | undefined>();
  const [error, setError] = useState('');
  useEffect(() => {
    if (codigo) obtenerProductoApi(codigo).then(setProducto).catch((e: Error) => setError(e.message));
  }, [codigo]);
  const { agregar } = useCarritoContexto();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  if (error) {
    return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  }
  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">No se encontró el producto solicitado.</p>
        <Link to="/catalogo">Volver al catálogo</Link>
      </div>
    );
  }

  function manejarAgregar() {
    agregar(producto!.codigo, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  }

  return (
    <div className="container py-5">
      <Link to="/catalogo" className="small d-inline-block mb-3">
        ← Volver al catálogo
      </Link>

      <div className="row g-4">
        <div className="col-md-5">
          <div className="ficha p-3 text-center">
            <ProductoImagen producto={producto} />
            <a
              className="small d-inline-block mt-2"
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(`${producto.marca} ${producto.nombre}`)}`}
              target="_blank"
              rel="noreferrer"
            >Buscar fotografía real de este producto ↗</a>
          </div>
        </div>
        <div className="col-md-7">
          <span className="badge text-bg-light mb-2">{producto.categoria}</span>
          <h1 className="h3">{producto.nombre}</h1>
          <p className="text-muted mb-1">
            {producto.marca} · {producto.unidad} · Código {producto.codigo}
          </p>
          <p className="fs-3 fw-bold">{formatearCLP(producto.pVenta)}</p>
          <StockPill producto={producto} />

          <div className="d-flex align-items-center gap-3 mt-4">
            <input
              type="number"
              min={1}
              max={producto.stock}
              className="form-control"
              style={{ width: '100px' }}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
            />
            <Boton disabled={producto.stock <= 0} onClick={manejarAgregar}>
              Agregar a mi selección
            </Boton>
          </div>
          {agregado && <div className="alert alert-success mt-3 py-2">Producto agregado.</div>}
        </div>
      </div>
    </div>
  );
}
