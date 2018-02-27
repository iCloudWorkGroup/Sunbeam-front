import Vue from 'vue';
import * as types from '../../mutation-types';
import extend from '../../../util/extend';

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
	},
	[types.UPDATE_SELECT](state, payload) {
		let select = state[payload.currentSheet][0];
		
		extend(select, payload.select);
	}
};