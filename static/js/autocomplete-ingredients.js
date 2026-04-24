document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('ingredient-autocomplete');
    const dropdown = document.getElementById('ingredient-dropdown');
    const tagsContainer = document.getElementById('ingredient-tags-container');
    
    if (!input || !dropdown || !tagsContainer) return;

    let debounceTimer;

    function addIngredientTag(name) {
        const pill = document.createElement('span');
        pill.className = 'ingredient-pill';
        
        pill.appendChild(document.createTextNode(name));
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'ing_name';
        hiddenInput.value = name;
        pill.appendChild(hiddenInput);
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-pill';
        removeBtn.innerHTML = '✕';
        removeBtn.onclick = () => pill.remove();
        pill.appendChild(removeBtn);
        
        tagsContainer.appendChild(pill);
    }

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        if (query.length === 0) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`/ingredients?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Network query was not ok');
                const ingredients = await res.json();
                
                dropdown.innerHTML = '';
                
                if (ingredients.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.classList.add('no-results');
                    dropdown.appendChild(li);
                } else {
                    ingredients.forEach(ing => {
                        const li = document.createElement('li');
                        li.textContent = ing.name;
                        li.addEventListener('click', () => {
                            addIngredientTag(ing.name);
                            input.value = '';
                            dropdown.classList.remove('active');
                        });
                        dropdown.appendChild(li);
                    });
                }
                
                dropdown.classList.add('active');
            } catch (err) {
                console.error('Ingredient Autocomplete Error:', err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            if (input.value.trim().length > 0 && !dropdown.classList.contains('active')) {
                addIngredientTag(input.value.trim());
                input.value = '';
            }
        }
    });
});
