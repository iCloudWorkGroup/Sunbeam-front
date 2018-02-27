import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import store from './store/index';
import {RESTORE} from './store/action-types';
import Book from './components/book/book.vue';


store.dispatch(RESTORE).then(() => {
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
			let wrapper = document.getElementById('wrapper');
			this.bookWidth = wrapper.offsetWidth;
			this.bookHeight = wrapper.offsetHeight;
		}
	});
});

