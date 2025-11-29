/**
 * Food Blogs Are Dumb - JavaScript
 * Recipe saving, API calls, and interactions
 */

(function($) {
	'use strict';

	// ==========================================================================
	// SAVED RECIPES MANAGER
	// ==========================================================================

	const SavedRecipes = {
		storageKey: 'fbad_saved_recipes',

		// Get all saved recipe IDs
		getSaved: function() {
			const saved = localStorage.getItem(this.storageKey);
			return saved ? JSON.parse(saved) : [];
		},

		// Save a recipe
		save: function(recipeId, recipeData) {
			const saved = this.getSaved();
			
			// Check if already saved
			const exists = saved.find(r => r.id === recipeId);
			if (exists) return false;
			
			// Add to saved
			saved.push({
				id: recipeId,
				title: recipeData.title,
				image: recipeData.image,
				readyInMinutes: recipeData.readyInMinutes,
				servings: recipeData.servings,
				savedAt: new Date().toISOString()
			});
			
			localStorage.setItem(this.storageKey, JSON.stringify(saved));
			this.updateBadge();
			return true;
		},

		// Remove a saved recipe
		remove: function(recipeId) {
			let saved = this.getSaved();
			saved = saved.filter(r => r.id !== recipeId);
			localStorage.setItem(this.storageKey, JSON.stringify(saved));
			this.updateBadge();
		},

		// Check if recipe is saved
		isSaved: function(recipeId) {
			const saved = this.getSaved();
			return saved.some(r => r.id === recipeId);
		},

		// Toggle save status
		toggle: function(recipeId, recipeData) {
			if (this.isSaved(recipeId)) {
				this.remove(recipeId);
				return false;
			} else {
				this.save(recipeId, recipeData);
				return true;
			}
		},

		// Update the saved recipes badge count
		updateBadge: function() {
			const count = this.getSaved().length;
			const $badge = $('.fbad-saved-badge__count');
			
			if (count > 0) {
				$badge.text(count).show();
			} else {
				$badge.hide();
			}
		},

		// Initialize
		init: function() {
			this.updateBadge();
			
			// Update all save button states on page load
			$('.fbad-recipe-card__save-btn').each(function() {
				const recipeId = $(this).data('recipe-id');
				if (SavedRecipes.isSaved(recipeId)) {
					$(this).addClass('is-saved');
				}
			});
		}
	};

	// ==========================================================================
	// API HELPERS
	// ==========================================================================

	const RecipeAPI = {
		// Search recipes
		search: function(query, filters = {}) {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: foodBlogsData.ajaxUrl,
					type: 'POST',
					data: {
						action: 'search_recipes',
						nonce: foodBlogsData.nonce,
						query: query,
						...filters
					},
					success: function(response) {
						if (response.success) {
							resolve(response.data);
						} else {
							reject(response.data);
						}
					},
					error: function(xhr, status, error) {
						reject(error);
					}
				});
			});
		},

		// Get recipe by ID
		getById: function(recipeId) {
			return new Promise((resolve, reject) => {
				$.ajax({
					url: foodBlogsData.ajaxUrl,
					type: 'POST',
					data: {
						action: 'get_recipe_by_id',
						nonce: foodBlogsData.nonce,
						recipe_id: recipeId
					},
					success: function(response) {
						if (response.success) {
							resolve(response.data);
						} else {
							reject(response.data);
						}
					},
					error: function(xhr, status, error) {
						reject(error);
					}
				});
			});
		}
	};

	// ==========================================================================
	// RECIPE CARD RENDERING
	// ==========================================================================

	function renderRecipeCard(recipe) {
		const isSaved = SavedRecipes.isSaved(recipe.id);
		const saveIcon = isSaved ? '❤️' : '🤍';
		
		return `
			<div class="fbad-recipe-card">
				<div class="fbad-recipe-card__image-wrapper">
					<img class="fbad-recipe-card__image" src="${recipe.image}" alt="${recipe.title}">
					<button class="fbad-recipe-card__save-btn ${isSaved ? 'is-saved' : ''}" 
							data-recipe-id="${recipe.id}"
							data-recipe-title="${recipe.title}"
							data-recipe-image="${recipe.image}"
							data-recipe-time="${recipe.readyInMinutes || ''}"
							data-recipe-servings="${recipe.servings || ''}"
							aria-label="Save recipe">
						<span>${saveIcon}</span>
					</button>
				</div>
				<div class="fbad-recipe-card__content">
					<h3 class="fbad-recipe-card__title">${recipe.title}</h3>
					<div class="fbad-recipe-card__meta">
						${recipe.readyInMinutes ? `
							<div class="fbad-recipe-card__meta-item">
								<span>⏱️</span>
								<span>${recipe.readyInMinutes} mins</span>
							</div>
						` : ''}
						${recipe.servings ? `
							<div class="fbad-recipe-card__meta-item">
								<span>🍽️</span>
								<span>${recipe.servings} servings</span>
							</div>
						` : ''}
					</div>
					<div class="fbad-recipe-card__footer">
						<a href="?recipe=${recipe.id}" class="fbad-recipe-card__cta">
							View Recipe →
						</a>
					</div>
				</div>
			</div>
		`;
	}

	// ==========================================================================
	// SEARCH FUNCTIONALITY
	// ==========================================================================

	function initSearch() {
		const $searchForm = $('.fbad-search__wrapper');
		const $searchInput = $('.fbad-search__input');
		const $searchButton = $('.fbad-search__button');
		const $resultsContainer = $('.fbad-recipe-grid');

		// Handle search
		$searchButton.on('click', function(e) {
			e.preventDefault();
			const query = $searchInput.val().trim();
			
			if (!query) return;
			
			// Show loading
			$resultsContainer.html('<div class="fbad-loading">Searching for delicious recipes...</div>');
			
			// Search
			RecipeAPI.search(query)
				.then(data => {
					if (data.results && data.results.length > 0) {
						const html = data.results.map(recipe => renderRecipeCard(recipe)).join('');
						$resultsContainer.html(html);
						
						// Re-initialize save buttons
						initSaveButtons();
					} else {
						$resultsContainer.html('<div class="fbad-loading">No recipes found. Try a different search!</div>');
					}
				})
				.catch(error => {
					console.error('Search error:', error);
					$resultsContainer.html('<div class="fbad-error">Error searching recipes. Please try again.</div>');
				});
		});

		// Search on Enter key
		$searchInput.on('keypress', function(e) {
			if (e.which === 13) {
				e.preventDefault();
				$searchButton.click();
			}
		});
	}

	// ==========================================================================
	// SAVE BUTTON FUNCTIONALITY
	// ==========================================================================

	function initSaveButtons() {
		$(document).on('click', '.fbad-recipe-card__save-btn', function(e) {
			e.preventDefault();
			e.stopPropagation();
			
			const $btn = $(this);
			const recipeId = parseInt($btn.data('recipe-id'));
			const recipeData = {
				id: recipeId,
				title: $btn.data('recipe-title'),
				image: $btn.data('recipe-image'),
				readyInMinutes: $btn.data('recipe-time'),
				servings: $btn.data('recipe-servings')
			};
			
			const isSaved = SavedRecipes.toggle(recipeId, recipeData);
			
			// Update button state
			if (isSaved) {
				$btn.addClass('is-saved').find('span').text('❤️');
			} else {
				$btn.removeClass('is-saved').find('span').text('🤍');
			}
			
			// Show feedback
			showToast(isSaved ? 'Recipe saved!' : 'Recipe removed');
		});
	}

	// ==========================================================================
	// FILTER PILLS
	// ==========================================================================

	function initFilters() {
		$('.fbad-filter-pill').on('click', function() {
			const $pill = $(this);
			const filter = $pill.data('filter');
			const value = $pill.data('value');
			
			// Toggle active state
			$pill.toggleClass('is-active');
			
			// Get all active filters
			const activeFilters = {};
			$('.fbad-filter-pill.is-active').each(function() {
				const f = $(this).data('filter');
				const v = $(this).data('value');
				activeFilters[f] = v;
			});
			
			// Get current search query
			const query = $('.fbad-search__input').val().trim();
			
			if (!query && Object.keys(activeFilters).length === 0) {
				return; // No search or filters active
			}
			
			// Search with filters
			$('.fbad-recipe-grid').html('<div class="fbad-loading">Filtering recipes...</div>');
			
			RecipeAPI.search(query || '', activeFilters)
				.then(data => {
					if (data.results && data.results.length > 0) {
						const html = data.results.map(recipe => renderRecipeCard(recipe)).join('');
						$('.fbad-recipe-grid').html(html);
						initSaveButtons();
					} else {
						$('.fbad-recipe-grid').html('<div class="fbad-loading">No recipes found with these filters.</div>');
					}
				})
				.catch(error => {
					console.error('Filter error:', error);
					$('.fbad-recipe-grid').html('<div class="fbad-error">Error filtering recipes.</div>');
				});
		});
	}

	// ==========================================================================
	// INGREDIENTS CHECKLIST
	// ==========================================================================

	function initIngredientsChecklist() {
		$('.fbad-ingredients__checkbox').on('change', function() {
			$(this).closest('.fbad-ingredients__item').toggleClass('is-checked');
		});
	}

	// ==========================================================================
	// TOAST NOTIFICATIONS
	// ==========================================================================

	function showToast(message, duration = 2000) {
		// Create toast if doesn't exist
		let $toast = $('.fbad-toast');
		if ($toast.length === 0) {
			$toast = $('<div class="fbad-toast"></div>');
			$('body').append($toast);
			
			// Add CSS for toast
			$('<style>')
				.text(`
					.fbad-toast {
						position: fixed;
						bottom: 100px;
						right: 30px;
						background: var(--color-charcoal);
						color: var(--color-white);
						padding: 16px 24px;
						border-radius: 8px;
						box-shadow: 0 10px 25px rgba(0,0,0,0.2);
						z-index: 9999;
						opacity: 0;
						transform: translateY(20px);
						transition: all 0.3s ease;
					}
					.fbad-toast.show {
						opacity: 1;
						transform: translateY(0);
					}
				`)
				.appendTo('head');
		}
		
		$toast.text(message).addClass('show');
		
		setTimeout(() => {
			$toast.removeClass('show');
		}, duration);
	}

	// ==========================================================================
	// SAVED RECIPES MODAL
	// ==========================================================================

	function initSavedRecipesModal() {
		$('.fbad-saved-badge').on('click', function() {
			const saved = SavedRecipes.getSaved();
			
			if (saved.length === 0) {
				showToast('No saved recipes yet!');
				return;
			}
			
			// Create modal HTML
			const modalHtml = `
				<div class="fbad-modal">
					<div class="fbad-modal__backdrop"></div>
					<div class="fbad-modal__content">
						<div class="fbad-modal__header">
							<h2>Saved Recipes</h2>
							<button class="fbad-modal__close">×</button>
						</div>
						<div class="fbad-modal__body">
							<div class="fbad-recipe-grid">
								${saved.map(recipe => renderRecipeCard(recipe)).join('')}
							</div>
						</div>
					</div>
				</div>
			`;
			
			// Add modal CSS
			if ($('.fbad-modal-styles').length === 0) {
				$('<style class="fbad-modal-styles">')
					.text(`
						.fbad-modal { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; }
						.fbad-modal__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.7); }
						.fbad-modal__content { position: relative; background: var(--color-cream); max-width: 1200px; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 32px; }
						.fbad-modal__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
						.fbad-modal__close { background: none; border: none; font-size: 32px; cursor: pointer; color: var(--color-charcoal); }
						.fbad-modal__close:hover { color: var(--color-cta); }
					`)
					.appendTo('head');
			}
			
			// Add modal to page
			$('body').append(modalHtml);
			
			// Re-initialize save buttons
			initSaveButtons();
			
			// Close modal handlers
			$('.fbad-modal__close, .fbad-modal__backdrop').on('click', function() {
				$('.fbad-modal').remove();
			});
		});
	}

	// ==========================================================================
	// INITIALIZE
	// ==========================================================================

	$(document).ready(function() {
		SavedRecipes.init();
		initSaveButtons();
		initSearch();
		initFilters();
		initIngredientsChecklist();
		initSavedRecipesModal();
		
		console.log('🍳 Food Blogs Are Dumb initialized!');
	});

})(jQuery);