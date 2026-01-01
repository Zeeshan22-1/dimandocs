<script>
  import { getDocument } from '../lib/api.js'
  import { isDarkMode, toggleDarkMode } from '../lib/darkmode.svelte.js'

  let { path } = $props()
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
  let toc = $state([])
  let activeId = $state('')
  let contentEl = $state(null)

  $effect(() => {
    if (path) {
      loadDocument(path)
    }
  })

  $effect(() => {
    if (contentEl && data) {
      generateToc()
      setupScrollSpy()
    }
  })

  async function loadDocument(docPath) {
    try {
      loading = true
      error = null
      data = await getDocument(docPath)
    } catch (e) {
      error = e.message
    } finally {
      loading = false
    }
  }

  function generateToc() {
    if (!contentEl) return

    const headings = contentEl.querySelectorAll('h1, h2, h3, h4')
    const items = []

    headings.forEach((heading, index) => {
      const id = heading.id || `heading-${index}`
      if (!heading.id) {
        heading.id = id
      }

      items.push({
        id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1))
      })
    })

    toc = items
    if (items.length > 0) {
      activeId = items[0].id
    }
  }

  function setupScrollSpy() {
    let ticking = false

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveHeading()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }

  function updateActiveHeading() {
    if (!contentEl || toc.length === 0) return

    const headings = contentEl.querySelectorAll('h1, h2, h3, h4')
    let current = ''

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect()
      if (rect.top <= 100) {
        current = heading.id
      }
    })

    if (current) {
      activeId = current
    }
  }

  function scrollToHeading(id) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function getTocIndent(level) {
    return `${(level - 1) * 0.75}rem`
  }

  function handleBackClick(e) {
    e.preventDefault()
    window.__navigate('/')
  }
</script>

<div class="min-h-screen">
  <!-- Header -->
  <header class="bg-slate-800 dark:bg-slate-950 text-white sticky top-0 z-10 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a
            href="/"
            onclick={handleBackClick}
            class="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Documentation</span>
          </a>
        </div>

        <div class="flex items-center gap-4">
          {#if data}
            <span class="text-sm text-slate-400 hidden md:block">{data.AbsPath}</span>
          {/if}

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
  <div class="max-w-7xl mx-auto px-4 py-8">
    {#if loading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    {:else if data}
      <div class="flex gap-8">
        <!-- Table of Contents -->
        {#if toc.length > 0}
          <aside class="hidden lg:block w-64 flex-shrink-0">
            <nav class="sticky top-24 bg-white dark:bg-slate-800 rounded-lg p-4 shadow border border-slate-200 dark:border-slate-700">
              <h2 class="font-semibold text-slate-900 dark:text-white mb-3">Table of Contents</h2>
              <ul class="space-y-1 text-sm">
                {#each toc as item}
                  <li style="padding-left: {getTocIndent(item.level)}">
                    <button
                      onclick={() => scrollToHeading(item.id)}
                      class="text-left w-full py-1 px-2 rounded transition-colors truncate {activeId === item.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}"
                      title={item.text}
                    >
                      {item.text}
                    </button>
                  </li>
                {/each}
              </ul>
            </nav>
          </aside>
        {/if}

        <!-- Document Content -->
        <article class="flex-1 min-w-0">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 md:p-8">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              {data.Title}
            </h1>
            <div
              bind:this={contentEl}
              class="prose max-w-none"
            >
              {@html data.Content}
            </div>
          </div>
        </article>
      </div>
    {/if}
  </div>
</div>
