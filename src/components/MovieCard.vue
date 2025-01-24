<template>
	<teleport to="body">
		<the-overlay v-if="modalOpen">
			<template #poster>
				<div class="movieInfo__poster" :class="certifiedFresh">
					<img
						:src="poster"
						alt="decorational no alt text needed"
					/>
				</div>
			</template>
			<template #title>{{ title }}</template>
			<template #streaming>{{ streaming }}</template>
			<template #rating
				><div :class="movieRatingClasses">
					{{ rating }}
				</div></template
			>
			<template #rated>{{ rated }}</template>
			<template #runtime>{{ runtime }}</template>
			<template #year>{{ year }}</template>
			<template #plot>{{ plot }}</template>
			<template #imdbLink
				><a class="movieInfo__link" :href="link"
					>View on IMDb</a
				></template
			>
			<button class="modalToggle" @click="toggleModal"></button>
		</the-overlay>
	</teleport>
	<div class="movieCard">
		<a @click="toggleModal" class="movieLink">
			<div class="movieCard__poster">
				<div class="movieCard__poster--imageContainer">
					<div
						class="movieCard__poster--image"
						:class="certifiedFresh"
					>
						<img
							:src="poster"
							alt="decorational no alt text needed"
						/>
					</div>
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
					:class="{
						visible: this.streaming
							.toLowerCase()
							.includes(stream.id),
					}"
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
	import TheOverlay from './TheOverlay.vue';
	export default {
		components: {
			TheOverlay,
		},
		data() {
			return {
				stream: '',
				streams: [
					{ id: 'vudu', label: 'V' },
					{ id: 'prime video', label: 'PV' },
					{ id: 'movies anywhere', label: 'MA' },
					{ id: 'itunes', label: 'i' },
					{ id: 'blu-ray', label: 'B' },
					{ id: 'dvd', label: 'D' },
				],
				modalOpen: false,
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
			'plot',
			'year',
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
					fresh:
						parseInt(this.rating) >= 60 &&
						parseInt(this.rating) < 75,
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
					moviesAnywhere:
						this.streaming.includes('Movies Anywhere'),
					iTunes: this.streaming.includes('iTunes'),
					bluRay: this.streaming.includes('Blu-Ray'),
					dvd: this.streaming.includes('DVD'),
				};
			},
		},
		watch: {
			modalOpen() {
				let body = document.body;
				if (this.modalOpen) {
					body.style.top = `-${window.scrollY}px`;
					body.style.position = 'fixed';
					body.style.width = 'calc(100% - 15px)';
				} else {
					const scrollY = body.style.top;
					body.style.top = '';
					body.style.position = '';
					body.style.width = '';
					window.scrollBy(0, parseInt(scrollY || '0') * -1);
				}
			},
		},
		methods: {
			toggleModal() {
				this.modalOpen = !this.modalOpen;
				console.log(this.modalOpen);
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
