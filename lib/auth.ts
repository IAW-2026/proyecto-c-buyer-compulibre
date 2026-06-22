/**
 * Valida si la petición proviene de un servicio interno autorizado (M2M).
 * Compara el header "x-service-token" con la variable de entorno "SERVICE_TOKEN".
 */
export function validateServiceToken(request: Request): boolean {
  const token = request.headers.get("x-service-token");
  const expectedToken = process.env.SERVICE_TOKEN;

  if (!expectedToken) {
    console.warn("SERVICE_TOKEN no está configurado en las variables de entorno.");
    return false;
  }

  return token === expectedToken;
}

/**
 * Valida si la petición proviene del Control Plane (Global Admin).
 * Compara el header "x-control-plane-token" con la variable de entorno "SERVICE_TOKEN" 
 * (u otra variable específica si existiera, pero por defecto usamos el mismo secreto de ecosistema 
 * o lo validamos así).
 */
export function validateControlPlaneToken(request: Request): boolean {
  const token = request.headers.get("x-control-plane-token");
  // Si hubiera una variable dedicada CONTROL_PLANE_TOKEN se usaría, sino fallback a SERVICE_TOKEN
  const expectedToken = process.env.CONTROL_PLANE_TOKEN || process.env.SERVICE_TOKEN;

  if (!expectedToken) {
    console.warn("No hay token de control plane configurado en el entorno.");
    return false;
  }

  return token === expectedToken;
}
