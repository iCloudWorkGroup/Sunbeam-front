import {rangeBinary, indexAttrBinary} from '../../../util/binary';

export default {
	rowList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet].list;
		return result;
	},
	getRowIndexByPosi(state, getters, rootState) {
		return function(posi) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet].list;
			return rangeBinary(posi, list, 'top', 'height');
		};
	},
	getRowIndexBySort(state, getters, rootState){
		return function(sort) {
			let currentSheet = rootState.currentSheet,
				list = state[currentSheet].list;
			return indexAttrBinary(sort, list, 'sort');
		};
	},
	getRowByAlias(state, getters, rootState) {
		return function(alias) {
			let currentSheet = rootState.currentSheet,
				map = state[currentSheet].map;

			return map.get(alias);
		};
	},
	getRowIndexByAlias(state, getters, rootState) {
		return function(alias) {
			let row = getters.getRowByAlias(alias),
				list = state[rootState.currentSheet].list;
			
			if(alias === 'MAX'){
				return 'MAX';
			}
			if (row) {
				return rangeBinary(row.top, list, 'top', 'height');
			}
			return -1;
		};
	},
	userViewRowList(state, getters, rootState){
		let currentSheet = rootState.currentSheet,
			list = state[currentSheet].list,
			userView = rootState.userView,
			start = getters.getRowIndexByPosi(userView.top),
			end = getters.getRowIndexByPosi(userView.bottom);

		return list.slice(start, end);
	}
};