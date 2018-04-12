import Vue from 'vue';
import * as types from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			list: [],
			map: new Map()
		});
	},
	[types.ADD_COL](state, payload) {
		let cols = payload.cols,
			colState = state[payload.currentSheet],
			list = colState.list,
			map = colState.map;	

		for (let i = 0, len = cols.length; i < len; i++) {
			let col = cols[i];
			list.push(col);
			map.set(col.alias, col);
		}
	},
	[types.INSERT_COL](state, payload) {
		let cols = payload.cols,
			colState = state[payload.currentSheet],
			list = colState.list,
			map = colState.map;	

		for (let i = 0, len = cols.length; i < len; i++) {
			let col = cols[i];
			let index = indexAttrBinary(col.sort, list, 'sort');
			list.splice(index, 0, col);
			map.set(col.alias, col);
		}
	}
};