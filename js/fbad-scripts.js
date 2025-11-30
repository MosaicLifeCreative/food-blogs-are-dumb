/**
 * Food Blogs Are Dumb - JavaScript
 * Recipe saving, API calls, and interactions
 */

(function($) {
	'use strict';

	// Emoji strings for save icons (outline & filled heart)
	const heartOutline = '🤍';
	const heartFilled = '❤️';

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
			
			// Ensure ID is a number
			recipeId = parseInt(recipeId);

			// Check if already saved
			const exists = saved.find(r => parseInt(r.id) === recipeId);
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
			// Ensure ID is a number
			recipeId = parseInt(recipeId);
			let saved = this.getSaved();
			saved = saved.filter(r => parseInt(r.id) !== recipeId);
			localStorage.setItem(this.storageKey, JSON.stringify(saved));
			this.updateBadge();
		},

		// Check if recipe is saved
		isSaved: function(recipeId) {
			// Ensure ID is a number
			recipeId = parseInt(recipeId);
			const saved = this.getSaved();
			return saved.some(r => parseInt(r.id) === recipeId);
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
			$('.fbad-save-btn').each(function() {
				const recipeId = $(this).data('recipe-id');
				if (SavedRecipes.isSaved(recipeId)) {
					$(this).addClass('is-saved');
					if ($(this).find('.fbad-save-icon').length) {
						$(this).find('.fbad-save-icon').text(heartFilled);
					} else {
						$(this).find('span').first().text(heartFilled);
					}
					// If this is a detail-style button with text, update the label
					if ($(this).hasClass('fbad-save-btn--detail') || $(this).hasClass('fbad-recipe-detail__save-btn')) {
						$(this).find('.fbad-recipe-detail__save-text').text('Saved!');
						$(this).attr('aria-label', 'Saved recipe');
					} else {
						$(this).attr('aria-label', 'Save recipe');
					}
					$(this).attr('aria-pressed', 'true');
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
		const saveIcon = isSaved ? heartFilled : heartOutline;
		
		return `
			<div class="fbad-recipe-card">
				<div class="fbad-recipe-card__image-wrapper">
					<img class="fbad-recipe-card__image" src="${recipe.image.replace(/\d{3}x\d{3}/, '636x393')}" alt="${recipe.title}">
					<button class="fbad-save-btn fbad-save-btn--card ${isSaved ? 'is-saved' : ''}" 
							data-recipe-id="${recipe.id}"
							data-recipe-title="${recipe.title}"
							data-recipe-image="${recipe.image}"
							data-recipe-time="${recipe.readyInMinutes || ''}"
							data-recipe-servings="${recipe.servings || ''}"
							aria-label="Save recipe"
							aria-pressed="${isSaved}">
						<span class="fbad-save-icon">${saveIcon}</span>
						<span class="sr-only">Save recipe</span>
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
						<a href="/recipe/?id=${recipe.id}" class="fbad-recipe-card__cta">
							View Recipe →
						</a>
					</div>
				</div>
			</div>
		`;
	}

	// ==========================================================================
	// SEARCH STATE
	// ==========================================================================

	const SearchState = {
		currentQuery: '',
		currentFilters: {},
		currentOffset: 0,
		hasMore: true,
		searchType: 'popular' // or 'search' or 'filter'
	};

	// ==========================================================================
	// SEARCH FUNCTIONALITY
	// ==========================================================================

	function initSearch() {
		// Support both regular and full-width search boxes
		const $searchInput = $('.fbad-search__input, .fbad-search-fullwidth__input');
		const $searchButton = $('.fbad-search__button, .fbad-search-fullwidth__button');
		const $resultsContainer = $('#recipe-results, .fbad-recipe-grid');

		// Handle search
		$searchButton.on('click', function(e) {
			e.preventDefault();
			const query = $searchInput.val().trim();

			if (!query) return;

			// Show loading
			$resultsContainer.html('<div class="fbad-loading">Searching for delicious recipes...</div>');
			hideLoadMoreButton();

			// Search
			RecipeAPI.search(query)
				.then(data => {
					if (data.results && data.results.length > 0) {
						const html = data.results.map(recipe => renderRecipeCard(recipe)).join('');
						$resultsContainer.html(html);

						// Update search state
						SearchState.searchType = 'search';
						SearchState.currentQuery = query;
						SearchState.currentFilters = {};
						SearchState.currentOffset = 0;

						// Re-initialize save buttons
						initSaveButtons();

						// Show load more if we got 9 results
						if (data.results.length === 9) {
							showLoadMoreButton();
						}

						// Smooth scroll to results
						setTimeout(() => {
							$resultsContainer[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 100);
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
	// LOAD MORE BUTTON
	// ==========================================================================

	function showLoadMoreButton() {
		const $resultsContainer = $('.fbad-recipe-grid');
		// Remove existing button if any
		$('.fbad-load-more').remove();		// Add load more button
		const $loadMoreBtn = $(`
			<div class="fbad-load-more">
				<button class="fbad-load-more__btn">Load More Recipes</button>
			</div>
		`);

		$loadMoreBtn.insertAfter($resultsContainer);

		// Handle click
		$loadMoreBtn.find('button').on('click', function() {
			const $btn = $(this);
			$btn.text('Loading...').prop('disabled', true);

			// Increment offset
			SearchState.currentOffset += 9;

			// Determine what to load based on search type
			let loadPromise;

			if (SearchState.searchType === 'search') {
				loadPromise = RecipeAPI.search(SearchState.currentQuery, {
					...SearchState.currentFilters,
					number: 9,
					offset: SearchState.currentOffset
				});
			} else if (SearchState.searchType === 'filter') {
				loadPromise = RecipeAPI.search(SearchState.currentQuery || '', {
					...SearchState.currentFilters,
					number: 9,
					offset: SearchState.currentOffset
				});
			} else {
				// Load more popular recipes
				loadPromise = $.ajax({
					url: foodBlogsData.ajaxUrl,
					type: 'POST',
					data: {
						action: 'get_popular_recipes',
						nonce: foodBlogsData.nonce,
						number: 9,
						offset: SearchState.currentOffset
					}
				}).then(response => response.data);
			}

			loadPromise.then(data => {
				if (data.results && data.results.length > 0) {
					const html = data.results.map(recipe => renderRecipeCard(recipe)).join('');
					$resultsContainer.append(html);
					initSaveButtons();

					// If less than 9 results, hide load more button
					if (data.results.length < 9) {
						$loadMoreBtn.remove();
					} else {
						$btn.text('Load More Recipes').prop('disabled', false);
					}
				} else {
					$loadMoreBtn.remove();
					showToast('No more recipes to load!');
				}
			}).catch(error => {
				console.error('Load more error:', error);
				$btn.text('Load More Recipes').prop('disabled', false);
				showToast('Error loading more recipes');
			});
		});
	}

	function hideLoadMoreButton() {
		$('.fbad-load-more').remove();
	}

	// ==========================================================================
	// LOAD INITIAL RECIPES
	// ==========================================================================

	function loadInitialRecipes() {
		const $resultsContainer = $('.fbad-recipe-grid');

		// Only load if the grid exists
		if ($resultsContainer.length === 0) {
			return;
		}

		// Skip if there are already recipe cards loaded
		if ($resultsContainer.find('.fbad-recipe-card').length > 0) {
			return;
		}

		// Show loading
		$resultsContainer.html('<div class="fbad-loading">Loading popular recipes...</div>');

		// Fetch popular recipes
		$.ajax({
			url: foodBlogsData.ajaxUrl,
			type: 'POST',
			data: {
				action: 'get_popular_recipes',
				nonce: foodBlogsData.nonce,
				number: 9
			},
			success: function(response) {
				if (response.success && response.data.results && response.data.results.length > 0) {
					const html = response.data.results.map(recipe => renderRecipeCard(recipe)).join('');
					$resultsContainer.html(html);
					initSaveButtons();

					// Update search state
					SearchState.searchType = 'popular';
					SearchState.currentQuery = '';
					SearchState.currentFilters = {};
					SearchState.currentOffset = 0;

					// Show load more button if we got 9 results
					if (response.data.results.length === 9) {
						showLoadMoreButton();
					}
				} else {
					$resultsContainer.html('<div class="fbad-loading">Use the search box above to find recipes!</div>');
				}
			},
			error: function() {
				$resultsContainer.html('<div class="fbad-loading">Use the search box above to find recipes!</div>');
			}
		});
	}

	// ==========================================================================
	// SAVE BUTTON FUNCTIONALITY
	// ==========================================================================

	function initSaveButtons() {
		// Remove any existing handlers to prevent double-firing
		$(document).off('click', '.fbad-save-btn').on('click', '.fbad-save-btn', function(e) {
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

			// Update all buttons for that recipe on the current page for consistent UI state
			const selector = `.fbad-save-btn[data-recipe-id="${recipeId}"]`;
			$(selector).each(function() {
				const $el = $(this);
				if (isSaved) {
					$el.addClass('is-saved');
					$el.attr('aria-pressed', 'true');
					if ($el.find('.fbad-save-icon').length) {
						$el.find('.fbad-save-icon').text(heartFilled);
					} else {
						$el.find('span').first().text(heartFilled);
					}
					$el.find('.fbad-recipe-detail__save-text').text('Saved!');
					$el.attr('aria-label', 'Saved recipe');
				} else {
					$el.removeClass('is-saved');
					$el.attr('aria-pressed', 'false');
					if ($el.find('.fbad-save-icon').length) {
						$el.find('.fbad-save-icon').text(heartOutline);
					} else {
						$el.find('span').first().text(heartOutline);
					}
					$el.find('.fbad-recipe-detail__save-text').text('Save Recipe');
					$el.attr('aria-label', 'Save recipe');
				}
			});

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

			// Get current search query - support both search box types
			const $searchInput = $('.fbad-search__input, .fbad-search-fullwidth__input');
			const query = $searchInput.val() ? $searchInput.val().trim() : '';

			if (!query && Object.keys(activeFilters).length === 0) {
				return; // No search or filters active
			}

			// Search with filters
			const $resultsContainer = $('.fbad-recipe-grid');
			$resultsContainer.html('<div class="fbad-loading">Filtering recipes...</div>');
			hideLoadMoreButton();

			RecipeAPI.search(query || '', activeFilters)
				.then(data => {
					if (data.results && data.results.length > 0) {
						const html = data.results.map(recipe => renderRecipeCard(recipe)).join('');
						$resultsContainer.html(html);

						// Update search state
						SearchState.searchType = 'filter';
						SearchState.currentQuery = query;
						SearchState.currentFilters = activeFilters;
						SearchState.currentOffset = 0;

						// Re-initialize save buttons
						initSaveButtons();

						// Show load more if we got 9 results
						if (data.results.length === 9) {
							showLoadMoreButton();
						}

						// Smooth scroll to results
						setTimeout(() => {
							$resultsContainer[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
						}, 100);
					} else {
						$resultsContainer.html('<div class="fbad-loading">No recipes found with these filters.</div>');
					}
				})
				.catch(error => {
					console.error('Filter error:', error);
					$resultsContainer.html('<div class="fbad-error">Error filtering recipes.</div>');
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
	// SAVED RECIPES LIST ITEM
	// ==========================================================================

	function renderSavedRecipeListItem(recipe) {
		return `
			<div class="fbad-saved-item">
				<div class="fbad-saved-item__content">
					<h3 class="fbad-saved-item__title">${recipe.title}</h3>
					<div class="fbad-saved-item__meta">
						${recipe.readyInMinutes ? `<span>⏱️ ${recipe.readyInMinutes} mins</span>` : ''}
						${recipe.servings ? `<span>🍽️ ${recipe.servings} servings</span>` : ''}
					</div>
				</div>
				<div class="fbad-saved-item__actions">
					<a href="/recipe/?id=${recipe.id}" class="fbad-saved-item__view">View Recipe →</a>
					<button class="fbad-saved-item__remove" data-recipe-id="${recipe.id}" aria-label="Remove recipe">
						<span class="fbad-save-icon">❤️</span>
					</button>
				</div>
			</div>
		`;
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
							<div class="fbad-saved-list">
								${saved.map(recipe => renderSavedRecipeListItem(recipe)).join('')}
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
						.fbad-modal__content { position: relative; background: var(--color-cream); max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; border-radius: 16px; padding: 32px; }
						.fbad-modal__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 2px solid var(--color-sage); padding-bottom: 16px; }
						.fbad-modal__header h2 { margin: 0; font-family: var(--font-display); color: var(--color-charcoal); }
						.fbad-modal__close { background: none; border: none; font-size: 32px; cursor: pointer; color: var(--color-charcoal); padding: 0; line-height: 1; }
						.fbad-modal__close:hover { color: var(--color-cta); }
						.fbad-saved-list { display: flex; flex-direction: column; gap: 12px; }
						.fbad-saved-item { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--color-white); border-radius: 8px; border: 1px solid rgba(180, 199, 180, 0.3); transition: all 0.2s ease; }
						.fbad-saved-item:hover { border-color: var(--color-sage); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
						.fbad-saved-item__content { flex: 1; }
						.fbad-saved-item__title { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: var(--color-charcoal); }
						.fbad-saved-item__meta { display: flex; gap: 16px; font-size: 14px; color: var(--color-text-light); }
						.fbad-saved-item__actions { display: flex; align-items: center; gap: 12px; }
						.fbad-saved-item__view { padding: 8px 16px; background: var(--color-cta); color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; transition: background 0.2s ease; white-space: nowrap; }
						.fbad-saved-item__view:hover { background: var(--color-charcoal); color: white; }
						.fbad-saved-item__remove { background: none; border: none; font-size: 24px; cursor: pointer; padding: 4px; line-height: 1; transition: transform 0.2s ease; }
						.fbad-saved-item__remove:hover { transform: scale(1.2); }
					`)
					.appendTo('head');
			}
			
			// Add modal to page
			$('body').append(modalHtml);

			// Remove button handler
			$('.fbad-saved-item__remove').on('click', function() {
				const recipeId = parseInt($(this).data('recipe-id'));
				SavedRecipes.remove(recipeId);

				// Remove the item from the list
				$(this).closest('.fbad-saved-item').fadeOut(300, function() {
					$(this).remove();

					// If no more items, close modal
					if ($('.fbad-saved-item').length === 0) {
						$('.fbad-modal').remove();
						showToast('All recipes removed!');
					}
				});

				showToast('Recipe removed!');
			});

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
		loadInitialRecipes();

		console.log('🍳 Food Blogs Are Dumb initialized!');
	});

})(jQuery);