<template>
	<textarea class="edit-frame" :value="texts" v-focus @blur="hide" :style="styleObject"></textarea>
</template>
<script type="text/javascript">
	import {EDIT_HIDE, EDIT_SHOW} from '../store/action-types';
	import config from '../config';
	
	export default {
		props: [
			'scrollLeft',
			'scrollTop'
		],
		mounted() {
			this.$watch('editState', function(val){
				if(val){
					this.$el.focus();
				}
			});
		},
		computed: {
			left(){
				let getters = this.$store.getters,
					frozenRules = getters.frozenState,
					cols = getters.colList,
					mainRule,
					left;
				for (let i = 0, len = frozenRules.length; i < len; i++) {
					if (frozenRules[i] === 'mainRule') {
						mainRule = frozenRules[i];
						break;
					}
				}
				if (!mainRule || cols[mainRule.startColIndex].left < left) {
					left -= this.scrollLeft;
				}
				
				left = getters.getInputState.left + config.cornerWidth;
				return left;
			},
			height(){
				cornerHeight
			},
			styleObject() {
				let state = this.$store.getters.getInputState;
				return {
					top: state.top + 1 + 'px',
					left: this.left + 1 + 'px',
					width: state.width + 'px',
					height: this.height + 'px',
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