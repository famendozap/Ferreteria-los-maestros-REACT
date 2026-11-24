import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Producto } from '../../datos/productos';
import {
  actualizarProductoApi,
  crearProductoApi,
  listarProductosApi,
  mensajeErrorApi,
} from '../../servicios/ferreteriaApi';
import { useSesion } from '../../hooks/SesionContexto';
import CampoFormulario from '../../componentes/moleculas/CampoFormulario';
import Boton from '../../componentes/atomos/Boton';

const PRODUCTO_VACIO: Producto = {
  codigo: '',
  categoria: '',
  subcategoria: '',
  nombre: '',
  marca: '',
  unidad: 'Unidad',
  pCompra: 0,
  pVenta: 0,
  stock: 0,
  stockMin: 0,
};

function aEntero(valor: string): number {
  const n = Math.trunc(Number(valor));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function AdminProductoEditar() {
  const { codigo } = useParams<{ codigo: string }>();
  const esNuevo = !codigo || codigo === 'nuevo';
  const navigate = useNavigate();
  const { token } = useSesion();

  const [producto, setProducto] = useState<Producto>(PRODUCTO_VACIO);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    let vigente = true;
    listarProductosApi()
      .then((lista) => {
        if (!vigente) return;
        setCategorias(Array.from(new Set(lista.map((p) => p.categoria))).sort());
        if (!esNuevo) {
          const existente = lista.find((p) => p.codigo === codigo);
          if (existente) setProducto(existente);
          else setError(`No se encontró el producto ${codigo}.`);
        }
      })
      .catch((e) => {
        if (vigente) setError(mensajeErrorApi(e, 'No fue posible cargar el producto.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [codigo, esNuevo]);

  function actualizar<K extends keyof Producto>(campo: K, valor: Producto[K]) {
    setProducto((p) => ({ ...p, [campo]: valor }));
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Tu sesión expiró. Usa "Salir" e inicia sesión nuevamente.');
      return;
    }
    if (!producto.categoria || !producto.subcategoria.trim()) {
      setError('La categoría y la subcategoría son obligatorias.');
      return;
    }

    setGuardando(true);
    try {
      // Guarda en la base de datos; el catálogo público lee de ahí, así que el cambio se refleja de inmediato.
      if (esNuevo) await crearProductoApi(producto, token);
      else await actualizarProductoApi(codigo!, producto, token);
      setGuardado(true);
      setTimeout(() => navigate('/admin/productos'), 900);
    } catch (err) {
      setError(mensajeErrorApi(err, 'No fue posible guardar el producto.'));
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="container py-5" style={{ maxWidth: '620px' }}>
        <p className="text-muted">Cargando producto...</p>
      </div>
    );
  }

  if (!esNuevo && error && producto.codigo === '') {
    return (
      <div className="container py-5" style={{ maxWidth: '620px' }}>
        <div className="alert alert-danger" role="alert">{error}</div>
        <Link to="/admin/productos">Volver al mantenedor</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '620px' }}>
      <h1 className="h2 mb-4">{esNuevo ? 'Nuevo producto' : 'Editar producto'}</h1>

      {guardado && <div className="alert alert-success py-2">Producto guardado correctamente.</div>}
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="row">
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="Código"
              id="codigo"
              value={producto.codigo}
              disabled={!esNuevo}
              onChange={(e) => actualizar('codigo', e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="Marca"
              id="marca"
              value={producto.marca}
              onChange={(e) => actualizar('marca', e.target.value)}
              required
            />
          </div>
        </div>

        <CampoFormulario
          etiqueta="Nombre del producto"
          id="nombre"
          value={producto.nombre}
          onChange={(e) => actualizar('nombre', e.target.value)}
          required
        />

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label" htmlFor="categoria">
              Categoría
            </label>
            <select
              id="categoria"
              className="form-select"
              value={producto.categoria}
              onChange={(e) => actualizar('categoria', e.target.value)}
              required
            >
              <option value="">Selecciona...</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="Subcategoría"
              id="subcategoria"
              value={producto.subcategoria}
              onChange={(e) => actualizar('subcategoria', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-6 col-md-3">
            <CampoFormulario
              etiqueta="Precio compra (CLP)"
              id="pCompra"
              type="number"
              min={0}
              value={producto.pCompra}
              onChange={(e) => actualizar('pCompra', Number(e.target.value))}
            />
          </div>
          <div className="col-6 col-md-3">
            <CampoFormulario
              etiqueta="Precio venta (CLP)"
              id="pVenta"
              type="number"
              min={0}
              value={producto.pVenta}
              onChange={(e) => actualizar('pVenta', Number(e.target.value))}
            />
          </div>
          <div className="col-6 col-md-3">
            <CampoFormulario
              etiqueta="Stock"
              id="stock"
              type="number"
              min={0}
              step={1}
              value={producto.stock}
              onChange={(e) => actualizar('stock', aEntero(e.target.value))}
            />
          </div>
          <div className="col-6 col-md-3">
            <CampoFormulario
              etiqueta="Stock mínimo"
              id="stockMin"
              type="number"
              min={0}
              step={1}
              value={producto.stockMin}
              onChange={(e) => actualizar('stockMin', aEntero(e.target.value))}
            />
          </div>
        </div>

        {producto.stock <= 0 && (
          <p className="text-muted small">
            Con stock 0 el producto aparece como «Sin stock» en el catálogo y no se puede comprar.
          </p>
        )}

        <Boton type="submit" className="w-100 mt-2" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar producto'}
        </Boton>
      </form>
    </div>
  );
}
