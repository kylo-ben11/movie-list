<template>
	<div class="genreFilter" @click.stop>
		<button class="genreFilter__trigger" type="button" @click="toggleOpen">
			{{ selectionLabel }}
			<span aria-hidden="true">&#9662;</span>
		</button>
		<div v-if="isOpen" class="genreFilter__menu" :class="{ 'genreFilter__menu--above': menuPlacement === 'above' }">
			<label
				v-for="option in availableOptions"
				:key="option.id"
				class="genreFilter__option"
				:class="{ selected: draftSelection.includes(option.id) }"
			>
				<input v-model="draftSelection" type="checkbox" :value="option.id" @change="updateSelection" />
				<span class="genreFilter__checkmark" aria-hidden="true"></span>
				<span>{{ option.label }}</span>
			</label>
		</div>
	</div>
</template>

<script>
export default {
	name: 'GenreMultiFilter',
	props: {
		modelValue: {
			type: Array,
			default: () => [],
		},
		options: {
			type: Array,
			default: null,
		},
		allLabel: {
			type: String,
			default: 'All Genres',
		},
	},
	emits: ['update:modelValue', 'opened'],
	data() {
		return {
			isOpen: false,
			menuPlacement: 'below',
			draftSelection: [...this.modelValue],
			genreOptions: [
				{ id: 'action', label: '💪 Action' },
				{ id: 'christmas', label: '🎄 Christmas' },
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
	computed: {
		availableOptions() {
			return this.options || this.genreOptions;
		},
		selectedGenreLabels() {
			const selectedValues = this.isOpen ? this.draftSelection : this.modelValue;
			return this.availableOptions
				.filter((option) => selectedValues.includes(option.id))
				.map((option) => option.label);
		},
		selectionLabel() {
			if (!this.selectedGenreLabels.length) {
				return this.allLabel;
			}

			if (this.selectedGenreLabels.length <= 2) {
				return this.selectedGenreLabels.join(', ');
			}

			return `${this.selectedGenreLabels.slice(0, 2).join(', ')} + ${this.selectedGenreLabels.length - 2} more`;
		},
	},
	mounted() {
		document.addEventListener('click', this.handleDocumentClick);
		window.addEventListener('resize', this.updateMenuPlacement);
	},
	beforeUnmount() {
		document.removeEventListener('click', this.handleDocumentClick);
		window.removeEventListener('resize', this.updateMenuPlacement);
	},
	watch: {
		modelValue(newValue) {
			this.draftSelection = [...newValue];
		},
	},
	methods: {
		toggleOpen() {
			this.draftSelection = [...this.modelValue];
			this.isOpen = !this.isOpen;
			if (this.isOpen) {
				this.$emit('opened');
				this.$nextTick(this.updateMenuPlacement);
			}
		},
		clearSelection() {
			this.draftSelection = [];
				this.updateSelection();
		},
			updateSelection() {
			this.$emit('update:modelValue', [...this.draftSelection]);
			},
			closeMenu() {
				this.isOpen = false;
		},
			handleDocumentClick(event) {
				if (this.isOpen && !this.$el.contains(event.target)) {
					this.closeMenu();
				}
			},
		updateMenuPlacement() {
			if (!this.isOpen) {
				return;
			}

			const trigger = this.$el.querySelector('.genreFilter__trigger');
			const availableBelow = window.innerHeight - (trigger?.getBoundingClientRect().bottom || 0);
			this.menuPlacement = availableBelow < Math.min(window.innerHeight * 0.6, 420) ? 'above' : 'below';
		},
	},
};
</script>

<style scoped>
.genreFilter {
	position: relative;
	min-width: 190px;
}

.genreFilter__trigger {
	width: 100%;
	height: 45px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	border: 1px solid rgba(255, 255, 255, 0.18);
	border-radius: 4px;
	background: rgba(9, 9, 11, 0.7);
	color: #fff;
	font: inherit;
	text-align: left;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	cursor: pointer;
}

.genreFilter__menu {
	position: absolute;
	top: calc(100% + 6px);
	left: 0;
	z-index: 8;
	width: min(280px, 80vw);
	padding: 10px;
	max-height: min(60vh, 420px);
	overflow-y: auto;
	background: #252525;
	border: 1px solid #4c5c68;
	box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.genreFilter__menu--above {
	top: auto;
	bottom: calc(100% + 6px);
}

.genreFilter__option {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px;
	color: #fff;
	cursor: pointer;
}

.genreFilter__option:hover {
	background: rgba(255, 255, 255, 0.08);
}

.genreFilter__option.selected {
	background: rgba(76, 92, 104, 0.55);
}

.genreFilter__option input {
	position: absolute;
	opacity: 0;
	width: 1px;
	height: 1px;
	pointer-events: none;
}

.genreFilter__checkmark {
	width: 16px;
	height: 16px;
	flex: 0 0 16px;
	border: 1px solid rgba(255, 255, 255, 0.7);
	border-radius: 3px;
	background: transparent;
}

.genreFilter__option input:checked + .genreFilter__checkmark {
	background: #87d7a6;
	border-color: #87d7a6;
	box-shadow: inset 0 0 0 3px #252525;
}

.genreFilter__actions {
	display: flex;
	justify-content: space-between;
	gap: 8px;
	padding-top: 10px;
	border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.genreFilter__actions .button_slide {
	height: 36px;
	font-size: 11px;
	letter-spacing: 0.5px;
}

@media screen and (max-width: 1024px) {
	.genreFilter {
		width: 100%;
	}

	.genreFilter__menu {
		position: fixed;
		left: 15px;
		bottom: 80px;
		top: auto;
		width: calc(100vw - 30px);
		max-height: 60vh;
		overflow-y: auto;
	}
}
</style>
