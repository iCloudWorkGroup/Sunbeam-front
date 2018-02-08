import {rangeBinary} from '../../../util/binary';
export default {
	getFullOprRegion(state, getters, rootState) {
		return function({startColIndex, startRowIndex, endColIndex = startColIndex, endRowIndex = startRowIndex}) {
			let cells = state.list,
				rows = rootState.row.list,
				cols = rootState.col.list,
				cellStartColIndex,
				cellStartRowIndex,
				cellEndColIndex,
				cellEndRowIndex,
				tmp,
				flag = true,

			if (startRowIndex > endRowIndex) {
				tmp = startRowIndex;
				startRowIndex = endRowIndex;
				endRowIndex = tmp;
			}
			if (startColIndex > endColIndex) {
				temp = startColIndex;
				startColIndex = endColIndex;
				endColIndex = temp;
			}
			if (startColIndex === 'MAX' || endColIndex === 'MAX') {
				return {
					startRowIndex: startRowIndex,
					startColIndex: 0,
					endRowIndex: endRowIndex,
					endColIndex: cols.length - 1
				};
			}
			if (startRowIndex === 'MAX' || endRowIndex === 'MAX') {
				return {
					startRowIndex: 0,
					startColIndex: startColIndex,
					endColIndex: endColIndex,
					endRowIndex: rows.length - 1
				};
			}

			while (flag) {
				flag = false;
				cellList = getters.getCellsByVertical({startColIndex, startRowIndex, endColIndex, endRowIndex});

				for (i = 0, len = cellList.length; i < len; i++) {
					tmp = cellList.physicsBox;
					cellStartRowIndex = rangeBinary(temp.top, rowList, 'top', 'height');
					cellStartColIndex = rangeBinary(temp.left, colList, 'left', 'width');
					cellEndRowIndex = rangeBinary(temp.top + temp.height, rowList, 'top', 'height');
					cellEndColIndex = rangeBinary(temp.left + temp.width, colList, 'left', 'width');
					if (cellStartColIndex < startColIndex) {
						startColIndex = cellStartColIndex;
						flag = true;
					}
					if (cellStartRowIndex < startRowIndex) {
						startRowIndex = cellStartRowIndex;
						flag = true;
					}
					if (cellEndRowIndex > endRowIndex) {
						endRowIndex = cellEndRowIndex;
						flag = true;
					}
					if (cellEndColIndex > endColIndex) {
						endColIndex = cellEndColIndex;
						flag = true;
					}
				}
			}
			return {
				startRowIndex,
				startColIndex,
				endRowIndex,
				endColIndex
			};
		}
	},
	getCellByVertical(state, getters, rootState) {
		let cells = state.list;
		return function({startColIndex, startRowIndex, endColIndex = startColIndex, endRowIndex = startRowIndex}){
			let result = [],
				pointInfo = rootState.points2Info.col,
				rows = rootState.row.list,
				cols = rootState.col.list,
				index,
				tmpObj = {},
				rowAlias,
				colAlias,
				region;

			strandX = cache.CellsPosition.strandX;
			for (let i = startColIndex, len1 = endColIndex + 1; i < len1; i++) {
				colAlias = cols[i].alias;
				if (typeof pointInfo[colAlias] !== 'undefined') {
					for (let j = startRowIndex, len2 = endRowIndex + 1; j < len2; j++) {
						rowAlias = rows[j].alias;
						if (typeof pointInfo[colAlias][rowAlias] !== 'undefined') {
							index = pointInfo[colAlias][rowAlias];
							if (!tempObj[index]) {
								result.push(cells.at(index));
								tmpObj[index] = 1;
							}
						}
					}
				}
			}
			return result;
		}
	}
}