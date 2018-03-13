import extend from '../../../util/extend';
import cellTemplate from '../cells/template';
import * as mutationTypes from '../../mutation-types';
import * as actionTypes from '../../action-types';

export default {
	[actionTypes.EDIT_SHOW]({state, rootState, getters, commit}) {
		let select = getters.selectList[0],
			colAlias = select.activePosi.colAlias,
			rowAlias = select.activePosi.rowAlias,
			colList = getters.colList,
			rowList = getters.rowList,
			colIndex, rowIndex,
			cellList, cell, temp = {};

		colIndex = getters.getColIndexByAlias(colAlias);
		rowIndex = getters.getRowIndexByAlias(rowAlias);

		cellList = getters.getCellsByVertical({
			startColIndex: colIndex,
			startRowIndex: rowIndex
		});

		if (cell = cellList[0]) {
			temp = extend(temp, cell.content, cell.physicsBox);
			temp.colAlias = cell.occupy.col[0];
			temp.rowAlias = cell.occupy.row[0];
		} else {
			let row = getters.rowList[rowIndex],
				col = getters.colList[colIndex];
			temp = extend(temp, {
				colAlias,
				rowAlias,
				left: col.left,
				width: col.width,
				top: row.top,
				height: row.height
			});
		}
		temp.maxWidth = colList[colList.length - 1].left + 
			colList[colList.length - 1].width - temp.left;
		temp.maxHeight = rowList[rowList.length - 1].top + 
			rowList[rowList.length - 1].height - temp.top;
		temp.editState = true;
		commit(mutationTypes.UPDATE_EDIT, {
			currentSheet: rootState.currentSheet,
			inputInfo: temp
		});
	},
	[actionTypes.EDIT_HIDE]({state, rootState, getters, commit, dispatch}, texts) {
		let currentSheet = rootState.currentSheet,
			currentState = state[currentSheet],
			colAlias = currentState.colAlias,
			rowAlias = currentState.rowAlias;

		dispatch(actionTypes.CELLS_UPDATECELL, {
			colAlias,
			rowAlias,
			propName: 'content.texts',
			propValue: texts
		});
		commit(mutationTypes.UPDATE_EDIT, {
			currentSheet,
			inputInfo: {
				editState: false,
				width: 0,
				height: 0,
				left: -9999,
				top: -9999,
				texts: ''
			}
		});
	}
}