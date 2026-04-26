document.addEventListener('DOMContentLoaded', () => {
    // ── Helpers ───────────────────────────────────────────────
    function escHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Ingredient rows with per-row autocomplete ─────────────
    const ingList = document.getElementById('ingredients-list');

    function attachAutocomplete(row) {
        const nameInput = row.querySelector('.ing-name-input');
        const suggestions = row.querySelector('.ing-suggestions');
        const qtyInput   = row.querySelector('.ing-qty-input');
        if (!nameInput || !suggestions) return;

        let debounce, highlightIdx = -1;

        nameInput.addEventListener('input', () => {
            clearTimeout(debounce);
            const q = nameInput.value.trim();
            highlightIdx = -1;
            if (!q) { hide(); return; }
            debounce = setTimeout(() => fetchSuggestions(q), 220);
        });

        async function fetchSuggestions(q) {
            try {
                const res  = await fetch(`/ingredients?q=${encodeURIComponent(q)}`);
                const items = await res.json();
                render(items.slice(0, 8));
            } catch { hide(); }
        }

        function render(items) {
            suggestions.innerHTML = '';
            if (!items.length) { hide(); return; }
            items.forEach(ing => {
                const li = document.createElement('li');
                li.textContent = ing.name;
                li.addEventListener('mousedown', e => {
                    e.preventDefault();
                    confirm(ing.name);
                });
                suggestions.appendChild(li);
            });
            suggestions.classList.add('active');
            highlightIdx = -1;
        }

        function confirm(name) {
            nameInput.value = name;
            hide();
            if (qtyInput) qtyInput.focus();
        }

        function hide() {
            suggestions.classList.remove('active');
            suggestions.innerHTML = '';
            highlightIdx = -1;
        }

        function updateHighlight() {
            suggestions.querySelectorAll('li').forEach((li, i) =>
                li.classList.toggle('highlighted', i === highlightIdx)
            );
        }

        nameInput.addEventListener('keydown', e => {
            const lis  = suggestions.querySelectorAll('li');
            const open = suggestions.classList.contains('active');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!open && nameInput.value.trim()) { fetchSuggestions(nameInput.value.trim()); return; }
                highlightIdx = Math.min(highlightIdx + 1, lis.length - 1);
                updateHighlight();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                highlightIdx = Math.max(highlightIdx - 1, -1);
                updateHighlight();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (open && highlightIdx >= 0 && lis[highlightIdx]) {
                    confirm(lis[highlightIdx].textContent);
                } else if (nameInput.value.trim()) {
                    confirm(nameInput.value.trim());
                }
            } else if (e.key === 'Escape') {
                hide();
            } else if (e.key === 'Tab' && open && highlightIdx >= 0 && lis[highlightIdx]) {
                e.preventDefault();
                confirm(lis[highlightIdx].textContent);
            }
        });

        nameInput.addEventListener('blur', () => setTimeout(hide, 160));

        row.querySelector('.btn-remove-ing').addEventListener('click', () => {
            const rows = ingList.querySelectorAll('.ingredient-row');
            if (rows.length > 1) {
                row.remove();
            } else {
                nameInput.value = '';
                if (qtyInput) qtyInput.value = '';
                const unitInput = row.querySelector('.ing-unit-input');
                if (unitInput) unitInput.value = '';
            }
        });
    }

    function createIngredientRow(name, qty, unit) {
        const row = document.createElement('div');
        row.className = 'ingredient-row';
        row.innerHTML = `
            <div class="ing-name-wrap">
                <input type="text" name="ing_name" value="${escHtml(name)}" placeholder="Ingredient name" autocomplete="off" class="ing-name-input">
                <ul class="ing-suggestions"></ul>
            </div>
            <input type="number" name="ing_qty" value="${escHtml(qty)}" placeholder="Qty" min="0" step="0.01" class="ing-qty-input">
            <input type="text" name="ing_unit" value="${escHtml(unit)}" placeholder="Unit" class="ing-unit-input">
            <button type="button" class="btn-remove-ing" title="Remove">✕</button>
        `;
        attachAutocomplete(row);
        return row;
    }

    function addEmptyRow() {
        const row = createIngredientRow('', '', '');
        ingList.appendChild(row);
        row.querySelector('.ing-name-input').focus();
    }

    if (ingList) {
        ingList.querySelectorAll('.ingredient-row').forEach(attachAutocomplete);
        if (ingList.querySelectorAll('.ingredient-row').length === 0) {
            ingList.appendChild(createIngredientRow('', '', ''));
        }
    }

    const addIngBtn = document.getElementById('add-ingredient');
    if (addIngBtn && ingList) {
        addIngBtn.addEventListener('click', () => {
            const row = createIngredientRow('', '', '');
            ingList.appendChild(row);
            row.querySelector('.ing-name-input').focus();
        });
    }

    // ── Instruction steps ─────────────────────────────────────
    const stepsList = document.getElementById('steps-list');
    if (stepsList) {
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
            row.querySelector('textarea').focus();
        });

        stepsList.addEventListener('click', e => {
            if (e.target.classList.contains('btn-remove-step')) {
                if (stepsList.querySelectorAll('.step-row').length > 1) {
                    e.target.closest('.step-row').remove();
                    renumberSteps();
                }
            }
        });
    }

    // ── Image upload ──────────────────────────────────────────
    const uploadArea    = document.getElementById('upload-area');
    const fileInput     = document.getElementById('recipe_image');
    const uploadPreview = document.getElementById('upload-preview');
    const uploadSection = document.getElementById('upload-section');
    const urlSection    = document.getElementById('url-section');
    const urlInput      = document.getElementById('image_url_input');
    const switchToUrl   = document.getElementById('switch-to-url');

    function showFilePreview(file) {
        const reader = new FileReader();
        reader.onload = e => {
            uploadPreview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="btn-clear-image" id="clear-image">✕ Remove</button>
            `;
            uploadPreview.style.display = 'block';
            if (uploadArea) uploadArea.style.display = 'none';
            document.getElementById('clear-image').addEventListener('click', () => {
                if (fileInput) fileInput.value = '';
                uploadPreview.style.display = 'none';
                uploadPreview.innerHTML = '';
                if (uploadArea) uploadArea.style.display = 'flex';
            });
        };
        reader.readAsDataURL(file);
    }

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', e => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', e => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInput.files = dt.files;
                } catch {}
                showFilePreview(file);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) showFilePreview(fileInput.files[0]);
        });
    }

    if (switchToUrl) {
        switchToUrl.addEventListener('click', e => {
            e.preventDefault();
            const urlVisible = urlSection && urlSection.style.display !== 'none';
            if (urlVisible) {
                if (urlSection) urlSection.style.display = 'none';
                if (uploadSection) uploadSection.style.display = 'block';
                switchToUrl.textContent = 'Or paste an image URL';
            } else {
                if (uploadSection) uploadSection.style.display = 'none';
                if (urlSection) urlSection.style.display = 'block';
                switchToUrl.textContent = 'Or upload a file instead';
                if (urlInput) urlInput.focus();
            }
        });
    }

    if (urlInput) {
        let previewTimer;
        urlInput.addEventListener('input', () => {
            clearTimeout(previewTimer);
            const url = urlInput.value.trim();
            const previewImg = document.getElementById('url-preview-img');
            if (!previewImg) return;
            if (!url) { previewImg.style.display = 'none'; return; }
            previewTimer = setTimeout(() => {
                previewImg.src = url;
                previewImg.style.display = 'block';
                previewImg.onerror = () => { previewImg.style.display = 'none'; };
            }, 600);
        });
    }
});
