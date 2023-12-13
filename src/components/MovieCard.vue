<template>
  <div class="movieCard">
    <a :href="link" class="movieLink">
      <div class="movieCard__poster">
        <div class="movieCard__poster--image" :class="certifiedFresh">
          <img :src="poster" alt="decorational no alt text needed" />
        </div>
        <div class="movieCard__rated" :class="movieRatedClasses">
          {{ rated }}
        </div>
        <div class="movieCard__rating" :class="movieRatingClasses">
          {{ rating }}
        </div>
      </div>
    </a>
    <div class="movieCard__info">
      <div class="movieCard__streaming" :class="movieStreamingClasses">
        <!-- <span class="movieCard__streaming--on">Available On:</span> -->
        <div
          class="movieCard__streamingStamp"
          v-for="stream in streams"
          :key="stream.id"
          :value="stream.id"
        >
          {{ stream.label }}
        </div>
      </div>
      <div class="movieCard__title">
        {{ title }}
      </div>
      <div class="movieCard__runtime">Runtime: {{ runtime }}</div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      stream: '',
      streams: [
        { id: 'vudu', label: 'V' },
        { id: 'primeVideo', label: 'PV' },
        { id: 'moviesAnywhere', label: 'MA' },
        { id: 'iTunes', label: 'i' },
        { id: 'bluRay', label: 'B' },
        { id: 'dvd', label: 'D' },
      ],
    };
  },
  props: [
    'title',
    'genre',
    'streaming',
    'rated',
    'rating',
    'runtime',
    'poster',
    'link',
  ],
  computed: {
    movieRatedClasses() {
      return {
        G: this.rated === 'G',
        PG: this.rated === 'PG',
        PG13: this.rated === 'PG-13',
        R: this.rated === 'R',
        TVY: this.rated === 'TV-Y',
        TVG: this.rated === 'TV-G',
        NA: this.rated === 'N/A',
      };
    },
    movieRatingClasses() {
      return {
        rotten: parseInt(this.rating) < 60,
        fresh: parseInt(this.rating) >= 60 && parseInt(this.rating) < 75,
        certified: parseInt(this.rating) >= 75,
        unrated: this.rating === 'N/A',
      };
    },
    certifiedFresh() {
      return {
        shimmer: parseInt(this.rating) >= 75,
      };
    },
    movieStreamingClasses() {
      return {
        vudu: this.streaming.includes('Vudu'),
        primeVideo: this.streaming.includes('Prime Video'),
        moviesAnywhere: this.streaming.includes('Movies Anywhere'),
        iTunes: this.streaming.includes('iTunes'),
        bluRay: this.streaming.includes('Blu-Ray'),
        dvd: this.streaming.includes('DVD'),
      };
    },
  },

  // No need to be this explicit in this case, but good to know

  // props: {
  //   title: {
  //     type: String,
  //     required: false,
  //   },
  //   id: {
  //     type: String,
  //     required: false,
  //   },
  //   streaming: {
  //     type: String,
  //     required: false,
  //   },
  //   rated: {
  //     type: String,
  //     required: false,
  //   },
  //   rating: {
  //     type: String,
  //     required: false,
  //   },
  //   runtime: {
  //     type: Number,
  //     required: false,
  //   },
  //   poster: {
  //     type: String,
  //     required: false,
  //   },
  //   link: {
  //     type: String,
  //     required: false,
  //   },
  // },
};
</script>
