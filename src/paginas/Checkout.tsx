import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Boton from '../componentes/atomos/Boton';
import CampoFormulario from '../componentes/moleculas/CampoFormulario';
import SelectorRegionComuna from '../componentes/moleculas/SelectorRegionComuna';
import { useCarritoContexto } from '../hooks/CarritoContexto';
import { useSesion } from '../hooks/SesionContexto';
import { esEmailValido, formatearCLP } from '../utils/validaciones';

type MetodoPago = 'transferencia' | 'efectivo' | 'tarjeta';
type TipoEntrega = 'despacho' | 'retiro';
type CampoTarjeta = 'titular' | 'numero' | 'vencimiento' | 'cvv';

const DATOS_TARJETA_PRUEBA = {
  numero: '4242424242424242',
  vencimiento: '12/30',
  cvv: '123',
};

export default function Checkout() {
  const { detalles, totalCLP } = useCarritoContexto();
  const { usuario } = useSesion();
  const [datos, setDatos] = useState(() => ({
    nombre: usuario ? `${usuario.nombre} ${usuario.apellidos}`.trim() : '',
    correo: usuario?.mail ?? '',
    region: usuario?.region ?? '',
    comuna: usuario?.comuna ?? '',
    direccion: usuario?.direccion ?? '',
    metodoPago: 'transferencia' as MetodoPago,
    tipoEntrega: 'despacho' as TipoEntrega,
  }));
  const [tarjeta, setTarjeta] = useState<Record<CampoTarjeta, string>>({
    titular: '',
    numero: '',
    vencimiento: '',
    cvv: '',
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [confirmada, setConfirmada] = useState(false);

  function actualizar<K extends keyof typeof datos>(campo: K, valor: (typeof datos)[K]) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
  }

  function actualizarTarjeta(campo: CampoTarjeta, valor: string) {
    const valorSeguro =
      campo === 'numero'
        ? valor.replace(/\D/g, '')
        : campo === 'cvv'
          ? valor.replace(/\D/g, '')
          : campo === 'vencimiento'
            ? valor
                .replace(/\D/g, '')
                .slice(0, 4)
                .replace(/^(\d{2})(\d)/, '$1/$2')
          : valor;
    if (campo !== 'titular' && !DATOS_TARJETA_PRUEBA[campo].startsWith(valorSeguro)) return;

    setTarjeta((actual) => ({ ...actual, [campo]: valorSeguro }));
    setErrores((actuales) => {
      const siguientes = { ...actuales };
      delete siguientes[campo];
      return siguientes;
    });
  }

  function completarDatosTarjetaPrueba() {
    setTarjeta((actual) => ({
      ...actual,
      numero: DATOS_TARJETA_PRUEBA.numero,
      vencimiento: DATOS_TARJETA_PRUEBA.vencimiento,
      cvv: DATOS_TARJETA_PRUEBA.cvv,
    }));
    setErrores((actuales) => {
      const siguientes = { ...actuales };
      delete siguientes.numero;
      delete siguientes.vencimiento;
      delete siguientes.cvv;
      return siguientes;
    });
  }

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevosErrores: Record<string, string> = {};

    if (!datos.nombre.trim()) nuevosErrores.nombre = 'Ingresa el nombre de quien solicita el pedido.';
    if (!datos.correo.trim()) nuevosErrores.correo = 'Ingresa un correo de contacto.';
    else if (!esEmailValido(datos.correo)) nuevosErrores.correo = 'El correo no tiene un formato válido.';

    if (datos.tipoEntrega === 'despacho') {
      if (!datos.region) nuevosErrores.region = 'Selecciona una región.';
      if (!datos.comuna) nuevosErrores.comuna = 'Selecciona una comuna.';
      if (!datos.direccion.trim()) nuevosErrores.direccion = 'Ingresa la dirección de despacho.';
    }

    if (datos.metodoPago === 'tarjeta') {
      if (!tarjeta.titular.trim()) nuevosErrores.titular = 'Ingresa el nombre del titular de prueba.';
      else if (tarjeta.titular.trim().length < 3) {
        nuevosErrores.titular = 'El nombre del titular debe tener al menos 3 caracteres.';
      }
      if (tarjeta.numero !== DATOS_TARJETA_PRUEBA.numero) {
        nuevosErrores.numero = 'En esta demostración solo se acepta la tarjeta de prueba indicada.';
      }
      if (tarjeta.vencimiento !== DATOS_TARJETA_PRUEBA.vencimiento) {
        nuevosErrores.vencimiento = 'Usa la fecha de vencimiento de prueba indicada.';
      }
      if (tarjeta.cvv !== DATOS_TARJETA_PRUEBA.cvv) {
        nuevosErrores.cvv = 'Usa el código de seguridad de prueba indicado.';
      }
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setTarjeta({ titular: '', numero: '', vencimiento: '', cvv: '' });
    setConfirmada(true);
  }

  if (detalles.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h2">Solicitar pedido</h1>
        <p className="text-muted">Tu selección está vacía. Agrega productos antes de continuar.</p>
        <Link to="/catalogo">
          <Boton>Ir al catálogo</Boton>
        </Link>
      </div>
    );
  }

  if (confirmada) {
    const entrega =
      datos.tipoEntrega === 'despacho'
        ? `${datos.direccion}, ${datos.comuna}, ${datos.region}`
        : 'Retiro en tienda, Av. Francisco de Aguirre 123, La Serena';
    const cuerpoCorreo = [
      'Hola, quisiera solicitar este pedido:',
      '',
      ...detalles.map(
        ({ producto, cantidad }) =>
          `${producto.nombre} x ${cantidad}: ${formatearCLP(producto.pVenta * cantidad)}`,
      ),
      `Total estimado: ${formatearCLP(totalCLP)}`,
      '',
      `Nombre: ${datos.nombre}`,
      `Correo: ${datos.correo}`,
      `Entrega: ${entrega}`,
      `Medio de pago: ${etiquetasMetodoPago[datos.metodoPago]}`,
    ].join('\n');
    const enlaceCorreo = `mailto:contacto@ferreterialosmaestros.cl?subject=${encodeURIComponent(
      'Solicitud de pedido - Ferretería Los Maestros',
    )}&body=${encodeURIComponent(cuerpoCorreo)}`;

    return (
      <div className="container py-5">
        <div className="mx-auto" style={{ maxWidth: '680px' }}>
          <div className="alert alert-success" role="status">
            <h1 className="h4">Solicitud preparada</h1>
            <p className="mb-0">
              {datos.metodoPago === 'tarjeta'
                ? 'Tarjeta de prueba aprobada. No se realizó ningún cobro y el pedido no se envió a la tienda.'
                : 'Esta demostración no procesa pagos. El pedido no se envía hasta que prepares y envíes el correo.'}
            </p>
          </div>
          <h2 className="h5">Resumen del pedido</h2>
          <p className="mb-1">
            <strong>Contacto:</strong> {datos.nombre} · {datos.correo}
          </p>
          <p className="mb-1">
            <strong>Entrega:</strong>{' '}
            {datos.tipoEntrega === 'despacho'
              ? `${datos.direccion}, ${datos.comuna}, ${datos.region}`
              : 'Retiro en tienda, Av. Francisco de Aguirre 123, La Serena'}
          </p>
          <p className="mb-3">
            <strong>Medio de pago:</strong> {etiquetasMetodoPago[datos.metodoPago]}
          </p>
          <ul className="list-group mb-3">
            {detalles.map(({ producto, cantidad }) => (
              <li key={producto.codigo} className="list-group-item d-flex justify-content-between">
                <span>
                  {producto.nombre} × {cantidad}
                </span>
                <span>{formatearCLP(producto.pVenta * cantidad)}</span>
              </li>
            ))}
            <li className="list-group-item d-flex justify-content-between fw-bold">
              <span>Total estimado</span>
              <span>{formatearCLP(totalCLP)}</span>
            </li>
          </ul>
          <a className="btn btn-lm-primary me-2 mb-2" href={enlaceCorreo}>
            Preparar correo para enviar el pedido
          </a>
          <Link to="/carrito">
            <Boton variante="outline">Volver al carrito</Boton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="section-header mb-4">
        <h1 className="h2">Datos del pedido</h1>
        <p className="text-muted mb-0">Completa tus datos, la entrega y el medio de pago.</p>
      </div>

      <div className="row g-4 align-items-start">
        <section className="col-lg-7" aria-label="Datos de entrega y pago">
          <form noValidate onSubmit={manejarEnvio}>
            <h2 className="h5">Datos de contacto</h2>
            <CampoFormulario
              etiqueta="Nombre"
              id="pedidoNombre"
              value={datos.nombre}
              onChange={(evento) => actualizar('nombre', evento.target.value)}
              error={errores.nombre}
            />
            <CampoFormulario
              etiqueta="Correo electrónico"
              id="pedidoCorreo"
              type="email"
              value={datos.correo}
              onChange={(evento) => actualizar('correo', evento.target.value)}
              error={errores.correo}
            />

            <fieldset className="mb-4">
              <legend className="h5">¿Cómo quieres recibir tu pedido?</legend>
              <div className="form-check">
                <input
                  id="entregaDespacho"
                  className="form-check-input"
                  type="radio"
                  name="tipoEntrega"
                  value="despacho"
                  checked={datos.tipoEntrega === 'despacho'}
                  onChange={() => actualizar('tipoEntrega', 'despacho')}
                />
                <label className="form-check-label" htmlFor="entregaDespacho">
                  Despacho a domicilio
                </label>
              </div>
              <div className="form-check">
                <input
                  id="entregaRetiro"
                  className="form-check-input"
                  type="radio"
                  name="tipoEntrega"
                  value="retiro"
                  checked={datos.tipoEntrega === 'retiro'}
                  onChange={() => actualizar('tipoEntrega', 'retiro')}
                />
                <label className="form-check-label" htmlFor="entregaRetiro">
                  Retiro en tienda (Av. Francisco de Aguirre 123, La Serena)
                </label>
              </div>
            </fieldset>

            {datos.tipoEntrega === 'despacho' && (
              <>
                <h2 className="h5">Dirección de despacho</h2>
                <SelectorRegionComuna
                  region={datos.region}
                  comuna={datos.comuna}
                  onRegionChange={(region) => actualizar('region', region)}
                  onComunaChange={(comuna) => actualizar('comuna', comuna)}
                  errorRegion={errores.region}
                  errorComuna={errores.comuna}
                />
                <CampoFormulario
                  etiqueta="Dirección"
                  id="pedidoDireccion"
                  value={datos.direccion}
                  onChange={(evento) => actualizar('direccion', evento.target.value)}
                  error={errores.direccion}
                />
              </>
            )}

            <fieldset className="mb-4">
              <legend className="h5">Medio de pago</legend>
              {opcionesPago.map(({ valor, etiqueta, ayuda }) => (
                <div className="form-check" key={valor}>
                  <input
                    id={`pago-${valor}`}
                    className="form-check-input"
                    type="radio"
                    name="metodoPago"
                    value={valor}
                    checked={datos.metodoPago === valor}
                    onChange={() => actualizar('metodoPago', valor)}
                  />
                  <label className="form-check-label" htmlFor={`pago-${valor}`}>
                    {etiqueta}{' '}
                    <span className="text-muted">
                      — {ayuda}
                    </span>
                  </label>
                </div>
              ))}
            </fieldset>

            {datos.metodoPago === 'tarjeta' && (
              <fieldset className="border rounded p-3 mb-4" aria-labelledby="tarjeta-prueba-titulo">
                <legend id="tarjeta-prueba-titulo" className="h5 float-none w-auto px-1">
                  Datos de tarjeta de prueba
                </legend>
                <div className="alert alert-warning" role="note">
                  Esta es una demostración: no ingreses datos de una tarjeta real. Solo se aceptan los
                  datos ficticios mostrados a continuación. No se guardan ni se envían.
                </div>
                <Boton
                  type="button"
                  variante="outline"
                  className="mb-3"
                  onClick={completarDatosTarjetaPrueba}
                >
                  Completar datos de prueba
                </Boton>
                <CampoFormulario
                  etiqueta="Nombre del titular"
                  id="titularTarjeta"
                  autoComplete="off"
                  maxLength={80}
                  value={tarjeta.titular}
                  onChange={(evento) => actualizarTarjeta('titular', evento.target.value)}
                  error={errores.titular}
                />
                <CampoFormulario
                  etiqueta="Número de tarjeta de prueba"
                  id="numeroTarjeta"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={16}
                  value={tarjeta.numero}
                  onChange={(evento) => actualizarTarjeta('numero', evento.target.value)}
                  error={errores.numero}
                  aria-describedby="ayudaNumeroTarjeta"
                />
                <div id="ayudaNumeroTarjeta" className="form-text mb-3">
                  Número ficticio: {DATOS_TARJETA_PRUEBA.numero.match(/.{1,4}/g)?.join(' ')}
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <CampoFormulario
                      etiqueta="Vencimiento"
                      id="vencimientoTarjeta"
                      autoComplete="off"
                      maxLength={5}
                      placeholder="MM/AA"
                      value={tarjeta.vencimiento}
                      onChange={(evento) => actualizarTarjeta('vencimiento', evento.target.value)}
                      error={errores.vencimiento}
                    />
                    <div className="form-text mb-3">Fecha ficticia: {DATOS_TARJETA_PRUEBA.vencimiento}</div>
                  </div>
                  <div className="col-sm-6">
                    <CampoFormulario
                      etiqueta="Código de seguridad de prueba"
                      id="cvvTarjeta"
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={3}
                      value={tarjeta.cvv}
                      onChange={(evento) => actualizarTarjeta('cvv', evento.target.value)}
                      error={errores.cvv}
                      aria-describedby="ayudaCvvTarjeta"
                    />
                    <div id="ayudaCvvTarjeta" className="form-text mb-3">
                      Código ficticio: {DATOS_TARJETA_PRUEBA.cvv}
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            <Boton type="submit" tamano="lg" className="w-100">
              {datos.metodoPago === 'tarjeta' ? 'Confirmar pago de prueba y pedido' : 'Confirmar solicitud'}
            </Boton>
          </form>
        </section>

        <aside className="col-lg-5" aria-labelledby="resumen-pedido">
          <div className="ticket p-3">
            <h2 id="resumen-pedido" className="h5">
              Resumen
            </h2>
            <ul className="list-unstyled">
              {detalles.map(({ producto, cantidad }) => (
                <li key={producto.codigo} className="d-flex justify-content-between gap-3 mb-2">
                  <span>
                    {producto.nombre} × {cantidad}
                  </span>
                  <span className="text-nowrap">{formatearCLP(producto.pVenta * cantidad)}</span>
                </li>
              ))}
            </ul>
            <hr />
            <p className="d-flex justify-content-between fw-bold mb-0">
              <span>Total estimado</span>
              <span>{formatearCLP(totalCLP)}</span>
            </p>
            <p className="small text-muted mt-3 mb-0">
              El costo de despacho se coordina con la tienda. Este sitio no procesa pagos ni envía pedidos.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

const opcionesPago: { valor: MetodoPago; etiqueta: string; ayuda: string }[] = [
  { valor: 'transferencia', etiqueta: 'Transferencia bancaria', ayuda: 'se coordina con la tienda' },
  { valor: 'efectivo', etiqueta: 'Efectivo', ayuda: 'al recibir o retirar el pedido' },
  { valor: 'tarjeta', etiqueta: 'Tarjeta', ayuda: 'al retirar en tienda' },
];

const etiquetasMetodoPago: Record<MetodoPago, string> = {
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
};
