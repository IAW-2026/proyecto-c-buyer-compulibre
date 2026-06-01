/**
 * Valida si la petición proviene de un servicio interno autorizado.
 * Compara el header "x-service-token" con la variable de entorno "SERVICE_TOKEN".
 * 
 * (TODO: Etapa 3)
 * Etapa 2: Esta validación es provisoria en la Etapa 3 habra una verificación mejor
 * Por ahora, SERVICE_TOKEN puede tener cualquier valor pero debe estar definido
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
