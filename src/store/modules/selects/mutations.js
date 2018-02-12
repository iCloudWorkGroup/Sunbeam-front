import Vue from 'vue';
import * as types from '../../mutation-types';

export default{
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, []);
	},
	[types.INSERT_SELECT](state, payload) {
		let selects = payload.selects,
			list = state[payload.currentSheet];
						
		for (let i = 0, len = selects.length; i < len; i++) {
			list.push(selects[i]);
		}
	}
}