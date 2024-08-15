# Tasty Bites - Recipe Finder

Tasty Bites is a web application that allows users to search for recipes, view recipe details, rate recipes, and save their favorite recipes. The application uses the Edamam Recipe Search API to fetch recipe data.

## Features

- Search for recipes by ingredients or dish name
- Apply dietary filters to refine search results
- View detailed recipe information, including ingredients, nutrition facts, and source
- Rate recipes and see average ratings
- Save favorite recipes for quick access
- Responsive design for desktop and mobile devices

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Edamam Recipe Search API
- Font Awesome for icons

## Setup and Installation

1. Clone the repository or download the source code.
2. this is the url `https://github.com/Rudhra0811/recipe-app`
3. Open `index.html` in a web browser to run the application locally.
4. Obtain API credentials from [Edamam](https://developer.edamam.com/edamam-recipe-api) and replace the `API_ID` and `API_KEY` variables in `app.js` with your own credentials.

```javascript
const API_ID = 'your_api_id';
const API_KEY = 'your_api_key';
```

## Usage

1. Enter ingredients or a dish name in the search bar and click "Search" or press Enter.
2. Use the dietary filters to refine your search results.
3. Click on "View Recipe" to see detailed information about a recipe.
4. Rate recipes by clicking on the stars in the recipe modal.
5. Add recipes to your favorites by clicking "Add to Favorites" or remove them by clicking "Remove Favorite".
6. Navigate between search results pages using the pagination buttons.

## Project Structure

- `index.html`: Main HTML file containing the structure of the web application
- `styles.css`: CSS file for styling the application
- `app.js`: JavaScript file containing the application logic and API interactions

## API Usage

This project uses the Edamam Recipe Search API. Make sure to comply with their terms of service and usage limits. You may need to upgrade your plan for increased API calls or commercial use.

## Future Improvements

- Implement user authentication for personalized experiences
- Add the ability to share recipes on social media
- Introduce a meal planning feature
- Improve accessibility features
- Implement caching to reduce API calls and improve performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
