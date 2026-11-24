import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Producto } from '../../datos/productos';
import { eliminarProductoApi, listarProductosApi } from '../../servicios/ferreteriaApi';
import TablaProductosAdmin from './TablaProductosAdmin';

vi.mock('../../servicios/ferreteriaApi', () => ({
  listarProductosApi: vi.fn(),
  eliminarProductoApi: vi.fn(),
  mensajeErrorApi: (_e: unknown, porDefecto: string) => porDefecto,
}));

vi.mock('../../hooks/SesionContexto', () => ({
  useSesion: () => ({ usuario: null, token: 'token-prueba', iniciarSesion: vi.fn(), cerrarSesion: vi.fn() }),
}));

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

const otroProducto: Producto = {
  ...productoPrueba,
  codigo: 'TEST-OTRO',
  nombre: 'Cemento de otra marca',
  stock: 0,
};

function renderTabla() {
  return render(
    <MemoryRouter>
      <TablaProductosAdmin />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(listarProductosApi).mockResolvedValue([productoPrueba, otroProducto]);
  vi.mocked(eliminarProductoApi).mockResolvedValue(undefined);
});

describe('<TablaProductosAdmin />', () => {
  it('carga los productos desde la API y los filtra por nombre y código', async () => {
    renderTabla();

    expect(await screen.findByText('Producto para filtrar')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: CODIGO_PRUEBA } });

    expect(screen.getByText('Producto para filtrar')).toBeInTheDocument();
    expect(screen.queryByText('Cemento de otra marca')).not.toBeInTheDocument();
  });

  it('muestra «Sin stock» para un producto con stock 0', async () => {
    renderTabla();

    await screen.findByText('Cemento de otra marca');
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('elimina la fila en la API luego de confirmar la acción', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderTabla();

    fireEvent.click(await screen.findByRole('button', { name: `Eliminar producto ${CODIGO_PRUEBA}` }));

    expect(window.confirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText('Producto para filtrar')).not.toBeInTheDocument());
    expect(eliminarProductoApi).toHaveBeenCalledWith(CODIGO_PRUEBA, 'token-prueba');
  });
});
