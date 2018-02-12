import Vue from 'vue';
import store from './store/index';
import {RESTORE} from './store/action-types';

new Vue({
	el: '#app',
	store,
	beforeCreate () {
		this.$store.dispatch(RESTORE);
	}
});