<?php
/**
 * Template Name: Recipe Detail Page
 * Description: Displays individual recipes from Spoonacular API
 */

// Check if recipe ID is provided
$recipe_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

// Fetch recipe data early for title
if ($recipe_id) {
    $recipe_data = get_recipe_by_id($recipe_id);

    // Set dynamic page title - multiple filters for compatibility
    if ($recipe_data && !is_wp_error($recipe_data)) {
        $recipe_title = $recipe_data['title'];

        // Modern WordPress (4.4+)
        add_filter('pre_get_document_title', function() use ($recipe_title) {
            return $recipe_title . ' | ' . get_bloginfo('name');
        }, 10);

        // Fallback for older themes
        add_filter('wp_title', function($title) use ($recipe_title) {
            return $recipe_title . ' | ' . get_bloginfo('name');
        }, 10, 2);

        // Divi theme compatibility
        add_filter('document_title_parts', function($title_parts) use ($recipe_title) {
            $title_parts['title'] = $recipe_title;
            return $title_parts;
        }, 10);
    }
}

get_header();

if ($recipe_id) {
    // Fetch recipe from API
    $recipe_data = get_recipe_by_id($recipe_id);

    if ($recipe_data && !is_wp_error($recipe_data)) {
        $recipe = $recipe_data;
        ?>

        <article class="fbad-recipe-detail">
            <!-- Hero Image -->
            <div class="fbad-recipe-detail__hero">
                <?php
                // Get larger image - try multiple approaches
                $image_url = $recipe['image'];
                // Try to replace existing size
                if (preg_match('/\d{3}x\d{3}/', $image_url)) {
                    $image_url = preg_replace('/\d{3}x\d{3}/', '636x393', $image_url);
                } elseif (preg_match('/-(\d{3})x(\d{3})\./', $image_url)) {
                    // Format like image-312x231.jpg
                    $image_url = preg_replace('/-\d{3}x\d{3}\./', '-636x393.', $image_url);
                }
                ?>
                <img src="<?php echo esc_url($image_url); ?>"
                     alt="<?php echo esc_attr($recipe['title']); ?>"
                     class="fbad-recipe-detail__image">
            </div>

            <div class="fbad-recipe-detail__container">
                <div class="fbad-recipe-detail__content">
                    <!-- Title & Meta -->
                    <header class="fbad-recipe-detail__header">
                        <div class="fbad-recipe-detail__title-row">
                            <h1 class="fbad-recipe-detail__title"><?php echo esc_html($recipe['title']); ?></h1>
                            <button class="fbad-save-btn fbad-save-btn--detail fbad-recipe-detail__save-btn"
                                    data-recipe-id="<?php echo esc_attr($recipe['id']); ?>"
                                    data-recipe-title="<?php echo esc_attr($recipe['title']); ?>"
                                    data-recipe-image="<?php echo esc_attr($recipe['image']); ?>"
                                    data-recipe-time="<?php echo esc_attr($recipe['readyInMinutes'] ?? ''); ?>"
                                    data-recipe-servings="<?php echo esc_attr($recipe['servings'] ?? ''); ?>"
                                    aria-label="Save recipe"
                                    aria-pressed="false">
                                <span class="fbad-save-icon">🤍</span>
                                <span class="fbad-recipe-detail__save-text">Save Recipe</span>
                            </button>
                        </div>

                        <div class="fbad-recipe-detail__meta">
                            <?php if (!empty($recipe['readyInMinutes'])): ?>
                            <div class="fbad-recipe-detail__meta-item">
                                <span class="fbad-recipe-detail__meta-icon">⏱️</span>
                                <span><?php echo esc_html($recipe['readyInMinutes']); ?> mins</span>
                            </div>
                            <?php endif; ?>

                            <?php if (!empty($recipe['servings'])): ?>
                            <div class="fbad-recipe-detail__meta-item">
                                <span class="fbad-recipe-detail__meta-icon">🍽️</span>
                                <span><?php echo esc_html($recipe['servings']); ?> servings</span>
                            </div>
                            <?php endif; ?>
                        </div>
                    </header>

                    <!-- Nutrition Facts -->
                    <?php if (!empty($recipe['nutrition']['nutrients'])): ?>
                    <div class="fbad-nutrition">
                        <h2 class="fbad-nutrition__title">Nutrition Facts</h2>
                        <div class="fbad-nutrition__per-serving">Per Serving</div>

                        <?php
                        // Extract key nutrients
                        $nutrients = $recipe['nutrition']['nutrients'];
                        $nutrient_map = [];
                        foreach ($nutrients as $nutrient) {
                            $nutrient_map[$nutrient['name']] = $nutrient;
                        }

                        // Get macros
                        $calories = $nutrient_map['Calories'] ?? null;
                        $protein = $nutrient_map['Protein'] ?? null;
                        $carbs = $nutrient_map['Carbohydrates'] ?? null;
                        $net_carbs = $nutrient_map['Net Carbohydrates'] ?? null;
                        $fiber = $nutrient_map['Fiber'] ?? null;
                        $sugar = $nutrient_map['Sugar'] ?? null;
                        $fat = $nutrient_map['Fat'] ?? null;
                        $sat_fat = $nutrient_map['Saturated Fat'] ?? null;
                        ?>

                        <!-- Calories (Featured) -->
                        <?php if ($calories): ?>
                        <div class="fbad-nutrition__calories">
                            <span class="fbad-nutrition__calories-label">Calories</span>
                            <span class="fbad-nutrition__calories-value"><?php echo round($calories['amount']); ?></span>
                        </div>
                        <?php endif; ?>

                        <div class="fbad-nutrition__divider"></div>

                        <!-- Macros Grid -->
                        <div class="fbad-nutrition__macros">
                            <?php if ($protein): ?>
                            <div class="fbad-nutrition__macro">
                                <div class="fbad-nutrition__macro-label">Protein</div>
                                <div class="fbad-nutrition__macro-value"><?php echo round($protein['amount']); ?>g</div>
                                <?php if (isset($protein['percentOfDailyNeeds'])): ?>
                                <div class="fbad-nutrition__macro-percent"><?php echo round($protein['percentOfDailyNeeds']); ?>%</div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>

                            <?php if ($carbs): ?>
                            <div class="fbad-nutrition__macro">
                                <div class="fbad-nutrition__macro-label">Carbs</div>
                                <div class="fbad-nutrition__macro-value"><?php echo round($carbs['amount']); ?>g</div>
                                <?php if (isset($carbs['percentOfDailyNeeds'])): ?>
                                <div class="fbad-nutrition__macro-percent"><?php echo round($carbs['percentOfDailyNeeds']); ?>%</div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>

                            <?php if ($fat): ?>
                            <div class="fbad-nutrition__macro">
                                <div class="fbad-nutrition__macro-label">Fat</div>
                                <div class="fbad-nutrition__macro-value"><?php echo round($fat['amount']); ?>g</div>
                                <?php if (isset($fat['percentOfDailyNeeds'])): ?>
                                <div class="fbad-nutrition__macro-percent"><?php echo round($fat['percentOfDailyNeeds']); ?>%</div>
                                <?php endif; ?>
                            </div>
                            <?php endif; ?>
                        </div>

                        <!-- Additional Details (Collapsible/Secondary) -->
                        <details class="fbad-nutrition__details">
                            <summary class="fbad-nutrition__details-summary">View Detailed Breakdown</summary>
                            <div class="fbad-nutrition__details-content">
                                <?php if ($net_carbs || $fiber || $sugar): ?>
                                <div class="fbad-nutrition__detail-group">
                                    <h3 class="fbad-nutrition__detail-group-title">Carbohydrates</h3>
                                    <?php if ($net_carbs): ?>
                                    <div class="fbad-nutrition__detail-row">
                                        <span class="fbad-nutrition__detail-label">Net Carbs</span>
                                        <span class="fbad-nutrition__detail-value"><?php echo round($net_carbs['amount']); ?>g</span>
                                    </div>
                                    <?php endif; ?>
                                    <?php if ($fiber): ?>
                                    <div class="fbad-nutrition__detail-row">
                                        <span class="fbad-nutrition__detail-label">Fiber</span>
                                        <span class="fbad-nutrition__detail-value"><?php echo round($fiber['amount']); ?>g</span>
                                    </div>
                                    <?php endif; ?>
                                    <?php if ($sugar): ?>
                                    <div class="fbad-nutrition__detail-row">
                                        <span class="fbad-nutrition__detail-label">Sugar</span>
                                        <span class="fbad-nutrition__detail-value"><?php echo round($sugar['amount']); ?>g</span>
                                    </div>
                                    <?php endif; ?>
                                </div>
                                <?php endif; ?>

                                <?php if ($sat_fat): ?>
                                <div class="fbad-nutrition__detail-group">
                                    <h3 class="fbad-nutrition__detail-group-title">Fats</h3>
                                    <div class="fbad-nutrition__detail-row">
                                        <span class="fbad-nutrition__detail-label">Saturated Fat</span>
                                        <span class="fbad-nutrition__detail-value"><?php echo round($sat_fat['amount']); ?>g</span>
                                    </div>
                                </div>
                                <?php endif; ?>
                            </div>
                        </details>
                    </div>
                    <?php endif; ?>

                    <!-- Main Content -->
                    <div class="fbad-recipe-detail__main">
                        <!-- Ingredients Sidebar -->
                        <aside class="fbad-recipe-detail__sidebar">
                            <h2 class="fbad-recipe-detail__section-title">Ingredients</h2>

                            <div class="fbad-ingredients-checklist">
                                <?php if (!empty($recipe['extendedIngredients'])): ?>
                                    <?php foreach ($recipe['extendedIngredients'] as $ingredient): ?>
                                    <label class="fbad-ingredient">
                                        <input type="checkbox" class="fbad-ingredient__checkbox">
                                        <span class="fbad-ingredient__text">
                                            <?php echo esc_html($ingredient['original']); ?>
                                        </span>
                                    </label>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </aside>

                        <!-- Instructions -->
                        <div class="fbad-recipe-detail__instructions">
                            <h2 class="fbad-recipe-detail__section-title">Instructions</h2>

                            <?php if (!empty($recipe['analyzedInstructions'][0]['steps'])): ?>
                            <div class="fbad-instructions">
                                <?php foreach ($recipe['analyzedInstructions'][0]['steps'] as $step): ?>
                                <div class="fbad-instructions__step">
                                    <div class="fbad-instructions__number"><?php echo $step['number']; ?></div>
                                    <div class="fbad-instructions__text">
                                        <?php echo esc_html($step['step']); ?>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <?php elseif (!empty($recipe['instructions'])): ?>
                            <div class="fbad-instructions__text">
                                <?php echo wp_kses_post($recipe['instructions']); ?>
                            </div>
                            <?php else: ?>
                            <p>No instructions available for this recipe.</p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Back Button -->
                    <div class="fbad-recipe-detail__footer">
                        <a href="<?php echo esc_url(home_url('/')); ?>" class="fbad-button fbad-button--secondary">
                            ← Back to Recipes
                        </a>
                    </div>
                </div>
            </div>
        </article>

        <?php
    } else {
        // Recipe not found
        ?>
        <div class="fbad-error-page">
            <div class="fbad-container">
                <h1>Recipe Not Found</h1>
                <p>Sorry, we couldn't find that recipe. It may have been removed or the ID is incorrect.</p>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="fbad-button">
                    ← Back to Homepage
                </a>
            </div>
        </div>
        <?php
    }
} else {
    // No recipe ID provided
    ?>
    <div class="fbad-error-page">
        <div class="fbad-container">
            <h1>No Recipe Selected</h1>
            <p>Please select a recipe from the homepage.</p>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="fbad-button">
                ← Back to Homepage
            </a>
        </div>
    </div>
    <?php
}

get_footer();
?>
