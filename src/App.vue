<template>
	<div class="movieList">
		<section
			class="row movieList__header header grid"
			:class="{ filtersOpen: filtersOpen }"
		>
			<div class="header__left grid">
				<img
					@click="mobileFilterToggle"
					src="./assets/images/movies-icon.png"
					alt=""
					class="logo"
				/>
				<h1 class="hidden-sm">Massive Movie<br />Collection</h1>
				<h1 class="visible-sm">Massive Movie Collection</h1>
			</div>
			<div class="header__right hidden-sm grid">
				<button class="menuButton" @click="toggleDesktopMenu">
					{{ desktopMenuOpen ? 'Close Menu' : 'Menu' }}
				</button>

				<div class="header__controls" :class="{ open: desktopMenuOpen }">
					<search-input v-model:searchQuery="searchQuery" />

					<div class="header__right--bottom grid">
						<div class="header__filterRow">
							<genre-multi-filter ref="desktopGenreFilter" v-model="genreFilters" @opened="closeFilterDropdown('desktopGenreFilter')" />
							<genre-multi-filter ref="desktopRatedFilter" v-model="ratedFilters" :options="ratedOptions" all-label="All Ratings" @opened="closeFilterDropdown('desktopRatedFilter')" />
							<select v-model="collectionFilter" aria-label="Filter by collection" @change="closeAllFilterDropdowns">
								<option value="all">All movies</option>
								<option value="vanReady">Van Ready</option>
								<option value="streaming">Streaming</option>
								<option value="hardCopy">Hard Copy</option>
							</select>
						</div>
						<div class="header__actionRow">
                            <button class="button_slide button_slide--reset" @click="resetSearch">Clear Filters</button>
							<button class="button_slide" @click="openRecommendation">Recommendation</button>
							<span aria-hidden="true"></span>
							<button class="button_slide button_addMovie" @click="toggleAddMovieForm">Add Movie</button>
						</div>

					</div>
				</div>
			</div>
		</section>
		<div
			class="mobileFilters visible-sm grid"
			:class="{ visible: filtersOpen }"
		>
			<search-input v-model:searchQuery="searchQuery" />

			<div class="mobileFilters__bottom grid">
				<genre-multi-filter ref="mobileGenreFilter" v-model="genreFilters" @opened="closeFilterDropdown('mobileGenreFilter')" />
				<genre-multi-filter ref="mobileRatedFilter" v-model="ratedFilters" :options="ratedOptions" all-label="All Ratings" @opened="closeFilterDropdown('mobileRatedFilter')" />
				<select v-model="collectionFilter" aria-label="Filter by collection" @change="closeAllFilterDropdowns">
					<option value="all">All movies</option>
					<option value="vanReady">Van Ready</option>
					<option value="streaming">Streaming</option>
					<option value="hardCopy">Hard Copy</option>
				</select>
				<button
					class="button_slide button_slide--reset"
					@click="resetSearch"
				>
					Clear Filters
				</button>
                <button class="button_slide" @click="openRecommendation">
					Recommendation
				</button>
				<button class="button_slide button_addMovie" @click="toggleAddMovieForm">
					Add Movie
				</button>
				<span
					class="visible-sm hidden-xs"
					style="text-align: center"
					>{{ filteredMovies.length }} Matching Results</span
				>
			</div>
		</div>

		<teleport to="body">
			<div v-if="movieFormOpen" class="modal movieInfo addMovieOverlay">
				<add-movie-form @movie-saved="handleMovieSaved" />
				<button class="modalToggle addMovieOverlay__close" @click="toggleAddMovieForm" aria-label="Close add movie form"></button>
			</div>
			<div v-if="recommendationOpen" class="recommendationOverlay">
				<div class="recommendationDialog">
					<button class="modalToggle" @click="recommendationOpen = false" aria-label="Close recommendation form"></button>
					<h2>Recommend a movie</h2>
					<p>Select at least one genre and rating.</p>
					<label>Genres</label>
					<genre-multi-filter ref="recommendationGenreFilter" v-model="recommendationGenres" @opened="closeFilterDropdown('recommendationGenreFilter')" />
					<label>Ratings</label>
					<genre-multi-filter ref="recommendationRatedFilter" v-model="recommendationRatings" :options="ratedOptions" all-label="Choose Ratings" @opened="closeFilterDropdown('recommendationRatedFilter')" />
					<button class="button_slide" @click="recommendMovie">Recommend</button>
					<div v-if="recommendationError" class="addMovieForm__error">{{ recommendationError }}</div>
				</div>
			</div>
		</teleport>

		<movie-card
			v-if="recommendation"
			:key="`recommendation-${recommendation.imdbID || recommendation.Title}`"
			:genre="recommendation.Genre"
			:streaming="recommendation.Streaming"
			:rated="recommendation.Rated"
			:rating="getRatingValue(recommendation)"
			:runtime="recommendation.Runtime"
			:poster="recommendation.Poster"
			:title="recommendation.Title"
			:link="imdbLink + recommendation.imdbID"
			:plot="recommendation.Plot"
			:year="recommendation.Year"
			:initial-modal-open="true"
			:show-card="false"
			overlay-heading="Recommended Movie:"
		/>

		<div class="movieCard__container">
			<movie-card
				v-for="movie in filteredMovies"
				:key="movie.imdbID || movie.Title"
				:genre="movie.Genre"
				:streaming="movie.Streaming"
				:rated="movie.Rated"
				:rating="getRatingValue(movie)"
				:runtime="movie.Runtime"
				:poster="movie.Poster"
				:title="movie.Title"
				:link="imdbLink + movie.imdbID"
				:plot="movie.Plot"
				:year="movie.Year"
			></movie-card>
		</div>
	</div>
	<a href="#top" class="scrollTop"></a>
	<button @click="mobileFilterToggle" class="visible-xs filterToggle grid">
		<svg>
			<rect x="0" y="0" fill="none" width="100%" height="100%" />
		</svg>
		<img
			v-if="filtersOpen"
			src="./assets/images/view.svg"
			alt="decorational no alt text needed"
		/>
		<img
			v-else
			src="./assets/images/filter.svg"
			alt="decorational no alt text needed"
		/>
		<span v-if="filtersOpen">View {{ filteredMovies.length }} Results</span>
		<span v-else>Filter Selection</span>
	</button>
