import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '../../datos/productos';
import { stockEstado } from '../../componentes/atomos/StockPill';
import { useSesion } from '../../hooks/SesionContexto';
import { listarProductosApi, mensajeErrorApi } from '../../servicios/ferreteriaApi';
import { listarUsuariosApi, mensajeError, type UsuarioSesion } from '../../servicios/usuariosApi';

export default function AdminDashboard() {
  const { token } = useSesion();
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioSesion[] | null>(null);
  const [errorProductos, setErrorProductos] = useState('');
  const [errorUsuarios, setErrorUsuarios] = useState('');

  useEffect(() => {
    let vigente = true;

    listarProductosApi()
      .then((lista) => {
        if (vigente) setProductos(lista);
      })
      .catch((e) => {
        if (vigente) setErrorProductos(mensajeErrorApi(e, 'No fue posible cargar los productos.'));
      });

    if (token) {
      listarUsuariosApi(token)
        .then((lista) => {
          if (vigente) setUsuarios(lista);
        })
        .catch((e) => {
          if (vigente) setErrorUsuarios(mensajeError(e, 'No fue posible cargar los usuarios.'));
        });
    }

    return () => {
      vigente = false;
    };
  }, [token]);

  const mostrar = (n: number | undefined) => (n === undefined ? '…' : n);

  const tarjetas = [
    { titulo: 'Productos en catálogo', valor: mostrar(productos?.length), enlace: '/admin/productos' },
        {
      titulo: 'Con stock bajo o agotado',
      valor: mostrar(productos?.filter((p) => stockEstado(p) !== 'ok').length),
      enlace: '/admin/productos?filtro=stock-bajo',
    },
    { titulo: 'Usuarios registrados', valor: mostrar(usuarios?.length), enlace: '/admin/usuarios' },
    {
      titulo: 'Usuarios activos',
      valor: mostrar(usuarios?.filter((u) => u.activo).length),
      enlace: '/admin/usuarios',
    },
  ];

  return (
    <div className="container py-5">
      <h1 className="h2 mb-4">Panel de administración</h1>
      {errorProductos && <div className="alert alert-danger py-2" role="alert">{errorProductos}</div>}
      {errorUsuarios && <div className="alert alert-danger py-2" role="alert">{errorUsuarios}</div>}
      <div className="row g-3">
        {tarjetas.map((t) => (
          <div className="col-sm-6 col-lg-3" key={t.titulo}>
            <Link to={t.enlace} className="text-decoration-none">
              <div className="card valor-card h-100 text-center">
                <div className="card-body">
                  <p className="fs-2 fw-bold mb-0">{t.valor}</p>
                  <p className="text-muted small mb-0">{t.titulo}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}