import * as types from '../../mutation-types';

export default{
	[types.INSERT_CELL](state, payload) {
		if (!Array.isArray(payload)) {
			payload = [payload];
		}

		for (let i = 0, len = payload.length; i < len; i++) {
			state.list.push(payload[i]);
		}
	}
	[types.UPDATE_CELL](state, {cellIndex, propName, val}) {
		let cell = state.list[cellIndex];
		cell[propName] = val;
	}
}
