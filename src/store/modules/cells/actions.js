import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';

export default {
	[actionTypes.CELLS_RESTORE_CELL] ({commit, state, rootState, rootGetters}, cells) {
		
		if (!Array.isArray(cells)) {
			cells = [cells];
		}

		let colList = rootState.cols.list,
			rowList = rootState.rows.list,
			cellList = rootState.cells.list,
			limitRowIndex = rowList.length - 1,
			limitColIndex = colList.length - 1,
			getPointInfo = rootGetters.getPointInfo;
			

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
				top, left,
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
				if (!col.hidden){
					width += col.width + 1;
				}
			}
			for (let j = startRowIndex; j < endRowIndex + 1; j++) {
				let row = rowList[j];
				if (!row.hidden){
					height += row.height + 1;
				}
			}
			physicsBox = {
				top: rowList[startRowIndex].top,
				left: colList[startColIndex].left,
				width: width - 1,
				height: height - 1
			};

			if(typeof cellIndex !== 'number'){
				let colAlias, rowAlias;
				for (let j = 0; j < aliasColList.length; j++) {
					for (let k = 0; k < aliasRowList.length; k++) {
						colAlias = aliasColList[j];
						rowAlias = aliasRowList[k];
						commit(mutaionTypes.UPDATE_POINTINFO, {
							colAlias,
							rowAlias,
							type: 'cellIndex',
							value: cellList.length
						});
					}
				}
				cell.physicsBox = physicsBox;
				commit(mutaionTypes.INSERT_CELL, cell);
				
			}else{
				commit(mutaionTypes.UPDATE_CELL, {
					propName: 'physicsBox',
					value: physicsBox,
					cellIndex
				});
			}
		}
	}
}