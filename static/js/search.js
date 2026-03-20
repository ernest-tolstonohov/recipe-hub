/**
 * search.js — tag-chip ingredient input + fetch search + grid re-render
 */
(function () {
    const inputArea = document.querySelector('.ingredient-input-area');
    const textInput = document.getElementById('ingredient-input');
    const findBtn = document.getElementById('find-recipes-btn');
    const grid = document.getElementById('recipe-grid');
    const mealSelect = document.getElementById('filter-meal');
    const diffSelect = document.getElementById('filter-difficulty');

    if (!textInput || !findBtn || !grid) return;

    let ingredients = ['chicken', 'rice', 'garlic']; // pre-populated from UI

    // Render chips from ingredients array
    function renderChips() {
        // Remove all existing chips
        inputArea.querySelectorAll('.chip').forEach(c => c.remove());
        // Insert chips before the text input
        ingredients.forEach((ing, i) => {
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `<span>${ing}</span><button type="button" data-i="${i}">×</button>`;
            chip.querySelector('button').addEventListener('click', () => {
                ingredients.splice(i, 1);
                renderChips();
            });
            inputArea.insertBefore(chip, textInput);
        });
    }

    renderChips();

    // Add ingredient on Enter or comma
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = textInput.value.trim().replace(/,$/, '');
            if (val && !ingredients.includes(val.toLowerCase())) {
                ingredients.push(val.toLowerCase());
                renderChips();
            }
            textInput.value = '';
        }
    });

    // Build a recipe card HTML string
    function buildCard(recipe) {
        const matchBadge = recipe.match_count > 0
            ? `<span class="match-badge">✓ ${recipe.match_count} of ${recipe.total_ingredients} ingredients matched</span>`
            : '';
        const img = recipe.image_url
            ? `<img class="card-img" src="${recipe.image_url}" alt="${recipe.title}">`
            : `<div class="card-img-placeholder">🍽️</div>`;
        const tagsArr = recipe.tags ? recipe.tags.split(',').map(t => t.trim()) : [];
        const tagHtml = tagsArr.slice(0, 1).map(t => `<span class="tag tag-green">${t}</span>`).join('');

        return `
            <a class="recipe-card" href="/recipes/${recipe.id}">
                <div class="card-img-wrapper">
                    ${matchBadge}
                    ${img}
                </div>
                <div class="card-body">
                    <h3>${recipe.title}</h3>
                    <div class="card-meta">
                        ${tagHtml}
                    </div>
                </div>
            </a>`;
    }

    // Fetch and render results
    async function doSearch() {
        const tags = [];
        if (mealSelect && mealSelect.value) tags.push(mealSelect.value);
        if (diffSelect && diffSelect.value) tags.push(diffSelect.value);

        findBtn.textContent = 'Searching…';
        findBtn.disabled = true;

        try {
            const res = await fetch('/recipes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, tags })
            });

            if (!res.ok) throw new Error('Search failed');
            const data = await res.json();

            if (!data.recipes || data.recipes.length === 0) {
                grid.innerHTML = '<p style="color:#666; padding:2rem 0;">No recipes found matching your ingredients.</p>';
            } else {
                grid.innerHTML = data.recipes.map(buildCard).join('');
            }
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p style="color:#b91c1c; padding:2rem 0;">Search failed. Please try again.</p>';
        } finally {
            findBtn.textContent = 'Find Recipes →';
            findBtn.disabled = false;
        }
    }

    findBtn.addEventListener('click', doSearch);
})();
