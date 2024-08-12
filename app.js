// API configuration
const API_ID = 'c511a929';
const API_KEY = 'd67ff9ec0a6b8770d581c64835a98a62';
const API_URL = 'https://api.edamam.com/search';

// DOM elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const favoritesList = document.getElementById('favorites-list');
const loadingSpinner = document.getElementById('loading-spinner');
const modal = document.getElementById('recipe-modal');
const modalTitle = document.getElementById('modal-recipe-title');
const modalImage = document.getElementById('modal-recipe-image');
const modalDetails = document.getElementById('modal-recipe-details');
const closeModal = document.querySelector('.close');

// Event listeners
searchForm.addEventListener('submit', handleSearch);
closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});

// Functions
function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        showLoadingSpinner();
        searchRecipes(query);
    }
}

async function searchRecipes(query) {
    try {
        const response = await fetch(`${API_URL}?q=${query}&app_id=${API_ID}&app_key=${API_KEY}&from=0&to=20`);
        const data = await response.json();
        hideLoadingSpinner();
        displaySearchResults(data.hits);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        hideLoadingSpinner();
        displayError('An error occurred while fetching recipes. Please try again.');
    }
}

function displaySearchResults(recipes) {
    searchResults.innerHTML = '';
    if (recipes.length === 0) {
        searchResults.innerHTML = '<p>No recipes found. Please try a different search term.</p>';
        return;
    }
    recipes.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe.recipe, false);
        searchResults.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe, isFavorite = false) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.label}">
        <div class="recipe-card-content">
            <h3>${recipe.label}</h3>
            <p>Calories: ${Math.round(recipe.calories)}</p>
            <p>Ingredients: ${recipe.ingredientLines.length}</p>
            <button class="view-recipe-btn" data-recipe='${JSON.stringify(recipe)}'>View Recipe</button>
            ${isFavorite
            ? `<button class="remove-favorite-btn" data-recipe='${JSON.stringify(recipe)}'>Remove Favorite</button>`
            : `<button class="favorite-btn" data-recipe='${JSON.stringify(recipe)}'>Add to Favorites</button>`
        }
        </div>
    `;
    card.querySelector('.view-recipe-btn').addEventListener('click', handleViewRecipe);
    if (isFavorite) {
        card.querySelector('.remove-favorite-btn').addEventListener('click', handleRemoveFromFavorites);
    } else {
        card.querySelector('.favorite-btn').addEventListener('click', handleAddToFavorites);
    }
    return card;
}

function handleViewRecipe(e) {
    const recipeData = JSON.parse(e.target.getAttribute('data-recipe'));
    displayRecipeModal(recipeData);
}

function handleAddToFavorites(e) {
    const recipeData = JSON.parse(e.target.getAttribute('data-recipe'));
    addToFavorites(recipeData);
}

function handleRemoveFromFavorites(e) {
    const recipeData = JSON.parse(e.target.getAttribute('data-recipe'));
    removeFromFavorites(recipeData);
}

function addToFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.label === recipe.label)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function removeFromFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.label !== recipe.label);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>You have no favorite recipes yet.</p>';
        return;
    }
    favorites.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe, true);
        favoritesList.appendChild(recipeCard);
    });
}

function displayRecipeModal(recipe) {
    modalTitle.textContent = recipe.label;
    modalImage.src = recipe.image;
    modalImage.alt = recipe.label;

    modalDetails.innerHTML = `
        <h3>Ingredients:</h3>
        <ul>
            ${recipe.ingredientLines.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <h3>Nutrition:</h3>
        <p>Calories: ${Math.round(recipe.calories)}</p>
        <p>Servings: ${recipe.yield}</p>
        <h3>Diet Labels:</h3>
        <p>${recipe.dietLabels.join(', ') || 'None'}</p>
        <h3>Health Labels:</h3>
        <p>${recipe.healthLabels.join(', ')}</p>
        <h3>Source:</h3>
        <p><a href="${recipe.url}" target="_blank">${recipe.source}</a></p>
    `;

    showModal();
}

function showModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showLoadingSpinner() {
    loadingSpinner.classList.remove('hidden');
}

function hideLoadingSpinner() {
    loadingSpinner.classList.add('hidden');
}

function displayError(message) {
    searchResults.innerHTML = `<p class="error">${message}</p>`;
}

// Initialize the app
function init() {
    displayFavorites();
}

init();