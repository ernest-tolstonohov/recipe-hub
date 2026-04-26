document.addEventListener('DOMContentLoaded', () => {
    // ── Reviews toggle ─────────────────────────────────
    document.querySelectorAll('.reviews-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = document.getElementById(btn.dataset.target);
            const icon = btn.querySelector('.toggle-icon');
            const isOpen = panel.classList.contains('open');
            panel.classList.toggle('open', !isOpen);
            icon.textContent = isOpen ? '▶' : '▼';
        });
    });

    // ── Block / Unblock user ───────────────────────────
    document.querySelectorAll('.btn-toggle-user').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.id;
            const isActive = btn.dataset.active === '1';
            if (!confirm(`Are you sure you want to ${isActive ? 'block' : 'unblock'} this user?`)) return;

            btn.disabled = true;
            try {
                const res = await fetch(`/system-control/users/${userId}/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    alert(data.error || 'Failed to update user status.');
                    return;
                }
                const data = await res.json();
                const row = btn.closest('tr');
                const badge = row.querySelector('.status-badge');

                if (data.is_active) {
                    btn.textContent = 'Block';
                    btn.dataset.active = '1';
                    badge.textContent = 'Active';
                    badge.className = 'status-badge status-active';
                    row.classList.remove('row-blocked');
                } else {
                    btn.textContent = 'Unblock';
                    btn.dataset.active = '0';
                    badge.textContent = 'Blocked';
                    badge.className = 'status-badge status-blocked';
                    row.classList.add('row-blocked');
                }
            } finally {
                btn.disabled = false;
            }
        });
    });

    // ── Delete recipe ──────────────────────────────────
    document.querySelectorAll('.btn-delete-recipe').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete this recipe and all its reviews? This cannot be undone.')) return;
            btn.disabled = true;
            try {
                const res = await fetch(`/system-control/recipes/${btn.dataset.id}`, { method: 'DELETE' });
                if (res.ok) {
                    btn.closest('.admin-recipe-card').remove();
                } else {
                    alert('Failed to delete recipe.');
                }
            } finally {
                btn.disabled = false;
            }
        });
    });

    // ── Delete review ──────────────────────────────────
    document.querySelectorAll('.btn-delete-review').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Delete this review?')) return;
            btn.disabled = true;
            try {
                const res = await fetch(`/system-control/reviews/${btn.dataset.id}`, { method: 'DELETE' });
                if (res.ok) {
                    const item = btn.closest('.admin-review-item');
                    const card = item.closest('.admin-recipe-card');
                    item.remove();

                    const remaining = card.querySelectorAll('.admin-review-item').length;
                    const countEl = card.querySelector('.review-count');
                    if (countEl) countEl.textContent = `${remaining} review(s)`;

                    if (remaining === 0) {
                        card.querySelector('.reviews-panel')?.remove();
                        card.querySelector('.reviews-toggle')?.remove();
                    }
                } else {
                    alert('Failed to delete review.');
                }
            } finally {
                btn.disabled = false;
            }
        });
    });
});
