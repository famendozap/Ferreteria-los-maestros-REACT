import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../atomos/Boton';
import { useSesion } from '../../hooks/SesionContexto';
import {
  alternarActivoApi,
  eliminarUsuarioApi,
  listarUsuariosApi,
  mensajeError,
  type UsuarioSesion,
} from '../../servicios/usuariosApi';

const claseBadge: Record<string, string> = {
  Administrador: 'badge-rol-admin',
  Contratista: 'text-bg-info',
  Cliente: 'badge-rol-usuario',
};


export default function TablaUsuariosAdmin() {
  const { token } = useSesion();
  const [busqueda, setBusqueda] = useState('');
  const [usuarios, setUsuarios] = useState<UsuarioSesion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let vigente = true;
    listarUsuariosApi(token)
      .then((lista) => {
        if (vigente) setUsuarios(lista);
      })
      .catch((e) => {
        if (vigente) setError(mensajeError(e, 'No fue posible cargar los usuarios.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [token]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        `${u.nombre} ${u.apellidos}`.toLowerCase().includes(q) ||
        u.mail.toLowerCase().includes(q) ||
        u.run.toLowerCase().includes(q),
    );
  }, [busqueda, usuarios]);

  async function alternarActivo(id: number) {
    if (!token) return;
    try {
      const actualizado = await alternarActivoApi(id, token);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? actualizado : u)));
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No fue posible actualizar el usuario.'));
    }
  }

  async function borrarUsuario(usuario: UsuarioSesion) {
    if (!token) return;
    if (!window.confirm(`¿Eliminar el usuario ${usuario.run}?`)) return;
    try {
      await eliminarUsuarioApi(usuario.id, token);
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      setError('');
    } catch (e) {
      setError(mensajeError(e, 'No fue posible eliminar el usuario.'));
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      <input
        type="search"
        className="form-control mb-3"
        placeholder="Buscar por nombre, correo o RUN..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>RUN</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr key={u.id}>
                <td className="font-monospace">{u.run}</td>
                <td>
                  {u.nombre} {u.apellidos}
                </td>
                <td>{u.mail}</td>
                <td>
                  <span className={`badge ${claseBadge[u.tipoUsuario] ?? 'text-bg-secondary'}`}>
                    {u.tipoUsuario}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.activo ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-2">
                    <Link to={`/admin/usuarios/${u.id}`}>
                      <Boton variante="outline" tamano="sm">
                        Editar
                      </Boton>
                    </Link>
                    <Boton variante="outline" tamano="sm" onClick={() => alternarActivo(u.id)}>
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </Boton>
                    <Boton
                      variante="danger"
                      tamano="sm"
                      aria-label={`Eliminar usuario ${u.run}`}
                      onClick={() => borrarUsuario(u)}
                    >
                      Eliminar
                    </Boton>
                  </div>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted">
                  {cargando ? 'Cargando usuarios...' : 'No se encontraron usuarios.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}