</template>

<script>
	import MovieCard from './components/MovieCard.vue';
	import SearchInput from './components/SearchInput.vue';
	import GenreMultiFilter from './components/GenreMultiFilter.vue';
	import AddMovieForm from './components/AddMovieForm.vue';
	import { supabase } from './lib/supabase';
	import confetti from 'canvas-confetti';

	export default {
		components: {
			MovieCard,
			SearchInput,
			GenreMultiFilter,
			AddMovieForm,
		},
		data() {
			return {
				imdbLink: 'https://www.imdb.com/title/',
				movies: [],
				searchQuery: '',
				collectionFilter: 'all',
				genreFilters: [],
				ratedFilters: [],
				filtersOpen: false,
				movieFormOpen: false,
				recommendation: null,
				recommendationOpen: false,
				recommendationGenres: [],
				recommendationRatings: [],
				recommendationError: '',
				formScrollY: 0,
				ratedOptions: [
					{ id: 'G', label: 'G' },
					{ id: 'PG', label: 'PG' },
					{ id: 'PG-13', label: 'PG-13' },
					{ id: 'R', label: 'R' },
					{ id: 'NC-17', label: 'NC-17' },
					{ id: 'TV-G', label: 'TV-G' },
					{ id: 'TV-PG', label: 'TV-PG' },
					{ id: 'TV-14', label: 'TV-14' },
					{ id: 'TV-MA', label: 'TV-MA' },
					{ id: 'N/A', label: 'Not Rated' },
				],
				desktopMenuOpen: false,
			};
		},
		mounted() {
			this.loadMovies();
			document.addEventListener('click', this.handleMenuOutsideClick);
		},
		beforeUnmount() {
			document.removeEventListener('click', this.handleMenuOutsideClick);
		},
		computed: {
			filteredMovies() {
				return this.getFilteredMovies(
					this.genreFilters,
					this.ratedFilters,
					this.collectionFilter
				);
			},
		},
		methods: {
			getFilteredMovies(genreFilters, ratedFilters, collectionFilter) {
				let filteredMovies = this.movies;
				if (this.searchQuery != '' && this.searchQuery) {
					filteredMovies = filteredMovies.filter((item) => {
						return (
							(item.Title || '')
								.toLowerCase()
								.includes(this.searchQuery.toLowerCase()) ||
							(item.Actors || '')
								.toLowerCase()
								.includes(this.searchQuery.toLowerCase())
						);
					});
				}
				if (genreFilters.length) {
					filteredMovies = filteredMovies.filter((item) => {
						const genre = (item.Genre || '').toLowerCase();
						return genreFilters.some((filter) => genre.includes(filter));
					});
				}
				if (collectionFilter == 'vanReady') {
					filteredMovies = filteredMovies.filter((item) => {
						const genre = (item.Genre || '').toLowerCase();
						const streaming = (item.Streaming || '').toLowerCase();
						return (
							(genre.includes('family') && streaming.includes('blu-ray')) ||
							(genre.includes('family') && streaming.includes('dvd'))
						);
					});
				}
				if (collectionFilter == 'streaming') {
					filteredMovies = filteredMovies.filter((item) => {
						const streaming = (this.normalizeStreamingValue(item.Streaming || '') || '').toLowerCase();
						return (
							streaming.includes('fandango') ||
							streaming.includes('prime video') ||
							streaming.includes('movies anywhere') ||
							streaming.includes('itunes')
						);
					});
				}
				if (collectionFilter == 'hardCopy') {
					filteredMovies = filteredMovies.filter((item) => {
						const streaming = (item.Streaming || '').toLowerCase();
						return (
							streaming.includes('blu-ray') ||
							streaming.includes('dvd')
						);
					});
				}
				if (ratedFilters.length) {
					filteredMovies = filteredMovies.filter((item) => {
						return ratedFilters.includes(String(item.Rated || 'N/A').trim().toUpperCase());
					});
				}
				return filteredMovies;
			},
			getRatingValue(movie) {
				const ratings = Array.isArray(movie.Ratings) ? movie.Ratings : [];
				const getSource = (rating) => String(rating?.Source ?? rating?.source ?? '').trim().toLowerCase();
				const getValue = (rating) => rating?.Value ?? rating?.value ?? null;

				const rottenTomatoes = ratings.find((rating) => {
					const source = getSource(rating);
					return source === 'rotten tomatoes' || source.includes('rotten') || source.includes('tomatoes');
				});
				const imdbRating = ratings.find((rating) => {
					const source = getSource(rating);
					return source.includes('imdb') || source.includes('internet movie database');
				});

				if (rottenTomatoes && getValue(rottenTomatoes)) {
					return getValue(rottenTomatoes);
				}
				if (imdbRating && getValue(imdbRating)) {
					return getValue(imdbRating);
				}
				return movie.imdbRating || movie.imdb_rating || 'N/A';
			},
			parseRatingScore(value) {
				if (value === null || value === undefined || value === '') {
					return 0;
				}

				const normalizedValue = String(value);
				const cleaned = normalizedValue.replace(/[^0-9.]/g, '');
				const numericValue = Number(cleaned);

				if (normalizedValue.includes('%')) {
					return Number.isFinite(numericValue) ? numericValue : 0;
				}

				if (normalizedValue.includes('/10')) {
					return Number.isFinite(numericValue) ? numericValue * 10 : 0;
				}

				return Number.isFinite(numericValue) ? numericValue : 0;
			},
			normalizeStreamingValue(value) {
				if (!value || typeof value !== 'string') {
					return '';
				}

				return value
					.split(',')
					.map((part) => part.trim())
					.map((part) => {
						if (/^vudu$/i.test(part) || /^fandango$/i.test(part)) {
							return 'Fandango';
						}
						return part;
					})
					.filter(Boolean)
					.join(', ');
			},
			normalizePosterUrl(value) {
				if (!value || typeof value !== 'string') {
					return '';
				}

				const trimmed = value.trim().replace(/^['"]+|['"]+$/g, '');
				if (!trimmed || trimmed === 'N/A') {
					return '';
				}

				try {
					const parsed = new URL(trimmed);
					const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
					const looksLikeImage = /\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?.*)?$/i.test(parsed.pathname);
					return isHttp && looksLikeImage ? parsed.href : '';
				} catch (error) {
					return '';
				}
			},
			normalizeMovie(movie) {
				const posterUrl = this.normalizePosterUrl(movie.poster || movie.Poster);
				const normalizedStreaming = this.normalizeStreamingValue(movie.streaming || movie.Streaming || '');
				const rawRatings = Array.isArray(movie.ratings)
					? movie.ratings
					: Array.isArray(movie.Ratings)
						? movie.Ratings
						: [];
				const normalizedRatings = (typeof rawRatings === 'string' ? JSON.parse(rawRatings) : rawRatings)
					.map((rating) => ({
						Source: rating.Source || rating.source || '',
						Value: rating.Value || rating.value || 'N/A',
					}))
					.filter((rating) => rating.Source && rating.Value);

				return {
					...movie,
					Title: movie.title || movie.Title || '',
					Genre: movie.genre || movie.Genre || '',
					Streaming: normalizedStreaming,
					VanReady: movie.van_ready ?? movie.VanReady ?? false,
					Rated: movie.rated || movie.Rated || 'N/A',
					Runtime: movie.runtime || movie.Runtime || 'N/A',
					Poster: posterUrl || 'https://placehold.co/300x450/111827/ffffff?text=No+Poster',
					Plot: movie.plot || movie.Plot || '',
					Actors: movie.actors || movie.Actors || '',
					Year: String(movie.year || movie.Year || ''),
					imdbID: movie.imdb_id || movie.imdbID || '',
					imdbRating: movie.imdb_rating || movie.imdbRating || 'N/A',
					Ratings: normalizedRatings.length
						? normalizedRatings
						: [
								{
									Source: 'Internet Movie Database',
									Value: movie.imdb_rating || movie.imdbRating || 'N/A',
								},
							],
				};
			},
			async loadMovies() {
				const { data, error } = await supabase
					.from('movies')
					.select('*')
					.order('title', { ascending: true });

				if (error) {
					console.error('Supabase load error:', error);
					this.movies = [];
					return;
				}

				this.movies = (data || []).map((movie) => this.normalizeMovie(movie));
			},
			handleMovieSaved() {
				this.movieFormOpen = false;
				this.loadMovies();
			},
			openRecommendation() {
				this.recommendationError = '';
				this.recommendationOpen = true;
			},
			recommendMovie() {
				if (!this.recommendationGenres.length || !this.recommendationRatings.length) {
					this.recommendationError = 'Choose at least one genre and rating.';
					return;
				}

				const candidatePool = this.movies.filter((movie) => {
					const genre = (movie.Genre || '').toLowerCase();
					const matchesGenre = this.recommendationGenres.some((filter) => genre.includes(filter));
					const ratedValue = String(movie.Rated || 'N/A').trim().toUpperCase();
					const matchesRating = this.recommendationRatings.includes(ratedValue);
					return matchesGenre && matchesRating;
				});

				if (candidatePool.length === 0) {
					this.recommendation = null;
					this.recommendationError = 'No movies match those criteria.';
					return;
				}

				const nextMovie = candidatePool[Math.floor(Math.random() * candidatePool.length)];
				this.recommendation = nextMovie;
				this.recommendationOpen = false;
			},
			resetSearch() {
				this.searchQuery = '';
				this.collectionFilter = 'all';
				this.genreFilters = [];
				this.ratedFilters = [];
				this.recommendation = null;
				this.desktopMenuOpen = false;
			},
			closeAllFilterDropdowns() {
				[
					'desktopGenreFilter',
					'desktopRatedFilter',
					'mobileGenreFilter',
					'mobileRatedFilter',
					'recommendationGenreFilter',
					'recommendationRatedFilter',
				].forEach((filterRef) => this.$refs[filterRef]?.closeMenu());
			},
			handleMenuOutsideClick(event) {
				const clickedDesktopMenu = event.target.closest('.header__controls, .menuButton');
				const clickedMobileMenu = event.target.closest('.mobileFilters, .filterToggle');

				if (!clickedDesktopMenu) {
					this.desktopMenuOpen = false;
				}
				if (!clickedMobileMenu) {
					this.filtersOpen = false;
				}
			},
			closeFilterDropdown(openedFilter) {
				const filterRefs = [
					'desktopGenreFilter',
					'desktopRatedFilter',
					'mobileGenreFilter',
					'mobileRatedFilter',
					'recommendationGenreFilter',
					'recommendationRatedFilter',
				];

				filterRefs
					.filter((filterRef) => filterRef !== openedFilter)
					.forEach((filterRef) => this.$refs[filterRef]?.closeMenu());
			},
			toggleDesktopMenu() {
				this.desktopMenuOpen = !this.desktopMenuOpen;
			},
			mobileFilterToggle() {
				if (this.filtersOpen) {
					this.filtersOpen = false;
					const documentElement = document.documentElement;
					const previousScrollBehavior = documentElement.style.scrollBehavior;
					documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, 0);
					documentElement.style.scrollBehavior = previousScrollBehavior;
					return;
				}
				this.filtersOpen = !this.filtersOpen;
			},
			toggleAddMovieForm() {
				this.desktopMenuOpen = false;
				this.filtersOpen = false;
				this.movieFormOpen = !this.movieFormOpen;
			},
		},
		watch: {
			movieFormOpen() {
				const body = document.body;
				if (this.movieFormOpen) {
					this.formScrollY = window.scrollY;
					body.style.top = `-${this.formScrollY}px`;
					body.style.position = 'fixed';
					body.style.width = '100%';
				} else {
					body.style.top = '';
					body.style.position = '';
					body.style.width = '';
					const documentElement = document.documentElement;
					const previousScrollBehavior = documentElement.style.scrollBehavior;
					documentElement.style.scrollBehavior = 'auto';
					window.scrollTo(0, this.formScrollY);
					documentElement.style.scrollBehavior = previousScrollBehavior;
				}
			},
			genreFilters() {
				let genreFilters = this.genreFilters;
				var duration = 15 * 1000;
				var animationEnd = Date.now() + duration;
				var skew = 1;

				function randomInRange(min, max) {
					return Math.random() * (max - min) + min;
				}

				(function frame() {
					var timeLeft = animationEnd - Date.now();
					var ticks = Math.max(200, 500 * (timeLeft / duration));
					skew = Math.max(0.8, skew - 0.001);

					if (genreFilters.includes('christmas')) {
						confetti({
							particleCount: 1,
							startVelocity: 0,
							ticks: ticks,
							origin: {
								x: Math.random(),
								y: Math.random() * skew - 0.2,
							},
							colors: ['#ffffff'],
							shapes: ['circle'],
							gravity: randomInRange(0.4, 0.6),
							scalar: randomInRange(0.4, 1),
							drift: randomInRange(-0.4, 0.4),
						});
					}

					if (timeLeft > 0) {
						requestAnimationFrame(frame);
					}
				})();
			},
		},
	};
