<template>
	<!-- Add header-expanded class if rushing is true -->
	<div class="movieList" :class="rushing ? 'header-expanded' : ''">
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
				<!-- Practice emitting event from component -->
				<search-input v-model:searchQuery="searchQuery" />

				<div class="header__right--bottom grid">
					<!-- Much simpler to use v-model in main App.vue and run the options through a component -->
					<select
						name="filterOption"
						id="filter-option"
						v-model="filterOption"
					>
						<movie-filter></movie-filter>
					</select>
					<!-- Fun use of v-if to practice displaying dynamic content based on if something is truthy or not -->
					<button class="button_slide" @click="inARush">
						<span v-if="!rushing">Time Crunch!</span>
						<span v-else
							>I've got all the time in the world</span
						>
					</button>
					<button
						class="button_slide button_slide--reset"
						@click="resetSearch"
					>
						Reset
					</button>

					<!-- Display Runtime Filter if I'm in a rush, otherwise keep the UI less cluttered -->
					<div
						class="runtimeFilter"
						:class="{ visible: rushing }"
					>
						<runtime-filter v-model:maxRuntime="maxRuntime" />
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
				<select
					name="filterOption"
					id="filter-option"
					v-model="filterOption"
				>
					<movie-filter></movie-filter>
				</select>
				<button class="button_slide" @click="inARush">
					<span v-if="!rushing">Time Crunch!</span>
					<span v-else>I've got all the time in the world</span>
				</button>
				<button
					class="button_slide button_slide--reset"
					@click="resetSearch"
				>
					Reset
				</button>
				<div class="runtimeFilter" :class="{ visible: rushing }">
					<runtime-filter v-model:maxRuntime="maxRuntime" />
				</div>
				<span
					class="visible-sm hidden-xs"
					style="text-align: center"
					>{{ filteredMovies.length }} Matching Results</span
				>
			</div>
		</div>

		<div class="movieCard__container">
			<movie-card
				v-for="movie in filteredMovies"
				:key="movie.Title"
				:genre="movie.Genre"
				:streaming="movie.Streaming"
				:rated="movie.Rated"
				:rating="movie.Ratings[1].Value"
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
		<span v-if="filtersOpen"
			>View {{ filteredMovies.length }} Results</span
		>
		<span v-else>Filter Selection</span>
	</button>
</template>

<script>
	import movies from './components/MovieStorage.vue';
	import MovieCard from './components/MovieCard.vue';
	import SearchInput from './components/SearchInput.vue';
	import MovieFilter from './components/MovieFilter.vue';
	import RuntimeFilter from './components/RuntimeFilter.vue';
	import confetti from 'canvas-confetti';

	export default {
		components: {
			MovieCard,
			SearchInput,
			MovieFilter,
			RuntimeFilter,
		},

		data() {
			return {
				imdbLink: 'https://www.imdb.com/title/',
				// set movies equal to the array from the storage file
				movies: movies,
				searchQuery: '',
				filterOption: 'all',
				maxRuntime: null,
				rushing: false,
				filtersOpen: false,
				overlayOpen: false,
			};
		},
		computed: {
			filteredMovies() {
				let filteredMovies = this.movies;
				// Return movies that match the searched title or actor
				if (this.searchQuery != '' && this.searchQuery) {
					filteredMovies = filteredMovies.filter((item) => {
						return (
							item.Title.toLowerCase().includes(
								this.searchQuery.toLowerCase()
							) ||
							item.Actors.toLowerCase().includes(
								this.searchQuery.toLowerCase()
							)
						);
					});
				}
				// Return movies that match the selected genre, if not a non-genre option
				if (
					this.filterOption !== 'all' &&
					this.filterOption !== 'vanReady' &&
					this.filterOption !== 'onlyTheBest' &&
					this.filterOption !== 'streaming' &&
					this.filterOption !== 'hardCopy'
				) {
					filteredMovies = filteredMovies.filter((item) => {
						return item.Genre.toLowerCase().includes(
							this.filterOption.toLowerCase()
						);
					});
				}
				// Return "Van Ready" movies that have a hard copy and are family friendly
				if (this.filterOption == 'vanReady') {
					filteredMovies = filteredMovies.filter((item) => {
						return (
							(item.Genre.toLowerCase().includes(
								'family'
							) &&
								item.Streaming.toLowerCase().includes(
									'blu-ray'
								)) ||
							(item.Genre.toLowerCase().includes(
								'family'
							) &&
								item.Streaming.toLowerCase().includes(
									'dvd'
								))
						);
					});
				}
				// Return movies that have a Rotten Tomatoes score >= 75%
				if (this.filterOption == 'onlyTheBest') {
					filteredMovies = filteredMovies.filter((item) => {
						return parseInt(item.Ratings[1].Value) >= 75;
					});
				}
				// Return movies that are available on a streaming platform
				if (this.filterOption == 'streaming') {
					filteredMovies = filteredMovies.filter((item) => {
						return (
							item.Streaming.toLowerCase().includes(
								'vudu'
							) ||
							item.Streaming.toLowerCase().includes(
								'prime video'
							) ||
							item.Streaming.toLowerCase().includes(
								'movies anywhere'
							) ||
							item.Streaming.toLowerCase().includes(
								'itunes'
							)
						);
					});
				}
				// Return movies that we have a hard copy of
				if (this.filterOption == 'hardCopy') {
					filteredMovies = filteredMovies.filter((item) => {
						return (
							item.Streaming.toLowerCase().includes(
								'blu-ray'
							) ||
							item.Streaming.toLowerCase().includes('dvd')
						);
					});
				}
				// Return movies based on maximum runtime selected
				if (this.maxRuntime)
					filteredMovies = filteredMovies.filter((item) => {
						// movies JSON has runtime as a String, so need to parse the integer out of it to return a number to compare to maxRuntime
						return parseInt(item.Runtime) <= this.maxRuntime;
					});

				return filteredMovies;
			},
		},
		methods: {
			// Clear the filters and search when clicked
			resetSearch() {
				this.searchQuery = '';
				this.filterOption = 'all';
				this.maxRuntime = null;
				this.rushing = false;
			},
			// Show the runtime filter when clicked
			inARush() {
				this.rushing = !this.rushing;
			},
			// Show the mobile search and filters when clicked
			mobileFilterToggle() {
				this.filtersOpen = !this.filtersOpen;
			},
		},
		watch: {
			// Watch for if modal is open, and if so prevent the body from scrolling
			filtersOpen() {
				let body = document.body;
				if (this.filtersOpen) {
					body.style.position = 'fixed';
					body.style.top = `-${window.scrollY}px`;
				} else {
					const scrollY = body.style.top;
					body.style.position = '';
					body.style.top = '';
					window.scrollTo(0, parseInt(scrollY || '0') * -1);
				}
			},
			// Watch for if Christmas is selected, then make it snow
			filterOption() {
				let filterOption = this.filterOption;
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

					if (filterOption == 'christmas') {
						confetti({
							particleCount: 1,
							startVelocity: 0,
							ticks: ticks,
							origin: {
								x: Math.random(),
								// since particles fall down, skew start toward the top
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
</style>
