document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.ingredient-input-area input');
    const chipContainer = document.querySelector('.ingredient-input-area');
    const findBtn = document.querySelector('.btn-green');
    const recipeGrid = document.querySelector('.recipe-grid');
    
    // Clear initial static chips
    document.querySelectorAll('.chip').forEach(c => c.remove());
    
    let ingredients = [];

    function addChip(text) {
        text = text.trim().toLowerCase();
        if (text && !ingredients.includes(text)) {
            ingredients.push(text);
            
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `<span>${text}</span><button>&times;</button>`;
            
            chip.querySelector('button').addEventListener('click', () => {
                ingredients = ingredients.filter(i => i !== text);
                chip.remove();
            });
            
            chipContainer.insertBefore(chip, input);
        }
        input.value = '';
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addChip(input.value);
        }
    });

    input.addEventListener('blur', () => {
        if (input.value.trim() !== '') {
            addChip(input.value);
        }
    });

    findBtn.addEventListener('click', async () => {
        try {
            // 1. Inject skeleton loaders immediately
            recipeGrid.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                recipeGrid.innerHTML += `
                    <div class="recipe-card">
                        <div class="card-img-placeholder skeleton" style="border-radius: 4px 4px 0 0; border: none; background: transparent; color: transparent;"></div>
                        <div class="card-body">
                            <div class="skeleton skeleton-text" style="height: 16px; width: 85%; margin-bottom: 1rem;"></div>
                            <div class="card-author" style="margin-bottom: 1rem;">
                                <div class="avatar-xs skeleton" style="color:transparent; float:left;"></div>
                                <div class="skeleton skeleton-text" style="height: 12px; width: 45%; margin-top: 4px; margin-left: 0.5rem; float:left;"></div>
                                <div style="clear:both;"></div>
                            </div>
                            <div class="card-meta">
                                <div class="skeleton skeleton-text" style="height: 12px; width: 35%; margin-top: auto;"></div>
                            </div>
                        </div>
                    </div>
                `;
            }

            // 2. Fetch results
            const tags = Array.from(document.querySelectorAll('.filter-row select'))
                .map(s => s.value)
                .filter(v => v !== "");

            const response = await fetch('/recipes/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients, tags })
            });
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            
            // 3. Render results (simulate minimal 500ms network delay to appreciate the skeleton effect)
            setTimeout(() => {
                renderRecipes(data.recipes);
            }, 500);
            
        } catch (err) {
            console.error(err);
            alert('Failed to find recipes. Please try again.');
        }
    });

    function renderRecipes(recipes) {
        recipeGrid.innerHTML = '';
        
        if (recipes.length === 0) {
            recipeGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                    <div class="emoji-placeholder" style="margin-bottom: 1rem;">🥣</div>
                    <h3 style="color: var(--navy); margin-bottom: 0.5rem;">No recipes found</h3>
                    <p style="color: var(--text-muted)">Try adding different ingredients!</p>
                </div>
            `;
            return;
        }

        recipes.forEach(recipe => {
            const hasMatch = ingredients.length > 0;
            const matchBadge = hasMatch ? `<div class="match-badge">${recipe.match_percentage || 100}% Match</div>` : '';
            
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.onclick = () => window.location.href = `/recipes/${recipe.id}`;
            
            const imageHtml = recipe.image_url 
                ? `<img src="${recipe.image_url}" alt="${recipe.title}" style="width:100%; height:100%; object-fit:cover;">`
                : `<span style="font-size:3rem; color:#d1d5db;">🍽️</span>`;

            card.innerHTML = `
                ${matchBadge}
                <div class="card-img-placeholder">
                    ${imageHtml}
                </div>
                <div class="card-body">
                    <h3>${recipe.title}</h3>
                    <div class="card-author">
                        <div class="avatar-xs">${recipe.author ? recipe.author.charAt(0).toUpperCase() : 'C'}</div>
                        <span>@${recipe.author || 'chef'}</span>
                    </div>
                    <div class="card-meta">
                        <span class="stars">★★★★★</span>
                    </div>
                </div>
            `;
            recipeGrid.appendChild(card);
        });
    }
});
