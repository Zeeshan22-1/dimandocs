const BASE_URL = ''

export async function getIndex() {
  const response = await fetch(`${BASE_URL}/api/index`)
  if (!response.ok) {
    throw new Error(`Failed to fetch index: ${response.statusText}`)
  }
  return response.json()
}

export async function getDocument(path) {
  const response = await fetch(`${BASE_URL}/api/doc/${encodeURIComponent(path)}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`)
  }
  return response.json()
}

export async function search(query) {
  if (!query || query.trim() === '') {
    return []
  }
  const response = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`)
  }
  return response.json()
}

export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}
