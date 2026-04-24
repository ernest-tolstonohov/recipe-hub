document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('nav-search-bar');
    const dropdown = document.getElementById('nav-search-dropdown');
    
    if (!input || !dropdown) return;
    
    let debounceTimer;

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
                const res = await fetch(`/search/autocomplete?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Search request failed');
                const recipes = await res.json();
                
                dropdown.innerHTML = '';
                
                if (recipes.length === 0) {
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.classList.add('no-results');
                    dropdown.appendChild(li);
                } else {
                    recipes.forEach(recipe => {
                        const li = document.createElement('li');
                        li.textContent = recipe.title;
                        li.addEventListener('click', () => {
                            input.value = recipe.title;
                            dropdown.classList.remove('active');
                        });
                        dropdown.appendChild(li);
                    });
                }
                
                dropdown.classList.add('active');
            } catch (err) {
                console.error('Autocomplete fetch error:', err);
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});
