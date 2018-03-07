<template>
	<textarea class="edit-frame" :value="texts" v-focus @blur="hide" :style="styleObject"></textarea>
</template>
<script type="text/javascript">
	import {EDIT_HIDE, EDIT_SHOW} from '../store/action-types';
	export default {
		mounted() {
			this.$watch('editState', function(val){
				if(val){
					this.$el.focus();
				}
			});
		},
		computed: {
			styleObject() {
				let state = this.$store.getters.getInputState;
				return {
					top: state.top + 1 + 'px',
					left: state.left + 1 + 'px',
					width: state.width + 'px',
					height: state.height + 'px',
					maxWidth: state.maxWidth + 'px',
					maxHeight: state.maxHeight + 'px',
					fontFamily: state.family,
					fontSize: state.size + 'px',
					fontStyle: state.italic,
					color: state.color,
					textDecoration: state.underline,
				}
			},
			texts() {
				let state = this.$store.getters.getInputState;
				return state.texts;
			},
			editState() {
				return this.$store.getters.getEidtState;
			}
		},
		methods: {
			hide() {
				if(this.editState){
					this.$store.dispatch(EDIT_HIDE, this.$el.value);
				}
			}
		},
		directives: {
			focus: {
				inserted(el) {
					el.focus();
				}
			}
		}
	};
</script>
<style type="text/css">
</style>