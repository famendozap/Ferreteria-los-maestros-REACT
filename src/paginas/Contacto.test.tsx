import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Contacto from './Contacto';

describe('<Contacto />', () => {
  it('muestra el mapa de Google y un enlace para obtener indicaciones al local', () => {
    render(<Contacto />);

    expect(screen.getByTitle('Mapa de ubicación de Ferretería Los Maestros')).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=Av.%20Francisco%20de%20Aguirre%20123%2C%20La%20Serena%2C%20Chile&output=embed',
    );
    expect(screen.getByRole('link', { name: 'Cómo llegar' })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Av.%20Francisco%20de%20Aguirre%20123%2C%20La%20Serena%2C%20Chile',
    );
  });
});
