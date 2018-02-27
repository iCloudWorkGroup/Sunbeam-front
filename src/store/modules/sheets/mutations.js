import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		state.list.push(sheet);
	}
};