/* ========================================
   SRCwL Archive — Application Logic
   ======================================== */

(async function() {
  'use strict';

  // State
  let papers = [];
  let themes = [];
  let methods = [];
  let glossary = [];
  let activeFilters = { themes: new Set(), methods: new Set() };

  // DOM refs
  const drawer = document.getElementById('paper-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerContent = document.getElementById('drawer-content');
  const drawerClose = document.getElementById('drawer-close');

  // Load data
  async function loadData() {
    try {
      const response = await fetch('data/papers.json');
      const data = await response.json();
      papers = data.papers;
      themes = data.themes;
      methods = data.methods;
      glossary = data.glossary || [];
      return data;
    } catch (error) {
      console.error('Failed to load papers data:', error);
      return null;
    }
  }

  // Render theme filter buttons
  function renderThemeFilters() {
    const container = document.getElementById('theme-filters');
    container.innerHTML = themes.map(theme => `
      <button class="filter-btn" data-theme="${theme.id}" data-filter-type="theme">
        ${theme.name}
      </button>
    `).join('');
  }

  // Render method filter buttons
  function renderMethodFilters() {
    const container = document.getElementById('method-filters');
    container.innerHTML = methods.map(method => `
      <button class="filter-btn" data-method="${method.id}" data-filter-type="method">
        ${method.name}
      </button>
    `).join('');
  }

  // Render thread cards
  function renderThreadCards() {
    const container = document.getElementById('thread-cards');
    container.innerHTML = themes.map(theme => `
      <div class="thread-card" data-theme="${theme.id}">
        <h3>${theme.name}</h3>
        <p>${theme.description}</p>
      </div>
    `).join('');

    // Hide threads section if empty
    const section = container.closest('.threads');
    if (themes.length === 0 && section) {
      section.style.display = 'none';
    }
  }

  // Format authors for display
  function formatAuthors(authors) {
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
    if (authors.length <= 4) {
      return authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1];
    }
    return `${authors[0]} et al.`;
  }

  // Format full citation
  function formatCitation(paper) {
    const c = paper.citation;
    const authors = c.authors.join(', ');
    let citation = `${authors} (${c.year}). ${c.title}. `;

    if (c.venue) {
      citation += `<em>${c.venue}</em>`;
    }

    if (c.volume) {
      citation += `, <em>${c.volume}</em>`;
      if (c.issue) {
        citation += `(${c.issue})`;
      }
    }

    if (c.pages) {
      citation += `, ${c.pages}`;
    }

    if (c.doi) {
      citation += `. <a href="https://doi.org/${c.doi}" target="_blank" rel="noopener">https://doi.org/${c.doi}</a>`;
    } else if (c.url) {
      citation += `. <a href="${c.url}" target="_blank" rel="noopener">${c.url}</a>`;
    }

    return citation;
  }

  // Get theme name by ID
  function getThemeName(themeId) {
    const theme = themes.find(t => t.id === themeId);
    return theme ? theme.name : themeId;
  }

  // Get method name by ID
  function getMethodName(methodId) {
    const method = methods.find(m => m.id === methodId);
    return method ? method.name : methodId;
  }

  // Get paper by ID
  function getPaperById(paperId) {
    return papers.find(p => p.id === paperId);
  }

  // Get short reference for cross-ref display
  function getShortRef(paperId) {
    const paper = getPaperById(paperId);
    if (!paper) return paperId;
    const firstAuthor = paper.citation.authors[0].split(',')[0];
    return `${firstAuthor} (${paper.citation.year})`;
  }

  // Format short citation for list view
  function formatShortCitation(paper) {
    const c = paper.citation;
    const firstAuthor = c.authors[0].split(',')[0];
    const authorStr = c.authors.length > 2
      ? `${firstAuthor} et al.`
      : c.authors.length === 2
        ? `${firstAuthor} & ${c.authors[1].split(',')[0]}`
        : firstAuthor;

    let citation = `${authorStr} (${c.year})`;
    if (c.venue) {
      // Shorten venue name if too long
      const shortVenue = c.venue.length > 50
        ? c.venue.substring(0, 47) + '…'
        : c.venue;
      citation += ` · ${shortVenue}`;
    }
    return citation;
  }

  // Render paper card (simplified — just the clickable row)
  function renderPaperCard(paper) {
    const themeTags = paper.themes.map(t =>
      `<span class="tag theme" data-theme="${t}">${getThemeName(t)}</span>`
    ).join('');

    return `
      <article class="paper-card" data-paper-id="${paper.id}" data-themes="${paper.themes.join(',')}" data-methods="${paper.methods.join(',')}" tabindex="0" role="button">
        <div class="paper-header">
          <h3 class="paper-title">${paper.citation.title}</h3>
          <p class="paper-citation-short">${formatShortCitation(paper)}</p>
          <div class="paper-tags">
            ${themeTags}
          </div>
        </div>
      </article>
    `;
  }

  // Render drawer content for a paper
  function renderDrawerContent(paper) {
    const themeTags = paper.themes.map(t =>
      `<span class="tag theme" data-theme="${t}">${getThemeName(t)}</span>`
    ).join('');

    const methodTags = paper.methods.map(m =>
      `<span class="tag method">${getMethodName(m)}</span>`
    ).join('');

    const crossRefs = paper.crossReferences && paper.crossReferences.length > 0
      ? paper.crossReferences.map(ref =>
          `<button class="cross-ref" data-paper-id="${ref}">${getShortRef(ref)}</button>`
        ).join('')
      : '<span style="color: var(--text-muted); font-size: 0.8125rem;">None specified</span>';

    const findings = paper.summary.keyFindings.map(f => `<li>${f}</li>`).join('');

    const questions = paper.discussionQuestions.map(q => `<li>${q}</li>`).join('');

    return `
      <h2 class="drawer-title">${paper.citation.title}</h2>
      <p class="drawer-meta">
        <span>${formatAuthors(paper.citation.authors)}</span>
        <span class="year"> · ${paper.citation.year}</span>
      </p>

      <div class="drawer-section">
        <p class="drawer-section-title">Citation</p>
        <p class="drawer-citation">${formatCitation(paper)}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Tags</p>
        <div class="drawer-tags">
          ${themeTags}
          ${methodTags}
        </div>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Annotation</p>
        <p class="drawer-annotation">${paper.annotation}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Summary</p>
        <p class="drawer-overview">${paper.summary.overview}</p>
        <ul class="drawer-findings">
          ${findings}
        </ul>
        <p class="drawer-argument">${paper.summary.centralArgument}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Cross-References</p>
        <div class="drawer-cross-refs">
          ${crossRefs}
        </div>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Discussion Questions</p>
        <ol class="drawer-questions">
          ${questions}
        </ol>
      </div>
    `;
  }

  // Render all paper cards
  function renderPapers() {
    const container = document.getElementById('paper-list');
    container.innerHTML = papers.map(renderPaperCard).join('');
    document.getElementById('paper-count').textContent = papers.length;
  }

  // Open drawer with paper content
  function openDrawer(paperId) {
    const paper = getPaperById(paperId);
    if (!paper) return;

    drawerContent.innerHTML = renderDrawerContent(paper);
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawerOverlay.classList.add('visible');
    document.body.classList.add('drawer-open');

    // Focus the close button for accessibility
    drawerClose.focus();
  }

  // Close drawer
  function closeDrawer() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerOverlay.classList.remove('visible');
    document.body.classList.remove('drawer-open');
  }

  // Highlight and open a cross-referenced paper
  function highlightCrossRef(paperId) {
    const targetCard = document.querySelector(`.paper-card[data-paper-id="${paperId}"]`);
    if (!targetCard) return;

    // Close current drawer
    closeDrawer();

    // Small delay so the drawer close animation starts
    setTimeout(() => {
      // Remove existing highlights
      document.querySelectorAll('.paper-card.cross-referenced').forEach(el => {
        el.classList.remove('cross-referenced');
      });

      // Add highlight
      targetCard.classList.add('cross-referenced');

      // Scroll into view
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Open the new paper's drawer after scroll
      setTimeout(() => {
        openDrawer(paperId);
      }, 400);
    }, 100);
  }

  // Apply filters
  function applyFilters() {
    const hasActiveFilters = activeFilters.themes.size > 0 || activeFilters.methods.size > 0;

    document.querySelectorAll('.paper-card').forEach(card => {
      const cardThemes = card.dataset.themes.split(',');
      const cardMethods = card.dataset.methods.split(',');

      let matchesTheme = activeFilters.themes.size === 0 ||
        [...activeFilters.themes].some(t => cardThemes.includes(t));
      let matchesMethod = activeFilters.methods.size === 0 ||
        [...activeFilters.methods].some(m => cardMethods.includes(m));

      if (matchesTheme && matchesMethod) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    // Show/hide clear button
    document.getElementById('clear-filters').style.display = hasActiveFilters ? 'block' : 'none';

    // Update visible count
    const visibleCount = document.querySelectorAll('.paper-card:not(.hidden)').length;
    document.getElementById('paper-count').textContent = visibleCount;
  }

  // Clear all filters
  function clearFilters() {
    activeFilters.themes.clear();
    activeFilters.methods.clear();

    document.querySelectorAll('.filter-btn.active').forEach(btn => {
      btn.classList.remove('active');
    });

    applyFilters();
  }

  // Set up event listeners
  function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filterType = btn.dataset.filterType;
        const value = filterType === 'theme' ? btn.dataset.theme : btn.dataset.method;
        const filterSet = filterType === 'theme' ? activeFilters.themes : activeFilters.methods;

        if (filterSet.has(value)) {
          filterSet.delete(value);
          btn.classList.remove('active');
        } else {
          filterSet.add(value);
          btn.classList.add('active');
        }

        applyFilters();
      });
    });

    // Clear filters
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Paper card clicks — open drawer
    document.getElementById('paper-list').addEventListener('click', (e) => {
      const card = e.target.closest('.paper-card');
      if (card) {
        openDrawer(card.dataset.paperId);
      }
    });

    // Paper card keyboard navigation
    document.getElementById('paper-list').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.paper-card');
        if (card) {
          e.preventDefault();
          openDrawer(card.dataset.paperId);
        }
      }
    });

    // Drawer close button
    drawerClose.addEventListener('click', closeDrawer);

    // Drawer overlay click
    drawerOverlay.addEventListener('click', closeDrawer);

    // Escape key closes drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Cross-reference clicks in drawer
    drawerContent.addEventListener('click', (e) => {
      const crossRef = e.target.closest('.cross-ref');
      if (crossRef) {
        e.stopPropagation();
        highlightCrossRef(crossRef.dataset.paperId);
      }
    });

    // Thread card clicks (filter to that theme)
    document.getElementById('thread-cards').addEventListener('click', (e) => {
      const card = e.target.closest('.thread-card');
      if (card) {
        const themeId = card.dataset.theme;
        clearFilters();
        activeFilters.themes.add(themeId);
        document.querySelector(`.filter-btn[data-theme="${themeId}"]`).classList.add('active');
        applyFilters();

        // Scroll to papers
        document.querySelector('.papers').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Glossary item clicks
    document.getElementById('glossary-list').addEventListener('click', (e) => {
      // Paper link click
      const paperLink = e.target.closest('.glossary-paper-link');
      if (paperLink) {
        e.stopPropagation();
        openDrawer(paperLink.dataset.paperId);
        return;
      }

      // Header click
      const header = e.target.closest('.glossary-header');
      if (header) {
        const item = header.closest('.glossary-item');
        toggleGlossaryItem(item);
      }
    });

    // Glossary keyboard navigation
    document.getElementById('glossary-list').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const header = e.target.closest('.glossary-header');
        if (header) {
          e.preventDefault();
          const item = header.closest('.glossary-item');
          toggleGlossaryItem(item);
        }
      }
    });

    // Glossary search
    document.getElementById('glossary-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterGlossary(query);
    });
  }

  // Initialize
  async function init() {
    const data = await loadData();
    if (!data) {
      document.getElementById('paper-list').innerHTML =
        '<p style="color: var(--text-muted);">Failed to load papers. Please check that data/papers.json exists.</p>';
      return;
    }

    renderThemeFilters();
    renderMethodFilters();
    renderThreadCards();
    renderPapers();
    renderGlossary();
    setupEventListeners();
  }

  // Render glossary
  function renderGlossary() {
    const container = document.getElementById('glossary-list');
    const section = container.closest('.glossary');

    // Hide glossary section if empty
    if (glossary.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    // Sort glossary alphabetically
    const sortedGlossary = [...glossary].sort((a, b) =>
      a.term.toLowerCase().localeCompare(b.term.toLowerCase())
    );

    container.innerHTML = sortedGlossary.map(item => {
      const paperCount = item.papers.length;
      const paperLinks = item.papers.map(paperId => {
        const ref = getShortRef(paperId);
        return `<button class="glossary-paper-link" data-paper-id="${paperId}">${ref}</button>`;
      }).join('');

      return `
        <div class="glossary-item" data-term="${item.term.toLowerCase()}">
          <div class="glossary-header" tabindex="0" role="button" aria-expanded="false">
            <span class="glossary-term">${item.term}</span>
            <span class="glossary-paper-count">${paperCount} paper${paperCount !== 1 ? 's' : ''}</span>
          </div>
          <div class="glossary-body">
            <p class="glossary-definition">${item.definition}</p>
            <p class="glossary-papers-label">Used in</p>
            <div class="glossary-papers">
              ${paperLinks}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Toggle glossary item expansion
  function toggleGlossaryItem(item) {
    const isExpanded = item.classList.contains('expanded');
    const header = item.querySelector('.glossary-header');

    // Close other expanded items
    document.querySelectorAll('.glossary-item.expanded').forEach(other => {
      if (other !== item) {
        other.classList.remove('expanded');
        other.querySelector('.glossary-header').setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle this item
    item.classList.toggle('expanded');
    header.setAttribute('aria-expanded', !isExpanded);
  }

  // Filter glossary by search query
  function filterGlossary(query) {
    document.querySelectorAll('.glossary-item').forEach(item => {
      const term = item.dataset.term;
      const definition = item.querySelector('.glossary-definition').textContent.toLowerCase();

      if (query === '' || term.includes(query) || definition.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  // Run
  init();
})();
