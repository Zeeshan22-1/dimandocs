// Simple dark mode toggle - reads from DOM, updates DOM + localStorage
export function isDarkMode() {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

export function toggleDarkMode() {
  const html = document.documentElement
  const isDark = html.classList.contains('dark')

  if (isDark) {
    html.classList.remove('dark')
    localStorage.theme = 'light'
  } else {
    html.classList.add('dark')
    localStorage.theme = 'dark'
  }

  // Dispatch custom event so components can react
  window.dispatchEvent(new CustomEvent('darkmodechange'))
}
