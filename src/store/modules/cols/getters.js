export default {
	colList(state, getters, rootState) {
		let currentSheet= rootState.currentSheet,
			result = state[currentSheet];
		return result;		
	}
}