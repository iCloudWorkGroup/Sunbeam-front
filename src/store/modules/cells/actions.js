import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';
import extend from '../../../util/extend';
import template from './template';

export default {
	/**
	 * 还原单元格
	 */
	[actionTypes.CELLS_RESTORECELL]({commit, dispatch, state, rootState, getters}, cells) {
		if (!Array.isArray(cells)) {
			cells = [cells];
		}

		let sheet = rootState.currentSheet,
			colList = rootState.cols[sheet],
			rowList = rootState.rows[sheet],
			cellList = rootState.cells[sheet],
			limitRowIndex = rowList.length - 1,
			limitColIndex = colList.length - 1,
			getPointInfo = getters.getPointInfo;


		for (let i = 0, len = cells.length; i < len; i++) {
			let cell,
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				aliasColList,
				aliasRowList,
				aliasCol, aliasRow,
				cellIndex,
				width = 0,
				height = 0,
				physicsBox;

			cell = cells[i];
			aliasColList = cell.occupy.x;
			aliasRowList = cell.occupy.y;
			aliasCol = aliasColList[0];
			aliasRow = aliasRowList[0];

			cellIndex = getPointInfo(aliasCol, aliasRow, 'cellIndex');

			startRowIndex = indexAttrBinary(cell.occupy.row, rowList, 'sort');
			endRowIndex = startRowIndex + aliasRowList.length - 1;
			delete cell.occupy.row;

			if (endRowIndex > limitRowIndex) {
				endRowIndex = limitRowIndex;
			}
			if (startRowIndex === -1) {
				continue;
			}

			startColIndex = indexAttrBinary(cell.occupy.col, rowList, 'sort');
			endColIndex = startColIndex + aliasColList.length - 1;
			delete cell.occupy.col;

			if (endColIndex > limitColIndex) {
				endColIndex = limitColIndex;
			}
			if (endColIndex === -1) {
				continue;
			}

			for (let j = startColIndex; j < endColIndex + 1; j++) {
				let col = colList[j];
				if (!col.hidden) {
					width += col.width + 1;
				}
			}
			for (let j = startRowIndex; j < endRowIndex + 1; j++) {
				let row = rowList[j];
				if (!row.hidden) {
					height += row.height + 1;
				}
			}
			physicsBox = {
				top: rowList[startRowIndex].top,
				left: colList[startColIndex].left,
				width: width - 1,
				height: height - 1
			};
			/**
			 * 更新坐标信息
			 */
			if (typeof cellIndex !== 'number') {
				let colAlias, rowAlias;
				for (let j = 0; j < aliasColList.length; j++) {
					for (let k = 0; k < aliasRowList.length; k++) {
						colAlias = aliasColList[j];
						rowAlias = aliasRowList[k];
						commit(mutaionTypes.UPDATE_POINTINFO, {
							currentSheet: sheet,
							info: {
								colAlias,
								rowAlias,
								type: 'cellIndex',
								value: cellList.length
							}
						});
					}
				}
				cell.physicsBox = physicsBox;
				cell = extend({}, template, cell);
				commit(mutaionTypes.INSERT_CELL, {
					currentSheet: sheet,
					cells: [cell]
				});
			} else {
				commit(mutaionTypes.UPDATE_CELL, {
					currentSheet: sheet,
					cell: {
						propName: 'physicsBox',
						value: physicsBox,
						cellIndex
					}
				});
			}
		}
	}
};