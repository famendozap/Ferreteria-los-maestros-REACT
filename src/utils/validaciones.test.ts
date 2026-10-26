import { describe, it, expect } from 'vitest';
import {
  validarRUN,
  esEmailValido,
  validarContacto,
} from './validaciones';


describe('validarRUN (algoritmo Módulo 11)', () => {
  it('acepta RUN válidos con distintos formatos', () => {
    expect(validarRUN('11.111.111-1')).toBe(true);
    expect(validarRUN('12.345.678-5')).toBe(true);
    expect(validarRUN('12345678-5')).toBe(true);
    expect(validarRUN('9.876.543-3')).toBe(true);
  });
});

describe('esEmailValido', () => {
  it('rechaza correos sin arroba o sin dominio', () => {
    expect(esEmailValido('juan.perez')).toBe(false);
    expect(esEmailValido('juan@')).toBe(false);
    expect(esEmailValido('')).toBe(false);
  });
});

describe('validarContacto', () => {
  it('exige un mensaje de al menos 10 caracteres', () => {
    const resultado = validarContacto({ nombre: 'Ana', mail: 'ana@test.cl', mensaje: 'hola' });
    expect(resultado.valido).toBe(false);
    expect(resultado.errores.mensaje).toBeDefined();
  });
});