import type { Producto } from '../datos/productos';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function normalizarProducto(producto: Producto & { pventa?: number; pcompra?: number }): Producto {
  return {
    ...producto,
    pVenta: producto.pVenta ?? producto.pventa ?? 0,
    pCompra: producto.pCompra ?? producto.pcompra ?? 0,
  };
}

export class ErrorApi extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE}${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...(opciones.headers ?? {}) },
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con Spring Boot. Verifica que el backend esté iniciado.');
  }
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos?.mensaje ?? datos?.message ?? 'La solicitud no pudo completarse.');
  return datos as T;
}

export async function listarProductosApi() {
  const productos = await pedir<Array<Producto & { pventa?: number; pcompra?: number }>>('/api/productos');
  return productos.map(normalizarProducto);
}
export async function obtenerProductoApi(codigo: string) {
  const producto = await pedir<Producto & { pventa?: number; pcompra?: number }>(`/api/productos/${encodeURIComponent(codigo)}`);
  return normalizarProducto(producto);
}
export function crearCarritoApi() { return pedir<{ id: string }>('/api/carrito', { method: 'POST' }); }
export function actualizarItemCarritoApi(carritoId: string, codigo: string, cantidad: number) {
  return pedir(`/api/carrito/${encodeURIComponent(carritoId)}/items/${encodeURIComponent(codigo)}`, { method: 'PUT', body: JSON.stringify({ cantidad }) });
}

export interface PedidoCreado {
  id: number;
  carritoId: string;
  nombreCliente: string;
  estado: string;
  totalCLP: number;
  notificacionId: number | null;
  estadoNotificacion: string | null;
}

export function crearPedidoApi(carritoId: string, nombreCliente: string, correoCliente: string) {
  return pedir<PedidoCreado>('/api/pedidos', {
    method: 'POST',
    body: JSON.stringify({ carritoId, nombreCliente, correoCliente }),
  });
}
