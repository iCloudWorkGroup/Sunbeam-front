import {rangeBinary, indexAttrBinary} from '../../../util/binary';

export default {
	colList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet];
		return result;
	},
	getColIndex(state, getters, rootState) {
		return function(posi) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			return rangeBinary(posi, list, 'left', 'width');
		};
	},
	getColIndexBySort(state, getters, rootState){
		return function(sort) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getColIndexByAlias(state, getters, rootState) {
		return function(alias) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			for (let i = 0, len = list.length; i < len; i++) {
				if (list[i].alias === alias) {
					return i;
				}
			}
			return -1
		};
	},
	getColByAlias(state, getters, rootState){
		return function(alias) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			for (let i = 0, len = list.length; i < len; i++) {
				if (list[i].alias === alias) {
					return list[i];
				}
			}
			return -1;
		};

	}
};