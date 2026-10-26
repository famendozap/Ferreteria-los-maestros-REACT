import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Boton from './Boton';

describe('<Boton />', () => {
  it('renderiza el texto recibido como children', () => {
    render(<Boton>Agregar</Boton>);
    expect(screen.getByRole('button', { name: 'Agregar' })).toBeInTheDocument();
  });

  it('ejecuta onClick cuando el usuario hace clic', async () => {
    const manejarClic = vi.fn();
    const usuario = userEvent.setup();

    render(<Boton onClick={manejarClic}>Guardar</Boton>);
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(manejarClic).toHaveBeenCalledTimes(1);
  });
});
