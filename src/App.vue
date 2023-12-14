<template>
  <div class="movieList" :class="rushing ? 'header-expanded' : ''">
    <section
      class="row movieList__header header grid"
      :class="{ filtersOpen: filtersOpen }"
    >
      <div class="header__left grid">
        <img src="./assets/images/movies-icon.png" alt="" class="logo" />
        <h1 class="hidden-sm">Massive Movie<br />Collection</h1>
        <h1 class="visible-sm">Massive Movie Collection</h1>
      </div>
      <div class="header__right hidden-xs grid">
        <!-- Practice two-way binding by emitting event in component -->
        <search-input v-model:searchQuery="searchQuery" />

        <div class="header__right--bottom grid">
          <!-- Much simpler to use v-model in main App.vue and run the options through a component -->
          <select
            class="round"
            name="filterGenre"
            id="filter-genre"
            v-model="filterGenre"
          >
            <genre-filter></genre-filter>
          </select>
          <!-- Fun use of v-if to practice displaying dynamic content based on if something is truthy or not -->
          <button class="button_slide" @click="inARush">
            <span v-if="!rushing"> I'm limited on time </span>
            <span v-else> I've got all the time in the world </span>
          </button>
          <button class="button_slide button_slide--reset" @click="resetSearch">
            Reset
          </button>
          <!-- Display Runtime Filter if I'm in a rush, otherwise keep the UI less cluttered -->
          <div class="runtimeFilter" :class="{ visible: rushing }">
            <runtime-filter v-model:maxRuntime="maxRuntime" />
          </div>
        </div>
      </div>
    </section>

    <div
      class="mobileFilters visible-xs grid"
      :class="{ visible: filtersOpen }"
    >
      <search-input v-model:searchQuery="searchQuery" />

      <div class="mobileFilters__bottom grid">
        <select
          class="round"
          name="filterGenre"
          id="filter-genre"
          v-model="filterGenre"
        >
          <genre-filter></genre-filter>
        </select>
        <button class="button_slide" @click="inARush">
          <span v-if="!rushing"> I'm limited on time </span>
          <span v-else> I've got all the time in the world </span>
        </button>
        <button class="button_slide button_slide--reset" @click="resetSearch">
          Reset
        </button>
        <div class="runtimeFilter" :class="{ visible: rushing }">
          <runtime-filter v-model:maxRuntime="maxRuntime" />
        </div>
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
      ></movie-card>
    </div>
  </div>
  <a href="#top" class="visible-xs scrollTop"></a>
  <button
    @click="mobileFilterDropdown"
    class="visible-xs filterDropdownToggle grid"
  >
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
    <span v-else>Narrow Down Choices</span>
  </button>
</template>

<script>
// Import movies array from storage file
import movies from './components/MovieStorage.vue';

export default {
  data() {
    return {
      imdbLink: 'https://www.imdb.com/title/',
      // set movies equal to the array from the storage file
      movies: movies,
      searchQuery: '',
      filterGenre: 'all',
      maxRuntime: null,
      rushing: false,
      filtersOpen: false,
    };
  },
  computed: {
    filteredMovies() {
      let filteredMovies = this.movies;
      // Return movies that match the searched title or actor
      if (this.searchQuery != '' && this.searchQuery) {
        filteredMovies = filteredMovies.filter((item) => {
          return (
            item.Title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            item.Actors.toLowerCase().includes(this.searchQuery.toLowerCase())
          );
        });
      }
      // Return movies that match the selected genre
      if (
        this.filterGenre !== 'all' &&
        this.filterGenre !== 'vanReady' &&
        this.filterGenre !== 'onlyTheBest'
      ) {
        filteredMovies = filteredMovies.filter((item) => {
          return item.Genre.toLowerCase().includes(
            this.filterGenre.toLowerCase()
          );
        });
      }
      // Return "Van Ready" movies that have a hard copy and are family friendly
      if (this.filterGenre == 'vanReady') {
        filteredMovies = filteredMovies.filter((item) => {
          return (
            (item.Genre.toLowerCase().includes('family') &&
              item.Streaming.toLowerCase().includes('blu-ray')) ||
            (item.Genre.toLowerCase().includes('family') &&
              item.Streaming.toLowerCase().includes('dvd'))
          );
        });
      }
      // Return movies that have a Rotten Tomatoes score >= 75%
      if (this.filterGenre == 'onlyTheBest') {
        filteredMovies = filteredMovies.filter((item) => {
          return parseInt(item.Ratings[1].Value) >= 75;
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
      this.filterGenre = 'all';
      this.maxRuntime = null;
      this.rushing = false;
    },
    // Show the runtime filter when clicked
    inARush() {
      this.rushing = !this.rushing;
    },
    // Show the mobile search and filters when clicked
    mobileFilterDropdown() {
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
  },
};
</script>

<style lang="scss">
#app {
  border: none;
}
</style>
