# Food Blogs Are Dumb - Development Guide

## Project Overview
Food Blogs Are Dumb is a WordPress/Divi recipe search site that cuts through the BS of traditional food blogs. Users can search for recipes via the Spoonacular API, save favorites to localStorage, and filter by dietary preferences - all without reading someone's life story. The tagline says it all: "Just the damn recipe, already."

## Tech Stack
- **CMS**: WordPress
- **Theme**: Divi (child theme active)
- **API**: Spoonacular API for recipe data
- **Hosting**: SiteGround
- **Development Environment**: Local editing via VS Code with SFTP auto-upload to dev subdomain
- **Version Control**: Git/GitHub
- **JavaScript**: jQuery (already enqueued by Divi)

## File Structure
- **Custom Design System CSS**: `fbad-design-system.css` (main styling, loads after child-style.css)
- **Child Theme CSS**: `style.css` (WordPress header + custom overrides)
- **Custom JavaScript**: `js/fbad-scripts.js` (recipe saving, search, filters)
- **Child Theme Location**: `/wp-content/themes/divi-child`
- **SFTP Config**: `.vscode/sftp.json` (DO NOT COMMIT - in .gitignore)
- **API Config**: `config.php` (contains Spoonacular API key - DO NOT COMMIT - in .gitignore)
- **Templates**: 
  - `page-recipe.php` (recipe detail page template)
  - `fbad-api-test.php` (API testing page template)
- **Demo Files**: `homepage-demo.html`, `homepage-demo-fullwidth.html`, `homepage-demo-minimal.html`, `homepage-demo-split.html` (HTML prototypes)
- **Documentation**: `IMPLEMENTATION-GUIDE.md` (design system usage guide)

## Brand Guidelines
**Colors** (CSS variables):
- Primary: `--color-sage` (#B4C7B4)
- Secondary: `--color-peach` (#F4D0C4)
- Accent: `--color-rose` (#E8B4B8)
- CTA: `--color-terracotta` (#D4846A)
- Background: `--color-cream` (#FAF7F2)
- Text: `--color-charcoal` (#2C2C2C)
- Text Light: `--color-text-light` (#666666)

**Fonts**:
- Display: 'Playfair Display' (headings, serif)
- Body: 'Inter' (body text, sans-serif)

**Tone**: Casual, direct, no-nonsense. Think Bon Appétit aesthetic meets "cut the crap" messaging. Examples: "Just the damn recipe, already", "No BS. Just Recipes."

## Development Workflow
- **Main branch**: Production (live site at foodblogsaredumb.com)
- **Dev branch**: Staging environment at dev subdomain
- **Feature branches**: For isolated work, merge to dev for testing before production
- **SFTP**: Auto-upload on save to `/foodblogsaredumb.com/public_html/wp-content/themes/divi-child`

## Important Notes
- **Divi tablet breakpoint**: Starts at 980px (mobile menu considerations)
- **jQuery**: Already enqueued, all custom JS uses jQuery
- **Spoonacular API**: Requires API key in `config.php` (not in repo)
  - Base URL: Set via `SPOONACULAR_API_URL` constant
  - Endpoints: `/recipes/complexSearch`, `/recipes/{id}/information`
- **Recipe Saving**: Uses localStorage (client-side, no accounts needed)
- **AJAX**: Custom endpoints registered in `functions.php`:
  - `search_recipes` - Recipe search with filters
  - `get_recipe_by_id` - Fetch single recipe
  - `get_popular_recipes` - Fetch popular recipes
- **Nonce**: All AJAX calls use `foodBlogsData.nonce` for security

## Common Tasks
**Adding a new filter type**: 
1. Add button in filter section with `data-filter` and `data-value` attributes
2. JavaScript in `fbad-scripts.js` handles the rest automatically

**Creating new pages**:
Use Divi Builder with CSS classes from `fbad-design-system.css` (see IMPLEMENTATION-GUIDE.md)

**Recipe search workflow**:
User input → `fbad-scripts.js` → AJAX to `functions.php` → Spoonacular API → Render cards

**Modifying design system**:
Edit `fbad-design-system.css` for component styles, `style.css` for overrides

## What Not to Touch
- `.vscode/sftp.json` (SFTP credentials - in .gitignore)
- `config.php` (API keys - in .gitignore)
- `.DS_Store` files
- `/mnt/skills/` directories (read-only)

## API Integration
**Spoonacular API Limits**: Free tier has daily quotas
**Helper Functions** (in `functions.php`):
- `spoonacular_api_request($endpoint, $params)` - Generic API caller
- `get_recipe_by_id($recipe_id)` - Fetch recipe details
- `search_recipes($args)` - Search with filters

## Design System Classes
Key component classes (see `fbad-design-system.css` and IMPLEMENTATION-GUIDE.md):
- `.fbad-recipe-card` - Recipe cards
- `.fbad-hero`, `.fbad-hero-fullwidth` - Hero sections
- `.fbad-search`, `.fbad-search-fullwidth` - Search components
- `.fbad-filter-pill` - Diet filter buttons
- `.fbad-recipe-grid` - Recipe card grid
- `.fbad-save-btn--card`, `.fbad-save-btn--detail` - Save buttons
- `.fbad-ingredients`, `.fbad-instructions` - Recipe detail sections