<template>
  <option v-for="genre in genres" :key="genre.id" :value="genre.id">
    {{ genre.label }}
  </option>
</template>

<script>
export default {
  data() {
    return {
      genre: 'all',
      genres: [
        { id: 'all', label: 'All' },
        { id: 'action', label: 'Action' },
        { id: 'animation', label: 'Animation' },
        { id: 'comedy', label: 'Comedy' },
        { id: 'drama', label: 'Drama' },
        { id: 'family', label: 'Family' },
        { id: 'fantasy', label: 'Fantasy' },
        { id: 'history', label: 'History' },
        { id: 'horror', label: 'Horror' },
        { id: 'romance', label: 'Romance' },
        { id: 'sci-fi', label: 'Sci-Fi' },
        { id: 'thriller', label: 'Thriller' },
        { id: 'vanReady', label: 'Van Ready' },
        { id: 'onlyTheBest', label: 'Only the Best' },
      ],
    };
  },
};
</script>
