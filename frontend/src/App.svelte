<script>
  import Index from './routes/Index.svelte'
  import Document from './routes/Document.svelte'

  let currentPath = $state(window.location.pathname)

  function handleNavigation() {
    currentPath = window.location.pathname
  }

  // Handle browser back/forward
  $effect(() => {
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  })

  // Navigation function for links
  function navigate(href) {
    window.history.pushState({}, '', href)
    currentPath = href
  }

  // Make navigate available globally for child components
  if (typeof window !== 'undefined') {
    window.__navigate = navigate
  }

  // Parse route
  let route = $derived.by(() => {
    if (currentPath.startsWith('/doc/')) {
      return { type: 'document', path: currentPath.slice(5) }
    }
    return { type: 'index' }
  })
</script>

<div class="min-h-screen">
  {#if route.type === 'index'}
    <Index />
  {:else if route.type === 'document'}
    <Document path={route.path} />
  {/if}
</div>
