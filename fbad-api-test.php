<?php
/*
 * Template Name: Recipe API Test
 * Description: Test page for Spoonacular API integration
 */

get_header();
?>

<div class="api-test-container" style="max-width: 1200px; margin: 40px auto; padding: 20px;">
    <h1>Spoonacular API Test</h1>
    
    <!-- Search Form -->
    <div class="search-section" style="margin-bottom: 40px;">
        <h2>Search Recipes</h2>
        <form id="recipe-search-form" style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input 
                type="text" 
                id="recipe-query" 
                placeholder="Enter a recipe or ingredient (e.g., pasta, chicken)" 
                style="flex: 1; padding: 10px; font-size: 16px;"
                required
            >
            <button type="submit" style="padding: 10px 20px; background: #0073aa; color: white; border: none; cursor: pointer;">
                Search
            </button>
        </form>
        
        <div id="search-loading" style="display: none; padding: 20px; text-align: center;">
            <p>Searching...</p>
        </div>
        
        <div id="search-error" style="display: none; padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px;">
        </div>
        
        <div id="search-results"></div>
    </div>
    
    <!-- Get Recipe by ID -->
    <div class="get-recipe-section" style="margin-bottom: 40px;">
        <h2>Get Recipe by ID</h2>
        <form id="get-recipe-form" style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input 
                type="number" 
                id="recipe-id" 
                placeholder="Enter recipe ID (e.g., 716429)" 
                style="flex: 1; padding: 10px; font-size: 16px;"
                required
            >
            <button type="submit" style="padding: 10px 20px; background: #0073aa; color: white; border: none; cursor: pointer;">
                Get Recipe
            </button>
        </form>
        
        <div id="recipe-loading" style="display: none; padding: 20px; text-align: center;">
            <p>Loading recipe...</p>
        </div>
        
        <div id="recipe-error" style="display: none; padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px;">
        </div>
        
        <div id="recipe-details"></div>
    </div>
    
    <!-- API Status -->
    <div class="api-status" style="padding: 20px; background: #f0f0f0; border-radius: 5px;">
        <h3>API Status</h3>
        <p><strong>API Base URL:</strong> <?php echo SPOONACULAR_API_URL; ?></p>
        <p><strong>API Key Configured:</strong> <?php echo defined('SPOONACULAR_API_KEY') && !empty(SPOONACULAR_API_KEY) ? '✅ Yes' : '❌ No'; ?></p>
    </div>
</div>

<style>
.recipe-card {
    border: 1px solid #ddd;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    display: flex;
    gap: 20px;
}

.recipe-card img {
    width: 200px;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
}

.recipe-card-content {
    flex: 1;
}

.recipe-card h3 {
    margin-top: 0;
}

.recipe-meta {
    color: #666;
    font-size: 14px;
    margin: 10px 0;
}

.ingredient-list {
    list-style: none;
    padding: 0;
}

.ingredient-list li {
    background: #f8f8f8;
    padding: 8px;
    margin: 5px 0;
    border-radius: 5px;
}
</style>

<script>
jQuery(document).ready(function($) {
    // Search recipes
    $('#recipe-search-form').on('submit', function(e) {
        e.preventDefault();
        
        const query = $('#recipe-query').val();
        
        $('#search-loading').show();
        $('#search-error').hide();
        $('#search-results').empty();
        
        $.ajax({
            url: foodBlogsData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'search_recipes',
                nonce: foodBlogsData.nonce,
                query: query
            },
            success: function(response) {
                $('#search-loading').hide();
                
                if (response.success) {
                    displaySearchResults(response.data);
                } else {
                    $('#search-error').text('Error: ' + response.data).show();
                }
            },
            error: function(xhr, status, error) {
                $('#search-loading').hide();
                $('#search-error').text('AJAX Error: ' + error).show();
            }
        });
    });
    
    // Get recipe by ID
    $('#get-recipe-form').on('submit', function(e) {
        e.preventDefault();
        
        const recipeId = $('#recipe-id').val();
        
        $('#recipe-loading').show();
        $('#recipe-error').hide();
        $('#recipe-details').empty();
        
        $.ajax({
            url: foodBlogsData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'get_recipe_by_id',
                nonce: foodBlogsData.nonce,
                recipe_id: recipeId
            },
            success: function(response) {
                $('#recipe-loading').hide();
                
                if (response.success) {
                    displayRecipeDetails(response.data);
                } else {
                    $('#recipe-error').text('Error: ' + response.data).show();
                }
            },
            error: function(xhr, status, error) {
                $('#recipe-loading').hide();
                $('#recipe-error').text('AJAX Error: ' + error).show();
            }
        });
    });
    
    function displaySearchResults(data) {
        console.log('API Response:', data); // Debug logging
        
        if (!data.results || data.results.length === 0) {
            $('#search-results').html('<p>No recipes found.</p><pre>' + JSON.stringify(data, null, 2) + '</pre>');
            return;
        }
        
        let html = '<h3>Found ' + data.totalResults + ' recipes</h3>';
        
        data.results.forEach(function(recipe) {
            html += `
                <div class="recipe-card">
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <div class="recipe-card-content">
                        <h3>${recipe.title}</h3>
                        <div class="recipe-meta">
                            <strong>ID:</strong> ${recipe.id}
                            ${recipe.readyInMinutes ? ' | <strong>Ready in:</strong> ' + recipe.readyInMinutes + ' mins' : ''}
                            ${recipe.servings ? ' | <strong>Servings:</strong> ' + recipe.servings : ''}
                        </div>
                        <button onclick="testRecipeId(${recipe.id})" style="margin-top: 10px; padding: 5px 15px; background: #28a745; color: white; border: none; cursor: pointer;">
                            View Full Recipe
                        </button>
                    </div>
                </div>
            `;
        });
        
        $('#search-results').html(html);
    }
    
    function displayRecipeDetails(recipe) {
        let html = `
            <div class="recipe-card">
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="recipe-card-content">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <strong>ID:</strong> ${recipe.id} | 
                        <strong>Ready in:</strong> ${recipe.readyInMinutes} mins | 
                        <strong>Servings:</strong> ${recipe.servings}
                    </div>
                    
                    ${recipe.summary ? '<div style="margin: 15px 0;">' + recipe.summary + '</div>' : ''}
                    
                    <h4>Ingredients:</h4>
                    <ul class="ingredient-list">
        `;
        
        if (recipe.extendedIngredients) {
            recipe.extendedIngredients.forEach(function(ing) {
                html += `<li>${ing.original}</li>`;
            });
        }
        
        html += `
                    </ul>
                    
                    ${recipe.sourceUrl ? '<a href="' + recipe.sourceUrl + '" target="_blank" style="color: #0073aa;">View Original Recipe</a>' : ''}
                </div>
            </div>
        `;
        
        $('#recipe-details').html(html);
    }
    
    // Global function to test recipe ID from search results
    window.testRecipeId = function(id) {
        $('#recipe-id').val(id);
        $('#get-recipe-form').submit();
        $('html, body').animate({
            scrollTop: $('.get-recipe-section').offset().top - 50
        }, 500);
    };
});
</script>

<?php
get_footer();
?>