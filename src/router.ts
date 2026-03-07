/**
 * router.ts — Router de hash simple para la SPA
 *
 * Rutas disponibles:
 *   #/login      → page-login
 *   #/estudiante → pagina-estudiante
 *   #/tutor      → pagina-tutor
 *   #/admin      → pagina-admin
 *
 * Rutas protegidas: cualquiera excepto /login requiere JWT en localStorage.
 */

export type Rol = 'estudiante' | 'tutor' | 'admin';
export type Route = '/login' | '/estudiante' | '/tutor' | '/admin';

const rutas_privadas: Route[] = ['/estudiante', '/tutor', '/admin'];

// Mapa rol → ruta por defecto después del login
export const rutaPorRol: Record<Rol, Route> = {
  estudiante: '/estudiante',
  tutor: '/tutor',
  admin: '/admin',
};

/** Obtiene la ruta actual del hash. Ej: "#/login" → "/login" */
export function getRutaActual(): Route {
  const hash = window.location.hash.slice(1); // quitar el '#'
  const rutasValidas: Route[] = ['/login', '/estudiante', '/tutor', '/admin'];
  if (!hash || !rutasValidas.includes(hash as Route)) return '/login';
  return hash as Route;
}

/** Navega programáticamente a una ruta */
export function navigate(ruta: Route): void {
  window.location.hash = ruta;
}

/** Verifica si el usuario tiene sesión activa */
export function estaAutenticado(): boolean {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Decodificar el payload del JWT (sin verificar firma — eso lo hace el servidor)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const ahora = Math.floor(Date.now() / 1000);
    return payload.exp > ahora;
  } catch {
    return false;
  }
}

/** Retorna el payload del JWT almacenado, o null si no existe */
export function getUsuario(): { id: number; email: string; rol: Rol; nombre: string } | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** Cierra sesión y redirige al login */
export function logout(): void {
  localStorage.removeItem('token');
  navigate('/login');
}

/**
 * Verifica si la ruta actual está protegida y si el usuario NO está autenticado,
 * redirige al login. Retorna `true` si el usuario puede acceder.
 */
export function guardarRuta(ruta: Route): boolean {
  if (rutas_privadas.includes(ruta) && !estaAutenticado()) {
    navigate('/login');
    return false;
  }
  return true;
}
