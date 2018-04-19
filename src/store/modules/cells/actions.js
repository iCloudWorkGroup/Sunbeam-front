import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';
import extend from '../../../util/extend';
import template from './template';
import {SELECT} from '../../../tools/basic';
import generator from '../../../tools/generator';

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
	// [actionTypes.CELLS_UPDATECELL]({commit, state, rootState, getters}, {
	// 	colAlias,
	// 	rowAlias,
	// 	propName,
	// 	propValue
	// }) {
	// 	let getPointInfo = getters.getPointInfo,
	// 		currentSheet = rootState.currentSheet,
	// 		cellIndex;

	// 	cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex');

	// 	if (typeof cellIndex === 'number') {
	// 		let cells = getters.cellList;
	// 		{cell, props}
	// 		commit(mutationTypes.UPDATE_CELL,
	// 			{
	// 				cell: cells[cellIndex],
	// 				propName: propName,
	// 				value: propValue
	// 			}
	// 		});
	// 	} else {
	// 		let cell = extend(template),
	// 			colIndex = getters.getColIndexByAlias(colAlias),
	// 			rowIndex = getters.getColIndexByAlias(rowAlias),
	// 			col = getters.colList[colIndex],
	// 			row = getters.rowList[rowIndex];

	// 		cell.occupy.col.push(colAlias);
	// 		cell.occupy.row.push(rowAlias);

	// 		cell.physicsBox = {
	// 			top: row.top,
	// 			left: col.left,
	// 			width: col.width,
	// 			height: row.height
	// 		};

	// 		cell.alias = generator.cellAliasGenerator();
	// 		propName = propName.split('.');
	// 		if (propName.length > 1) {
	// 			cell[propName[0]][propName[1]] = propValue;
	// 		} else {
	// 			cell[propName[0]] = propValue;
	// 		}
	// 		commit(mutationTypes.INSERT_CELL, {
	// 			currentSheet,
	// 			cells: [cell]
	// 		});


	// 		commit(mutationTypes.UPDATE_POINTINFO, {
	// 			currentSheet,
	// 			info: {
	// 				colAlias,
	// 				rowAlias,
	// 				type: 'cellIndex',
	// 				value: getters.cellList.length - 1
	// 			}
	// 		});
	// 	}
	// },
	[actionTypes.CELLS_INSERTCELL]({commit, state, rootState, getters}, cellList){
		let insertCellInfo = [],
			cols = getters.colList,
			rows = getters.rowList,
			currentSheet = rootState.currentSheet,
			indexCounter = getters.cellList.length;
		cellList.forEach(function(cell) {
			let aliasColList = cell.occupy.col,
				aliasRowList = cell.occupy.row,
				startRowIndex,
				startColIndex,
				endColIndex,
				endRowIndex;

			cell = extend({}, template, cell);
			for (let i = 0, len = aliasColList.length; i < len; i++) {
				if ((startColIndex = getters.getColIndexByAlias(aliasColList[i])) !== -1) {
					break;
				}
			}
			for (let i = aliasColList.length - 1; i > -1; i++) {
				if ((endColIndex = getters.getColIndexByAlias(aliasColList[i])) !== -1) {
					break;
				}
			}
			for (let i = 0, len = aliasRowList.length; i < len; i++) {
				if ((startRowIndex = getters.getRowIndexByAlias(aliasRowList[i])) !== -1) {
					break;
				}
			}
			for (let i = aliasRowList.length - 1; i > -1; i++) {
				if ((endRowIndex = getters.getRowIndexByAlias(aliasRowList[i])) !== -1) {
					break;
				}
			}


			cell.physicsBox = {
				top: rows[startRowIndex].top,
				left: cols[startColIndex].left,
				width: cols[endColIndex].left + cols[endColIndex].width - cols[startColIndex].left,
				height: rows[endRowIndex].top + rows[endRowIndex].height - rows[startRowIndex].top
			};

			cell.alias = generator.cellAliasGenerator();
			commit(mutationTypes.INSERT_CELL, {
				currentSheet,
				cells: [cell]
			});
			for (let j = 0; j < aliasColList.length; j++) {
				for (let k = 0; k < aliasRowList.length; k++) {
					let colAlias = aliasColList[j],
						rowAlias = aliasRowList[k];
					commit(mutationTypes.UPDATE_POINTINFO, {
						currentSheet: rootState.currentSheet,
						info: {
							colAlias,
							rowAlias,
							type: 'cellIndex',
							value: indexCounter
						}
					});
				}
			}
			indexCounter ++;
		});
	},
	[actionTypes.COLS_OPERCOLS]({getters, state, rootState, commit, dispatch}, 
        {startIndex, endIndex, props}){
		if(startIndex === undefined){
            let selects = getters.selectList,
                select;
            for (let i = 0, len = selects.length; i < len; i++) {
                if (selects[i].type === SELECT) {
                    select = selects[i];
                    break;
                }
            }
            startIndex =  getters.getColIndexByAlias(select.wholePosi.startColAlias);
            endIndex =  getters.getColIndexByAlias(select.wholePosi.endColAlias);
        }
        endIndex = endIndex === undefined ? startIndex : endIndex;

        let updateCellInfo = [];
       	let cellList = getters.getCellsByVertical({
       		startRowIndex: 0,
       		endRowIndex: 'MAX',
       		startColIndex: startIndex,
       		endColIndex: endIndex
       	});
       	cellList.forEach(function(cell){
       		updateCellInfo.push({
       			cell,
       			props
       		})
       	});
       	commit(mutationTypes.UPDATE_CELL, updateCellInfo);

       	let insertCellInfo = [],
			editViewOccupy = getters.getEditViewOccupy(),
			cols = getters.colList,
			rows = getters.rowList;

       	for(let key in editViewOccupy){
			let viewOccupyRow = editViewOccupy[key].row,
				startRowIndex,
				endRowIndex;
			if (viewOccupyRow.length == 0) {
				continue;
			}
			startRowIndex = getters.getRowIndexByAlias(viewOccupyRow[0]);
			endRowIndex = getters.getRowIndexByAlias(viewOccupyRow[viewOccupyRow.length - 1]);

			for (let i = startRowIndex; i < endRowIndex + 1; i++) {
				for (let j = startIndex; j < endIndex + 1; j++) {
					let colAlias = cols[j].alias,
						rowAlias = rows[i].alias,
						cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex'),
						cell = extend({}, props);
						cell.occupy = {
							col: [colAlias],
							row: [rowAlias]
						};
					if(typeof cellIndex !== 'number'){
						insertCellInfo.push(cell);
					}
				}
			}
       	}
       	dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo);	
	},
	[actionTypes.ROWS_OPERROWS]({getters, state, rootState, commit, dispatch}, 
        {startIndex, endIndex, props}){
		if (startIndex === undefined) {
			let selects = getters.selectList,
				select;
			for (let i = 0, len = selects.length; i < len; i++) {
				if (selects[i].type === SELECT) {
					select = selects[i];
					break;
				}
			}
			startIndex = getters.getRowIndexByAlias(select.wholePosi.startRowAlias);
			endIndex = getters.getRowIndexByAlias(select.wholePosi.endRowAlias);
		}
		endIndex = endIndex === undefined ? startIndex : endIndex;

		if (endIndex === 'MAX') {
			return;
		}
		let updateCellInfo = [];

		let cellList = getters.getCellsByVertical({
			startRowIndex: startIndex,
			endRowIndex: endIndex,
			startColIndex: 0,
			endColIndex: 'MAX'
		});
		cellList.forEach(function(cell) {
			updateCellInfo.push({
				cell,
				props
			})
		});
		commit(mutationTypes.UPDATE_CELL, updateCellInfo);

		let insertCellInfo = [],
			editViewOccupy = getters.getEditViewOccupy(),
			cols = getters.colList,
			rows = getters.rowList;

		for (let key in editViewOccupy) {
			let viewOccupyCol = editViewOccupy[key].col,
				startColIndex,
				endColIndex;
			if (viewOccupyCol.length === 0) {
				continue;
			}
			startColIndex = getters.getColIndexByAlias(viewOccupyCol[0]),
			endColIndex = getters.getColIndexByAlias(viewOccupyCol[viewOccupyCol.length - 1]);

			for (let i = startColIndex; i < endColIndex + 1; i++) {
				for (let j = startIndex; j < endIndex + 1; j++) {
					let colAlias = cols[i].alias,
						rowAlias = rows[j].alias,
						cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex'),
						cell = extend({}, props);
					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					};
					if (typeof cellIndex !== 'number') {
						insertCellInfo.push(cell);
					}
				}
			}
		}
		dispatch(actionTypes.CELLS_INSERTCELL, insertCellInfo);
	},
	[actionTypes.OCCUPY_UPDATE]({commit, getters, rootState, dispatch}, {col, row}){

		let startRowIndex = getters.getRowIndexByAlias(row[0]),
			startColIndex = getters.getColIndexByAlias(col[0]),
			endRowIndex = getters.getRowIndexByAlias(row[row.length - 1]),
			endColIndex = getters.getColIndexByAlias(col[col.length - 1]),
			cols = getters.colList,
			rows = getters.rowList,
			getPointInfo = getters.getPointInfo,
			temp;

		for (let i = startRowIndex; i < endRowIndex + 1; i++) {
			if (!isEmpty((temp = rows[i].oprProp))) {
				for (let j = startColIndex; j < endColIndex + 1; j++) {
					let rowAlias = rows[i].alias,
						colAlias = cols[j].alias,
						index = getPointInfo(colAlias, rowAlias, 'cellIndex'),
						cell = extend({}, temp);

					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					};
					if (typeof index !== 'number') {
						dispatch(actionTypes.CELLS_INSERTCELL, [cell]);
					}
				}
			}
		}
		

		for (let i = startColIndex; i < endColIndex + 1; i++) {
			if (!isEmpty((temp =cols[i].oprProp))) {
				for (let j = startRowIndex; j < endRowIndex + 1; j++) {
					let rowAlias = rows[j].alias,
						colAlias = cols[i].alias,
						index = getPointInfo(colAlias, rowAlias, 'cellIndex'),
						cell = extend({}, temp);
						
					cell.occupy = {
						col: [colAlias],
						row: [rowAlias]
					};
					if(typeof index !== 'number'){
						dispatch(actionTypes.CELLS_INSERTCELL, [cell]);
					}
				}
			}
		}
		function isEmpty(obj){
			for(let key in obj){
				return false;
			}
			return true;
		}
	},
};