import extend from '../../../util/extend';
import * as mutationTypes from '../../mutation-types';
import * as actionTypes from '../../action-types';
import template from './template';


export default {
	[actionTypes.SELECTS_INITSELECT]({state, getters, commit, rootState}) {
		let currentSheet = rootState.currentSheet,
			rows = rootState.rows[currentSheet],
			cols = rootState.cols[currentSheet],
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
	},
	[actionTypes.SELECTS_UPDATESELECT]({state, getters, commit, rootState}, 
		{startColIndex, startRowIndex, endColIndex = startColIndex, endRowIndex = startRowIndex, type}) {
		let currentSheet = rootState.currentSheet,
			rows = rootState.rows[currentSheet],
			cols = rootState.cols[currentSheet],
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
				rowAlias: cols[startColIndex].alias,
				colAlias: rows[startRowIndex].alias
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