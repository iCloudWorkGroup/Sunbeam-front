import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import store from './store/index';
import {RESTORE} from './store/action-types';
import {UPDATE_MOUSESTATE} from './store/mutation-types';
import Book from './components/book.vue';
import {LOCATE, DRAG} from './tools/basic';

let wrapper = document.getElementById('wrapper'),
	excelId = document.getElementById('excelId'),
	right = wrapper.offsetWidth,
	bottom = wrapper.offsetHeight;

window.SPREADSHEET_AUTHENTIC_KEY = '1e624f96-17ac-44f5-9def-fe989a1f6bec';

store.dispatch(RESTORE, {
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
		},
		mounted(){
			let self = this;
			document.addEventListener('mouseup', function() {
				self.$store.commit(UPDATE_MOUSESTATE, {
					state: LOCATE
				});
			}, false);
		}
	});
});

let element1 = document.getElementById('frozen');
let element2 = document.getElementById('unfrozen');
let element3 = document.getElementById('insertrow');
let element4 = document.getElementById('insertcol');
let element5 = document.getElementById('deletecol');
let element6 = document.getElementById('deleterow');


element1.addEventListener('click',function(e){
	store.dispatch('SHEET_FROZEN');
},false);
element2.addEventListener('click',function(e){
	store.dispatch('SHEET_UNFROZEN');
},false);
element3.addEventListener('click',function(e){
	store.dispatch('ROWS_INSERTROWS');
},false);
element4.addEventListener('click',function(e){
	store.dispatch('COLS_INSERTCOLS');
},false);
element5.addEventListener('click',function(e){
	store.dispatch('COLS_DELETECOLS');
},false);

element6.addEventListener('click',function(e){
	store.dispatch('ROWS_DELETEROWS');
},false);