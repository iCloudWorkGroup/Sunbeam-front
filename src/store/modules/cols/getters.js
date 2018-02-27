import {rangeBinary} from '../../../util/binary';

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
	}
};