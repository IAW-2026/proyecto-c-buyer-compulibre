const CATEGORY_MAP: Record<string, string> = {
  "GPU": "Placa de Video",
  "CPU": "Procesador",
  "RAM": "Memoria RAM",
  "MONITOR": "Monitor",
  "STORAGE": "Almacenamiento",
  "MOTHERBOARD": "Motherboard",
};

const CONDITION_MAP: Record<string, string> = {
  "NEW": "Nuevo",
  "USED": "Usado",
  "REFURBISHED": "Reacondicionado",
};

/**
 * Traduce una categoría técnica a su versión amigable para el comprador.
 * Si no está en el diccionario, aplica capitalización estética.
 * Ejemplo: "MOTHERBOARD" -> "Motherboard", "VR_HEADSET" -> "Vr Headset"
 */
export function formatCategory(rawCategory: string): string {
  if (!rawCategory) return "";
  const upper = rawCategory.toUpperCase();
  const translated = CATEGORY_MAP[upper];
  
  if (translated) return translated;

  // Fallback Inteligente
  return rawCategory
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Traduce una condición técnica a su equivalente amigable.
 * Si no está en el diccionario, aplica capitalización estética.
 * Ejemplo: "NEW" -> "Nuevo", "MINT_CONDITION" -> "Mint Condition"
 */
export function formatCondition(rawCondition: string): string {
  if (!rawCondition) return "";
  const upper = rawCondition.toUpperCase();
  const translated = CONDITION_MAP[upper];

  if (translated) return translated;

  // Fallback Inteligente
  return rawCondition
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
