import * as mutationTypes from '../../mutation-types';

export default {
	[mutationTypes.INSERT_HISTORY](state, payload) {
		let index = state.currentIndex;
		let list = state.list;
		list.splice(index + 1, list.length - index - 1, payload);
		state.currentIndex += 1;
	},
	[mutationTypes.MOVE_HISTORYINDEX](state, index) {
		state.currentIndex = index;
	}
}
