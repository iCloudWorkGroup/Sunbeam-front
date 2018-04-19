import extend from '../../../util/extend';
import * as mutationTypes from '../../mutation-types';
import * as actionTypes from '../../action-types';
import generator from '../../../tools/generator';
import template from './template';
import {LOCATE, DRAG} from '../../../tools/basic';
import {indexAttrBinary} from '../../../util/binary';
import {SELECT} from '../../../tools/basic';


export default {
	/**
	 * 初始化选中区域
	 */
	[actionTypes.SELECTS_INITSELECT]({state, getters, commit, rootState}) {
		let currentSheet = rootState.currentSheet,
			rows = rootState.rows[currentSheet].list,
			cols = rootState.cols[currentSheet].list,
			select = extend(template),
			region,
			width,
			height;

		region = getters.getFullOprRegion({
			startColIndex: 0,
			startRowIndex: 0
		});

		let startColIndex = region.startColIndex,
			startRowIndex = region.startRowIndex,
			endColIndex = region.endColIndex,
			endRowIndex = region.endRowIndex;

		width = cols[endColIndex].width + cols[endColIndex].left - cols[startColIndex].left;
		height = rows[endRowIndex].height + rows[endRowIndex].top - rows[startRowIndex].top;

		select.physicsBox = {
			top: rows[startRowIndex].top,
			left: cols[startColIndex].left,
			width: width,
			height: height
		};
		select.wholePosi = {
			startColAlias: cols[startColIndex].alias,
			startRowAlias: rows[startRowIndex].alias,
			endColAlias: cols[endColIndex].alias,
			endRowAlias: rows[endRowIndex].alias
		};
		commit(mutationTypes.INSERT_SELECT, {
			currentSheet,
			selects: [select]
		});
		commit(mutationTypes.SWITCH_ACTIVESELECT, {
			select: getters.selectList[0]
		});
		commit(mutationTypes.ACTIVE_COL, {
			currentSheet,
			startIndex: startColIndex,
			endIndex: endColIndex
		});
		commit(mutationTypes.ACTIVE_ROW, {
			currentSheet,
			startIndex: startRowIndex,
			endIndex: endRowIndex
		});
	},
	/**
	 * 更新选中区域
	 */
	[actionTypes.SELECTS_UPDATESELECT]({
		state,
		getters,
		commit,
		rootState,
		dispatch
	}, {
		colIndex,
		rowIndex,
		type
	}) {
		let currentSheet = rootState.currentSheet,
			rows = rootState.rows[currentSheet].list,
			cols = rootState.cols[currentSheet].list,
			select = {},
			activeSelect = state.activeSelect,
			mouseState = rootState.mouseState,
			region;

		if(mouseState === LOCATE){
			region = getters.getFullOprRegion({
				startColIndex: colIndex,
				startRowIndex: rowIndex
			});
		}

		if (mouseState === DRAG) {
			let tempPosi = activeSelect.tempPosi,
				wholePosi = activeSelect.wholePosi;

			if(wholePosi.endColAlias === 'MAX'){
				colIndex = 'MAX';
				rowIndex = rowIndex === 'MAX' ? 0 : rowIndex;
			}
			
			if(wholePosi.endRowAlias === 'MAX'){
				rowIndex = 'MAX';
				colIndex = colIndex === 'MAX' ? 0 : colIndex;
			}

			region = getters.getFullOprRegion({
				startColIndex: indexAttrBinary(tempPosi.initColSort, cols, 'sort'),
				startRowIndex: indexAttrBinary(tempPosi.initRowSort, rows, 'sort'),
				endColIndex: colIndex,
				endRowIndex: rowIndex
			});
		}

		let {startColIndex, startRowIndex, endColIndex, endRowIndex} = region;

		select.physicsBox = {
			top: rows[startRowIndex].top,
			left: cols[startColIndex].left
		};

		select.wholePosi = {
			startColAlias: cols[startColIndex].alias,
			startRowAlias: rows[startRowIndex].alias,
			endColAlias: endColIndex !== 'MAX' ? cols[endColIndex].alias : 'MAX',
			endRowAlias: endRowIndex !== 'MAX' ? rows[endRowIndex].alias : 'MAX'
		};
		endColIndex = endColIndex === 'MAX' ? cols.length - 1 : endColIndex;
		endRowIndex = endRowIndex === 'MAX' ? rows.length - 1 : endRowIndex;

		let width = cols[endColIndex].width + cols[endColIndex].left - 
				cols[startColIndex].left;
		select.physicsBox.width = width;
	
		let height = rows[endRowIndex].height + rows[endRowIndex].top - 
				rows[startRowIndex].top;
		select.physicsBox.height = height;
		if(mouseState === LOCATE){
			select.activePosi = {
				colAlias: cols[startColIndex].alias,
				rowAlias: rows[startRowIndex].alias
			};
			select.tempPosi = {
				initColSort: cols[startColIndex].sort,
				initRowSort: rows[startRowIndex].sort
			};
		}
		
		if (activeSelect.type === SELECT) {
			dispatch(actionTypes.ROWS_UPDATEACTIVEROWS, {
				oldStartAlias: activeSelect.wholePosi.startRowAlias,
				newStartAlias: select.wholePosi.startRowAlias,
				oldEndAlias: activeSelect.wholePosi.endRowAlias,
				newEndAlias: select.wholePosi.endRowAlias
			});
			dispatch(actionTypes.COLS_UPDATEACTIVECOLS, {
				oldStartAlias: activeSelect.wholePosi.startColAlias,
				newStartAlias: select.wholePosi.startColAlias,
				oldEndAlias: activeSelect.wholePosi.endColAlias,
				newEndAlias: select.wholePosi.endColAlias
			});
		}
		commit(mutationTypes.UPDATE_SELECT, {
			select: activeSelect,
			props: select
		});
	}
};