import extend from '../../../util/extend';
import * as mutationTypes from '../../mutation-types';
import * as actionTypes from '../../action-types';
import generator from '../../../tools/generator';
import template from './template';


export default {
	/**
	 * 初始化选中区域
	 */
	[actionTypes.SELECTS_INITSELECT]({
		state,
		getters,
		commit,
		rootState,
		rootGetters
	}) {
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
		select.alias = generator.selectAliasGenerator().value;
		commit(mutationTypes.INSERT_SELECT, {
			currentSheet,
			selects: [select]
		});
	},
	/**
	 * 更新选中区域
	 */
	[actionTypes.SELECTS_UPDATESELECT]({
		state,
		getters,
		commit,
		rootState
	}, {
		startColIndex,
		startRowIndex,
		endColIndex = startColIndex,
		endRowIndex = startRowIndex,
		type
	}) {
		let currentSheet = rootState.currentSheet,
			rows = rootState.rows[currentSheet].list,
			cols = rootState.cols[currentSheet].list,
			select = extend(template),
			region,
			width,
			height;

		region = getters.getFullOprRegion({
			startColIndex,
			startRowIndex,
			endColIndex,
			endRowIndex
		});

		startColIndex = region.startColIndex;
		startRowIndex = region.startRowIndex;
		endColIndex = region.endColIndex;
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
		if (type === 'locate') {
			select.activePosi = {
				colAlias: cols[startColIndex].alias,
				rowAlias: rows[startRowIndex].alias
			};
			select.tempPosi = {
				initColSort: startColIndex,
				initRowSort: startRowIndex
			};
		}
		commit(mutationTypes.UPDATE_SELECT, {
			currentSheet,
			select
		});
	}
};