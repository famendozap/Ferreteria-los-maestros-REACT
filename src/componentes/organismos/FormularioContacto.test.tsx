import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioContacto from './FormularioContacto';

describe('<FormularioContacto />', () => {
  it('muestra errores de validación si se envía vacío', async () => {
    const usuario = userEvent.setup();
    render(<FormularioContacto />);

    await usuario.click(screen.getByRole('button', { name: /enviar mensaje/i }));

    expect(await screen.findByText(/tu nombre es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/el correo es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/el mensaje no puede estar vacío/i)).toBeInTheDocument();
  });
});
