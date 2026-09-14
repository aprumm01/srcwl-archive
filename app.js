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

  // Render paper card
  function renderPaperCard(paper) {
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
      : '<span style="color: var(--text-muted); font-size: 0.875rem;">None specified</span>';

    const findings = paper.summary.keyFindings.map(f => `<li>${f}</li>`).join('');

    const questions = paper.discussionQuestions.map(q => `<li>${q}</li>`).join('');

    return `
      <article class="paper-card" data-paper-id="${paper.id}" data-themes="${paper.themes.join(',')}" data-methods="${paper.methods.join(',')}">
        <div class="paper-header" tabindex="0" role="button" aria-expanded="false">
          <div class="paper-title-row">
            <h3 class="paper-title">${paper.citation.title}</h3>
            <span class="paper-year">${paper.citation.year}</span>
          </div>
          <p class="paper-authors">${formatAuthors(paper.citation.authors)}</p>
          <div class="paper-tags">
            ${themeTags}
            ${methodTags}
          </div>
        </div>
        <div class="paper-body">
          <div class="paper-section">
            <h4 class="paper-section-title">Citation</h4>
            <p class="citation">${formatCitation(paper)}</p>
          </div>

          <div class="paper-section">
            <h4 class="paper-section-title">Annotation</h4>
            <p class="annotation">${paper.annotation}</p>
          </div>

          <div class="paper-section">
            <h4 class="paper-section-title">Summary</h4>
            <p class="summary-overview">${paper.summary.overview}</p>
            <ul class="summary-findings">
              ${findings}
            </ul>
            <p class="summary-argument">${paper.summary.centralArgument}</p>
          </div>

          <div class="paper-section">
            <h4 class="paper-section-title">Cross-References</h4>
            <div class="cross-references">
              ${crossRefs}
            </div>
          </div>

          <div class="paper-section">
            <h4 class="paper-section-title">Discussion Questions</h4>
            <ol class="discussion-questions">
              ${questions}
            </ol>
          </div>
        </div>
      </article>
    `;
  }

  // Render all paper cards
  function renderPapers() {
    const container = document.getElementById('paper-list');
    container.innerHTML = papers.map(renderPaperCard).join('');
    document.getElementById('paper-count').textContent = papers.length;
  }

  // Toggle paper expansion
  function togglePaper(card) {
    const isExpanded = card.classList.contains('expanded');
    const header = card.querySelector('.paper-header');

    // Close other expanded cards
    document.querySelectorAll('.paper-card.expanded').forEach(other => {
      if (other !== card) {
        other.classList.remove('expanded');
        other.querySelector('.paper-header').setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle this card
    card.classList.toggle('expanded');
    header.setAttribute('aria-expanded', !isExpanded);

    // Clear any cross-reference highlights
    document.querySelectorAll('.paper-card.cross-referenced').forEach(el => {
      el.classList.remove('cross-referenced');
    });
  }

  // Highlight and scroll to a cross-referenced paper
  function highlightCrossRef(paperId) {
    const targetCard = document.querySelector(`.paper-card[data-paper-id="${paperId}"]`);
    if (!targetCard) return;

    // Remove existing highlights
    document.querySelectorAll('.paper-card.cross-referenced').forEach(el => {
      el.classList.remove('cross-referenced');
    });

    // Add highlight
    targetCard.classList.add('cross-referenced');

    // Scroll into view
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Expand the card
    if (!targetCard.classList.contains('expanded')) {
      togglePaper(targetCard);
    }
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

    // Paper card clicks
    document.getElementById('paper-list').addEventListener('click', (e) => {
      // Cross-reference click
      const crossRef = e.target.closest('.cross-ref');
      if (crossRef) {
        e.stopPropagation();
        highlightCrossRef(crossRef.dataset.paperId);
        return;
      }

      // Header click
      const header = e.target.closest('.paper-header');
      if (header) {
        const card = header.closest('.paper-card');
        togglePaper(card);
      }
    });

    // Keyboard navigation
    document.getElementById('paper-list').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const header = e.target.closest('.paper-header');
        if (header) {
          e.preventDefault();
          const card = header.closest('.paper-card');
          togglePaper(card);
        }
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
        highlightCrossRef(paperLink.dataset.paperId);
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
