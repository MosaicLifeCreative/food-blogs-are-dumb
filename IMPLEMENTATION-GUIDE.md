# Food Blogs Are Dumb - Design System Implementation Guide

## 🎨 What You Have

A complete, modern design system with:
- **Bon Appétit-inspired** aesthetic
- **Pastel color palette** (sage, peach, rose, cream, terracotta)
- **Recipe saving** with localStorage (no account needed!)
- **Fully responsive** design
- **Ready for Divi** - just add the CSS classes!

---

## 📁 Files to Add

### 1. **fbad-design-system.css**
   - All your styling
   - Copy to your theme folder
   - Enqueue it in functions.php

### 2. **fbad-scripts.js** 
   - Recipe saving functionality
   - Search interactions
   - Copy to `/js/` folder (replace or rename scripts.js)
   - Already enqueued in functions.php

---

## 🚀 Quick Setup

### Step 1: Upload Files
1. Add `fbad-design-system.css` to your theme root
2. Add `fbad-scripts.js` to `/js/` folder

### Step 2: Update functions.php

Add this to your `my_theme_enqueue_styles()` function:

```php
// Enqueue design system CSS
wp_enqueue_style( 'fbad-design-system',
    get_stylesheet_directory_uri() . '/fbad-design-system.css',
    array( 'child-style' ),
    '1.0'
);

// Update scripts.js enqueue
wp_enqueue_script( 'fbad-scripts', 
    get_stylesheet_directory_uri() . '/js/fbad-scripts.js', 
    array('jquery'), 
    '1.0', 
    true 
);
```

### Step 3: Add Google Fonts

Add to your theme's `<head>` (Divi Theme Options → Integration → Add code to <head>):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
```

---

## 🎯 Building Pages in Divi

### Homepage Example

**Section 1: Hero**
1. Add Row
2. Add Text Module
3. Advanced → CSS ID & Classes → CSS Class: `fbad-hero__content`
4. Content:
   ```
   <h1 class="fbad-hero__title">Find Recipes Without the Life Story</h1>
   <p class="fbad-hero__subtitle">Just the damn recipe, already.</p>
   ```

**Section 2: Search**
1. Add Row
2. Add Code Module
3. CSS Class on row: `fbad-container`
4. Content:
   ```html
   <div class="fbad-search">
       <div class="fbad-search__wrapper">
           <span class="fbad-search__icon">🔍</span>
           <input type="text" class="fbad-search__input" placeholder="Search for recipes...">
           <button class="fbad-search__button">Search</button>
       </div>
   </div>
   ```

**Section 3: Filter Pills**
1. Add Code Module
2. Content:
   ```html
   <div class="fbad-filters">
       <button class="fbad-filter-pill" data-filter="diet" data-value="vegetarian">🥗 Vegetarian</button>
       <button class="fbad-filter-pill" data-filter="diet" data-value="vegan">🌱 Vegan</button>
       <button class="fbad-filter-pill" data-filter="diet" data-value="gluten-free">🌾 Gluten Free</button>
       <button class="fbad-filter-pill" data-filter="diet" data-value="keto">🥑 Keto</button>
   </div>
   ```

**Section 4: Recipe Grid**
1. Add Row
2. Add Code Module
3. Content:
   ```html
   <div class="fbad-recipe-grid">
       <!-- Recipes will load here via JavaScript -->
   </div>
   ```

---

## 🍳 Recipe Card HTML Template

When you want to manually add recipe cards in Divi:

```html
<div class="fbad-recipe-card">
    <div class="fbad-recipe-card__image-wrapper">
        <img class="fbad-recipe-card__image" src="IMAGE_URL" alt="RECIPE_NAME">
        <button class="fbad-save-btn fbad-save-btn--card" 
                data-recipe-id="123"
                data-recipe-title="RECIPE_NAME"
                data-recipe-image="IMAGE_URL">
            <span>🤍</span>
        </button>
    </div>
    <div class="fbad-recipe-card__content">
        <h3 class="fbad-recipe-card__title">RECIPE_NAME</h3>
        <div class="fbad-recipe-card__meta">
            <div class="fbad-recipe-card__meta-item">
                <span>⏱️</span>
                <span>30 mins</span>
            </div>
            <div class="fbad-recipe-card__meta-item">
                <span>🍽️</span>
                <span>4 servings</span>
            </div>
        </div>
        <div class="fbad-recipe-card__footer">
            <a href="#" class="fbad-recipe-card__cta">View Recipe →</a>
        </div>
    </div>
</div>
```

---

## 🎨 CSS Classes Reference

### Layout
- `fbad-container` - Max-width container
- `fbad-section` - Section padding
- `fbad-recipe-grid` - Recipe card grid

### Components
- `fbad-hero` - Hero section
- `fbad-search` - Search bar
- `fbad-filter-pill` - Filter buttons
- `fbad-recipe-card` - Recipe card
- `fbad-ingredients` - Ingredients list
- `fbad-instructions` - Cooking steps

### States
- `is-active` - Active filter
- `is-saved` - Saved recipe
- `is-checked` - Checked ingredient

---

## 🎨 Color Palette

Use these CSS variables anywhere:

```css
var(--color-sage)       /* #B4C7B4 - Primary green */
var(--color-peach)      /* #F4D0C4 - Secondary */
var(--color-rose)       /* #E8B4B8 - Accent */
var(--color-terracotta) /* #D4846A - CTAs */
var(--color-cream)      /* #FAF7F2 - Background */
var(--color-charcoal)   /* #2C2C2C - Text */
```

---

## ✨ Key Features

### 1. Recipe Saving (Automatic!)
- Click heart icon to save
- Saves to browser localStorage
- No account needed
- Floating badge shows count
- Click badge to see all saved recipes

### 2. Search
- Type and click Search button
- Results appear in grid
- All cards have save buttons

### 3. Filters
- Click pills to activate
- Multiple filters work together
- Re-search with active filters

---

## 🎯 Next Steps

1. **Test it!** Upload files and create a test page
2. **Build homepage** using the examples above
3. **Create recipe detail template** (I can help with this!)
4. **Add more pages** as needed

---

## 💡 Pro Tips

1. **Divi Theme Builder**: Create a global header/footer with the design system classes
2. **Save as Divi Library**: Once you build a good recipe card, save it to reuse
3. **Custom CSS**: Override any colors in Divi's Custom CSS panel using the variables
4. **Performance**: The design system is lightweight (~15KB)

---

## 🐛 Troubleshooting

**Styles not loading?**
- Check that CSS file is enqueued in functions.php
- Clear browser cache
- Check file path is correct

**Save feature not working?**
- Check browser console for errors
- Make sure jQuery is loaded
- Verify foodBlogsData is defined (should be from functions.php)

**Fonts not loading?**
- Make sure Google Fonts link is in <head>
- Check network tab for font loading

---

Need help building any specific page? Let me know! 🚀
