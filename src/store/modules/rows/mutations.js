import Vue from 'vue';
import * as types from '../../mutation-types';

export default {	
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, []);
	},
	[types.ADD_ROW](state, payload) {
		let rows = payload.rows,
			list = state[payload.currentSheet];			
		for (let i = 0, len = rows.length; i < len; i++) {
			list.push(rows[i]);
		}
	}
};