import Vue from 'vue';
import * as types from '../../mutation-types';
import {
	indexAttrBinary
} from '../../../util/binary';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			list: [],
			map: new Map()
		});
	},
	[types.ADD_ROW](state, payload) {
		let rows = payload.rows,
			rowsState = state[payload.currentSheet],
			list = rowsState.list,
			map = rowsState.map;
		for (let i = 0, len = rows.length; i < len; i++) {
			let row = rows[i];
			list.push(row);
			map.set(row.alias, row);
		}
	},
	[types.INSERT_ROW](state, payload) {
		let rows = payload.rows,
			rowsState = state[payload.currentSheet],
			list = rowsState.list,
			map = rowsState.map;

		for (let i = 0, len = rows.length; i < len; i++) {
			let row = rows[i];
			let index = indexAttrBinary(row.sort, list, 'sort');
			list.splice(index, 0, row);
			map.set(row.alias, row);
		}
	}
};