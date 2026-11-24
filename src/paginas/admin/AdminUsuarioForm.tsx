import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { TipoUsuario, Usuario } from '../../datos/usuarios';
import CampoFormulario from '../../componentes/moleculas/CampoFormulario';
import SelectorRegionComuna from '../../componentes/moleculas/SelectorRegionComuna';
import Boton from '../../componentes/atomos/Boton';
import { useSesion } from '../../hooks/SesionContexto';
import {
  actualizarUsuarioApi,
  crearUsuarioApi,
  mensajeError,
  obtenerUsuarioApi,
} from '../../servicios/usuariosApi';
import { validarRUN, esEmailValido, formatearRUN } from '../../utils/validaciones';

const USUARIO_VACIO: Usuario = {
  run: '',
  nombre: '',
  apellidos: '',
  mail: '',
  clave: '',
  tipoUsuario: 'Cliente',
  region: '',
  comuna: '',
  direccion: '',
  activo: true,
};

export default function AdminUsuarioForm() {
  const { id } = useParams<{ id: string }>();
  const esNuevo = !id || id === 'nuevo';
  const idNumerico = esNuevo ? null : Number(id);
  const navigate = useNavigate();
  const { token } = useSesion();

  const [usuario, setUsuario] = useState<Usuario>(USUARIO_VACIO);
  const [cargando, setCargando] = useState(!esNuevo);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (esNuevo) return;

    if (idNumerico === null || !Number.isInteger(idNumerico) || !token) {
      setError('No se pudo identificar al usuario o la sesión expiró.');
      setCargando(false);
      return;
    }

    let vigente = true;

    obtenerUsuarioApi(idNumerico, token)
      .then((usuarioApi) => {
        if (vigente) setUsuario({ ...usuarioApi, clave: '' });
      })
      .catch((e) => {
        if (vigente) setError(mensajeError(e, 'No fue posible cargar el usuario.'));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [esNuevo, idNumerico, token]);

  function actualizar<K extends keyof Usuario>(campo: K, valor: Usuario[K]) {
    setUsuario((u) => ({ ...u, [campo]: valor }));
  }

  async function manejarEnvio(e: FormEvent) {
  e.preventDefault();

  if (!token) {
    setError('Tu sesión expiró. Sal e inicia sesión nuevamente.');
    return;
  }

  const nuevosErrores: Record<string, string> = {};

  if (esNuevo && !validarRUN(usuario.run)) nuevosErrores.run = 'RUN inválido.';
  if (!usuario.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
  if (!usuario.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
  if (!esEmailValido(usuario.mail)) nuevosErrores.mail = 'Correo inválido.';

  if (esNuevo && usuario.clave.length < 6) {
    nuevosErrores.clave = 'La contraseña debe tener al menos 6 caracteres.';
  } else if (!esNuevo && usuario.clave !== '' && usuario.clave.length < 6) {
    nuevosErrores.clave = 'La nueva contraseña debe tener al menos 6 caracteres.';
  }

  setErrores(nuevosErrores);
  if (Object.keys(nuevosErrores).length > 0) return;

  setError('');
  setGuardando(true);

  try {
    if (esNuevo) {
      await crearUsuarioApi(
        {
          run: formatearRUN(usuario.run),
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          mail: usuario.mail,
          clave: usuario.clave,
          tipoUsuario: usuario.tipoUsuario,
          region: usuario.region,
          comuna: usuario.comuna,
          direccion: usuario.direccion,
          activo: usuario.activo,
        },
        token,
      );
    } else {
      await actualizarUsuarioApi(
        idNumerico!,
        {
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          mail: usuario.mail,
          clave: usuario.clave || undefined,
          tipoUsuario: usuario.tipoUsuario,
          region: usuario.region,
          comuna: usuario.comuna,
          direccion: usuario.direccion,
          activo: usuario.activo,
        },
        token,
      );
    }

    setGuardado(true);
    setTimeout(() => navigate('/admin/usuarios'), 900);
  } catch (e) {
    setError(mensajeError(e, 'No fue posible guardar el usuario.'));
  } finally {
    setGuardando(false);
  }
}
  if (cargando) {
    return (
      <div className="container py-5">
        <p className="text-muted">Cargando usuario...</p>
      </div>
    );
  }

  if (!esNuevo && usuario.run === '') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">{error}</div>
        <Link to="/admin/usuarios">Volver a usuarios</Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: '620px' }}>
      <h1 className="h2 mb-4">{esNuevo ? 'Nuevo usuario' : 'Editar usuario'}</h1>

      {guardado && <div className="alert alert-success py-2">Usuario guardado correctamente.</div>}
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

      <form onSubmit={manejarEnvio}>
        <div className="row">
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="RUN"
              id="run"
              value={usuario.run}
              onChange={(e) => actualizar('run', e.target.value)}
              error={errores.run}
              disabled={!esNuevo}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="tipoUsuario">
              Rol
            </label>
            <select
              id="tipoUsuario"
              className="form-select"
              value={usuario.tipoUsuario}
              onChange={(e) => actualizar('tipoUsuario', e.target.value as TipoUsuario)}
            >
              <option value="Administrador">Administrador</option>
              <option value="Contratista">Contratista</option>
              <option value="Cliente">Cliente</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="Nombre"
              id="nombre"
              value={usuario.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              error={errores.nombre}
            />
          </div>
          <div className="col-md-6">
            <CampoFormulario
              etiqueta="Apellidos"
              id="apellidos"
              value={usuario.apellidos}
              onChange={(e) => actualizar('apellidos', e.target.value)}
            />
          </div>
        </div>

        <CampoFormulario
          etiqueta="Correo electrónico"
          id="mail"
          type="email"
          value={usuario.mail}
          onChange={(e) => actualizar('mail', e.target.value)}
          error={errores.mail}
        />

        <CampoFormulario
          etiqueta={esNuevo ? 'Contraseña' : 'Nueva contraseña (opcional)'}
          id="clave"
          type="password"
          autoComplete="new-password"
          value={usuario.clave}
          onChange={(e) => actualizar('clave', e.target.value)}
            error={errores.clave}
        />

        <SelectorRegionComuna
          region={usuario.region}
          comuna={usuario.comuna}
          onRegionChange={(v) => actualizar('region', v)}
          onComunaChange={(v) => actualizar('comuna', v)}
        />

        <CampoFormulario
          etiqueta="Dirección"
          id="direccion"
          value={usuario.direccion}
          onChange={(e) => actualizar('direccion', e.target.value)}
        />

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="activo"
            checked={usuario.activo}
            onChange={(e) => actualizar('activo', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="activo">
            Usuario activo
          </label>
        </div>

        <Boton type="submit" className="w-100 mt-2">
          Guardar usuario
        </Boton>
      </form>
    </div>
  );
}
