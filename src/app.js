import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import store from './store/index';
import {RESTORE} from './store/action-types';
import Book from './components/book.vue';

let wrapper = document.getElementById('wrapper'),
	excelId = document.getElementById('excelId'),
	right = wrapper.offsetWidth,
	bottom = wrapper.offsetHeight;

window.SPREADSHEET_AUTHENTIC_KEY = '1e624f96-17ac-44f5-9def-fe989a1f6bec';


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