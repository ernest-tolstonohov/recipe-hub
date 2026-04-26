document.addEventListener('DOMContentLoaded', () => {
    // ── Delete recipe (admin / owner) ─────────────────
    const deleteRecipeBtn = document.getElementById('btn-delete-recipe');
    if (deleteRecipeBtn) {
        deleteRecipeBtn.addEventListener('click', async () => {
            if (!confirm('Delete this recipe? This cannot be undone.')) return;
            deleteRecipeBtn.disabled = true;
            const res = await fetch(`/recipes/${deleteRecipeBtn.dataset.recipeId}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.href = '/';
            } else {
                alert('Failed to delete recipe.');
                deleteRecipeBtn.disabled = false;
            }
        });
    }

    // ── Servings stepper ─────────────────────────────
    const srvCount = document.getElementById('srv-count');
    const srvMinus = document.getElementById('srv-minus');
    const srvPlus  = document.getElementById('srv-plus');
    const ingTexts = document.querySelectorAll('.ing-text');

    if (!srvCount || !srvMinus || !srvPlus) return;

    const baseServings = parseInt(srvCount.textContent);
    let currentServings = baseServings;

    ingTexts.forEach(el => {
        el.dataset.original = el.textContent.trim();
    });

    function updateIngredients() {
        const ratio = currentServings / baseServings;
        ingTexts.forEach(el => {
            const original = el.dataset.original;
            el.textContent = original.replace(/^[\d.]+/, n => {
                const scaled = parseFloat(n) * ratio;
                return Number.isInteger(scaled) ? scaled : scaled.toFixed(2);
            });
        });
    }

    srvMinus.addEventListener('click', () => {
        if (currentServings > 1) {
            currentServings--;
            srvCount.textContent = currentServings;
            updateIngredients();
        }
    });

    srvPlus.addEventListener('click', () => {
        currentServings++;
        srvCount.textContent = currentServings;
        updateIngredients();
    });

    // ── Ingredient tick-off + progress bar ───────────
    const checkboxes   = document.querySelectorAll('.ing-checkbox');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const total = checkboxes.length;

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('.ing-checkbox:checked').length;
            const pct = total > 0 ? (checked / total) * 100 : 0;
            if (progressFill) {
                progressFill.style.width = pct + '%';
                progressFill.style.background = checked === 0 ? 'transparent' : '';
            }
            if (progressText) progressText.innerText = 'You have ' + checked + ' of ' + total + ' ingredients';
            cb.closest('.ingredient-item').classList.toggle('checked', cb.checked);
        });
    });
});
