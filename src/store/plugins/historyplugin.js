import extend from '../../util/extend';
import * as actionTypes from '../action-types';
import * as mutationTypes from '../mutation-types';
import cellTemplate from '../modules/cells/template';

export default function(store) {
	let lockAction = true;
	let lockMutation = true;
	let historyOpring = false;
	let userActionItemTemplate = {
		type: '',
		payload: null,
		actions: []
	};
	let currentUserAction = '';
	let currentAction = '';
	let actionItemTemplate = {
		type: '',
		payload: null,
		mutations: []
	};
	//用户动作对应action记录
	let userActionItem = null;
	//顶层操作对应action记录
	let actionItem = null;
	//当前action下，需要监听的mutations
	let listenMutations = null;

	store.subscribeBeforeAction((action, state) => {
		let type = action.type;
		if (lockAction) {
			if (userAction[type]) {
				userActionItem = extend(userActionItemTemplate);
				currentUserAction = userActionItem.actionType = type;
				userActionItem.payload = extend(action.payload);
				lockAction = false;
			} else {
				return;
			}
		}
		if (recordAction[type]){
			actionItem = extend(actionItemTemplate);
			actionItem.type = type;
			if(isObject(actionItem.payload)){
				actionItem.payload = extend(action.payload);
			}else{
				actionItem.payload = action.payload;
			}
			//解冻需要记录原冻结状态
			if(type === 'SHEET_EXECUNFROZEN'){
				let alias = state.currentSheet;
				let list = state.sheets.list;
				let sheet;
				for (let i = 0, len = list.length; i < len; i++) {
					if (list[i].alias === alias) {
						sheet = list[i];
						break;
					}
				}
				let currentFrozenState = sheet.frozenState;
				actionItem.frozenRecord = {
					frozenColSort: currentFrozenState.frozenColSort,
					frozenRowSort: currentFrozenState.frozenRowSort,
					userViewColSort: currentFrozenState.userViewColSort,
					userViewRowSort: currentFrozenState.userViewRowSort
				}
			}
			if (type === actionTypes.ROWS_EXECADJUSTHEIGHT) {
				let sort = actionItem.payload.sort;
				let index = store.getters.getRowIndexBySort(sort);
				let row = store.getters.rowList[index];
				let height = row.height;
				actionItem.originalValue = height;
			}
			if (type === actionTypes.COLS_EXECADJUSTWIDTH) {
				let sort = actionItem.payload.sort;
				let index = store.getters.getColIndexBySort(sort);
				let col = store.getters.colList[index];
				let width = col.width;
				actionItem.originalValue = width;
			}
			if (type === actionTypes.COLS_EXECDELETECOL) {
				let sort = actionItem.payload;
				let index = store.getters.getColIndexBySort(sort);
				let col = store.getters.colList[index];
				actionItem.originalValue = col;
			}
			if (type === actionTypes.ROWS_EXECDELETEROW) {
				let sort = actionItem.payload;
				let index = store.getters.getRowIndexBySort(sort);
				let row = store.getters.rowList[index];
				actionItem.originalValue = row;
			}
			userActionItem.actions.push(actionItem);
			if(recordMutations[type]){
				currentAction = type;
				listenMutations = recordMutations[type];
				lockMutation = false;
			}else{
				listenMutations = null;
				lockMutation = true;
			}
		}
			
		// 	if (actionToMutations[actionType]) {
		// 		recordMutations = actionToMutations[actionType];
		// 		lockMutation = false;
		// 	}else {
		// 		recordMutations = null;
		// 		lockMutation = true;
		// 	}
		// }
	});
	store.subscribeAfterAction((action, state) => {
		let type = action.type;
		if(currentAction === type){
			lockMutation = true;
		}
		if (currentUserAction === type) {
			lockAction = true;
			if (!userActionItem || userActionItem.actions.length === 0) {
				return;
			}
			store.dispatch(actionTypes.HISTORY_ADD, userActionItem);
			userActionItem = null;
		}

	});
	store.subscribeBeforeMutation(function(mutation, state) {
		if(lockMutation){
			return;
		}
		let mutationType = mutation.type;
		if(listenMutations[mutationType]){
			let payload = mutation.payload;

			if(mutationType === mutationTypes.UPDATE_CELL){
				let mutationInfo = {
					type: mutationType,
					updateCells: []
				};
				payload.forEach(function({cell, props}) {
					props = getDiffValue(cell, props);
					mutationInfo.updateCells.push({
						cell,
						props: getDiffValue(cell, props)
					});
				});
				actionItem.mutations.push(mutationInfo);
			}
			if (mutationType === mutationTypes.INSERT_CELL) {
				let mutationInfo = {
					type: mutationType,
					updateCells: []
				};
				let props = extend({}, cellTemplate);
				let physicsBox = props.physicsBox;
				delete props.occupy;
				delete physicsBox.top;
				delete physicsBox.left;
				delete physicsBox.right;
				delete physicsBox.bottom;
				delete props.alias;

				mutationInfo.updateCells.push({
					cell: payload.cell,
					props
				});
				actionItem.mutations.push(mutationInfo);
			}
			if (mutationType === mutationTypes.UPDATE_ROW) {
				let mutationInfo = {
					type: mutationType,
					updateRows: []
				};
				let defaultValue = {
					oprProp: {
						content: cellTemplate.content,
						physicsBox: cellTemplate.physicsBox,
						decoration: cellTemplate.decoration
					}
				};
				payload.forEach(function({row, props}) {
					mutationInfo.updateRows.push({
						row,
						props: getDiffValue(row, props, defaultValue)
					});
				});
				actionItem.mutations.push(mutationInfo);
			}
			if (mutationType === mutationTypes.UPDATE_COL) {
				let mutationInfo = {
					type: mutationType,
					updateCols: []
				};
				let defaultValue = {
					oprProp: {
						content: cellTemplate.content,
						physicsBox: cellTemplate.physicsBox,
						decoration: cellTemplate.decoration
					}
				};
				payload.forEach(function({col, props}) {
					mutationInfo.updateCols.push({
						col,
						props: getDiffValue(col, props, defaultValue)
					});
				});
				actionItem.mutations.push(mutationInfo);
			}
			if(mutationType === mutationTypes.UPDATE_POINTINFO){
				let {colAlias, rowAlias, type} = payload.info;
				let originalValue = store.getters.getPointInfo(colAlias, rowAlias, type);
				let reversePayload = extend(payload);
				reversePayload.info.value = originalValue;
				let mutationInfo = {
					type: mutationType,
					payload: reversePayload
				};
				actionItem.mutations.push(mutationInfo);
			}
		}
	});
}

