require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const movies = require('./movies.json');

const supabase = createClient(
  process.env.VUE_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importMovies() {
  const rows = movies.map((movie) => ({
    title: movie.Title || '',
    year: Number(movie.Year) || null,
    genre: movie.Genre || '',
    streaming: movie.Streaming || '',
    poster: movie.Poster || '',
    plot: movie.Plot || '',
    actors: movie.Actors || '',
    director: movie.Director || '',
    imdb_id: movie.imdbID || '',
    imdb_rating: movie.imdbRating || '',
    runtime: movie.Runtime || '',
    rated: movie.Rated || '',
    van_ready: Boolean(movie.VanReady),
    ratings: Array.isArray(movie.Ratings) ? movie.Ratings : [],
    source: 'movie_storage',
  }));

  const { data, error } = await supabase.from('movies').insert(rows);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Imported', rows.length, 'movies');
}

importMovies();