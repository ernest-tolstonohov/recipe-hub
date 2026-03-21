// Review functionality for recipe detail page
document.addEventListener('DOMContentLoaded', function() {
    const stars = document.querySelectorAll('.star');
    const reviewForm = document.getElementById('review-form');
    let selectedRating = 0;

    // Star rating selection for new review
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            updateStars(selectedRating);
        });

        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.dataset.rating);
            updateStars(rating);
        });

        star.addEventListener('mouseout', function() {
            updateStars(selectedRating);
        });
    });

    function updateStars(rating) {
        stars.forEach((star, index) => {
            star.textContent = index < rating ? '★' : '☆';
        });
    }

    // Submit new review
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (selectedRating === 0) {
                alert('Please select a rating.');
                return;
            }

            const body = this.body.value.trim();
            const recipeId = window.location.pathname.split('/').pop();

            try {
                const response = await fetch(`/reviews/recipe/${recipeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rating: selectedRating, body }),
                });

                if (response.ok) {
                    location.reload();
                } else {
                    const error = await response.json();
                    alert('Error: ' + error.error);
                }
            } catch (err) {
                console.error('Error submitting review:', err);
                alert('Failed to submit review. Please try again.');
            }
        });
    }

    // Edit and delete reviews
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.dataset.reviewId;
            const card = this.closest('.review-card');
            const bodyP = card.querySelector('p');
            const starsSpan = card.querySelector('.review-stars');

            // Simple inline edit: replace text with input
            const currentBody = bodyP.textContent.replace(/"/g, '');
            const currentRating = starsSpan.textContent.split('★').length - 1;

            bodyP.innerHTML = `<textarea>${currentBody}</textarea>`;
            starsSpan.innerHTML = Array(5).fill().map((_, i) => `<span class="edit-star" data-rating="${i+1}">${i < currentRating ? '★' : '☆'}</span>`).join('');

            this.textContent = 'Save';
            this.classList.add('saving');

            // Handle star selection for edit
            card.querySelectorAll('.edit-star').forEach(star => {
                star.addEventListener('click', function() {
                    const rating = parseInt(this.dataset.rating);
                    card.querySelectorAll('.edit-star').forEach((s, idx) => {
                        s.textContent = idx < rating ? '★' : '☆';
                    });
                });
            });

            this.onclick = async function() {
                const newBody = card.querySelector('textarea').value.trim();
                const newRating = Array.from(card.querySelectorAll('.edit-star')).filter(s => s.textContent === '★').length;

                try {
                    const response = await fetch(`/reviews/${reviewId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rating: newRating, body: newBody }),
                    });

                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('Error updating review.');
                    }
                } catch (err) {
                    alert('Failed to update review.');
                }
            };
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!confirm('Are you sure you want to delete this review?')) return;

            const reviewId = this.dataset.reviewId;

            try {
                const response = await fetch(`/reviews/${reviewId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    location.reload();
                } else {
                    alert('Error deleting review.');
                }
            } catch (err) {
                alert('Failed to delete review.');
            }
        });
    });
});
