/* FOODAHOLIC — Recipe Detail Page
   Reads ?id=... from URL, fetches recipes.json, renders full recipe view. */

(function () {
  'use strict';

  const main = document.getElementById('recipe-main');
  if (!main) return;

  /* Helpers */

  function getRecipeId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  /**
   * Build alternate image path for gallery.
   * e.g. "assets/images/recipes/aasmi.webp" → "assets/images/recipes/aasmi-2.webp"
   * Returns null if the alternate is not likely to exist.
   */
  function getAlternateImage(path) {
    if (!path) return null;
    const match = path.match(/^(.*)\.(webp|jpg|jpeg|png)$/i);
    if (!match) return null;
    const [, base, ext] = match;
    // Only offer alternates for known "-2" dishes
    const knownAlternates = ['aasmi', 'helapa', 'lump-rice', 'pol-rotti'];
    const name = base.split('/').pop();
    if (knownAlternates.includes(name)) {
      return `${base}-2.${ext}`;
    }
    return null;
  }

  function renderNotFound() {
    main.innerHTML = `
      <div class="container not-found">
        <h1>Recipe not found 🍽️</h1>
        <p class="text-muted">Sorry — we couldn't find that recipe. It may have been moved or removed.</p>
        <a href="recipe.html" class="btn btn-primary">Browse All Recipes</a>
      </div>`;
  }

  /* Template builders */

  function buildShareSection(recipe) {
    return `
      <div class="recipe-share">
        <button class="btn btn-outline share-btn" data-share>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          <span>Share Recipe</span>
        </button>
      </div>`;
  }

  function buildRecipeHTML(recipe) {
    const altImage = getAlternateImage(recipe.image);
    const galleryImages = [recipe.image, altImage].filter(Boolean);

    const ingredients = (recipe.ingredients || [])
      .map(
        (item) => `
        <li class="ingredient-item">
          <label>
            <input type="checkbox" class="ingredient-check" />
            <span>${item}</span>
          </label>
        </li>`
      )
      .join('');

    const steps = (recipe.steps || [])
      .map(
        (step, i) => `
        <li class="step-item">
          <span class="step-number">${i + 1}</span>
          <p class="step-text">${step}</p>
        </li>`
      )
      .join('');

    const tags = (recipe.tags || [])
      .map((t) => `<span class="tag">#${t}</span>`)
      .join('');

    const gallery =
      galleryImages.length > 1
        ? `
      <section class="recipe-gallery-section">
        <h2 class="recipe-section-title">Gallery</h2>
        <div class="recipe-gallery">
          ${galleryImages
            .map(
              (img, i) => `
            <figure class="gallery-item" data-gallery-index="${i}">
              <img src="${img}" alt="${recipe.name} — view ${i + 1}" loading="lazy" />
            </figure>`
            )
            .join('')}
        </div>
      </section>`
        : '';

    return `
      <!-- Hero image -->
      <section class="recipe-hero">
        <div class="recipe-hero-image" style="background-image: url('${recipe.image}');">
          <div class="recipe-hero-overlay"></div>
          <div class="container recipe-hero-content">
            <a href="recipes.html" class="recipe-back">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            Back to Recipes
            </a>
            <span class="recipe-hero-category">${recipe.category}</span>
            <h1 class="recipe-hero-title">${recipe.name}</h1>
            <p class="recipe-hero-desc">${recipe.shortDescription}</p>
          </div>
        </div>
      </section>

      <!-- Meta bar -->
      <section class="recipe-meta-bar">
        <div class="container recipe-meta-inner">
          <div class="meta-item">
            <span class="meta-label">Prep Time</span>
            <span class="meta-value">${recipe.prepTime}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Cook Time</span>
            <span class="meta-value">${recipe.cookTime}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Servings</span>
            <span class="meta-value">${recipe.servings}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Difficulty</span>
            <span class="meta-value">${recipe.difficulty}</span>
          </div>
        </div>
      </section>

      <!-- Main content -->
      <section class="section recipe-body">
        <div class="container recipe-layout">
          <!-- Ingredients column -->
          <aside class="recipe-ingredients">
            <h2 class="recipe-section-title">Ingredients</h2>
            <ul class="ingredient-list">
              ${ingredients}
            </ul>
            ${buildShareSection(recipe)}
          </aside>

          <!-- Steps column -->
          <div class="recipe-steps">
            <h2 class="recipe-section-title">Preparation</h2>
            <ol class="step-list">
              ${steps}
            </ol>
            ${tags ? `<div class="recipe-tags">${tags}</div>` : ''}
          </div>
        </div>
      </section>

      ${gallery}
    `;
  }

  /* Share functionality */

  function initShare(recipe) {
    const btn = main.querySelector('[data-share]');
    if (!btn) return;

    btn.addEventListener('click', async () => {
      const shareData = {
        title: `${recipe.name} — Foodaholic`,
        text: recipe.shortDescription,
        url: window.location.href,
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(window.location.href);
          btn.querySelector('span').textContent = 'Link Copied!';
          setTimeout(() => {
            btn.querySelector('span').textContent = 'Share Recipe';
          }, 2000);
        }
      } catch (err) {
        // User cancelled share or clipboard denied — silent fail
        console.warn('Share cancelled or failed:', err);
      }
    });
  }

  /* Simple lightbox for gallery */

  function initGallery(images) {
    const figures = main.querySelectorAll('.gallery-item');
    if (!figures.length) return;

    // Build a lightbox element once
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <button class="lightbox-close" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <img class="lightbox-image" src="" alt="" />
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-image');

    function openLightbox(src, alt) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    figures.forEach((fig) => {
      fig.addEventListener('click', () => {
        const img = fig.querySelector('img');
        openLightbox(img.src, img.alt);
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  /* Init */

  document.addEventListener('DOMContentLoaded', async () => {
    const id = getRecipeId();

    if (!id) {
      renderNotFound();
      return;
    }

    try {
      const res = await fetch('assets/data/recipes.json');
      if (!res.ok) throw new Error('Failed to load recipes');
      const data = await res.json();
      const recipe = (data.recipes || []).find((r) => r.id === id);

      if (!recipe) {
        renderNotFound();
        return;
      }

      // Update page title
      document.title = `${recipe.name} — Foodaholic`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', recipe.shortDescription);

      // Render
      main.innerHTML = buildRecipeHTML(recipe);

      // Wire up interactivity
      initShare(recipe);
      const altImage = getAlternateImage(recipe.image);
      initGallery([recipe.image, altImage].filter(Boolean));
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="container not-found"><h1>Oops!</h1><p class="text-muted">Something went wrong loading this recipe.</p></div>`;
    }
  });
})();