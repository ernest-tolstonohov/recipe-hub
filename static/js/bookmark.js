/*
 * RecipeHub Bookmarking Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Detail Page Bookmark Button
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', async (e) => {
            const userId = bookmarkBtn.dataset.userId;
            const recipeId = bookmarkBtn.dataset.recipeId;
            const isSaved = bookmarkBtn.dataset.saved === 'true';
            
            const method = isSaved ? 'DELETE' : 'POST';
            const url = `/users/${userId}/saved/${recipeId}`;
            
            // Optimistic update
            const oldSaved = isSaved;
            updateBookmarkButton(bookmarkBtn, !oldSaved);
            
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok || data.error) {
                    throw new Error(data.error || 'Failed to update bookmark');
                }
            } catch (err) {
                console.error(err);
                alert('Connection error. Please try again.');
                // Revert UI
                updateBookmarkButton(bookmarkBtn, oldSaved);
            }
        });
    }

    // 2. Saved Page Unsave Buttons
    const unsaveBtns = document.querySelectorAll('.btn-unsave');
    unsaveBtns.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const userId = btn.dataset.userId;
            const recipeId = btn.dataset.recipeId;
            const wrapper = btn.closest('.recipe-card-wrapper');
            
            if (!confirm('Are you sure you want to remove this recipe?')) return;
            
            btn.disabled = true;
            btn.textContent = 'Removing...';
            
            try {
                const response = await fetch(`/users/${userId}/saved/${recipeId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    wrapper.style.opacity = '0';
                    wrapper.style.transform = 'scale(0.95)';
                    setTimeout(() => wrapper.remove(), 300);
                } else {
                    throw new Error('Failed to remove');
                }
            } catch (err) {
                console.error(err);
                btn.disabled = false;
                btn.textContent = '🗑️ Remove';
                alert('Could not remove recipe. Try again later.');
            }
        });
    });

    /**
     * Helper to update bookmark button UI.
     */
    function updateBookmarkButton(btn, saved) {
        btn.dataset.saved = saved ? 'true' : 'false';
        btn.classList.toggle('saved', saved);
        
        const iconSpan = btn.querySelector('.icon');
        const labelSpan = btn.querySelector('.label');
        
        if (saved) {
            iconSpan.textContent = '🔖';
            labelSpan.textContent = 'Saved';
            btn.setAttribute('aria-label', 'Remove bookmark');
        } else {
            iconSpan.textContent = '🏷️';
            labelSpan.textContent = 'Save';
            btn.setAttribute('aria-label', 'Save recipe');
        }
    }
});
