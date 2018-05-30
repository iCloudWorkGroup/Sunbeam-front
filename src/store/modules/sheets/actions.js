import extend from '../../../util/extend';
import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import template from './template';
import {SELECT} from '../../../tools/constant';
import send from '../../../util/send';
import config from '../../../config';


let viewTypes = {
	mainRule: 'mainView',
	leftRule: 'leftView',
	topRule: 'topView',
	cornerRule: 'cornerView'
};

export default {
	/**
	 * 还原sheet
	 */
	[actionTypes.SHEET_INSERTSHEET]({
		commit,
		state
	}, sheet) {
		let list = state.list,
			flag = true;
		for (let i = 0, len1 = state.length; i < len1; i++) {
			if (list[i].alias === sheet.alias) {
				flag = false;
				break;
			}
		}
		if (flag) {
			commit(mutationTypes.INSERT_SHEET, extend({}, template, sheet));
		}
	},
	[actionTypes.SHEET_FROZEN]({
		commit,
		state,
		getters,
		rootState,
		dispatch
	}, frozen) {
		let currentSheet = rootState.currentSheet,
			selects = rootState.selects[currentSheet].list,
			stateList = state.list,
			frozenState;

		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				frozenState = stateList[i];
				break;
			}
		}

		if (frozenState.isFrozen) {
			return;
		}

		let frozenColAlias,
			frozenRowAlias,
			frozenColIndex,
			frozenRowIndex,
			userViewTopIndex,
			userViewLeftIndex;

		if(frozen){
			frozenRowAlias = frozen.rowAlias;
			frozenColAlias = frozen.colAlias;
			userViewLeftIndex = getters.getColIndexByAlias(frozen.viewColAlias);
			userViewTopIndex = getters.getRowIndexByAlias(frozen.viewRowAlias);
		}else{
			let select = getters.activeSelect;
			frozenRowAlias = select.wholePosi.startRowAlias;
			frozenColAlias = select.wholePosi.startColAlias;

			let userView = rootState.userView;
			userViewTopIndex = getters.getRowIndexByPosi(userView.top);
			userViewLeftIndex = getters.getColIndexByPosi(userView.left);
		}
		frozenRowIndex = getters.getRowIndexByAlias(frozenRowAlias);
		frozenColIndex = getters.getColIndexByAlias(frozenColAlias);

		if (!frozen || frozen.type !== 'restore') {
			let userView = rootState.userView;
			let userViewBottomIndex = getters.getRowIndexByPosi(userView.bottom);
			let userViewRightIndex = getters.getColIndexByPosi(userView.right);
			//非可视范围，不能进行冻结
			if (frozenRowIndex - userViewTopIndex < 0 ||
				userViewBottomIndex - frozenRowIndex < 0 ||
				frozenColIndex - userViewLeftIndex < 0 ||
				userViewRightIndex - frozenColIndex < 0) {
				return;
			}
			//左上角位置不能进行冻结
			if (frozenRowIndex === userViewTopIndex &&
				frozenColIndex === userViewLeftIndex) {
				return;
			}
		}

		if (frozenColIndex === userViewLeftIndex) {
			dispatch(actionTypes.SHEET_FIRSTROWFROZEN, frozenRowIndex);
			return;
		}
		if (frozenRowIndex === userViewTopIndex) {
			dispatch(actionTypes.SHEET_FIRSTCOLFROZEN, frozenColIndex);
			return;
		}

		let rowList = getters.rowList,
			colList = getters.colList,
			userViewCol = colList[userViewLeftIndex],
			userViewRow = rowList[userViewTopIndex],
			frozenCol = colList[frozenColIndex],
			frozenRow = rowList[frozenRowIndex];

		if (!frozen || frozen.type !== 'restore') {
			send({
				url: config.operUrl['frozen'],
				data: JSON.stringify({
					viewRow: userViewRow.alias,
					viewCol: userViewCol.alias,
					oprCol: frozenCol.alias,
					oprRow: frozenRow.alias
				}),
			});
		}

		let rules = [];

		rules.push({
			type: 'cornerRule',
			startRowIndex: userViewTopIndex,
			endRowIndex: frozenRowIndex - 1,
			startColIndex: userViewLeftIndex,
			endColIndex: frozenColIndex - 1,
			offsetTop: userViewRow.top,
			offsetLeft: userViewCol.left,
			width: frozenCol.left - userViewCol.left - 1, //减1为边框的宽度
			height: frozenRow.top - userViewRow.top - 1
		}, {
			type: 'topRule',
			startRowIndex: userViewTopIndex,
			endRowIndex: frozenRowIndex - 1,
			startColIndex: frozenColIndex,
			userViewLeft: userViewCol.left,
			offsetTop: userViewRow.top,
			offsetLeft: frozenCol.left,
			height: frozenRow.top - userViewRow.top - 1
		}, {
			type: 'leftRule',
			startRowIndex: frozenRowIndex,
			startColIndex: userViewLeftIndex,
			endColIndex: frozenColIndex - 1,
			userViewTop: userViewRow.top,
			offsetLeft: userViewCol.left,
			offsetTop: frozenRow.top,
			width: frozenCol.left - userViewCol.left - 1
		}, {
			type: 'mainRule',
			startRowIndex: frozenRowIndex,
			startColIndex: frozenColIndex,
			userViewTop: userViewRow.top,
			userViewLeft: userViewCol.left,
			offsetLeft: frozenCol.left,
			offsetTop: frozenRow.top
		});

		commit(mutationTypes.UPDATE_FROZENSTATE, {
			isFrozen: true,
			rowFrozen: true,
			colFrozen: true,
			rules,
			currentSheet
		});
	},
	[actionTypes.SHEET_FIRSTCOLFROZEN]({
		commit,
		state,
		getters,
		rootState
	}, index) {
		let currentSheet = rootState.currentSheet,
			stateList = state.list,
			frozenState;

		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				frozenState = stateList[i].frozenState;
				break;
			}
		}
		if (frozenState.isFrozen) {
			return;
		}

		let frozenColIndex;

		let userView = rootState.userView,
			userViewLeftIndex = getters.getColIndexByPosi(userView.left);

		if (index === undefined) {
			index = userViewLeftIndex + 1;
		}
		frozenColIndex = index;

		let rowList = getters.rowList,
			colList = getters.colList,
			userViewCol = colList[userViewLeftIndex],
			frozenCol = colList[frozenColIndex];

		send({
			url: config.operUrl['frozen'],
			data: JSON.stringify({
				viewRow: rowList[0].alias,
				viewCol: userViewCol.alias,
				oprCol: frozenCol.alias,
				oprRow: rowList[0].alias
			}),
		});

		let rules = [];

		rules.push({
			type: 'leftRule',
			startRowIndex: 0,
			startColIndex: userViewLeftIndex,
			endColIndex: frozenColIndex - 1,
			offsetLeft: userViewCol.left,
			offsetTop: 0,
			width: frozenCol.left - userViewCol.left - 1
		}, {
			type: 'mainRule',
			startRowIndex: 0,
			startColIndex: frozenColIndex,
			offsetLeft: frozenCol.left,
			userViewLeft: userViewCol.left,
			offsetTop: 0
		});
		commit(mutationTypes.UPDATE_FROZENSTATE, {
			isFrozen: true,
			rowFrozen: false,
			colFrozen: true,
			rules,
			currentSheet
		});
	},
	[actionTypes.SHEET_FIRSTROWFROZEN]({
		commit,
		state,
		getters,
		rootState
	}, index) {
		let currentSheet = rootState.currentSheet,
			stateList = state.list,
			frozenState;

		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				frozenState = stateList[i];
				break;
			}
		}
		if (frozenState.isFrozen) {
			return;
		}

		let frozenRowIndex;

		let userView = rootState.userView,
			userViewTopIndex = getters.getRowIndexByPosi(userView.top);

		if (index === undefined) {
			index = userViewTopIndex + 1;
		}
		frozenRowIndex = index;

		let rowList = getters.rowList,
			colList = getters.colList,
			userViewRow = rowList[userViewTopIndex],
			frozenRow = rowList[frozenRowIndex];

		send({
			url: config.operUrl['frozen'],
			data: JSON.stringify({
				viewCol: colList[0].alias,
				viewRow: userViewRow.alias,
				oprRow: frozenRow.alias,
				oprCol: colList[0].alias
			}),
		});
		let rules = [];

		rules.push({
			type: 'topRule',
			startColIndex: 0,
			startRowIndex: userViewTopIndex,
			endRowIndex: frozenRowIndex - 1,
			offsetTop: userViewRow.top,
			offsetLeft: 0,
			width: frozenRow.top - userViewRow.top - 1
		}, {
			type: 'mainRule',
			startRowIndex: frozenRowIndex,
			startColIndex: 0,
			offsetTop: frozenRow.top,
			userViewTop: userViewRow.top,
			offsetLeft: 0
		});
		commit(mutationTypes.UPDATE_FROZENSTATE, {
			isFrozen: true,
			rowFrozen: true,
			colFrozen: false,
			rules,
			currentSheet
		});
	},
	[actionTypes.SHEET_UNFROZEN]({
		commit,
		state,
		getters,
		rootState
	}, sheet) {
		send({
			url: config.operUrl['unfrozen']
		});
		commit(mutationTypes.UPDATE_FROZENSTATE, {
			isFrozen: false,
			rowFrozen: false,
			colFrozen: false,
			rules: [],
			currentSheet: rootState.currentSheet
		});
	},
	[actionTypes.OCCUPY_UPDATE]({commit, getters, rootState}, {
		type = 'mainRule',
		col,
		row
	}){
		commit(mutationTypes.UPDATE_OCCUPY, {
			currentSheet: rootState.currentSheet,
			type: viewTypes[type],
			col,
			row
		});
	},
	[actionTypes.OCCUPY_DELETECOL]({state, commit, getters, rootState}, alias){
		let currentSheet = rootState.currentSheet,
			stateList = state.list,
			editViewOccupy;

		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				editViewOccupy = stateList[i].editViewOccupy;
				break;
			}
		}
		
		for (let key in editViewOccupy) {
			let index,
				occupyCol = editViewOccupy[key].col.slice(0);

			if ((index = occupyCol.indexOf(alias)) !== -1) {
				occupyCol.splice(index, 1);
				commit(mutationTypes.UPDATE_OCCUPY, {
					currentSheet: rootState.currentSheet,
					type: key,
					col: occupyCol
				});
			}
		}
	},
	[actionTypes.OCCUPY_DELETEROW]({commit, getters, rootState}, alias){
		let currentSheet = rootState.currentSheet,
			stateList = state.list,
			editViewOccupy;
   
		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				editViewOccupy = stateList[i].editViewOccupy;
				break;
			}
		}
		
		for (let key in editViewOccupy) {
			let index,
				occupyRow = editViewOccupy[key].row.slice(0);

			if ((index = occupyRow.indexOf(alias)) !== -1) {
				occupyRow.splice(index, 1);
				
				commit(mutationTypes.UPDATE_OCCUPY, {
					currentSheet: rootState.currentSheet,
					type: key,
					row: occupyRow
				});
			}
		}
	}
};