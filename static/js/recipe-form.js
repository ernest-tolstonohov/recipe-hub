// ── Dynamic ingredient rows ───────────────────────────
const ingList = document.getElementById('ingredients-list');

document.getElementById('add-ingredient').addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" name="ing_name" placeholder="Ingredient name">
        <input type="number" name="ing_qty" placeholder="Qty" min="0" step="0.01">
        <input type="text" name="ing_unit" placeholder="Unit (g, ml...)">
        <button type="button" class="btn-remove">✕</button>
    `;
    ingList.appendChild(row);
});

ingList.addEventListener('click', e => {
    if (e.target.classList.contains('btn-remove')) {
        e.target.closest('.ingredient-row').remove();
    }
});

// ── Dynamic instruction steps ─────────────────────────
const stepsList = document.getElementById('steps-list');

function renumberSteps() {
    stepsList.querySelectorAll('.step-row').forEach((row, i) => {
        row.querySelector('.step-number').textContent = i + 1;
        row.querySelector('textarea').name = 'step_' + (i + 1);
    });
}

document.getElementById('add-step').addEventListener('click', () => {
    const count = stepsList.querySelectorAll('.step-row').length + 1;
    const row = document.createElement('div');
    row.className = 'step-row';
    row.innerHTML = `
        <div class="step-number">${count}</div>
        <textarea name="step_${count}" rows="2" placeholder="Describe this step..."></textarea>
        <button type="button" class="btn-remove-step">✕</button>
    `;
    stepsList.appendChild(row);
});

stepsList.addEventListener('click', e => {
    if (e.target.classList.contains('btn-remove-step')) {
        if (stepsList.querySelectorAll('.step-row').length > 1) {
            e.target.closest('.step-row').remove();
            renumberSteps();
        }
    }
});
