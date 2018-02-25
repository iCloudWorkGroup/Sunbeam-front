import './css/main.css';
import './css/temp.css';
import Vue from 'vue';
import store from './store/index';
import {
	RESTORE
} from './store/action-types';
import SheetContainer from './components/sheetcontainer/sheetcontainer.vue';


store.dispatch(RESTORE).then(() => {
	new Vue({
		el: '#app',
		data: {
			sheetWidth: 0,
			sheetHeight: 0
		},
		store,
		components: {
			'sheet-container': SheetContainer
		},
		beforeCreate() {
			let wrapper = document.getElementById('wrapper');
			this.sheetWidth = wrapper.offsetWidth;
			this.sheetHeight = wrapper.offsetHeight;
		}
	});
});