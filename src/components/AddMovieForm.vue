<template>
  <div class="addMovieForm">
    <h3>Add a movie</h3>

    <div class="addMovieForm__row">
      <label>IMDb URL or ID</label>
      <input v-model="movieInput" type="text" placeholder="https://www.imdb.com/title/tt0126029/?_ssoLoop=1" />
    </div>

    <button class="button_slide" @click="loadMovieFromImdb">Load movie</button>

    <div v-if="moviePreview" class="addMovieForm__manualFields">
      <div class="addMovieForm__row">
        <label>Streaming</label>
        <div class="addMovieForm__checkboxGrid">
          <label v-for="option in streamingOptions" :key="option.value" class="addMovieForm__checkboxItem">
            <input type="checkbox" :value="option.value" v-model="streamingSelection" />
            <span class="addMovieForm__checkboxMark" aria-hidden="true"></span>
            <span>{{ option.label }}</span>
          </label>
        </div>
      </div>

      <div class="addMovieForm__row">
        <label>Van Ready</label>
        <select v-model="vanReadyOption" class="addMovieForm__select">
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="addMovieForm__error">{{ error }}</div>

    <div v-if="moviePreview" class="addMovieForm__preview">
      <div class="addMovieForm__previewCard">
        <img :src="moviePreview.Poster || defaultPoster" alt="movie poster" />
        <div>
          <h4>{{ moviePreview.Title }}</h4>
          <p>{{ moviePreview.Year }} · {{ moviePreview.Runtime }} · {{ moviePreview.Genre }}</p>
          <p>{{ moviePreview.Plot }}</p>
        </div>
      </div>

      <div class="addMovieForm__actions">
        <button class="button_slide" @click="saveMovie">Save to collection</button>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase';

export default {
  name: 'AddMovieForm',
  emits: ['movie-saved'],
  data() {
    return {
      movieInput: '',
      moviePreview: null,
      error: '',
      streaming: 'Unknown',
      streamingSelection: [],
      streamingOptions: [
        { label: 'Fandango', value: 'Fandango' },
        { label: 'Prime Video', value: 'Prime Video' },
        { label: 'Movies Anywhere', value: 'Movies Anywhere' },
        { label: 'iTunes', value: 'iTunes' },
        { label: '4K', value: '4K' },
        { label: 'Blu-Ray', value: 'Blu-Ray' },
        { label: 'DVD', value: 'DVD' },
      ],
      vanReady: false,
      vanReadyOption: 'No',
      defaultPoster: 'https://placehold.co/300x450/111827/ffffff?text=No+Poster',
    };
  },
  watch: {
    vanReadyOption(newValue) {
      this.vanReady = newValue === 'Yes';
    },
    streamingSelection(newValue) {
      const selectedValues = Array.isArray(newValue) ? newValue : [newValue];
      const cleaned = selectedValues.filter(Boolean);
      this.streaming = cleaned.length ? cleaned.join(', ') : 'Unknown';
    },
  },
  methods: {
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
    extractImdbId(input) {
      if (!input || input.trim() === '') {
        return '';
      }

      const trimmed = input.trim();
      const urlMatch = trimmed.match(/\/title\/(tt\d+)/i);
      if (urlMatch) {
        return urlMatch[1];
      }

      return trimmed.replace(/[^a-zA-Z0-9]/g, '');
    },
    async loadMovieFromImdb() {
      const imdbId = this.extractImdbId(this.movieInput);
      if (!imdbId) {
        this.error = 'Please paste an IMDb URL or IMDb ID.';
        return;
      }

      this.error = '';

      try {
        const apiKey = process.env.VUE_APP_OMDB_API_KEY;
        const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${apiKey}`;
        const response = await fetch(url);
        const result = await response.json();

        if (result.Response === 'False') {
          this.error = result.Error || 'Movie not found.';
          this.moviePreview = null;
          return;
        }

        const sanitizedPoster = this.normalizePosterUrl(result.Poster);

        this.moviePreview = {
          Title: result.Title,
          Year: result.Year,
          Runtime: result.Runtime,
          Genre: result.Genre,
          Plot: result.Plot,
          Poster: sanitizedPoster || this.defaultPoster,
          Rated: result.Rated,
          Actors: result.Actors,
          Director: result.Director,
          imdbID: result.imdbID,
          imdbRating: result.imdbRating,
          Streaming: this.streaming || 'Unknown',
          Ratings: result.Ratings || [],
        };
        this.streaming = this.streaming || 'Unknown';
        this.vanReadyOption = this.vanReady ? 'Yes' : 'No';
      } catch (err) {
        this.error = 'Unable to load movie from OMDb.';
        this.moviePreview = null;
      }
    },
    async saveMovie() {
      if (!this.moviePreview) {
        this.error = 'Load a movie before saving.';
        return;
      }

      const payload = {
        title: this.moviePreview.Title,
        year: Number(this.moviePreview.Year) || null,
        genre: this.moviePreview.Genre,
        streaming: this.streaming || 'Unknown',
        poster: this.normalizePosterUrl(this.moviePreview.Poster) || this.defaultPoster,
        plot: this.moviePreview.Plot,
        actors: this.moviePreview.Actors,
        director: this.moviePreview.Director,
        imdb_id: this.moviePreview.imdbID,
        imdb_rating: this.moviePreview.imdbRating,
        runtime: this.moviePreview.Runtime,
        rated: this.moviePreview.Rated,
        van_ready: this.vanReady,
        source: 'omdb',
      };

      const { error } = await supabase.from('movies').insert(payload);

      if (error) {
        this.error = error.message;
        return;
      }

      this.$emit('movie-saved');
      this.movieInput = '';
      this.moviePreview = null;
      this.streaming = 'Unknown';
      this.streamingSelection = ['Unknown'];
      this.vanReady = false;
      this.vanReadyOption = 'No';
      this.error = '';
    },
  },
};
</script>

<style scoped>
.addMovieForm {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 18px;
  color: #fff;
}

.addMovieForm h3 {
  margin: 0 0 14px 0;
}

.addMovieForm__row {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.addMovieForm input,
.addMovieForm select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(22, 22, 22, 0.7);
  color: #fff;
  box-sizing: border-box;
}

.addMovieForm__select {
  appearance: none;
}

.addMovieForm__checkboxGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  padding: 8px 0;
}

.addMovieForm__checkboxItem {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(22, 22, 22, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 8px 12px;
  color: #fff;
  cursor: pointer;
}

.addMovieForm__checkboxItem input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.addMovieForm__checkboxMark {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  background: transparent;
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

.addMovieForm__checkboxItem input:checked + .addMovieForm__checkboxMark {
  background: #87d7a6;
  border-color: #87d7a6;
  box-shadow: inset 0 0 0 4px rgba(10, 17, 18, 0.75);
}

.addMovieForm__preview {
  margin-top: 18px;
}

.addMovieForm__previewCard {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  align-items: start;
}

.addMovieForm__previewCard img {
  width: 100%;
  border-radius: 8px;
}

.addMovieForm__error {
  color: #ff9aa2;
  margin-top: 12px;
}

.addMovieForm__manualFields {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.addMovieForm__checkboxRow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
}

.addMovieForm__actions {
  margin-top: 14px;
}
</style>
