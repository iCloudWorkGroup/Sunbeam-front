export default {
	getEidtState(state, getters, rootState) {
		let currentSheet = rootState.currentSheet;
		return state[currentSheet].editState;
	},
	getInputState(state, getters, rootState){
		let currentSheet = rootState.currentSheet;
		return state[currentSheet];
	}
};