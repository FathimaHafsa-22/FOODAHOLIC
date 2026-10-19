/* ==========================================================================
   FOODAHOLIC — Recipes Listing Page
   ========================================================================== */

(function () {
  'use strict';

  let allRecipes = [];
  let activeCategory = 'All';
  let searchQuery = '';

  let grid, chips, countEl, emptyEl, searchInput, clearBtn, resetBtn;

  function renderChips(categories) {
    chips.innerHTML = categories
      .map(
        (cat) => `
        <button
          class="chip ${cat === 'All' ? 'is-active' : ''}"
          data-category="${cat}"
          role="tab"
          aria-selected="${cat === 'All'}"
        >${cat}</button>`
      )
      .join('');
  }

  function renderRecipes(list) {
    if (!list.length) {
      grid.innerHTML = '';
      emptyEl.hidden = false;
      countEl.textContent = '';
      return;
    }

    emptyEl.hidden = true;

    grid.innerHTML = list
      .map(
        (r) => `
      <article class="recipe-card" data-reveal>
        <a href="recipe.html?id=${r.id}" class="recipe-card-link" aria-label="View ${r.name} recipe">
          <div class="recipe-card-image">
            <img src="${r.image}" alt="${r.name}" loading="lazy" />
            <span class="recipe-card-category">${r.category}</span>
          </div>
          <div class="recipe-card-body">
            <h3 class="recipe-card-title">${r.name}</h3>
            <p class="recipe-card-desc text-muted">${r.shortDescription}</p>
            <div class="recipe-card-meta">
              <span>⏱ ${r.prepTime}</span>
              <span>🍽 ${r.servings} servings</span>
            </div>
          </div>
        </a>
      </article>`
      )
      .join('');

    // Reveal animation
    requestAnimationFrame(() => {
      grid.querySelectorAll('.recipe-card').forEach((el, i) => {
        setTimeout(() => el.classList.add('is-revealed'), i * 50);
      });
    });
  }

  function updateCount(list) {
    const total = allRecipes.length;
    const showing = list.length;
    if (showing === total) {
      countEl.textContent = `Showing all ${total} recipes`;
    } else {
      countEl.textContent = `Showing ${showing} of ${total} recipes`;
    }
  }

  function applyFilters() {
    let filtered = allRecipes;

    if (activeCategory !== 'All') {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) => {
        const haystack = [r.name, r.shortDescription, r.category, ...(r.tags || [])].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    renderRecipes(filtered);
    updateCount(filtered);
  }

  function wireEvents() {
    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      activeCategory = chip.dataset.category;

      chips.querySelectorAll('.chip').forEach((c) => {
        const isActive = c.dataset.category === activeCategory;
        c.classList.toggle('is-active', isActive);
        c.setAttribute('aria-selected', String(isActive));
      });

      applyFilters();
    });

    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      searchQuery = e.target.value;
      clearBtn.hidden = !searchQuery;
      debounceTimer = setTimeout(applyFilters, 200);
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.hidden = true;
      searchInput.focus();
      applyFilters();
    });

    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      activeCategory = 'All';
      clearBtn.hidden = true;
      chips.querySelectorAll('.chip').forEach((c) => {
        const isActive = c.dataset.category === 'All';
        c.classList.toggle('is-active', isActive);
        c.setAttribute('aria-selected', String(isActive));
      });
      applyFilters();
    });
  }

  document.addEventListener('DOMContentLoaded', async () => {
    grid = document.getElementById('recipes-grid');
    chips = document.getElementById('filter-chips');
    countEl = document.getElementById('results-count');
    emptyEl = document.getElementById('empty-state');
    searchInput = document.getElementById('recipe-search');
    clearBtn = document.getElementById('search-clear');
    resetBtn = document.getElementById('reset-filters');

    if (!grid) return;

    try {
      const res = await fetch('assets/data/recipes.json');
      if (!res.ok) throw new Error('Failed to load recipes');
      const data = await res.json();
      allRecipes = data.recipes || [];

      const cats = ['All', ...new Set(allRecipes.map((r) => r.category))];
      renderChips(cats);

      wireEvents();
      applyFilters();
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<p class="text-muted">Sorry — recipes couldn't be loaded.</p>`;
    }
  });
})();