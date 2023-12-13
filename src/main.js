import { createApp } from 'vue';

import App from './App.vue';

import MovieCard from './components/MovieCard.vue';

import SearchInput from './components/SearchInput.vue';

import GenreFilter from './components/GenreFilter.vue';

import RuntimeFilter from './components/RuntimeFilter.vue';

const app = createApp(App);

app.component('movie-card', MovieCard);

app.component('search-input', SearchInput);

app.component('genre-filter', GenreFilter);

app.component('runtime-filter', RuntimeFilter);

app.mount('#app');
