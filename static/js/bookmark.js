/**
 * bookmark.js — toggle save/unsave a recipe via fetch
 * Requires data-recipe-id, data-user-id, data-saved attrs on #bookmark-btn
 */
(function () {
    const btn = document.getElementById('bookmark-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const recipeId = btn.dataset.recipeId;
        const userId = btn.dataset.userId;
        const isSaved = btn.dataset.saved === 'true';

        const url = `/users/${userId}/saved/${recipeId}`;
        const method = isSaved ? 'DELETE' : 'POST';

        try {
            btn.disabled = true;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                if (res.status === 403) {
                    window.location.href = '/login';
                    return;
                }
                throw new Error('Request failed');
            }

            const data = await res.json();
            btn.dataset.saved = data.saved ? 'true' : 'false';
            btn.querySelector('.label').textContent = data.saved ? '🔖 Saved' : '⊞ Save';
            btn.classList.toggle('saved', data.saved);
        } catch (err) {
            console.error('Bookmark error:', err);
        } finally {
            btn.disabled = false;
        }
    });
})();
