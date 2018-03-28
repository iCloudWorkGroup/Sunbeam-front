import Vue from 'vue';
import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, []);
	},
	[types.INSERT_CELL](state, {
		currentSheet,
		cells
	}) {
		let currentList = state[currentSheet];
		for (let i = 0, len = cells.length; i < len; i++) {
			currentList.push(cells[i]);
		}
	},
	[types.UPDATE_CELL](state, {
		currentSheet,
		cellInfo: {
			cellIndex,
			propName,
			value
		}
	}) {
		let currentList = state[currentSheet],
			cell = currentList[cellIndex];

		propName = propName.split('.');
		if (propName.length > 1) {
			cell[propName[0]][propName[1]] = value;
		} else {
			cell[propName[0]] = value;
		}
	}
};