import Vue from 'vue';
import store from './store/index';

new Vue({
	el: '#app',
	store,
	beforeCreate () {
		this.$store.dispatch('restore');
	},
	methods: {
		show() {
			console.log(this.$store.state.cols.list);
			console.log(this.$store.state.rows.list);
		}
	}
});