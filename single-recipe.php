<?php get_header(); ?>

<div class="recipe-container">
    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        <h1 class="recipe-title"><?php the_title(); ?></h1>

        <!-- Display Recipe Image -->
        <?php
        $recipe_image = get_post_meta(get_the_ID(), 'image', true);
        if ($recipe_image) {
            echo '<img class="recipe-image" src="' . esc_url($recipe_image) . '" alt="' . esc_attr(get_the_title()) . '">';
        }
        ?>

        <!-- Display Ingredients -->
        <h2>Ingredients</h2>
        <ul class="recipe-ingredients">
            <?php
            $ingredients = get_post_meta(get_the_ID(), 'ingredients', true);
            if ($ingredients) {
                $ingredients = json_decode($ingredients, true);
                foreach ($ingredients as $ingredient) {
                    echo '<li>' . esc_html($ingredient['original']) . '</li>';
                }
            }
            ?>
        </ul>

        <!-- Display Instructions -->
        <h2>Instructions</h2>
        <div class="recipe-instructions">
            <?php the_content(); ?>
        </div>

    <?php endwhile; endif; ?>
</div>

<?php get_footer(); ?>