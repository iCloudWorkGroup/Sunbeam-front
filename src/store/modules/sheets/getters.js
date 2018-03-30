export default {
	frozenState(state, getters, rootState) {
		let alias = rootState.currentSheet,
			list = state.list,
			sheet;
		for (let i = 0, len = list.length; i < len; i++) {
			if(list[i].alias === alias){
				sheet = list[i];
				break;
			}
		}
		return sheet.frozenState;
	}
};