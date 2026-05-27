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
    'tremmer-1': 'First Trimmer',
    'tremmer-2': 'Second Trimmer',
    'tremmer-3': 'Third Trimmer',
    'trimmer-1': 'First Trimmer',
    'trimmer-2': 'Second Trimmer',
    'trimmer-3': 'Third Trimmer'
  }
}

export function getFunctionLabel(id, lang = 'nl') {
  return FUNCTION_LABELS[lang]?.[id] || FUNCTION_LABELS.nl[id] || id
}
