import Vue from 'vue';
import extend from '../../../util/extend';
import template from './template';
import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			col: {},
			row: {}
		});
	},
	[types.UPDATE_POINTINFO](state, {currentSheet, info: {colAlias, rowAlias, type, value}}) {
		let colInfo = state[currentSheet].col,
			rowInfo = state[currentSheet].row,
			tmp;
			
		if (colInfo[colAlias] && (tmp = colInfo[colAlias][rowAlias])) {
			tmp[type] = value;
			tmp = rowInfo[rowAlias][colAlias];
			tmp[type] = value;
		} else {
			if (!colInfo[colAlias]) {
				colInfo[colAlias] = {};
			}
			if (!rowInfo[rowAlias]) {
				rowInfo[rowAlias] = {};
			}
			tmp = colInfo[colAlias][rowAlias] = extend(template);
			tmp[type] = value;
			tmp = rowInfo[rowAlias][colAlias] = extend(template);
			tmp[type] = value;
		}
	},
	[types.DELETE_CELL_POINTINFO](state, {currentSheet, cells}) {
		let colInfo = state[currentSheet].col,
			rowInfo = state[currentSheet].row;
		
		cells.forEach(function(cell) {
			let occupyCol = cell.occupy.col,
				occupyRow = cell.occupy.row;

			for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
				for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
					colInfo[occupyCol][occupyRow].cellIndex = null;
					rowInfo[occupyRow][occupyCol].cellIndex = null;
				}
			}
		});
	}
};
