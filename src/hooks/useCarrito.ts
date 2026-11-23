import { useCallback, useEffect, useState } from 'react';
import { buscarPorCodigo, type Producto } from '../datos/productos';
import { listarProductosApi } from '../servicios/ferreteriaApi';

const CLAVE_LOCALSTORAGE = 'lm_carrito';

export interface ItemCarrito {
  codigo: string;
  cantidad: number;
}

function leerCarritoInicial(): ItemCarrito[] {
  try {
    const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
    return guardado ? (JSON.parse(guardado) as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

// Mantiene el carrito en estado, lo sincroniza con localStorage y calcula sus totales.
export function useCarrito() {
  const [items, setItems] = useState<ItemCarrito[]>(leerCarritoInicial);
  const [productosApi, setProductosApi] = useState<Producto[]>([]);

  useEffect(() => {
    listarProductosApi().then(setProductosApi).catch(() => undefined);
  }, []);

  useEffect(() => {
    localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(items));
  }, [items]);

  const agregar = useCallback((codigo: string, cantidad = 1) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.codigo === codigo);
      if (existente) {
        return prev.map((i) => (i.codigo === codigo ? { ...i, cantidad: i.cantidad + cantidad } : i));
      }
      return [...prev, { codigo, cantidad }];
    });
  }, []);

  const quitar = useCallback((codigo: string) => {
    setItems((prev) => prev.filter((i) => i.codigo !== codigo));
  }, []);

  const actualizarCantidad = useCallback((codigo: string, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) => (i.codigo === codigo ? { ...i, cantidad: Math.max(1, cantidad) } : i)),
    );
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const detalles = items
    .map((item) => {
      const producto = productosApi.find((p) => p.codigo === item.codigo) ?? buscarPorCodigo(item.codigo);
      return producto ? { producto, cantidad: item.cantidad } : null;
    })
    .filter((d): d is { producto: Producto; cantidad: number } => d !== null);

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const totalCLP = detalles.reduce((acc, d) => acc + d.producto.pVenta * d.cantidad, 0);

  return { items, detalles, agregar, quitar, actualizarCantidad, vaciar, cantidadTotal, totalCLP };
}
