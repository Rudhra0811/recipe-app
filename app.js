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

// Event listeners
searchForm.addEventListener('submit', handleSearch);

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
        const recipeCard = createRecipeCard(recipe.recipe);
        searchResults.appendChild(recipeCard);
    });
}

function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.label}">
        <div class="recipe-card-content">
            <h3>${recipe.label}</h3>
            <p>Calories: ${Math.round(recipe.calories)}</p>
            <p>Ingredients: ${recipe.ingredientLines.length}</p>
            <button class="favorite-btn" data-recipe='${JSON.stringify(recipe)}'>Add to Favorites</button>
        </div>
    `;
    card.querySelector('.favorite-btn').addEventListener('click', handleAddToFavorites);
    return card;
}

function handleAddToFavorites(e) {
    const recipeData = JSON.parse(e.target.getAttribute('data-recipe'));
    addToFavorites(recipeData);
}

function addToFavorites(recipe) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.label === recipe.label)) {
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';
    favorites.forEach(recipe => {
        const recipeCard = createRecipeCard(recipe);
        favoritesList.appendChild(recipeCard);
    });
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