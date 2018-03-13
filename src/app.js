import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import store from './store/index';
import {RESTORE} from './store/action-types';
import Book from './components/book.vue';

let wrapper = document.getElementById('wrapper'),
	right = wrapper.offsetWidth,
	bottom = wrapper.offsetHeight

store.dispatch(RESTORE,{
	left: 0,
	top: 0,
	right,
	bottom
}).then(() => {
	new Vue({
		el: '#app',
		store,
		data: {
			bookWidth: 0,
			bookHeight: 0
		},
		components: {
			'book': Book
		},
		created() {
			this.bookWidth = wrapper.offsetWidth;
			this.bookHeight = wrapper.offsetHeight;
		}
	});
});