</script>

<style lang="scss">
	#app {
		border: none;
	}

	.header__right--bottom select,
	.mobileFilters select,
	.recommendationDialog select {
		appearance: none;
		padding: 8px 12px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(9, 9, 11, 0.7);
		color: #fff;
	}

	.header__right--bottom select[multiple],
	.mobileFilters select[multiple],
	.recommendationDialog select[multiple] {
		min-height: 44px;
	}

	.addMovieOverlay {
		justify-content: flex-start;
		padding-top: 80px;
	}

	.addMovieOverlay .addMovieForm {
		width: min(720px, 100%);
		box-sizing: border-box;
	}

	.addMovieOverlay__close {
		position: absolute;
		right: 20px;
		top: 20px;
		width: 30px;
		height: 30px;
		background: transparent url('./assets/images/close-icon.svg') center / 100% no-repeat;
		cursor: pointer;
	}

	.recommendationOverlay {
		position: fixed;
		inset: 0;
		z-index: 6;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(0, 0, 0, 0.82);
	}

	.recommendationDialog {
		position: relative;
		width: min(520px, 100%);
		display: grid;
		gap: 12px;
		padding: 28px;
		background: #141414;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #fff;
	}

	.recommendationDialog h2 {
		margin: 0;
	}

	.recommendationDialog .modalToggle {
		position: absolute;
		right: 20px;
		top: 20px;
	}

	.recommendationRatings {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.button_addMovie {
		grid-column: -1;
		background: #87d7a6;
		border-color: #87d7a6;
		color: #141414;
		font-weight: 500;
		box-shadow: inset 0 0 0 0 #b5f2c9;
	}

	.button_addMovie:hover {
		color: #141414;
		box-shadow: inset 0 0 0 50px #b5f2c9;
	}

	@media screen and (max-width: 1024px) {
		.mobileFilters .button_addMovie {
			grid-column: auto;
		}
	}
</style>
