import Vue from 'vue';
import store from './store/index';
import data from '../data.json';

new Vue({
	el: '#app',
	store,
	beforeCreate () {
		this.$store.dispatch('restore');
	}
});