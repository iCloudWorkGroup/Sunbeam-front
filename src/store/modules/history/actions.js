import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';

export default {
	[actionTypes.HISTORY_REDO]({state, commit}){
		let index = state.currentIndex;
		let list = state.list;
		if (list.length === index + 1) {
			return;
		}

	},
	[actionTypes.HISTORY_UNDO]({state, commit}){
		let index = state.currentIndex;
		if (index === -1) {
			return;
		}
		let list = state.list;
		let actions = list[index].actions;
		actions.forEach(function(action){
			//区域更新属性，回退操作
			if(action.type === actionTypes.CELLS_UPDATE_PROP){
				let mutations = action.mutations;
				mutations.forEach(mutationInfo => {
					if (mutationInfo.type === mutationTypes.UPDATE_CELL ||
						mutationInfo.type === mutationTypes.INSERT_CELL) {
						commit(mutationTypes.UPDATE_CELL, mutationInfo.updateCells);
					}
				});
			}
			//整列更新回退操作
			if(action.type === actionTypes.CELLS_UPDATE_PROP){
				let mutations = action.mutations;
				mutations.forEach(mutationInfo => {
					if (mutationInfo.type === mutationTypes.UPDATE_CELL ||
						mutationInfo.type === mutationTypes.INSERT_CELL) {
						commit(mutationTypes.UPDATE_CELL, mutationInfo.updateCells);
					}
				});
			}
		});
		commit(mutationTypes.MOVE_HISTORYINDEX, --index);
	},
	[actionTypes.HISTORY_ADD]({state, commit}, record){
		commit(mutationTypes.INSERT_HISTORY, record);
	}
}