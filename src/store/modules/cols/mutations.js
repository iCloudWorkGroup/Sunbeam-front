import Vue from 'vue';
import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, []);
	},
	[types.ADD_COL](state, payload) {
		let cols = payload.cols,
			list = state[payload.currentSheet];			
		for (let i = 0, len = cols.length; i < len; i++) {
			list.push(cols[i]);
		}
	}
};