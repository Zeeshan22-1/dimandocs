<script>
  import { getIndex, search, debounce } from '../lib/api.js'
  import { isDarkMode, toggleDarkMode } from '../lib/darkmode.svelte.js'

  let isDark = $state(isDarkMode())

  $effect(() => {
    function onDarkModeChange() {
      isDark = isDarkMode()
    }
    window.addEventListener('darkmodechange', onDarkModeChange)
    return () => window.removeEventListener('darkmodechange', onDarkModeChange)
  })

  let data = $state(null)
  let loading = $state(true)
  let error = $state(null)
  let searchQuery = $state('')
  let searchResults = $state(null)
  let searching = $state(false)

  $effect(() => {
    loadIndex()
  })

  async function loadIndex() {
    try {
      loading = true
      error = null
      data = await getIndex()
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }

  const debouncedSearch = debounce(async (query) => {
    if (!query || query.trim() === '') {
      searchResults = null
      return
    }
    try {
      searching = true
      searchResults = await search(query)
    } catch (e) {
      console.error('Search error:', e)
    } finally {
      searching = false
    }
  }, 300)

  function handleSearchInput(e) {
    searchQuery = e.target.value
    debouncedSearch(searchQuery)
  }

  function clearSearch() {
    searchQuery = ''
    searchResults = null
  }

  function isDocumentInResults(doc) {
    if (!searchResults) return true
    return searchResults.some(r => r.RelPath === doc.RelPath)
  }

  function hasVisibleDocuments(group) {
    if (!searchResults) return true
    return group.Documents.some(doc => isDocumentInResults(doc))
  }

  function handleLinkClick(e, href) {
    e.preventDefault()
    window.__navigate(href)
  }
</script>

<div class="min-h-screen">
  <!-- Header -->
  <header class="bg-slate-800 dark:bg-slate-950 text-white sticky top-0 z-10 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <h1 class="text-xl font-bold">{data?.Title || 'Documentation'}</h1>
          {#if data}
            <span class="text-slate-400 text-sm">
              {searchResults ? `${searchResults.length} results` : `${data.TotalDocuments} documents`}
            </span>
          {/if}
        </div>

        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="relative">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              oninput={handleSearchInput}
              class="w-64 px-4 py-2 pl-10 rounded-lg bg-slate-700 dark:bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg class="absolute left-3 top-2.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {#if searchQuery}
              <button
                onclick={clearSearch}
                class="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>

          <!-- Dark mode toggle -->
          <button
            onclick={toggleDarkMode}
            class="p-2 rounded-lg bg-slate-700 dark:bg-slate-800 hover:bg-slate-600 dark:hover:bg-slate-700 transition-colors"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {#if isDark}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Content -->
  <main class="max-w-7xl mx-auto px-4 py-8">
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    {:else if data}
      {#each data.Groups as group}
        {#if hasVisibleDocuments(group)}
          <section class="mb-8">
            <h2 class="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {group.Name}
            </h2>

            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {#each group.Documents as doc}
                {#if isDocumentInResults(doc)}
                  <a
                    href="/doc/{doc.RelPath}"
                    onclick={(e) => handleLinkClick(e, `/doc/${doc.RelPath}`)}
                    class="block p-4 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg dark:shadow-slate-900/50 transition-all hover:-translate-y-0.5 border border-slate-200 dark:border-slate-700"
                  >
                    <h3 class="font-medium text-slate-900 dark:text-white mb-1 truncate">
                      {doc.DirName}
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate">
                      {doc.AbsPath}
                    </p>
                    {#if doc.Overview}
                      <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {doc.Overview}
                      </p>
                    {/if}
                  </a>
                {/if}
              {/each}
            </div>
          </section>
        {/if}
      {/each}

      {#if searchResults && searchResults.length === 0}
        <div class="text-center py-12 text-slate-500 dark:text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No documents found matching "{searchQuery}"</p>
        </div>
      {/if}
    {/if}
  </main>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
