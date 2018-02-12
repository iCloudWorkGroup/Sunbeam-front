import extend from '../../../util/extend';
import * as types from '../../action-types';
import template from './template';


export default {
	[types.SELECTS_INITSELECT]({state, getters, commit, rootState}) {
	 	let currentSheet = rootState.currentSheet,
			cells = state[currentSheet],
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

		select.physicsBox =  {
			top: rows[startRowIndex].top,
			left: cols[startColIndex].left,
			width: width,
			height: height
		};
		select.wholePosi = {
			startX: cols[startColIndex].alias,
			startY: rows[startRowIndex].alias,
			endX: cols[endColIndex].alias,
			endY: rows[endRowIndex].alias
		};
		commit('INSERT_SELECT',{
			currentSheet,
			selects: [select]
		});
	}
}