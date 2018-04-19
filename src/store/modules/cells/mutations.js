import Vue from 'vue';
import * as types from '../../mutation-types';
import extend from '../../../util/extend';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, []);
	},
	[types.INSERT_CELL](state, {currentSheet, cells}) {
		let currentList = state[currentSheet];
		for (let i = 0, len = cells.length; i < len; i++) {
			currentList.push(cells[i]);
		}
	},
	[types.UPDATE_CELL](state, info) {
		if(!Array.isArray(info)){
			info = [info];
		}
		info.forEach(function({cell, props}) {
			extend(cell, props);
		});
	}
};