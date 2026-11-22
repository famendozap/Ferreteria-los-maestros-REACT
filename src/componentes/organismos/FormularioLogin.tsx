import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoFormulario from '../moleculas/CampoFormulario';
import Boton from '../atomos/Boton';
import { validarLogin } from '../../utils/validaciones';
import { useSesion } from '../../hooks/SesionContexto';
import { loginApi, ErrorApi } from '../../servicios/usuariosApi';

export default function FormularioLogin() {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const navigate = useNavigate();
  const { iniciarSesion } = useSesion();
  const [enviando, setEnviando] = useState(false);

  
  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');
    const resultado = validarLogin(correo, clave);
    setErrores(resultado.errores);
    if (!resultado.valido) return;

    setEnviando(true);
    try {
      const { usuario, token } = await loginApi(correo, clave);
      iniciarSesion(usuario, token);
      navigate('/catalogo');
    } catch (error) {
      if (error instanceof ErrorApi && error.status === 401) {
        setErrorGeneral('Correo o contraseña incorrectos.');
      } else if (error instanceof ErrorApi && error.status === 403) {
        setErrorGeneral('Tu cuenta se encuentra inactiva. Contacta al administrador.');
      } else if (error instanceof ErrorApi) {
        setErrorGeneral(error.message);
      } else {
        setErrorGeneral('Ocurrió un error inesperado.');
    }
  } finally {
    setEnviando(false);
  }
}

  return (
    <form noValidate onSubmit={manejarEnvio} className="mx-auto" style={{ maxWidth: '420px' }}>
      {errorGeneral && <div className="alert alert-danger py-2">{errorGeneral}</div>}

      <CampoFormulario
        etiqueta="Correo electrónico"
        id="correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        error={errores.correo}
      />
      <CampoFormulario
        etiqueta="Contraseña"
        id="clave"
        type="password"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        error={errores.clave}
      />

      <Boton type="submit" className="w-100 mt-2" disabled={enviando}>{enviando ? 'Ingresando...' : 'Ingresar'}</Boton>

      <p className="text-center small text-muted mt-3 mb-0">
        Cuenta de prueba: admin@ferreterialosmaestros.cl / admin123
      </p>
    </form>
  );
}
