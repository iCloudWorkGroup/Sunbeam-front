import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		state.list.push(sheet);
	},
	[types.UPDATE_FROZENSTATE](state, payload) {
		let list = state.list,
			currentSheet = payload.currentSheet,
			frozenState;

		list.forEach(function(item) {
			if (item.alias === currentSheet) {
				frozenState = item.frozenState;
			}
		});

		frozenState.rules.splice(0, frozenState.rules.length, ...payload.rules);
		frozenState.isFrozen = payload.isFrozen;
		frozenState.rowFrozen = payload.rowFrozen;
		frozenState.colFrozen = payload.colFrozen;
	},
	[types.RESET_OCCUPY](state, payload) {
		let list = state.list,
			currentSheet = payload.currentSheet,
			editViewOccupy;

		list.forEach(function(item) {
			if (item.alias === currentSheet) {
				editViewOccupy = item.editViewOccupy[payload.type];
			}
		});
		let col = editViewOccupy.col,
			row = editViewOccupy.row;
		col.splice(0, col.length, ...payload.col);
		row.splice(0, row.length, ...payload.row);
	}
};