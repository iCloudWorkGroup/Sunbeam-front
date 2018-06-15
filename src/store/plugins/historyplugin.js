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
			actionItem.payload = extend(action.payload);

			//解冻需要记录原冻结状态
			// if(type === 'SHEET_EXECUNFROZEN'){
			// 	let alias = state.currentSheet;
			// 	let list = state.sheets.list;
			// 	let sheet;
			// 	for (let i = 0, len = list.length; i < len; i++) {
			// 		if (list[i].alias === alias) {
			// 			sheet = list[i];
			// 			break;
			// 		}
			// 	}
			// 	sheet.frozenState;
			// 	actionItem.frozen ={
			// 		//冻结别名
			// 	}
			// }
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

			if(mutationType === 'UPDATE_CELL'){
				let mutationInfo = {
					type: mutationType,
					updateCells: []
				};
				payload.forEach(function({cell, props}) {
					let props = getOriginalValueByProps(cell, props);
					mutationInfo.updateCells.push({
						cell,
						props: getOriginalValueByProps(cell, props)
					});
				});
				actionItem.mutations.push(mutationInfo);
			}
			if (mutationType === 'INSERT_CELL') {
				let mutationInfo = {
					type: mutationType,
					updateCells: []
				};
				let props = {};
				props.content = cellTemplate.content;
				props.decoration = cellTemplate.decoration;
				props.physicsBox = {};
				props.physicsBox.border = cellTemplate.physicsBox.border;
				props = getDiffValue(props, payload.cell) || {};
				mutationInfo.updateCells.push({
					cell: payload.cell,
					props
				});
				actionItem.mutations.push(mutationInfo);
			}
			if (mutationType === 'UPDATE_ROW') {
				let mutationInfo = {
					type: mutationType,
					updateRows: []
				};
				payload.forEach(function({row, props}) {
					mutationInfo.updateRows.push({
						row,
						props: getOriginalValueByProps(row, props)
					});
				});
				actionItem.mutations.push(mutationInfo);
			}
		}
	});
}

function getOriginalValueByProps(object, props){
	let result = {};
	for (let name in props) {
		let src = object[name];
		let value = props[name];

		if (value === undefined) {
			continue;
		}
		if (isObject(value)) {
			if (Array.isArray(value)) {
				result[name] = [...src];
			} else {
				result[name] = getOriginalValueByProps(src, value);
			}
		} else {
			result[name] = src;
		}
	}
	return result;
}

function getDiffValue(object1, object2){
	let result;
	for (let name in object1) {
		let src = object1[name];
		let value = object2[name];

		if(!Array.isArray(value)){
			if (isObject(value)) {
				let temp = getDiffValue(src, value);
				if(temp){
					result = result || {};
					result[name] = temp;
				}
			} else{
				if(src!== value){
					result = result || {};
					result[name] = src;
				}
			}
		}
	}
	return result;
}
function isObject(obj) {
	return typeof obj === 'object' && obj !== null;
}
let userAction = {
	[actionTypes.CELLS_UPDATE]: true,
	[actionTypes.CELLS_UPDATE_PROP]: true,
	// [actionTypes.SHEET_FROZEN]: true,
	// [actionTypes.SHEET_UNFROZEN]: true,
	[actionTypes.ROWS_HIDE]: true,
	[actionTypes.ROWS_CANCELHIDE]: true
}
let recordAction = {
	[actionTypes.CELLS_UPDATE_PROP]: true,
	[actionTypes.ROWS_OPERROWS]: true,
	[actionTypes.COLS_OPERCOLS]: true
// 	[actionTypes.SHEET_ROWFROZEN]: true,
// 	[actionTypes.SHEET_COLFROZEN]: true,
// 	[actionTypes.SHEET_POINTFROZEN]: true,
// 	[actionTypes.ROWS_EXECHIDE]: true
}
let recordMutations = {
	[actionTypes.CELLS_UPDATE_PROP]: {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.INSERT_CELL] : true,
	},
	[actionTypes.ROWS_OPERROWS] : {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.UPDATE_ROW] : true
	},
	[actionTypes.COLS_OPERCOLS] : {
		[mutationTypes.UPDATE_CELL] : true,
		[mutationTypes.UPDATE_COL] : true
	},
}
// let recordMutations = {
// 	'CELLS_UPDATE_PROP': {
// 		'UPDATE_CELL': true,
// 		'INSERT_CELL': true
// 	},
// 	'ROWS_OPERROWS': {
// 		'UPDATE_CELL': true
// 	},
// 	'COLS_OPERCOLS': {
// 		'UPDATE_CELL': true
// 	},
// 	'SHEET_EXECUNFROZEN': {
// 		'UPDATE_FROZENSTATE': true
// 	},
// 	'SHEET_EXECUNFROZEN': {

// 	}
// }

