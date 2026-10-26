import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { CarritoProvider } from '../hooks/CarritoContexto';
import { SesionProvider } from '../hooks/SesionContexto';
import Carrito from './Carrito';
import Checkout from './Checkout';

function renderFlujoPedido() {
  return render(
    <MemoryRouter initialEntries={['/carrito']}>
      <SesionProvider>
        <CarritoProvider>
          <Routes>
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </CarritoProvider>
      </SesionProvider>
    </MemoryRouter>,
  );
}

describe('flujo de solicitud del carrito', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('lm_carrito', JSON.stringify([{ codigo: 'MC001', cantidad: 2 }]));
  });

  it('permite avanzar del carrito, validar datos de despacho y confirmar una solicitud local', () => {
    renderFlujoPedido();

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar pedido' }));
    expect(screen.getByRole('heading', { name: 'Datos del pedido' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar solicitud' }));
    expect(screen.getByText('Ingresa el nombre de quien solicita el pedido.')).toBeInTheDocument();
    expect(screen.getByText('Selecciona una región.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.cl' },
    });
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Coquimbo' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'La Serena' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle Uno 123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar solicitud' }));

    expect(screen.getByRole('status')).toHaveTextContent('no procesa pagos');
    expect(screen.getByText('Calle Uno 123, La Serena, Coquimbo')).toBeInTheDocument();
    expect(screen.getByText('Transferencia bancaria')).toBeInTheDocument();
    expect(screen.getAllByText('$11.980')).toHaveLength(2);
    const enlaceCorreo = screen.getByRole('link', { name: 'Preparar correo para enviar el pedido' });
    const correoPreparado = decodeURIComponent(enlaceCorreo.getAttribute('href') ?? '');
    expect(correoPreparado).toContain('mailto:contacto@ferreterialosmaestros.cl');
    expect(correoPreparado).toContain('Cemento Polpaico gris 25 kg x 2: $11.980');
    expect(correoPreparado).toContain('Calle Uno 123, La Serena, Coquimbo');
    expect(correoPreparado).not.toContain('4242424242424242');
    expect(JSON.parse(localStorage.getItem('lm_carrito') ?? '[]')).toEqual([
      { codigo: 'MC001', cantidad: 2 },
    ]);
  });

  it('muestra los datos de tarjeta al seleccionarla con despacho a domicilio', () => {
    renderFlujoPedido();

    fireEvent.click(screen.getByRole('button', { name: 'Solicitar pedido' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'ana@example.cl' },
    });
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Coquimbo' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'La Serena' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle Uno 123' } });

    const tarjeta = screen.getByRole('radio', { name: /Tarjeta/ });
    expect(tarjeta).toBeEnabled();
    fireEvent.click(tarjeta);

    expect(screen.getByLabelText('Número de tarjeta de prueba')).toBeInTheDocument();
    expect(screen.getByText(/no ingreses datos de una tarjeta real/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Número de tarjeta de prueba')).toHaveAttribute(
      'aria-describedby',
      'ayudaNumeroTarjeta',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Completar datos de prueba' }));
    expect(screen.getByLabelText('Número de tarjeta de prueba')).toHaveValue('4242424242424242');
    expect(screen.getByLabelText('Vencimiento')).toHaveValue('12/30');
    expect(screen.getByLabelText('Código de seguridad de prueba')).toHaveValue('123');
    fireEvent.change(screen.getByLabelText('Número de tarjeta de prueba'), {
      target: { value: '4111111111111111' },
    });
    expect(screen.getByLabelText('Número de tarjeta de prueba')).toHaveValue('4242424242424242');

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pago de prueba y pedido' }));
    expect(screen.getByText('Ingresa el nombre del titular de prueba.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre del titular'), {
      target: { value: 'AB' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pago de prueba y pedido' }));
    expect(screen.getByText('El nombre del titular debe tener al menos 3 caracteres.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nombre del titular'), {
      target: { value: 'Ana Prueba' },
    });
    const vencimiento = screen.getByLabelText('Vencimiento');
    fireEvent.change(vencimiento, { target: { value: '1' } });
    fireEvent.change(vencimiento, { target: { value: '12' } });
    fireEvent.change(vencimiento, { target: { value: '123' } });
    expect(vencimiento).toHaveValue('12/3');
    fireEvent.change(vencimiento, { target: { value: '1230' } });
    expect(vencimiento).toHaveValue('12/30');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar pago de prueba y pedido' }));
    expect(screen.getByRole('status')).toHaveTextContent('Tarjeta de prueba aprobada');
    expect(screen.getByRole('status')).toHaveTextContent('No se realizó ningún cobro');
    expect(screen.getByText('Calle Uno 123, La Serena, Coquimbo')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('lm_carrito') ?? '[]')).toEqual([
      { codigo: 'MC001', cantidad: 2 },
    ]);
    expect(screen.queryByLabelText('Número de tarjeta de prueba')).not.toBeInTheDocument();
  });

  it('precarga los datos de dirección y contacto del usuario con sesión', () => {
    localStorage.setItem(
      'lm_sesion',
      JSON.stringify({
        run: '12.345.678-5',
        nombre: 'Juan',
        apellidos: 'Pérez Soto',
        mail: 'juan@example.cl',
        clave: 'cliente123',
        tipoUsuario: 'Cliente',
        region: 'Coquimbo',
        comuna: 'Coquimbo',
        direccion: 'Los Aromos 456',
        activo: true,
      }),
    );

    renderFlujoPedido();
    fireEvent.click(screen.getByRole('button', { name: 'Solicitar pedido' }));

    expect(screen.getByLabelText('Nombre')).toHaveValue('Juan Pérez Soto');
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('juan@example.cl');
    expect(screen.getByLabelText('Región')).toHaveValue('Coquimbo');
    expect(screen.getByLabelText('Comuna')).toHaveValue('Coquimbo');
    expect(screen.getByLabelText('Dirección')).toHaveValue('Los Aromos 456');
  });
});
