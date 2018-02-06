import * as types from '../../mutation-types';

export default {
	[types.ADD_ROW](state, payload) {
		if (!Array.isArray(payload)) {
			payload = [payload];
		}

		let row;
		for (let i = 0, len = payload.length; i < len; i++) {
			row = payload[i];
			state.list.push(row);
		}
	}
};