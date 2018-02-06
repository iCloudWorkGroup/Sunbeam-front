import * as types from '../../mutation-types';

export default {
	[types.ADD_COL](state, payload) {
		if (!Array.isArray(payload)) {
			payload = [payload];
		}

		for (let i = 0, len = payload.length; i < len; i++) {
			state.list.push(payload[i]);
		}
	}
};