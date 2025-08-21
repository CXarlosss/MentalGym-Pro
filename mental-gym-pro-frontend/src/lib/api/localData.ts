// src/lib/api/localData.ts
// Limpia el bucket global antiguo (si existía)
export function clearLegacyLocalData() {
  try {
    localStorage.removeItem('mg:cog:sessions:v1') // global legacy
  } catch {}
}

// Limpia estado volátil del usuario ACTUAL (no borra historiales por-usuario)
export function clearUserScopedData() {
  try {
    // si guardas cosas temporales, límpialas aquí…
    // p.ej. filtros, vistas, etc.
    // Importante: NO borrar keys tipo "mg:cog:sessions:<uid>:v1"
    localStorage.removeItem('mg:userId') // solo olvidamos qué usuario está activo
  } catch {}
}
