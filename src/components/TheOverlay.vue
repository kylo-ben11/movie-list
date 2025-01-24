<template>
	<div class="modal movieInfo">
		<slot name="poster"></slot>
		<div class="flex movieInfo__rowOne">
			<h2>
				<slot name="title"></slot>
			</h2>
		</div>
		<div class="flex movieInfo__rowTwo">
			Available On: <slot name="streaming"></slot>
		</div>
		<div class="flex movieInfo__rowThree">
			<div class="movieInfo__rating">
				<slot name="rating"></slot>
			</div>
			<div class="movieInfo__rated">
				Rated: <slot name="rated"></slot>
			</div>
			<div class="movieInfo__runtime">
				<slot name="runtime"></slot>
			</div>
			<div class="movieInfo__year">
				<slot name="year"></slot>
			</div>
		</div>
		<div class="movieInfo__plot">
			<slot name="plot"></slot>
		</div>
		<div class="movieInfo__imdb">
			<slot name="imdbLink"></slot>
		</div>
		<div class="movieInfo__close">
			<slot></slot>
		</div>
	</div>
</template>
<script>
	export default {};
</script>
