export default {
	selectList(state, getters, rootState) {
		return state[rootState.currentSheet].list;
	}
};