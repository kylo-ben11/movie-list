<template>
	<option
		v-for="option in filterOptions"
		:key="option.id"
		:value="option.id"
	>
		{{ option.label }}
	</option>
</template>

<script>
	export default {
		data() {
			return {
				filterOptions: [
					{ id: 'all', label: 'All' },
					{ id: 'action', label: '💪 Action' },
					{ id: 'christmas', label: '🎄 Christmas' },
					// { id: 'animation', label: 'Animation' },
					{ id: 'comedy', label: '🤣 Comedy' },
					{ id: 'drama', label: '🎭 Drama' },
					{ id: 'family', label: '👪 Family' },
					{ id: 'fantasy', label: '🧙‍♂️ Fantasy' },
					{ id: 'history', label: '🏛️ History' },
					{ id: 'horror', label: '🫣 Horror' },
					{ id: 'romance', label: '🥰 Romance' },
					{ id: 'sci-fi', label: '🤖 Sci-Fi' },
					{ id: 'thriller', label: '😱 Thriller' },
				],
			};
		},
	};
</script>
