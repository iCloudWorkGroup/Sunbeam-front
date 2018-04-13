import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import {
	indexAttrBinary
} from '../../../util/binary';
import {
	cellAliasGenerator
} from '../../../tools/generator';
import extend from '../../../util/extend';
import template from './template';

export default {
    /**
     * 还原单元格
     */
    [actionTypes.CELLS_RESTORECELL]({ commit, dispatch, state, rootState,
        getters }, cells) {
        if (!Array.isArray(cells)) {
            cells = [cells];
        }

        let sheet = rootState.currentSheet,
            colList = rootState.cols[sheet].list,
            rowList = rootState.rows[sheet].list,
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

			startColIndex = indexAttrBinary(cell.occupy.col, colList, 'sort');
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
						commit(mutationTypes.UPDATE_POINTINFO, {
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
				/**
				 * 该代码为保持与后台数据结构相同，后期删除
				 */
				cell.occupy.col = cell.occupy.x;
				cell.occupy.row = cell.occupy.y;
				delete cell.occupy.x;
				delete cell.occupy.y;
				cell = extend({}, template, cell);
				commit(mutationTypes.INSERT_CELL, {
					currentSheet: sheet,
					cells: [cell]
				});
			} else {
				commit(mutationTypes.UPDATE_CELL, {
					currentSheet: sheet,
					info: {
						propName: 'physicsBox.width',
						value: physicsBox.width,
						cell: cellList[cellIndex]
					}
				});
				commit(mutationTypes.UPDATE_CELL, {
					currentSheet: sheet,
					info: {
						propName: 'physicsBox.height',
						value: physicsBox.height,
						cell: cellList[cellIndex]
					}
				});
			}
		}
	},
	[actionTypes.CELLS_UPDATECELL]({
		commit,
		state,
		rootState,
		getters
	}, {
		colAlias,
		rowAlias,
		propName,
		propValue
	}) {
		let getPointInfo = getters.getPointInfo,
			currentSheet = rootState.currentSheet,
			cellIndex;

		cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex');

		if (typeof cellIndex === 'number') {
			let cells = getters.cellList;
			commit(mutationTypes.UPDATE_CELL, {
				currentSheet: rootState.currentSheet,
				info: {
					cell: cells[cellIndex],
					propName: propName,
					value: propValue
				}
			});
		} else {
			let cell = extend(template),
				colIndex = getters.getColIndexByAlias(colAlias),
				rowIndex = getters.getColIndexByAlias(rowAlias),
				col = getters.colList[colIndex],
				row = getters.rowList[rowIndex];

			cell.occupy.col.push(colAlias);
			cell.occupy.row.push(rowAlias);
			cell.physicsBox = {
				top: row.top,
				left: col.left,
				width: col.width,
				height: row.height
			};
			propName = propName.split('.');
			if (propName.length > 1) {
				cell[propName[0]][propName[1]] = propValue;
			} else {
				cell[propName[0]] = propValue;
			}
			commit(mutationTypes.INSERT_CELL, {
				currentSheet,
				cells: [cell]
			});


			commit(mutationTypes.UPDATE_POINTINFO, {
				currentSheet,
				info: {
					colAlias,
					rowAlias,
					type: 'cellIndex',
					value: getters.cellList.length - 1
				}
			});
		}
	}
};