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
				Vue.set(colInfo, colAlias, {
					[rowAlias]: extend(template)
				});
			}
			if (!rowInfo[rowAlias]) {
				Vue.set(rowInfo, rowAlias, {
					[colAlias]: extend(template)
				});
			}
			if(!colInfo[colAlias][rowAlias]){
				Vue.set(colInfo[colAlias], rowAlias, extend(template));
			}
			if(!rowInfo[rowAlias][colAlias] ){
				Vue.set(rowInfo[rowAlias], colAlias, extend(template));
			}

			colInfo[colAlias][rowAlias][type] = value;
			rowInfo[rowAlias][colAlias][type] = value;
		}
	},
	[types.DELETE_CELL_POINTINFO](state, {currentSheet, occupys}) {
		let colInfo = state[currentSheet].col,
			rowInfo = state[currentSheet].row;
		
		occupys.forEach(function(occupy) {
			let occupyCol = occupy.col,
				occupyRow = occupy.row;

			for (let i = 0, len1 = occupyCol.length; i < len1; i++) {
				for (let j = 0, len2 = occupyRow.length; j < len2; j++) {
					colInfo[occupyCol[i]][occupyRow[j]].cellIndex = null;
					rowInfo[occupyRow[j]][occupyCol[i]].cellIndex = null;
				}
			}
		});
	}
};
