import extend from '../../../util/extend';
import cellTemplate from '../cells/template';
import * as mutationTypes from '../../mutation-types';
import * as actionTypes from '../../action-types';
import send from '../../../util/send';
import config from '../../../config';

export default {
	[actionTypes.EDIT_SHOW]({
		state,
		rootState,
		getters,
		commit
	}) {
		let wholePosi = getters.activeSelect.wholePosi,
			colAlias = wholePosi.startColAlias,
			rowAlias = wholePosi.startRowAlias,
			colIndex, rowIndex;

		colIndex = getters.getColIndexByAlias(colAlias);
		rowIndex = getters.getRowIndexByAlias(rowAlias);

		let cellList;
		cellList = getters.getCellsByVertical({
			startColIndex: colIndex,
			startRowIndex: rowIndex
		});
		let cell = cellList[0],
			colList = getters.colList,
			rowList = getters.rowList,
			props;

		props = {
			editState: true,
			transverseScroll: true,
			verticalScroll: true
		};
		if (cell) {
			props = extend(props, cell.content, cell.physicsBox);
			props.colAlias = cell.occupy.col[0];
			props.rowAlias = cell.occupy.row[0];
		} else {
			let row = rowList[rowIndex],
				col = colList[colIndex];

			props = extend(props, {
				colAlias,
				rowAlias,
				left: col.left,
				width: col.width,
				top: row.top,
				height: row.height
			});
		}

		let frozenState = getters.frozenState;
		if(frozenState.isFrozen){
			let rules = frozenState.rules,
				rule;
			for (let i = 0, len = rules.length; i < len; i++) {
				rule = rules[i];
				if(rule.type === 'mainRule'){
					break;
				}
			}
			let frozenRowIndex = rule.startRowIndex,
			frozenColIndex = rule.startColIndex;
			if(colIndex < frozenColIndex){
				props.transverseScroll = false;
			}
			if(rowIndex < frozenRowIndex){
				props.verticalScroll = false;
			}
		}
		commit(mutationTypes.UPDATE_EDIT, {
			currentSheet: rootState.currentSheet,
			inputInfo: props
		});
	},
	[actionTypes.EDIT_HIDE]({
		state,
		rootState,
		getters,
		commit,
		dispatch
	}, texts) {
		let inputState = getters.getInputState,
			startColIndex = getters.getColIndexByAlias(inputState.colAlias),
			startRowIndex = getters.getRowIndexByAlias(inputState.rowAlias),
			cols = getters.colList,
			rows = getters.rowList;

		commit(mutationTypes.UPDATE_EDIT, {
			currentSheet: rootState.currentSheet,
			inputInfo: {
				editState: false,
				width: 0,
				height: 0,
				left: -9999,
				top: -9999,
				texts: ''
			}
		});
		let cell = getters.getCellsByVertical({startColIndex, startRowIndex})[0];

		if(cell && cell.content.texts === texts){
			 return;
		}
		send({
			url: config.operUrl['texts'],
			data: JSON.stringify({
				coordinate: {
					startCol: cols[startColIndex].sort,
					startRow: rows[startRowIndex].sort,
					endCol: cols[startColIndex].sort,
					endRow: rows[startRowIndex].sort
				},
				content: texts
			}),
		});
		dispatch(actionTypes.CELLS_UPDATE_PROP, {
			startColIndex,
			startRowIndex,
			endColIndex: startColIndex,
			endRowIndex: startRowIndex,
			props: {
				content: {
					texts: texts
				}
			}
		});
	}
}