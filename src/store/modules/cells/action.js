import * as actionTypes from './action-types';

export default {
	[actionTypes.RESTORE_CELL] ({commit, state, rootState}, cells) {
		if (!Array.isArray(cells)) {
			cells = [cells];
		}

		let cell, aliasColList,aliasRowList,	
			aliasCol, aliasRow,		
			startRowIndex,
			startColIndex,
			limitRowIndex,
			limitColIndex;
			point2Info = rootState.point2Info;
			

		for (let i = 0, len = cells.length; i < len; i++) {
			cell = cells[i];
			aliasColList = cell.occupy.x;
			aliasRowList = cell.occupy.y;

			if

			if(aliasRowList){

			}
				var j, k, //循环变量
				tempCell = null,
				limitRowIndex = headItemRows.length - 1,
				physicsBox = {},
				cellStartRowIndex, //cell起始row索引
				cellStartColIndex, //cell起始col索引
				cellEndRowIndex, //cell结束row索引
				cellEndColIndex, //cell结束row索引
				cellsPositionX = cache.CellsPosition.strandX,
				colSort, rowSort,
				width = 0,
				height = 0,
				i,
				model; //gridrow加载数量


			//解析cell
			for (i = 0; i < cellsData.length; i++) {
				cellAttributes = cellsData[i];
				if (cellAttributes === null) {
					continue;
				}

				gridAliasColList = cellAttributes.occupy.x;
				gridAliasRowList = cellAttributes.occupy.y;
				colSort = cellAttributes.occupy.col;
				rowSort = cellAttributes.occupy.row;
				delete cellAttributes.occupy.col;
				delete cellAttributes.occupy.row;

				cellStartRowIndex = binary.indexAttrBinary(rowSort, headItemRowList, 'sort');
				cellEndRowIndex = cellStartRowIndex + gridAliasRowList.length - 1;
				if (cellEndRowIndex > limitRowIndex) {
					cellEndRowIndex = limitRowIndex;
				}
				if (cellStartRowIndex === -1) {
					continue;
				}
				cellStartColIndex = binary.indexAttrBinary(colSort, headItemColList, 'sort');
				cellEndColIndex = cellStartColIndex + gridAliasColList.length - 1;

				//判断cell模型是否已加载
				if (cellsPositionX[gridAliasColList[0]] &&
					cellsPositionX[gridAliasColList[0]][gridAliasRowList[0]] !== undefined) {
					tempCell = cells.models[cellsPositionX[gridAliasColList[0]][gridAliasRowList[0]]];
				}

				//计算cell模型宽高
				for (j = cellStartColIndex; j < cellEndColIndex + 1; j++) {
					model = headItemColList[j];
					if (!model.get('hidden')) {
						width += model.get('width') + 1;
					}
				}
				for (j = cellStartRowIndex; j < cellEndRowIndex + 1; j++) {
					model = headItemRowList[j];
					height += model.get('height') + 1;
				}
				physicsBox = {
					top: headItemRowList[cellStartRowIndex].get('top'),
					left: headItemColList[cellStartColIndex].get('left'),
					width: width - 1,
					height: height - 1
				};
				if (tempCell !== null) {
					//重新渲染cell模型宽高
					tempCell.set('physicsBox', physicsBox);
				} else {
					cellAttributes.physicsBox = physicsBox;
					cells.add(cellAttributes);
					//维护postion
					for (j = 0; j < gridAliasColList.length; j++) {
						for (k = 0; k < gridAliasRowList.length; k++) {
							cache.cachePosition(gridAliasRowList[k], gridAliasColList[j], cells.length - 1);
						}
					}
				}
				tempCell = null;
				width = 0;
				height = 0;
			}
		}
	}
}