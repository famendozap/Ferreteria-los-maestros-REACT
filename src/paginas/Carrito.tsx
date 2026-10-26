import { Link, useNavigate } from 'react-router-dom';
import { useCarritoContexto } from '../hooks/CarritoContexto';
import ItemCarrito from '../componentes/moleculas/ItemCarrito';
import Boton from '../componentes/atomos/Boton';
import { formatearCLP } from '../utils/validaciones';

export default function Carrito() {
  const { detalles, actualizarCantidad, quitar, vaciar, totalCLP } = useCarritoContexto();
  const navigate = useNavigate();

  if (detalles.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h2">Mi selección</h1>
        <p className="text-muted">Aún no has agregado productos.</p>
        <Link to="/catalogo">
          <Boton>Ir al catálogo</Boton>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="h2 mb-4">Mi selección</h1>

      <div className="table-responsive ticket ticket-perf">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {detalles.map(({ producto, cantidad }) => (
              <ItemCarrito
                key={producto.codigo}
                producto={producto}
                cantidad={cantidad}
                onCantidadChange={actualizarCantidad}
                onQuitar={quitar}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <Boton variante="outline" onClick={vaciar}>
          Vaciar selección
        </Boton>
        <div className="text-end">
          <p className="mb-1 text-muted">Total estimado</p>
          <p className="fs-3 fw-bold mb-0">{formatearCLP(totalCLP)}</p>
        </div>
      </div>

      <div className="text-end mt-3">
        <Boton tamano="lg" onClick={() => navigate('/checkout')}>
          Solicitar pedido
        </Boton>
      </div>
    </div>
  );
}
