import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';
import extend from '../../../util/extend';
import template from './template';
import {SELECT} from '../../../tools/constant';
import generator from '../../../tools/generator';

export default {
    /**
     * 还原单元格, 由occupy生成盒模型信息
     */
    [actionTypes.CELLS_RESTORECELL]({ commit, dispatch, state, rootState,
        getters }, cellList) {
        if (!Array.isArray(cellList)) {
            cellList = [cellList];
        }

        let sheet = rootState.currentSheet,
            cols = getters.colList,
            rows = getters.rowList,
            cells = getters.cellList,
            limitRowIndex = rows.length - 1,
            limitColIndex = cols.length - 1,
            getPointInfo = getters.getPointInfo,
            getColIndexByAlias = getters.getColIndexByAlias,
            getRowIndexByAlias = getters.getRowIndexByAlias;

        for (let i = 0, len = cellList.length; i < len; i++) {
			let cell = cellList[i],
				aliasColList = cell.occupy.col,
				aliasRowList = cell.occupy.row,
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				aliasCol, aliasRow,
				cellIndex,
				width = 0,
				height = 0,
				physicsBox;

			aliasCol = aliasColList[0];
			aliasRow = aliasRowList[0];

			cellIndex = getPointInfo(aliasCol, aliasRow, 'cellIndex');

			startRowIndex = getRowIndexByAlias(aliasRow);
			endRowIndex = startRowIndex + aliasRowList.length - 1;

			if (endRowIndex > limitRowIndex) {
				endRowIndex = limitRowIndex;
			}
			if (startRowIndex === -1) {
				continue;
			}

			startColIndex = getColIndexByAlias(aliasCol);
			endColIndex = startColIndex + aliasColList.length - 1;

			if (endColIndex > limitColIndex) {
				endColIndex = limitColIndex;
			}
			if (endColIndex === -1) {
				continue;
			}

			for (let j = startColIndex; j < endColIndex + 1; j++) {
				let col = cols[j];
				if (!col.hidden) {
					width += col.width + 1;
				}
			}
			for (let j = startRowIndex; j < endRowIndex + 1; j++) {
				let row = rows[j];
				if (!row.hidden) {
					height += row.height + 1;
				}
			}
			physicsBox = {
				top: rows[startRowIndex].top,
				left: cols[startColIndex].left,
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
								value: cells.length
							}
						});
					}
				}
				cell.physicsBox = physicsBox;
				cell = extend({}, template, cell);
				commit(mutationTypes.INSERT_CELL, {
					currentSheet: sheet,
					cell
				});
			} else {
				commit(mutationTypes.UPDATE_CELL, [{
					cell: cells[cellIndex],
					props: {
						physicsBox: {
							height: physicsBox.height,
							width: physicsBox.width
						}
					}
				}]);
			}
		}
	},

	[actionTypes.CELLS_UPDATE]({commit, dispatch, getters}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex,
		propNames,
		value
	}) {
		if(typeof startColIndex === 'undefined'){
			let select = getters.activeSelect,
				wholePosi = select.wholePosi;
			
			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias);
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias);
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias);
		}
		endColIndex = endColIndex || startColIndex;
		endRowIndex = endRowIndex || startRowIndex;

		propNames = propNames.split('.');

		if(value === undefined){
			let cellList = getters.getCellsByVertical({
				startColIndex,
				endColIndex,
				startRowIndex,
				endRowIndex
			});
			if(cellList.length === 0){
				value = true;
			}else{
				let temp;
				for (let i = 0; i < propNames.length; i++) {
					if(i === 0){
						temp = cellList[0][propNames[i]];
					}else{
						temp = temp[propNames[i]];
					}
				}
				value = !temp;
			}
		}

		let	props = {},
			temp;

		for (let i = 0, len = propNames.length; i < len; i++) {
			if (i === 0) {
				temp = props[propNames[0]] = {};
			}else if (i < len - 1) {	
				temp[propNames[i]] = temp = {};
			}else {
				temp[propNames[i]] = value;
			} 
		}

		let getPointInfo = getters.getPointInfo,
			tempSign = {},
			cols = getters.colList,
			rows = getters.rowList,
			cells = getters.cellList,
			updateCellInfo = [],
			insertCellList = [],
			colAlias,
			rowAlias,
			cellIndex;

		for (let i = startColIndex; i <= endColIndex; i++) {
			for (let j = startRowIndex; j <= endRowIndex; j++) {
				colAlias = cols[i].alias;
				rowAlias = rows[j].alias;
				cellIndex = getPointInfo(colAlias, rowAlias, 'cellIndex');
				if (typeof cellIndex === 'number') {
					let cell;
					if ((cell = cells[cellIndex]) && !tempSign[cell.alias]) {
						updateCellInfo.push({
			       			cell,
			       			props
			       		});
					}
				} else {
					insertCellList.push(extend({
						occupy: {
							col: [colAlias],
							row: [rowAlias]
						}
					}, props));
				}
			}
		}
		dispatch(actionTypes.CELLS_INSERTCELL, insertCellList);
		commit(mutationTypes.UPDATE_CELL, updateCellInfo);
	},
	[actionTypes.CELLS_UPDATE_BORDER]({commit, dispatch, getters}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex,
		value
	}) {
		if(typeof startColIndex === 'undefined'){
			let select = getters.activeSelect,
				wholePosi = select.wholePosi;
			
			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias);
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias);
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias);
		}
		let thick = false;
		if (value.indexOf('-thick') !== -1) {
			thick = true;
			value = value.split('-')[0];
		}

		switch (value) {
			case 'bottom':
				setBottom();
				break;
			case 'top':
				setTop();
				break;
			case 'left':
				setLeft();
				break;
			case 'right':
				setRight();
				break;
			case 'none':
				setNone();
				break;
			case 'all':
				setAll();
				break;
			case 'outer':
				setOuter();
				break;
		}

		function setBottom() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex: endRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border.bottom',
				value: thick ? 2 : 1
			});
		}

		function setTop() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex: startRowIndex,
				endColIndex,
				propNames: 'physicsBox.border.top',
				value: thick ? 2 : 1
			});
		}

		function setLeft() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex: startColIndex,
				propNames: 'physicsBox.border.left',
				value: thick ? 2 : 1
			});
		}

		function setRight() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex: endColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border.right',
				value: thick ? 2 : 1
			});
		}

		function setNone() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border',
				value: {
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				}
			});
		}

		function setAll() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border',
				value: {
					top: 1,
					left: 1,
					right: 1,
					bottom: 1
				}
			});
		}

		function setOuter() {
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex: startRowIndex,
				endColIndex,
				propNames: 'physicsBox.border',
				value: {
					top: 1
				}
			});
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex: startColIndex,
				propNames: 'physicsBox.border',
				value: {
					left: 1
				}
			});
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex: endRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border',
				value: {
					bottom: 1
				}
			});
			dispatch(actionTypes.CELLS_UPDATE, {
				startRowIndex,
				startColIndex: endColIndex,
				endRowIndex,
				endColIndex,
				propNames: 'physicsBox.border',
				value: {
					right: 1
				}
			});
		}
	},
	/**
	 * 插入单元格
	 */
	[actionTypes.CELLS_INSERTCELL]({commit, state, rootState, getters}, cellList){
		let insertCellInfo = [],
			cols = getters.colList,
			rows = getters.rowList,
			sheet = rootState.currentSheet,
			indexCounter = getters.cellList.length;
			
		cellList.forEach(function(cell) {
			let aliasColList = cell.occupy.col,
				aliasRowList = cell.occupy.row,
				startRowIndex,
				startColIndex,
				endColIndex,
				endRowIndex;

			cell = extend({}, template, cell);

			startColIndex = getters.getColIndexByAlias(aliasColList[0]);			
			endColIndex = getters.getColIndexByAlias(aliasColList[aliasColList.length -1]);
			startRowIndex = getters.getRowIndexByAlias(aliasRowList[0]);
			endRowIndex = getters.getRowIndexByAlias(aliasRowList[aliasRowList.length -1]);


			let physicsBox = {
				top: rows[startRowIndex].top,
				left: cols[startColIndex].left,
				width: cols[endColIndex].left + cols[endColIndex].width - cols[startColIndex].left,
				height: rows[endRowIndex].top + rows[endRowIndex].height - rows[startRowIndex].top
			};

			extend(cell, {physicsBox});

			cell.alias = generator.cellAliasGenerator();
			commit(mutationTypes.INSERT_CELL, {
				currentSheet: rootState.currentSheet,
				cell
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
						cellIndex = getters.getPointInfo(colAlias, rowAlias, 'cellIndex');
					if (typeof cellIndex !== 'number') {
						let cell = extend({}, props);
						cell.occupy = {
							col: [colAlias],
							row: [rowAlias]
						};
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
	[actionTypes.CELLS_MERGE]({commit, dispatch, getters, rootState}, {
		startColIndex,
		endColIndex,
		startRowIndex,
		endRowIndex,
		value
	} = {}) {
		if(typeof startColIndex === 'undefined'){
			let select = getters.activeSelect,
				wholePosi = select.wholePosi;
			
			startColIndex = getters.getColIndexByAlias(wholePosi.startColAlias);
			endColIndex = getters.getColIndexByAlias(wholePosi.endColAlias);
			startRowIndex = getters.getRowIndexByAlias(wholePosi.startRowAlias);
			endRowIndex = getters.getRowIndexByAlias(wholePosi.endRowAlias);
		}
		endColIndex = endColIndex || startColIndex;
		endRowIndex = endRowIndex || startRowIndex;

		if (value === undefined) {
			value = !getters.getMergeState();
		}
		let cellList = getters.getCellsByTransverse({
			startColIndex,
			endColIndex,
			startRowIndex,
			endRowIndex
		});

		if (value) {
			let cell;
			for (let i = 0, len = cellList.length; i < len; i++) {
				if(cellList[i].content.texts){
					cell = cellList[i];
					break;
				}
			}
			if(!cell){
				cell = getters.getCellsByTransverse({
					startColIndex,
					endColIndex
				})[0];
			}
			cell = extend({}, cell || {});

			let cols = getters.colList,
				rows = getters.rowList,
				rowAliasList = [],
				colAliasList = [];

			for (let i = startColIndex; i < endColIndex + 1; i++) {
				colAliasList.push(cols[i].alias);
			}
			for (let i = startRowIndex; i < endRowIndex + 1; i++) {
				rowAliasList.push(rows[i].alias);
			}
			cell.occupy = {
				row: rowAliasList,
				col: colAliasList
			}
			dispatch(actionTypes.CELLS_INSERTCELL, [cell]);
		}else{
			let currentSheet = rootState.currentSheet,
				cols = getters.colList,
				rows = getters.rowList;
			for (let i = startColIndex; i < endColIndex + 1; i++) {
				for (let j = startRowIndex; j < endRowIndex + 1; j++) {
					commit(mutationTypes.UPDATE_POINTINFO, {
						currentSheet,
						info: {
							colAlias: cols[i].alias,
							rowAlias: rows[j].alias,
							type: 'cellIndex',
							value: null
						}
					});
				}
			}
			let insertCellList = [];
			cellList.forEach(function(cell) {
				let rowAliasList = cell.occupy.row,
					colAliasList = cell.occupy.col;
				for (let i = 0, len1 = colAliasList.length; i < len1; i++) {
					for (let j = 0, len2 = rowAliasList.length; j < len2; j++) {
						let insertCell = extend({}, cell);
						insertCell.occupy.col = [colAliasList[i]];
						insertCell.occupy.row = [rowAliasList[j]];
						if (i !== 0 || j !== 0) {
							insertCell.content.texts = '';
						}
						insertCellList.push(insertCell);
					}
				}
			});
			dispatch(actionTypes.CELLS_INSERTCELL, insertCellList);
		}

	}
};