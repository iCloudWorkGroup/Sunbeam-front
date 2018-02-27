import {rangeBinary} from '../../../util/binary';

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
	}
};