function getDiffValue(object, props, defaultValue) {
	let result = {};
	for (let name in props) {
		let value = props[name];
		let src = object[name];

		if (isObject(value)) {
			if (Array.isArray(value) && Array.isArray(src)) {
				result[name] = [...src];
			} else {
				if (src === undefined) {
					if (defaultValue !== undefined) {
						result[name] = getDiffValue(defaultValue[name], value, defaultValue[name]);
					}
				} else {
					if (defaultValue !== undefined) {
						result[name] = getDiffValue(defaultValue[name], value, defaultValue[name]);
					} else {
						result[name] = getDiffValue(src, value);
					}
				}
			}
		} else {
			if (src === undefined) {
				if (defaultValue !== undefined) {
					result[name] = defaultValue[name];
				}
			} else {
				result[name] = src;
			}
		}
	}
	return result;
}

function isObject(obj) {
	return typeof obj === 'object' && obj !== null;
}

let userAction = {
	[actionTypes.EDIT_HIDE]: true,
	[actionTypes.CELLS_HANDLEMERGE]: true,
	[actionTypes.CELLS_UPDATE_BORDER]: true,
	[actionTypes.CELLS_UPDATE]: true,
	[actionTypes.ROWS_HIDE]: true,
	[actionTypes.ROWS_CANCELHIDE]: true,
	[actionTypes.COLS_HIDE]: true,
	[actionTypes.COLS_CANCELHIDE]: true,
	[actionTypes.ROWS_ADJUSTHEIGHT]: true,
	[actionTypes.COLS_ADJUSTWIDTH]: true,
	[actionTypes.COLS_INSERTCOL]: true,
	[actionTypes.COLS_DELETECOL]: true,
	[actionTypes.ROWS_INSERTROW]: true,
	[actionTypes.ROWS_DELETEROW]: true,
	[actionTypes.SHEET_FROZEN]: true,
	[actionTypes.SHEET_UNFROZEN]: true,
}
let recordAction = {
	[actionTypes.CELLS_UPDATE_PROP]: true,
	[actionTypes.CELLS_MERGE]: true,
	[actionTypes.CELLS_SPLIT]: true,
	[actionTypes.ROWS_OPERROWS]: true,
	[actionTypes.COLS_OPERCOLS]: true,
	[actionTypes.ROWS_EXECADJUSTHEIGHT]: true,
	[actionTypes.COLS_EXECADJUSTWIDTH]: true,
	[actionTypes.ROWS_EXECHIDE]: true,
	[actionTypes.ROWS_EXECCANCELHIDE]: true,
	[actionTypes.COLS_EXECHIDE]: true,
	[actionTypes.COLS_EXECCANCELHIDE]: true,
	[actionTypes.COLS_EXECINSERTCOL]: true,
	[actionTypes.COLS_EXECDELETECOL]: true,
	[actionTypes.ROWS_EXECINSERTROW]: true,
	[actionTypes.ROWS_EXECDELETEROW]: true,
	[actionTypes.SHEET_COLFROZEN]: true,
	[actionTypes.SHEET_ROWFROZEN]: true,
	[actionTypes.SHEET_POINTFROZEN]: true,
	[actionTypes.SHEET_EXECUNFROZEN]: true
}
let recordMutations = {
	[actionTypes.CELLS_UPDATE_PROP]: {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.INSERT_CELL] : true,
	},
	[actionTypes.ROWS_OPERROWS] : {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.UPDATE_ROW] : true,
		[mutationTypes.INSERT_CELL] : true,
	},
	[actionTypes.COLS_OPERCOLS] : {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.INSERT_CELL] : true,
		[mutationTypes.UPDATE_COL] : true
	},
	[actionTypes.CELLS_MERGE]: {
		[mutationTypes.UPDATE_POINTINFO]: true
	}, 
	[actionTypes.CELLS_SPLIT]: {
		[mutationTypes.UPDATE_POINTINFO]: true
	},
	[actionTypes.COLS_EXECDELETECOL]: {
		[mutationTypes.UPDATE_POINTINFO]: true,
		[mutationTypes.UPDATE_CELL]: true
	},
	[actionTypes.ROWS_EXECDELETEROW]: {
		[mutationTypes.UPDATE_POINTINFO]: true,
		[mutationTypes.UPDATE_CELL]: true
	}
}


