import * as types from './mutation-types';

export default {
	[types.UPDATE_ACTIVESHEET](state, alias) {
		state.currentSheet = alias;
	}
}