import {rangeBinary, indexAttrBinary} from '../../../util/binary';

export default {
	rowList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet];
		return result;
	},
	getRowIndex(state, getters, rootState) {
		return function(posi) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			return rangeBinary(posi, list, 'top', 'height');
		};
	},
	getRowIndexBySort(state, getters, rootState){
		return function(sort) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getRowIndexByAlias(state, getters, rootState) {
		return function(alias) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet];
			for (let i = 0, len = list.length; i < len; i++) {
				if (list[i].alias === alias) {
					return i;
				}
			}
			return -1;
		};
	},
	getRowByAlias(state, getters, rootState){
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
	},
	getIndexByAlias(state, getters, rootState){
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
	},
	userViewRowList(state, getters, rootState){
		let currentSheet = rootState.currentSheet,
			list = state[currentSheet],
			userView = rootState.userView,
			start = getters.getRowIndex(userView.top),
			end = getters.getRowIndex(userView.bottom);

		return list.slice(start, end);
	}
};