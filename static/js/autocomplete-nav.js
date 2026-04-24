document.addEventListener('DOMContentLoaded', () => {
    // Select DOM nodes for the navbar search bar and its respective suggestion dropdown
    const input = document.getElementById('nav-search-bar');
    const dropdown = document.getElementById('nav-search-dropdown');
    
    // Safety check: ensure elements exist before attaching listeners
    if (!input || !dropdown) return;
    
    // Variable to track the timer for the 300ms debounce window
    let debounceTimer;

    // Listen for every keystroke in the search field
    input.addEventListener('input', (e) => {
        // Clear the previous timer if the user types again before 300ms passes
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        // If the input is empty, instantly collapse the dropdown and clear contents
        if (query.length === 0) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        // Start the debounce window: wait 300ms since the last keystroke before firing the API request
        debounceTimer = setTimeout(async () => {
            try {
                // Query the backend autocomplete API with the sanitized user search string
                const res = await fetch(`/search/autocomplete?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Search request failed');
                const recipes = await res.json();
                
                // Clear out stale suggestions before rendering new ones
                dropdown.innerHTML = '';
                
                if (recipes.length === 0) {
                    // Feedback UI: explicitly show 'No results' state if the API array is empty
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.classList.add('no-results');
                    dropdown.appendChild(li);
                } else {
                    // Iterate and render result titles matching the search
                    recipes.forEach(recipe => {
                        const li = document.createElement('li');
                        li.textContent = recipe.title;
                        
                        // Handle suggestion selection
                        li.addEventListener('click', () => {
                            input.value = recipe.title; // Populate the search input
                            dropdown.classList.remove('active'); // Close the dropdown
                        });
                        dropdown.appendChild(li);
                    });
                }
                
                // Make the dropdown visible if it contains suggestions
                dropdown.classList.add('active');
            } catch (err) {
                console.error('Autocomplete fetch error:', err);
            }
        }, 300);
    });

    // UX Refinement: Collapse the dropdown if the user clicks anywhere outside of it or the input
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});
