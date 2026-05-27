export const FUNCTION_LABELS = {
  nl: {
    'tremmer-1': '1e Tremmer',
    'tremmer-2': '2e Tremmer',
    'tremmer-3': '3e Tremmer',
    'trimmer-1': '1e Tremmer',
    'trimmer-2': '2e Tremmer',
    'trimmer-3': '3e Tremmer'
  },
  en: {
    'tremmer-1': '1st Tremmer',
    'tremmer-2': '2nd Tremmer',
    'tremmer-3': '3rd Tremmer',
    'trimmer-1': '1st Tremmer',
    'trimmer-2': '2nd Tremmer',
    'trimmer-3': '3rd Tremmer'
  }
}

export function getFunctionLabel(id, lang = 'nl') {
  return FUNCTION_LABELS[lang]?.[id] || FUNCTION_LABELS.nl[id] || id
}
