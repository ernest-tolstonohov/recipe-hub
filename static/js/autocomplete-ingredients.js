document.addEventListener('DOMContentLoaded', () => {
    // Select elements for the tag builder interface
    const input = document.getElementById('ingredient-autocomplete');
    const dropdown = document.getElementById('ingredient-dropdown');
    const tagsContainer = document.getElementById('ingredient-tags-container');
    
    // Safety check: ensure interface is present on the current page (Add/Edit forms)
    if (!input || !dropdown || !tagsContainer) return;

    // Track the debounce timer for API requests
    let debounceTimer;

    /**
     * Component Function: Generates a visually styled ingredient 'pill' tag.
     * This includes a hidden input so the value is processed by the server-side form parser.
     */
    function addIngredientTag(name) {
        // Create the pill container
        const pill = document.createElement('span');
        pill.className = 'ingredient-pill';
        
        // Add the ingredient name text
        pill.appendChild(document.createTextNode(name));
        
        // Essential: Create a hidden input that maps to the 'ing_name' array in the backend
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'ing_name';
        hiddenInput.value = name;
        pill.appendChild(hiddenInput);
        
        // Create the 'remove' (X) button for the pill
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-pill';
        removeBtn.innerHTML = '✕';
        
        // Bind removal logic directly to the button
        removeBtn.onclick = () => pill.remove();
        pill.appendChild(removeBtn);
        
        // Inject the completed pill into the UI container
        tagsContainer.appendChild(pill);
    }

    // Handle user input for ingredient lookup
    input.addEventListener('input', (e) => {
        // Stop any pending API calls while the user is still typing
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        // Clear suggestions if the search bar is empty
        if (query.length === 0) {
            dropdown.classList.remove('active');
            dropdown.innerHTML = '';
            return;
        }

        // Apply 300ms debouncing logic before querying the database
        debounceTimer = setTimeout(async () => {
            try {
                // Fetch existing ingredients from the /ingredients API filter
                const res = await fetch(`/ingredients?q=${encodeURIComponent(query)}`);
                if (!res.ok) throw new Error('Network query was not ok');
                const ingredients = await res.json();
                
                // Reset the suggestions list
                dropdown.innerHTML = '';
                
                if (ingredients.length === 0) {
                    // Show 'No results' feedback if no match found
                    const li = document.createElement('li');
                    li.textContent = 'No results found';
                    li.classList.add('no-results');
                    dropdown.appendChild(li);
                } else {
                    // Render suggestions list
                    ingredients.forEach(ing => {
                        const li = document.createElement('li');
                        li.textContent = ing.name;
                        
                        // Action: Selecting a suggestion adds the tag and clears the input field
                        li.addEventListener('click', () => {
                            addIngredientTag(ing.name);
                            input.value = ''; // Reset input for the next ingredient
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

    // Close the dropdown if the user clicks away from the component
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    /**
     * UX Feature: Support for custom ingredients.
     * If the user presses 'Enter' and no dropdown is active, add the current text as a tag.
     */
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent accidental form submission
            if (input.value.trim().length > 0 && !dropdown.classList.contains('active')) {
                addIngredientTag(input.value.trim());
                input.value = '';
            }
        }
    });
});
