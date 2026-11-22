import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UsuarioSesion } from '../servicios/usuariosApi';

const CLAVE_LOCALSTORAGE = 'lm_sesion';

interface DatosSesion {
  usuario: UsuarioSesion;
  token: string;
}

interface SesionAPI {
  usuario: UsuarioSesion | null;
  token: string | null;
  iniciarSesion: (usuario: UsuarioSesion, token: string) => void;
  cerrarSesion: () => void;
}

const SesionContext = createContext<SesionAPI | null>(null);

function leerSesionInicial(): DatosSesion | null {
  try {
    const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
    if (!guardado) return null;
    const datos = JSON.parse(guardado);
    // Ignora sesiones guardadas con el formato antiguo (sin token).
    return datos?.usuario && datos?.token ? (datos as DatosSesion) : null;
  } catch {
    return null;
  }
}


export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<DatosSesion | null>(leerSesionInicial);

  const iniciarSesion = (usuario: UsuarioSesion, token: string) => {
    const nueva = { usuario, token };
    setSesion(nueva);
    localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(nueva));
  };

  const cerrarSesion = () => {
    setSesion(null);
    localStorage.removeItem(CLAVE_LOCALSTORAGE);
  };

  return (
    <SesionContext.Provider
      value={{ usuario: sesion?.usuario ?? null, token: sesion?.token ?? null, iniciarSesion, cerrarSesion }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion(): SesionAPI {
  const ctx = useContext(SesionContext);
  if (!ctx) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return ctx;
}
