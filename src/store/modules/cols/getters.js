import {rangeBinary, indexAttrBinary} from '../../../util/binary';

export default {
	colList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet].list;
		return result;
	},
	visibleColList(state, getters){
		let list = getters.colList,
			result = [];

		list.forEach(function(col) {
			if (!col.hidden) {
				result.push(col);
			}
		});
		return result;
	},
	getColMaxPosi(state, getters) {
		let list = getters.visibleColList,
			lastCol = list[list.length -1];
		return lastCol.left + lastCol.width;
	},
	getColIndexByPosi(state, getters, rootState) {
		return function(posi) {
			let col = getters.getColByPosi(posi);
			return getters.getColIndexBySort(col.sort);
		};
	},
	getColByPosi(state, getters) {
		let visibleList = getters.visibleColList,
			list = getters.colList;

		return function(posi) {
			let lastCol = visibleList[visibleList.length - 1];
			if (lastCol.left + lastCol.width < posi) {
				return lastCol;
			};
			let index = rangeBinary(posi, visibleList, 'left', 'width'),
				col = visibleList[index];
			return col;
		};
	},
	getVisibleColIndexBySort(state, getters, rootState) {
		let list = getters.visibleColList;
		return function(sort) {
			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getColIndexBySort(state, getters, rootState) {
		let list = getters.colList;
		return function(sort) {
			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getColIndexByAlias(state, getters, rootState) {
		let list = getters.colList;
		return function(alias) {
			if(alias === 'MAX'){
				return 'MAX';
			}
			let col = getters.getColByAlias(alias);
			if (col) {
				return getters.getColIndexBySort(col.sort);
			}
			return -1;
		};
	},
	getColByAlias(state, getters, rootState) {
		return function(alias) {
			let currentSheet = rootState.currentSheet,
				map = state[currentSheet].map;
			return map.get(alias);
		};
	},
	userViewColList(state, getters, rootState) {
		let list = getters.colList,
			visibleList = getters.visibleColList,
			userView = rootState.userView,
			start = getters.getColIndexByPosi(userView.left),
			end = getters.getColIndexByPosi(userView.right);

			start = indexAttrBinary(list[start].sort, visibleList, 'sort');
			end = indexAttrBinary(list[end].sort, visibleList, 'sort');
			
		return visibleList.slice(start, end + 1);
	},
	// getVisibleColList(state, getters) {
	// 	return function(start, end){

	// 		let list = getters.visibleColList,
	// 			startIndex = indexAttrBinary(list[start].sort, visibleList, 'sort'),
	// 			endIndex = indexAttrBinary(list[end].sort, visibleList, 'sort');

	// 		return visibleList.slice(startIndex, endIndex);
	// 	}
	// }
};