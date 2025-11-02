export const FUNCTION_LABELS = {
  'tremmer-1': '1e Tremmer',
  'tremmer-2': '2e Tremmer',
  'tremmer-3': '3e Tremmer',
  // Backwards compatibility for previous id names
  'trimmer-1': '1e Tremmer',
  'trimmer-2': '2e Tremmer',
  'trimmer-3': '3e Tremmer'
}

export function getFunctionLabel(id) {
  return FUNCTION_LABELS[id] || id
}
