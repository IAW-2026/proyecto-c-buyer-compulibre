export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  try {
    const res = await fetch(url, {
      ...fetchOptions,
      signal: AbortSignal.timeout(timeoutMs),
    });
    
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message ?? `HTTP ${res.status}`);
    }
    
    return res.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new Error('El servicio externo no respondió a tiempo');
    }
    throw err;
  }
}
