import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import Vuex from 'vuex';
import options from './store/index';
import {RESTORE} from './store/action-types';
import {UPDATE_MOUSESTATE} from './store/mutation-types';
import Book from './components/book.vue';
import { LOCATE } from './tools/constant';
import dataloader from './tools/dataloader';
import font from './entrance/font';

Vue.use(Vuex);

function SBM(wrapperId) {
	if(!(this instanceof SBM)){
		return new SBM(wrapperId);
	}

	let wrapper = document.getElementById(wrapperId),
		right = wrapper.offsetWidth,
		bottom = wrapper.offsetHeight,
		store = new Vuex.Store(options);

	dataloader({left: 0, top: 0, right, bottom}, function(data) {
		store.dispatch(RESTORE, data);
	});

	new Vue({
		el: '#' + wrapperId,
		store,
		data: {
			bookWidth: 0,
			bookHeight: 0
		},
		template: '<book :book-width="bookWidth" :book-height="bookHeight"></book>',
		components: {
			Book
		},
		created() {
			this.bookWidth = wrapper.offsetWidth;
			this.bookHeight = wrapper.offsetHeight;
		},
		mounted() {
			let self = this;
			document.addEventListener('mouseup', function() {
				self.$store.commit(UPDATE_MOUSESTATE, {
					state: LOCATE
				});
			}, false);
		}
	});
	font(this, store);
}

export default SBM;

