document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-block-user');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
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
            const statusEl = document.getElementById('profile-status');

            if (data.is_active) {
                btn.textContent = 'Block User';
                btn.dataset.active = '1';
                if (statusEl) { statusEl.textContent = 'Active'; statusEl.className = 'status-badge status-active'; }
            } else {
                btn.textContent = 'Unblock User';
                btn.dataset.active = '0';
                if (statusEl) { statusEl.textContent = 'Blocked'; statusEl.className = 'status-badge status-blocked'; }
            }
        } finally {
            btn.disabled = false;
        }
    });
});
