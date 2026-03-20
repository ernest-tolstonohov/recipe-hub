document.addEventListener('DOMContentLoaded', () => {
    const inputArea   = document.getElementById('ingredient-input-area');
    const panel       = document.getElementById('ingredient-panel');
    const ingSearch   = document.getElementById('ing-search');
    const ingList     = document.getElementById('ing-list');
    const chipsWrap        = document.getElementById('chips-container');
    const chipsPlaceholder = document.getElementById('chips-placeholder');
    const findBtn     = document.getElementById('find-btn');
    const recipeGrid  = document.getElementById('recipe-grid');
    const heading     = document.getElementById('results-heading');
    const countBadge  = document.getElementById('results-count');
    const spinner     = document.getElementById('spinner');

    let allIngredients = [];   // [{id, name}] from API
    let selected = new Set();  // selected ingredient names
    let loaded = false;

    // ── Open panel when clicking the input area ──────────────
    inputArea.addEventListener('click', async () => {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block' && !loaded) {
            await loadIngredients();
        }
        if (panel.style.display === 'block') {
            ingSearch.focus();
        }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!inputArea.contains(e.target) && !panel.contains(e.target)) {
            panel.style.display = 'none';
        }
    });

    // ── Load ingredients from API (once) ─────────────────────
    async function loadIngredients() {
        try {
            const res = await fetch('/ingredients');
            allIngredients = await res.json();
            loaded = true;
            renderIngredientList(allIngredients);
        } catch (err) {
            ingList.innerHTML = '<p style="color:red;font-size:0.85rem;padding:0.5rem;">Failed to load ingredients.</p>';
        }
    }

    // ── Filter ingredient list as user types ─────────────────
    ingSearch.addEventListener('input', () => {
        const q = ingSearch.value.toLowerCase();
        const filtered = allIngredients.filter(i => i.name.toLowerCase().includes(q));
        renderIngredientList(filtered);
    });

    // Stop click inside search from closing panel
    ingSearch.addEventListener('click', (e) => e.stopPropagation());

    // ── Render checkbox list ──────────────────────────────────
    function renderIngredientList(ingredients) {
        ingList.innerHTML = '';

        if (ingredients.length === 0) {
            ingList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">No ingredients found.</p>';
            return;
        }

        ingredients.forEach(ing => {
            const label = document.createElement('label');
            label.className = 'ing-check-item';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = ing.name;
            cb.checked = selected.has(ing.name);

            cb.addEventListener('change', (e) => {
                e.stopPropagation();
                if (cb.checked) {
                    selected.add(ing.name);
                } else {
                    selected.delete(ing.name);
                }
                renderChips();
            });

            const nameSpan = document.createElement('span');
            nameSpan.textContent = ing.name;

            label.append(cb, nameSpan);
            ingList.appendChild(label);
        });
    }

    // ── Render chips in the input bar ─────────────────────────
    function renderChips() {
        chipsWrap.innerHTML = '';
        chipsPlaceholder.style.display = selected.size === 0 ? 'inline' : 'none';
        selected.forEach(name => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `<span>${name}</span><button type="button">&times;</button>`;
            chip.querySelector('button').addEventListener('click', (e) => {
                e.stopPropagation();
                selected.delete(name);
                renderChips();
                // Uncheck in the panel list if open
                const cb = ingList.querySelector(`input[value="${name}"]`);
                if (cb) cb.checked = false;
            });
            chipsWrap.appendChild(chip);
        });
    }

    // ── Central search function ───────────────────────────────
    async function runSearch() {
        panel.style.display = 'none';
        const ingredients = [...selected];
        const difficulty  = document.getElementById('filter-difficulty').value;
        const filterTags  = [
            document.getElementById('filter-meal').value,
            document.getElementById('filter-dietary').value,
            ...[...selectedTags],
        ].filter(v => v);
        const matchMode   = document.querySelector('input[name="match_mode"]:checked').value;
        const hasFilters  = ingredients.length > 0 || filterTags.length > 0;

        // If no ingredients or tags — filter ALL_RECIPES client-side
        if (!hasFilters) {
            let recipes = window.ALL_RECIPES;
            if (difficulty) recipes = recipes.filter(r => r.difficulty === difficulty);
            heading.textContent = difficulty
                ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Recipes`
                : 'All Recipes';
            renderCards(recipes, false);
            return;
        }

        findBtn.textContent = 'Searching…';
        findBtn.disabled = true;
        spinner.style.display = 'block';
        recipeGrid.style.display = 'none';

        try {
            const res = await fetch('/recipes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, tags: filterTags, matchMode })
            });
            if (!res.ok) throw new Error();
            let { recipes } = await res.json();
            if (difficulty) recipes = recipes.filter(r => r.difficulty === difficulty);

            const parts = [];
            if (ingredients.length) parts.push(ingredients.join(', '));
            if (selectedTags.size) parts.push([...selectedTags].join(', '));
            heading.textContent = parts.length ? `Results for: ${parts.join(' · ')}` : 'All Recipes';

            renderCards(recipes, ingredients.length > 0);
        } catch {
            alert('Search failed. Please try again.');
        } finally {
            findBtn.textContent = 'Find Recipes →';
            findBtn.disabled = false;
            spinner.style.display = 'none';
            recipeGrid.style.display = 'grid';
        }
    }

    findBtn.addEventListener('click', runSearch);

    // ── Tag clicks (sidebar) ──────────────────────────────────
    let selectedTags = new Set();

    document.querySelectorAll('.tags-wrap .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const name = tag.dataset.tag;
            if (selectedTags.has(name)) {
                selectedTags.delete(name);
                tag.classList.remove('tag-active');
            } else {
                selectedTags.add(name);
                tag.classList.add('tag-active');
            }
            runSearch();
        });
    });

    // ── Render recipe cards ───────────────────────────────────
    function renderCards(recipes, showMatch) {
        recipeGrid.innerHTML = '';
        countBadge.textContent = recipes ? `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''}` : '';

        if (!recipes || recipes.length === 0) {
            recipeGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:4rem;background:var(--white);border:1px dashed var(--border);border-radius:8px;">
                    <span style="font-size:3rem;display:block;margin-bottom:1rem;">🔍</span>
                    <h3 style="color:var(--navy);margin-bottom:0.5rem;">No recipes found</h3>
                    <p style="color:var(--text-muted);">Try different ingredients or remove some filters.</p>
                </div>`;
            return;
        }

        recipes.forEach(recipe => {
            const matchBadge = showMatch && recipe.match_percentage != null
                ? `<div class="match-badge">${recipe.match_percentage}% Match</div>` : '';
            const img = recipe.image_url
                ? `<img src="${recipe.image_url}" alt="${recipe.title}" style="width:100%;height:100%;object-fit:cover;">`
                : `<span style="font-size:3rem;color:#d1d5db;">🍽️</span>`;
            const rating = parseFloat(recipe.avg_rating) > 0
                ? `★ ${parseFloat(recipe.avg_rating).toFixed(1)}` : 'No reviews';
            const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
            const diff = recipe.difficulty || '';

            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `/recipes/${recipe.id}`;
            card.innerHTML = `
                ${matchBadge}
                <div class="card-img-placeholder">${img}</div>
                <div class="card-body">
                    <h3>${recipe.title}</h3>
                    <div class="card-author">
                        <div class="avatar-xs">${recipe.author ? recipe.author[0].toUpperCase() : 'C'}</div>
                        <span>@${recipe.author || 'chef'}</span>
                    </div>
                    <div class="card-meta">
                        <span style="font-size:0.85rem;color:var(--text-muted);">${rating}</span>
                        <span class="difficulty-badge diff-${diff}">${diff}</span>
                    </div>
                    <div class="card-times" style="display:flex;gap:0.75rem;margin-top:0.5rem;font-size:0.8rem;color:var(--text-muted);">
                        <span>⏱ ${totalTime} min</span>
                        <span>🍽 ${recipe.servings || '?'} servings</span>
                    </div>
                </div>`;
            recipeGrid.appendChild(card);
        });
    }
});
