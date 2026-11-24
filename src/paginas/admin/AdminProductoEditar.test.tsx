import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { Producto } from '../../datos/productos';
import { actualizarProductoApi, listarProductosApi } from '../../servicios/ferreteriaApi';
import AdminProductoEditar from './AdminProductoEditar';

vi.mock('../../servicios/ferreteriaApi', () => ({
  listarProductosApi: vi.fn(),
  actualizarProductoApi: vi.fn(),
  crearProductoApi: vi.fn(),
  mensajeErrorApi: (_e: unknown, porDefecto: string) => porDefecto,
}));

vi.mock('../../hooks/SesionContexto', () => ({
  useSesion: () => ({ usuario: null, token: 'token-prueba', iniciarSesion: vi.fn(), cerrarSesion: vi.fn() }),
}));

const producto: Producto = {
  codigo: 'MC001',
  categoria: 'Mat. Construcción',
  subcategoria: 'Cementos',
  nombre: 'Cemento Polpaico gris 25 kg',
  marca: 'Polpaico',
  unidad: 'Saco',
  pCompra: 3200,
  pVenta: 5990,
  stock: 80,
  stockMin: 20,
};

beforeEach(() => {
  vi.mocked(listarProductosApi).mockResolvedValue([producto]);
  vi.mocked(actualizarProductoApi).mockResolvedValue({ ...producto, stock: 0 });
});

describe('<AdminProductoEditar />', () => {
  it('guarda el stock 0 en la API (así el catálogo lo refleja y no permite comprar)', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/productos/MC001']}>
        <Routes>
          <Route path="/admin/productos/:codigo" element={<AdminProductoEditar />} />
        </Routes>
      </MemoryRouter>,
    );

    const campoStock = await screen.findByLabelText('Stock');
    fireEvent.change(campoStock, { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar producto/i }));

    await waitFor(() =>
      expect(actualizarProductoApi).toHaveBeenCalledWith(
        'MC001',
        expect.objectContaining({ codigo: 'MC001', stock: 0 }),
        'token-prueba',
      ),
    );
  });
});
