import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { crearProducto, eliminarProducto, buscarPorCodigo, type Producto } from '../../datos/productos';
import TablaProductosAdmin from './TablaProductosAdmin';

const CODIGO_PRUEBA = 'TEST-TABLA-PRODUCTOS';

const productoPrueba: Producto = {
  codigo: CODIGO_PRUEBA,
  categoria: 'Pruebas',
  subcategoria: 'Unitarias',
  nombre: 'Producto para filtrar',
  marca: 'Marca de prueba',
  unidad: 'Unidad',
  pCompra: 100,
  pVenta: 200,
  stock: 10,
  stockMin: 2,
};

function renderTabla() {
  return render(
    <MemoryRouter>
      <TablaProductosAdmin />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  if (buscarPorCodigo(CODIGO_PRUEBA)) eliminarProducto(CODIGO_PRUEBA);
});

describe('<TablaProductosAdmin />', () => {
  it('filtra las filas por nombre y código', () => {
    crearProducto(productoPrueba);
    renderTabla();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: CODIGO_PRUEBA } });

    expect(screen.getByText('Producto para filtrar')).toBeInTheDocument();
    expect(screen.queryByText('Cemento Polpaico gris 25 kg')).not.toBeInTheDocument();
  });

  it('elimina la fila luego de confirmar la acción', () => {
    crearProducto(productoPrueba);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderTabla();

    fireEvent.click(screen.getByRole('button', { name: `Eliminar producto ${CODIGO_PRUEBA}` }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(screen.queryByText('Producto para filtrar')).not.toBeInTheDocument();
    expect(buscarPorCodigo(CODIGO_PRUEBA)).toBeUndefined();
  });
});
