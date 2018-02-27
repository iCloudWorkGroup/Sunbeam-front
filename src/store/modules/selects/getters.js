export default {
	selectList(state, getters, rootState) {
		let currentSheet = rootState.currentSheet,
			result = state[currentSheet];
		return result;
	}
};