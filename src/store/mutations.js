import * as types from './mutation-types';
import extend from '../util/extend';

export default {
	[types.UPDATE_ACTIVESHEET](state, alias) {
		state.currentSheet = alias;
	},
	[types.UPDATE_USERVIEW](state, payload){
		extend(this.state.userView, payload);
	}
};