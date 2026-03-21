document.addEventListener('DOMContentLoaded', function () {
    // ── Write review: star rating ──────────────────────────────
    const stars = document.querySelectorAll('.stars-input .star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function () {
            selectedRating = parseInt(this.dataset.rating);
            updateWriteStars(selectedRating);
        });
        star.addEventListener('mouseover', function () {
            updateWriteStars(parseInt(this.dataset.rating));
        });
        star.addEventListener('mouseout', function () {
            updateWriteStars(selectedRating);
        });
    });

    function updateWriteStars(rating) {
        stars.forEach((star, i) => {
            star.textContent = i < rating ? '★' : '☆';
        });
    }

    // ── Submit new review ──────────────────────────────────────
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (selectedRating === 0) return alert('Please select a star rating.');

            const body = this.querySelector('textarea[name="body"]').value.trim();
            const recipeId = window.location.pathname.split('/').pop();

            const res = await fetch(`/reviews/recipe/${recipeId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating: selectedRating, body }),
            });

            if (res.ok) {
                location.reload();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to submit review.');
            }
        });
    }

    // ── Edit review ────────────────────────────────────────────
    document.querySelectorAll('.btn-edit-review').forEach(btn => {
        btn.addEventListener('click', function () {
            const card = this.closest('.review-card');
            if (card.querySelector('.review-edit-form')) return; // already open

            const reviewId = this.dataset.reviewId;
            const currentBody = this.dataset.body || '';
            const currentRating = parseInt(this.dataset.rating) || 0;

            // Hide existing content
            card.querySelectorAll('p, .review-stars, .review-actions').forEach(el => el.style.display = 'none');

            // Build inline edit form
            const form = document.createElement('div');
            form.className = 'review-edit-form';

            const starsRow = document.createElement('div');
            starsRow.className = 'review-edit-stars';
            let editRating = currentRating;

            for (let i = 1; i <= 5; i++) {
                const s = document.createElement('span');
                s.className = 'edit-star';
                s.textContent = i <= currentRating ? '★' : '☆';
                s.dataset.rating = i;
                s.addEventListener('click', () => {
                    editRating = i;
                    starsRow.querySelectorAll('.edit-star').forEach((st, idx) => {
                        st.textContent = idx < i ? '★' : '☆';
                    });
                });
                s.addEventListener('mouseover', () => {
                    starsRow.querySelectorAll('.edit-star').forEach((st, idx) => {
                        st.textContent = idx < i ? '★' : '☆';
                    });
                });
                s.addEventListener('mouseout', () => {
                    starsRow.querySelectorAll('.edit-star').forEach((st, idx) => {
                        st.textContent = idx < editRating ? '★' : '☆';
                    });
                });
                starsRow.appendChild(s);
            }

            const textarea = document.createElement('textarea');
            textarea.value = currentBody;
            textarea.placeholder = 'Update your review...';

            const actions = document.createElement('div');
            actions.className = 'review-edit-actions';

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-save-review';
            saveBtn.textContent = 'Save';

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-cancel-review';
            cancelBtn.textContent = 'Cancel';

            cancelBtn.addEventListener('click', () => {
                form.remove();
                card.querySelectorAll('p, .review-stars, .review-actions').forEach(el => el.style.display = '');
            });

            saveBtn.addEventListener('click', async () => {
                const res = await fetch(`/reviews/${reviewId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating: editRating, body: textarea.value.trim() }),
                });
                if (res.ok) {
                    location.reload();
                } else {
                    alert('Failed to update review.');
                }
            });

            actions.append(saveBtn, cancelBtn);
            form.append(starsRow, textarea, actions);
            card.appendChild(form);
        });
    });

    // ── Delete review ──────────────────────────────────────────
    document.querySelectorAll('.btn-delete-review').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!confirm('Delete this review?')) return;

            const res = await fetch(`/reviews/${this.dataset.reviewId}`, { method: 'DELETE' });
            if (res.ok) {
                location.reload();
            } else {
                alert('Failed to delete review.');
            }
        });
    });
});
