document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.recipe-card[data-id]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            window.location.href = `/recipes/${card.dataset.id}`;
        });
    });

    document.querySelectorAll('.btn-card-edit').forEach(link => {
        link.addEventListener('click', e => e.stopPropagation());
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!confirm('Delete this recipe? This cannot be undone.')) return;
            const id = btn.dataset.id;
            const res = await fetch(`/recipes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                btn.closest('.recipe-card').remove();
            } else {
                alert('Failed to delete recipe.');
            }
        });
    });
});
