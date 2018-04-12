import * as types from './mutation-types';
import extend from '../util/extend';

export default {
	[types.UPDATE_ACTIVESHEET](state, alias) {
		state.currentSheet = alias;
	},
	[types.UPDATE_USERVIEW](state, payload){
		extend(state.userView, payload);
	},
	[types.UPDATE_MOUSESTATE](state, payload){
		state.mouseState = payload.state;
	},
};