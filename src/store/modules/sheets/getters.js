export default {
	getFrozenState(state) {
		let currentSheet = rootState.currentSheet;
		return state[currentSheet].frozenState;
	}
};