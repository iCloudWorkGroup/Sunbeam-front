import {rangeBinary} from '../../../util/binary';
export default {
	cellList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet];
		return result;
	},
	/**
	 * 返回合法的操作区域
	 * 区域内只能包含完整的单元格
	 */
	getFullOprRegion(state, getters, rootState) {
		return function({startColIndex, startRowIndex, endColIndex = startColIndex, endRowIndex = startRowIndex}) {
			let currentSheet = rootState.currentSheet,
				rows = rootState.rows[currentSheet],
				cols = rootState.cols[currentSheet],
				cellStartColIndex,
				cellStartRowIndex,
				cellEndColIndex,
				cellEndRowIndex,
				cellList,
				temp,
				flag = true;

			if (startRowIndex > endRowIndex) {
				temp = startRowIndex;
				startRowIndex = endRowIndex;
				endRowIndex = temp;
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

				for (let i = 0, len = cellList.length; i < len; i++) {
					temp = cellList[i].physicsBox;
					cellStartRowIndex = rangeBinary(temp.top, rows, 'top', 'height');
					cellStartColIndex = rangeBinary(temp.left, cols, 'left', 'width');
					cellEndRowIndex = rangeBinary(temp.top + temp.height, rows, 'top', 'height');
					cellEndColIndex = rangeBinary(temp.left + temp.width, cols, 'left', 'width');
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
		};
	},
	/**
	 * 查选区域内所有单元格(垂直方向)
	 */
	getCellsByVertical(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			cells = state[currentSheet];
			
		return function({startColIndex, startRowIndex, endColIndex = startColIndex, endRowIndex = startRowIndex}) {
			let result = [],
				pointInfo = rootState.pointsInfo[currentSheet].col,
				rows = rootState.rows[currentSheet],
				cols = rootState.cols[currentSheet],
				index, temp,
				tempObj = {},
				rowAlias,
				colAlias;

			for (let i = startColIndex, len1 = endColIndex + 1; i < len1; i++) {
				colAlias = cols[i].alias;
				if (typeof pointInfo[colAlias] !== 'undefined') {
					for (let j = startRowIndex, len2 = endRowIndex + 1; j < len2; j++) {
						rowAlias = rows[j].alias;
						if (typeof (temp = pointInfo[colAlias][rowAlias]) !== 'undefined' &&
							temp.cellIndex !== null) {
							index = temp.cellIndex;
							if (!tempObj[index]) {
								result.push(cells[index]);
								tempObj[index] = 1;
							}
						}
					}
				}
			}
			return result;
		};
	}
};