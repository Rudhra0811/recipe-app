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
const dietaryFilters = document.querySelectorAll('#dietary-filters input[type="checkbox"]');
const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const starRating = document.querySelector('.star-rating');
const averageRatingSpan = document.querySelector('#average-rating span');

// Pagination state
let currentPage = 1;
let totalResults = 0;
let resultsPerPage = 20;
let currentQuery = '';
let currentFilters = {};
let currentRecipe = null;

// Event listeners
searchForm.addEventListener('submit', handleSearch);
closeModal.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});
dietaryFilters.forEach(filter => filter.addEventListener('change', handleSearch));
prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
starRating.addEventListener('click', handleRating);

// Functions
function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
        currentPage = 1;
        currentQuery = query;
        currentFilters = getSelectedFilters();
        showLoadingSpinner();
        searchRecipes(query, currentFilters, currentPage);
    }
}

function getSelectedFilters() {
    const filters = {
        diet: [],
        health: []
    };
    dietaryFilters.forEach(filter => {
        if (filter.checked) {
            if (filter.name === 'diet') {
                filters.diet.push(filter.value);
            } else if (filter.name === 'health') {
                filters.health.push(filter.value);
            }
        }
    });
    return filters;
}

async function searchRecipes(query, filters, page) {
    try {
        const from = (page - 1) * resultsPerPage;
        const to = from + resultsPerPage;
        let url = `${API_URL}?q=${query}&app_id=${API_ID}&app_key=${API_KEY}&from=${from}&to=${to}`;

        if (filters.diet.length > 0) {
            url += `&diet=${filters.diet.join('&diet=')}`;
        }
        if (filters.health.length > 0) {
            url += `&health=${filters.health.join('&health=')}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        hideLoadingSpinner();
        totalResults = data.count;
        displaySearchResults(data.hits);
        updatePagination();
    } catch (error) {
        console.error('Error fetching recipes:', error);
        hideLoadingSpinner();
        displayError('An error occurred while fetching recipes. Please try again.');
    }
}

function displaySearchResults(recipes) {
    searchResults.innerHTML = '';
    if (recipes.length === 0) {
        searchResults.innerHTML = '<p>No recipes found. Please try a different search term or adjust your filters.</p>';
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
        <p>${recipe.dietLabels.length ? recipe.dietLabels.join(', ') : 'None'}</p>
        <h3>Health Labels:</h3>
        <p>${recipe.healthLabels.join(', ')}</p>
        <h3>Source:</h3>
        <p><a href="${recipe.url}" target="_blank" rel="noopener noreferrer">${recipe.source}</a></p>
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

function updatePagination() {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    pagination.classList.remove('hidden');
}

function changePage(newPage) {
    currentPage = newPage;
    showLoadingSpinner();
    searchRecipes(currentQuery, currentFilters, currentPage);
}

function createRecipeCard(recipe, isFavorite = false) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    const averageRating = getAverageRating(recipe.label);
    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.label}">
        <div class="recipe-card-content">
            <h3>${recipe.label}</h3>
            <p>Calories: ${Math.round(recipe.calories)}</p>
            <p>Ingredients: ${recipe.ingredientLines.length}</p>
            <div class="rating">
                ${averageRating > 0 ? `Average Rating: ${averageRating.toFixed(1)} ⭐` : 'Not rated yet'}
            </div>
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

function displayRecipeModal(recipe) {
    currentRecipe = recipe;
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
        <p>${recipe.dietLabels.length ? recipe.dietLabels.join(', ') : 'None'}</p>
        <h3>Health Labels:</h3>
        <p>${recipe.healthLabels.join(', ')}</p>
        <h3>Source:</h3>
        <p><a href="${recipe.url}" target="_blank" rel="noopener noreferrer">${recipe.source}</a></p>
    `;

    updateStarRating();
    showModal();
}

function handleRating(e) {
    if (e.target.classList.contains('star')) {
        const rating = parseInt(e.target.getAttribute('data-rating'));
        saveRating(currentRecipe.label, rating);
        updateStarRating();
    }
}

function saveRating(recipeLabel, rating) {
    let ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    if (!ratings[recipeLabel]) {
        ratings[recipeLabel] = [];
    }
    ratings[recipeLabel].push(rating);
    localStorage.setItem('ratings', JSON.stringify(ratings));
}

function getAverageRating(recipeLabel) {
    const ratings = JSON.parse(localStorage.getItem('ratings')) || {};
    const recipeRatings = ratings[recipeLabel] || [];
    if (recipeRatings.length === 0) return 0;
    const sum = recipeRatings.reduce((a, b) => a + b, 0);
    return sum / recipeRatings.length;
}

function updateStarRating() {
    const averageRating = getAverageRating(currentRecipe.label);
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < Math.round(averageRating)) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    averageRatingSpan.textContent = averageRating > 0 ? averageRating.toFixed(1) : 'Not rated yet';
}

// Initialize the app
function init() {
    displayFavorites();
}

init();