<?php
/**
 * Divi Child Theme - Food Blogs Are Dumb
 * Functions and definitions
 */

// Load configuration (API keys, etc.)
require_once get_stylesheet_directory() . '/config.php';

/**
 * Enqueue parent and child theme styles and scripts
 */
function my_theme_enqueue_styles() {
    $parent_style = 'divi-style';
 
    // Enqueue parent theme stylesheet
    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
    
    // Enqueue child theme stylesheet (WordPress header + custom overrides)
    wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style ),
        wp_get_theme()->get('Version')
    );
    
    // Enqueue design system CSS (load after child-style so it can be overridden)
    wp_enqueue_style( 'fbad-design-system',
        get_stylesheet_directory_uri() . '/fbad-design-system.css',
        array( 'child-style' ),
        '1.0.0'
    );
    
    // Enqueue custom JavaScript
    wp_enqueue_script( 'fbad-scripts', 
        get_stylesheet_directory_uri() . '/js/fbad-scripts.js', 
        array('jquery'), 
        '1.0.0', 
        true 
    );
    
    // Pass data to JavaScript
    wp_localize_script( 'fbad-scripts', 'foodBlogsData', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('food_blogs_nonce')
    ));
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );

/**
 * Spoonacular API Helper Functions
 */

/**
 * Make a request to the Spoonacular API
 * 
 * @param string $endpoint The API endpoint (e.g., 'recipes/complexSearch')
 * @param array $params Query parameters for the API call
 * @return array|WP_Error The API response or error
 */
function spoonacular_api_request($endpoint, $params = array()) {
    // Add API key to parameters
    $params['apiKey'] = SPOONACULAR_API_KEY;
    
    // Build the URL
    $url = SPOONACULAR_API_URL . '/' . $endpoint . '?' . http_build_query($params);
    
    // Make the request
    $response = wp_remote_get($url, array(
        'timeout' => 15,
        'headers' => array(
            'Content-Type' => 'application/json'
        )
    ));
    
    // Check for errors
    if (is_wp_error($response)) {
        return $response;
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    return $data;
}

/**
 * Get recipe information by ID
 * 
 * @param int $recipe_id The Spoonacular recipe ID
 * @param bool $include_nutrition Whether to include nutrition data
 * @return array|WP_Error Recipe data or error
 */
function get_recipe_by_id($recipe_id, $include_nutrition = true) {
    $params = array(
        'includeNutrition' => $include_nutrition ? 'true' : 'false'
    );
    
    return spoonacular_api_request('recipes/' . $recipe_id . '/information', $params);
}

/**
 * Search for recipes
 * 
 * @param array $args Search parameters (query, cuisine, diet, etc.)
 * @return array|WP_Error Search results or error
 */
function search_recipes($args = array()) {
    $defaults = array(
        'number' => 10,
        'offset' => 0,
        'addRecipeInformation' => 'true'
    );
    
    $params = wp_parse_args($args, $defaults);
    
    return spoonacular_api_request('recipes/complexSearch', $params);
}

/**
 * AJAX handler for recipe searches (if you want to search from the frontend)
 */
function ajax_search_recipes() {
    // Verify nonce
    check_ajax_referer('food_blogs_nonce', 'nonce');

    $query = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';

    // Build search parameters
    $search_params = array();

    // Add query if provided
    if (!empty($query)) {
        $search_params['query'] = $query;
    }

    // Add diet filter if provided
    if (isset($_POST['diet']) && !empty($_POST['diet'])) {
        $search_params['diet'] = sanitize_text_field($_POST['diet']);
    }

    // Add cuisine filter if provided
    if (isset($_POST['cuisine']) && !empty($_POST['cuisine'])) {
        $search_params['cuisine'] = sanitize_text_field($_POST['cuisine']);
    }

    // Add intolerances if provided
    if (isset($_POST['intolerances']) && !empty($_POST['intolerances'])) {
        $search_params['intolerances'] = sanitize_text_field($_POST['intolerances']);
    }

    // Require either a query or at least one filter
    if (empty($search_params)) {
        wp_send_json_error('No search query or filters provided');
        return;
    }

    $results = search_recipes($search_params);

    if (is_wp_error($results)) {
        wp_send_json_error($results->get_error_message());
    } else {
        wp_send_json_success($results);
    }
}
add_action('wp_ajax_search_recipes', 'ajax_search_recipes');
add_action('wp_ajax_nopriv_search_recipes', 'ajax_search_recipes');

/**
 * AJAX handler for getting recipe by ID
 */
function ajax_get_recipe_by_id() {
    // Verify nonce
    check_ajax_referer('food_blogs_nonce', 'nonce');
    
    $recipe_id = isset($_POST['recipe_id']) ? intval($_POST['recipe_id']) : 0;
    
    if (empty($recipe_id)) {
        wp_send_json_error('No recipe ID provided');
        return;
    }
    
    $result = get_recipe_by_id($recipe_id);
    
    if (is_wp_error($result)) {
        wp_send_json_error($result->get_error_message());
    } else {
        wp_send_json_success($result);
    }
}
add_action('wp_ajax_get_recipe_by_id', 'ajax_get_recipe_by_id');
add_action('wp_ajax_nopriv_get_recipe_by_id', 'ajax_get_recipe_by_id');

/**
 * AJAX handler for getting popular recipes
 */
function ajax_get_popular_recipes() {
    // Verify nonce
    check_ajax_referer('food_blogs_nonce', 'nonce');

    $number = isset($_POST['number']) ? intval($_POST['number']) : 9;

    // Get popular recipes using the complexSearch endpoint with sort=popularity
    $results = search_recipes(array(
        'number' => $number,
        'sort' => 'popularity',
        'sortDirection' => 'desc'
    ));

    if (is_wp_error($results)) {
        wp_send_json_error($results->get_error_message());
    } else {
        wp_send_json_success($results);
    }
}
add_action('wp_ajax_get_popular_recipes', 'ajax_get_popular_recipes');
add_action('wp_ajax_nopriv_get_popular_recipes', 'ajax_get_popular_recipes');

/**
 * Custom Post Type Registration (if needed for storing recipes)
 */
// Uncomment if you want to create a custom post type for recipes
/*
function register_recipe_post_type() {
    $args = array(
        'labels' => array(
            'name' => 'Recipes',
            'singular_name' => 'Recipe'
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rewrite' => array('slug' => 'recipes'),
    );
    
    register_post_type('recipe', $args);
}
add_action('init', 'register_recipe_post_type');
*/
?>