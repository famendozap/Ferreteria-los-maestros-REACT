import { useEffect, useMemo, useState } from 'react';
import type { Producto } from '../../datos/productos';
import CardProducto from '../moleculas/CardProducto';
import { useCarritoContexto } from '../../hooks/CarritoContexto';
import { listarProductosApi } from '../../servicios/ferreteriaApi';

type Orden = 'nombre-asc' | 'precio-asc' | 'precio-desc';

export default function GrillaProductos() {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState<Orden>('nombre-asc');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const { agregar } = useCarritoContexto();

  useEffect(() => {
    listarProductosApi().then(setProductos).catch((e: Error) => setError(e.message)).finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(() => Array.from(new Set(productos.map((p) => p.categoria))).sort(), [productos]);

  // Combina búsqueda, categoría y orden sin modificar el arreglo original del catálogo.
  const productosFiltrados = useMemo(() => {
    let resultado = productos.filter((p) => {
      const coincideTexto =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !categoria || p.categoria === categoria;
      return coincideTexto && coincideCategoria;
    });

    resultado = [...resultado].sort((a, b) => {
      if (orden === 'nombre-asc') return a.nombre.localeCompare(b.nombre);
      if (orden === 'precio-asc') return a.pVenta - b.pVenta;
      return b.pVenta - a.pVenta;
    });

    return resultado;
  }, [busqueda, categoria, orden, productos]);

  if (cargando) return <p className="text-muted">Cargando productos desde Spring Boot...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="row g-2 mb-4">
        <div className="col-md-5">
          <input
            type="search"
            className="form-control"
            placeholder="Buscar por nombre o código..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}>
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="precio-asc">Precio (menor a mayor)</option>
            <option value="precio-desc">Precio (mayor a menor)</option>
          </select>
        </div>
      </div>

      <p className="text-muted small">{productosFiltrados.length} productos encontrados</p>

      <div className="row g-3">
        {productosFiltrados.map((producto) => (
          <div className="col-sm-6 col-lg-4 col-xl-3" key={producto.codigo}>
            <CardProducto producto={producto} onAgregar={(codigo) => agregar(codigo, 1)} />
          </div>
        ))}
        {productosFiltrados.length === 0 && (
          <p className="text-center text-muted py-5">No se encontraron productos con ese criterio.</p>
        )}
      </div>
    </div>
  );
}
