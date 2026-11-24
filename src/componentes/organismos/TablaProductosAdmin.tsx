import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Producto } from '../../datos/productos';
import { eliminarProductoApi, listarProductosApi, mensajeErrorApi } from '../../servicios/ferreteriaApi';
import { useSesion } from '../../hooks/SesionContexto';
import { formatearCLP } from '../../utils/validaciones';
import StockPill, { stockEstado } from '../atomos/StockPill';
import Boton from '../atomos/Boton';

export default function TablaProductosAdmin() {
  const { token } = useSesion();
  const [params, setParams] = useSearchParams();
  const soloStockBajo = params.get('filtro') === 'stock-bajo';
  const [busqueda, setBusqueda] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarProductosApi()
      .then((lista) => {
        if (vigente) setProductos(lista);
      })
      .catch((e) => {
        if (vigente) setError(mensajeErrorApi(e, 'No fue posible cargar los productos.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase();
    return productos.filter((p) => {
      if (soloStockBajo && stockEstado(p) === 'ok') return false;
      if (!consulta) return true;
      return (
        p.nombre.toLocaleLowerCase().includes(consulta) ||
        p.codigo.toLocaleLowerCase().includes(consulta) ||
        p.marca.toLocaleLowerCase().includes(consulta)
      );
    });
  }, [busqueda, productos, soloStockBajo]);

  async function borrarProducto(codigo: string) {
    if (!token) return;
    if (!window.confirm(`¿Eliminar el producto ${codigo}?`)) return;
    try {
      await eliminarProductoApi(codigo, token);
      setProductos((prev) => prev.filter((p) => p.codigo !== codigo));
      setError('');
    } catch (e) {
      setError(mensajeErrorApi(e, 'No fue posible eliminar el producto.'));
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
        <input
          type="search"
          className="form-control"
          placeholder="Buscar producto por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="form-select w-auto"
          aria-label="Filtrar por estado de stock"
          value={soloStockBajo ? 'stock-bajo' : 'todos'}
          onChange={(e) => setParams(e.target.value === 'stock-bajo' ? { filtro: 'stock-bajo' } : {})}
        >
          <option value="todos">Todos los productos</option>
          <option value="stock-bajo">Stock bajo o agotado</option>
        </select>
        <Link to="/admin/productos/nuevo" className="text-nowrap">
          <Boton>+ Nuevo producto</Boton>
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio venta</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.codigo}>
                <td className="font-monospace">{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria}</td>
                <td>{formatearCLP(p.pVenta)}</td>
                <td>{p.stock}</td>
                <td>
                  <StockPill producto={p} />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/admin/productos/${p.codigo}`}>
                      <Boton variante="outline" tamano="sm">
                        Editar
                      </Boton>
                    </Link>
                    <Boton
                      variante="danger"
                      tamano="sm"
                      aria-label={`Eliminar producto ${p.codigo}`}
                      onClick={() => borrarProducto(p.codigo)}
                    >
                      Eliminar
                    </Boton>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-muted">
                  {cargando
                    ? 'Cargando productos...'
                    : soloStockBajo
                      ? 'No hay productos con stock bajo o agotado.'
                      : 'No se encontraron productos.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}