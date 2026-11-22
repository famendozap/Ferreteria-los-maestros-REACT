import type { TipoUsuario } from '../datos/usuarios';

export const API_USUARIOS = 'http://localhost:8081/api/usuarios';

export interface UsuarioSesion {
  id: number;
  run: string;
  nombre: string;
  apellidos: string;
  mail: string;
  tipoUsuario: TipoUsuario;
  region: string;
  comuna: string;
  direccion: string;
  activo: boolean;
}

export interface RespuestaAuth {
  token: string;
  usuario: UsuarioSesion;
}

export interface DatosRegistro {
  run: string;
  nombre: string;
  apellidos: string;
  mail: string;
  clave: string;
  region: string;
  comuna: string;
  direccion: string;
}

export class ErrorApi extends Error {
  status: number;
  errores: Record<string, string>;

  constructor(status: number, mensaje: string, errores: Record<string, string> = {}) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

async function pedir<T>(ruta: string, metodo: string, cuerpo?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_USUARIOS}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(respuesta.status, datos?.mensaje ?? 'Ocurrió un error inesperado.', datos?.errores ?? {});
  }
  return datos as T;
}

export function loginApi(mail: string, clave: string) {
  return pedir<RespuestaAuth>('/login', 'POST', { mail, clave });
}

export function registroApi(datos: DatosRegistro) {
  return pedir<RespuestaAuth>('/registro', 'POST', datos);
}
export function listarUsuariosApi(token: string) {
  return pedir<UsuarioSesion[]>('', 'GET', undefined, token);
}

export function alternarActivoApi(id: number, token: string) {
  return pedir<UsuarioSesion>(`/${id}/activo`, 'PATCH', undefined, token);
}

export function eliminarUsuarioApi(id: number, token: string) {
  return pedir<void>(`/${id}`, 'DELETE', undefined, token);
}

export interface DatosUsuarioNuevo {
  run: string;
  nombre: string;
  apellidos: string;
  mail: string;
  clave: string;
  tipoUsuario: TipoUsuario;
  region: string;
  comuna: string;
  direccion: string;
  activo: boolean;
}

export interface DatosUsuarioEdicion {
  nombre: string;
  apellidos: string;
  mail: string;
  clave?: string;
  tipoUsuario: TipoUsuario;
  region: string;
  comuna: string;
  direccion: string;
  activo: boolean;
}

export function obtenerUsuarioApi(id: number, token: string) {
  return pedir<UsuarioSesion>(`/${id}`, 'GET', undefined, token);
}

export function crearUsuarioApi(datos: DatosUsuarioNuevo, token: string) {
  return pedir<UsuarioSesion>('', 'POST', datos, token);
}

export function actualizarUsuarioApi(id: number, datos: DatosUsuarioEdicion, token: string) {
  return pedir<UsuarioSesion>(`/${id}`, 'PUT', datos, token);
}

export function mensajeError(e: unknown, porDefecto: string): string {
  if (e instanceof ErrorApi) {
    if (e.status === 401) return 'Tu sesión expiró. Usa "Salir" e inicia sesión nuevamente.';
    if (e.status === 403) return 'No tienes permisos para realizar esta acción.';
    return e.message;
  }
  return porDefecto;
}
