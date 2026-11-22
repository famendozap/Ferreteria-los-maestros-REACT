import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoFormulario from '../moleculas/CampoFormulario';
import SelectorRegionComuna from '../moleculas/SelectorRegionComuna';
import Boton from '../atomos/Boton';
import { validarRegistro, formatearRUN } from '../../utils/validaciones';
import { useSesion } from '../../hooks/SesionContexto';
import { registroApi, ErrorApi } from '../../servicios/usuariosApi';

export default function FormularioRegistro() {
  const [datos, setDatos] = useState({
    run: '',
    nombre: '',
    apellidos: '',
    mail: '',
    clave: '',
    confirmarClave: '',
    region: '',
    comuna: '',
    direccion: '',
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensajeExito, setMensajeExito] = useState('');
  const navigate = useNavigate();
  const { iniciarSesion } = useSesion();
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function actualizar<K extends keyof typeof datos>(campo: K, valor: string) {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
  }


  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');
    const resultado = validarRegistro(datos);
    setErrores(resultado.errores);
    if (!resultado.valido) return;

    setEnviando(true);
    try {
      const { usuario, token } = await registroApi({
        run: formatearRUN(datos.run),
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        mail: datos.mail,
        clave: datos.clave,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion,
      });
      iniciarSesion(usuario, token);
      setMensajeExito('¡Cuenta creada correctamente! Redirigiendo al catálogo...');
      setTimeout(() => navigate('/catalogo'), 1200);
    } catch (error) {
      if (!(error instanceof ErrorApi)) {
        setErrorGeneral('Ocurrió un error inesperado.');
      } else if (error.status === 409) {
        const texto = error.message.toLowerCase();
        if (texto.includes('run')) setErrores({ run: 'Ya existe una cuenta registrada con ese RUN.' });
        else if (texto.includes('mail')) setErrores({ mail: 'Ya existe una cuenta registrada con ese correo.' });
        else setErrorGeneral(error.message);
      } else if (error.status === 400 && Object.keys(error.errores).length > 0) {
        setErrores(error.errores);
      } else {
        setErrorGeneral(error.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form noValidate onSubmit={manejarEnvio} className="mx-auto" style={{ maxWidth: '620px' }}>
      {mensajeExito && <div className="alert alert-success py-2">{mensajeExito}</div>}
      {errorGeneral && <div className="alert alert-danger py-2">{errorGeneral}</div>}
      <div className="row">
        <div className="col-md-6">
          <CampoFormulario
            etiqueta="RUN (ej: 12.345.678-5)"
            id="run"
            value={datos.run}
            onChange={(e) => actualizar('run', e.target.value)}
            error={errores.run}
          />
        </div>
        <div className="col-md-6">
          <CampoFormulario
            etiqueta="Nombre"
            id="nombre"
            value={datos.nombre}
            onChange={(e) => actualizar('nombre', e.target.value)}
            error={errores.nombre}
          />
        </div>
      </div>

      <CampoFormulario
        etiqueta="Apellidos"
        id="apellidos"
        value={datos.apellidos}
        onChange={(e) => actualizar('apellidos', e.target.value)}
        error={errores.apellidos}
      />

      <CampoFormulario
        etiqueta="Correo electrónico"
        id="mail"
        type="email"
        value={datos.mail}
        onChange={(e) => actualizar('mail', e.target.value)}
        error={errores.mail}
      />

      <div className="row">
        <div className="col-md-6">
          <CampoFormulario
            etiqueta="Contraseña"
            id="clave"
            type="password"
            value={datos.clave}
            onChange={(e) => actualizar('clave', e.target.value)}
            error={errores.clave}
          />
        </div>
        <div className="col-md-6">
          <CampoFormulario
            etiqueta="Confirmar contraseña"
            id="confirmarClave"
            type="password"
            value={datos.confirmarClave}
            onChange={(e) => actualizar('confirmarClave', e.target.value)}
            error={errores.confirmarClave}
          />
        </div>
      </div>

      <SelectorRegionComuna
        region={datos.region}
        comuna={datos.comuna}
        onRegionChange={(v) => actualizar('region', v)}
        onComunaChange={(v) => actualizar('comuna', v)}
        errorRegion={errores.region}
        errorComuna={errores.comuna}
      />

      <CampoFormulario
        etiqueta="Dirección"
        id="direccion"
        value={datos.direccion}
        onChange={(e) => actualizar('direccion', e.target.value)}
        error={errores.direccion}
      />

      <Boton type="submit" className="w-100 mt-2" disabled={enviando}>{enviando ? 'Creando cuenta...' : 'Crear cuenta'}</Boton>
    </form>
  );
}
