import * as types from '../../mutation-types';

export default {
	[types.INSERT_SHEET](state, sheet) {
		state.list.push(sheet);
	},
	[types.UPDATE_FROZENSTATE](state, payload){
		let list = state.list,
			currentSheet = payload.currentSheet,
			frozenState;

		list.forEach(function(item){
			if(item.alias === currentSheet){
				frozenState = item.frozenState;
				break;
			}
		});

		frozenState.rules.splice(0, frozenState.rules.length, payload.rules);
		frozenState.isFrozen = payload.isFrozen;
		frozenState.rowFrozen = payload.rowFrozen;
		frozenState.colFrozen = payload.colFrozen;
	}
};