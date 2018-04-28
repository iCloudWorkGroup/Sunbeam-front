import {rangeBinary, indexAttrBinary} from '../../../util/binary';

export default {
	colList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet].list;
		return result;
	},
	getColIndexByPosi(state, getters, rootState) {
		return function(posi) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet].list,
				lastCol = list[list.length - 1];

			if (lastCol.left + lastCol.height) {
				return list.length - 1;
			};
			return rangeBinary(posi, list, 'left', 'width');
		};
	},
	getColByPosi(state, getters, rootState) {
		return function(posi) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet].list,
				lastCol = list[list.length - 1];

			if (lastCol.left + lastCol.height) {
				return list.length - 1;
			};

			return list[rangeBinary(posi, list, 'left', 'width')];
		};
	},
	getColIndexBySort(state, getters, rootState) {
		return function(sort) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet].list;

			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getColIndexByAlias(state, getters, rootState) {
		return function(alias) {
			let col = getters.getColByAlias(alias),
				list = state[rootState.currentSheet].list;

			if(alias === 'MAX'){
				return 'MAX';
			}
			if (col) {
				return rangeBinary(col.left, list, 'left', 'width');
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
		let currentSheet = rootState.currentSheet,
			list = state[currentSheet].list,
			userView = rootState.userView,
			start = getters.getColIndexByPosi(userView.left),
			end = getters.getColIndexByPosi(userView.right);

		return list.slice(start, end);
	}
};