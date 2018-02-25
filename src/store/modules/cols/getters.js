export default {
	colList(state, getters, rootState) {
		console.log('run');
		let currentSheet= rootState.currentSheet,
			result = state[currentSheet];
		return result;		
	}
}