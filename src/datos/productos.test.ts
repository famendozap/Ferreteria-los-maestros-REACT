import { afterEach, describe, expect, it } from 'vitest';
import {
  actualizarProducto,
  buscarPorCodigo,
  crearProducto,
  eliminarProducto,
  filtrarProductos,
  type Producto,
} from './productos';

const CODIGO_PRUEBA = 'TEST-CRUD-PRODUCTO';

function productoPrueba(cambios: Partial<Producto> = {}): Producto {
  return {
    codigo: CODIGO_PRUEBA,
    categoria: 'Pruebas',
    subcategoria: 'Unitarias',
    nombre: 'Producto de prueba',
    marca: 'Marca de prueba',
    unidad: 'Unidad',
    pCompra: 100,
    pVenta: 200,
    stock: 10,
    stockMin: 2,
    ...cambios,
  };
}

afterEach(() => {
  if (buscarPorCodigo(CODIGO_PRUEBA)) eliminarProducto(CODIGO_PRUEBA);
});

describe('módulo de productos', () => {
  it('crea un producto y permite consultarlo por su código', () => {
    crearProducto(productoPrueba());
    expect(buscarPorCodigo(CODIGO_PRUEBA)?.nombre).toBe('Producto de prueba');
  });

  it('actualiza un producto existente', () => {
    crearProducto(productoPrueba());
    actualizarProducto(CODIGO_PRUEBA, productoPrueba({ nombre: 'Nombre actualizado', stock: 7 }));
    expect(buscarPorCodigo(CODIGO_PRUEBA)).toMatchObject({ nombre: 'Nombre actualizado', stock: 7 });
  });

  it('elimina un producto existente', () => {
    crearProducto(productoPrueba());
    eliminarProducto(CODIGO_PRUEBA);
    expect(buscarPorCodigo(CODIGO_PRUEBA)).toBeUndefined();
  });

  it('filtra por nombre, código y marca sin distinguir mayúsculas', () => {
    crearProducto(productoPrueba());
    expect(filtrarProductos('PRODUCTO DE PRUEBA').some((producto) => producto.codigo === CODIGO_PRUEBA)).toBe(true);
    expect(filtrarProductos(CODIGO_PRUEBA.toLowerCase()).some((producto) => producto.codigo === CODIGO_PRUEBA)).toBe(true);
    expect(filtrarProductos('marca de prueba').some((producto) => producto.codigo === CODIGO_PRUEBA)).toBe(true);
  });
});
