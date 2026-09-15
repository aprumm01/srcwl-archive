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

  // Render paper card with expandable annotation (includes citation)
  function renderPaperCard(paper) {
    const themeTags = paper.themes.map(t =>
      `<span class="tag theme" data-theme="${t}">${getThemeName(t)}</span>`
    ).join('');

    return `
      <article class="paper-card" data-paper-id="${paper.id}" data-themes="${paper.themes.join(',')}" data-methods="${paper.methods.join(',')}">
        <div class="paper-header" tabindex="0" role="button">
          <h3 class="paper-title">${paper.citation.title}</h3>
          <p class="paper-citation-short">${formatShortCitation(paper)}</p>
        </div>
        <div class="paper-controls">
          <div class="paper-tags">
            ${themeTags}
          </div>
          <div class="paper-actions">
            <button class="annotation-toggle" aria-expanded="false">
              <span>Annotation</span>
              <svg class="toggle-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </button>
            <button class="paper-detail-btn">Full summary →</button>
          </div>
        </div>
        <div class="paper-annotation-body expandable-body">
          <p class="paper-citation-text">${formatCitation(paper)}</p>
          <p class="paper-annotation-text">${paper.annotation}</p>
        </div>
      </article>
    `;
  }

  // Render drawer content for a paper (study-partner summary)
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

    const questions = paper.discussionQuestions.map(q => `<li>${q}</li>`).join('');

    // Use study-partner format summary
    const s = paper.summary;

    return `
      <h2 class="drawer-title">${paper.citation.title}</h2>
      <p class="drawer-meta">
        <span>${formatAuthors(paper.citation.authors)}</span>
        <span class="year"> · ${paper.citation.year}</span>
      </p>

      <div class="drawer-section">
        <p class="drawer-section-title">Tags</p>
        <div class="drawer-tags">
          ${themeTags}
          ${methodTags}
        </div>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Overview of the Document</p>
        <p class="drawer-text">${s.documentOverview}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Research Overview</p>
        <p class="drawer-text">${s.researchOverview}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Theories of Knowledge</p>
        <p class="drawer-text">${s.theoriesOfKnowledge}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Central Arguments</p>
        <p class="drawer-text">${s.centralArguments}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Evidence</p>
        <p class="drawer-text">${s.evidence}</p>
      </div>

      <div class="drawer-section">
        <p class="drawer-section-title">Conclusion</p>
        <p class="drawer-text">${s.conclusion}</p>
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

  // Toggle expandable section (citation or annotation)
  function toggleExpandable(card, type) {
    const className = `${type}-expanded`;
    const isExpanded = card.classList.contains(className);
    const toggle = card.querySelector(`.${type}-toggle`);

    // Close other expanded sections of same type in other cards
    document.querySelectorAll(`.paper-card.${className}`).forEach(other => {
      if (other !== card) {
        other.classList.remove(className);
        other.querySelector(`.${type}-toggle`).setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle this card
    card.classList.toggle(className);
    toggle.setAttribute('aria-expanded', !isExpanded);
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

  // Set up event listeners
  function setupEventListeners() {
    // Paper card clicks
    document.getElementById('paper-list').addEventListener('click', (e) => {
      // Annotation toggle
      const annotationToggle = e.target.closest('.annotation-toggle');
      if (annotationToggle) {
        e.stopPropagation();
        const card = annotationToggle.closest('.paper-card');
        toggleExpandable(card, 'annotation');
        return;
      }

      // Detail button — open drawer
      const detailBtn = e.target.closest('.paper-detail-btn');
      if (detailBtn) {
        e.stopPropagation();
        const card = detailBtn.closest('.paper-card');
        openDrawer(card.dataset.paperId);
        return;
      }

      // Header click — open drawer
      const header = e.target.closest('.paper-header');
      if (header) {
        const card = header.closest('.paper-card');
        openDrawer(card.dataset.paperId);
      }
    });

    // Paper card keyboard navigation
    document.getElementById('paper-list').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const header = e.target.closest('.paper-header');
        if (header) {
          e.preventDefault();
          const card = header.closest('.paper-card');
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
