import extend from '../../../util/extend';
import * as actionTypes from '../../action-types';
import * as mutationTypes from '../../mutation-types';
import template from './template';

export default {
	/**
	 * 还原sheet
	 */
	[actionTypes.SHEET_INSERTSHEET]({commit, state}, sheet) {
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
	[actionTypes.SHEET_FROZEN]({commit, state, getters, rootState, dispatch}) {
		let currentSheet = rootState.currentSheet,
			selects = rootState.selects[currentSheet],
			stateList = state.list,
			frozenState;
			
		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				frozenState = stateList[i];
				break;
			}
		}

		if(frozenState.isFrozen){
			return;
		}

		let select,
			frozenColAlias,
			frozenRowAlias,
			frozenColIndex,
			frozenRowIndex;

		selects.forEach(function(item){
			if(item.type === 'selected'){
				select = item;
			}
		});

		frozenRowAlias = select.wholePosi.startRowAlias;
		frozenColAlias = select.wholePosi.startColAlias;
		frozenRowIndex = getters.getRowIndexByAlias(frozenRowAlias);
		frozenColIndex = getters.getColIndexByAlias(frozenColAlias);

		let userView = rootState.userView,
			userViewTopIndex = getters.getRowIndexByPosi(userView.top),
			userViewBottomIndex = getters.getRowIndexByPosi(userView.bottom),
			userViewRightIndex = getters.getColIndexByPosi(userView.right),
			userViewLeftIndex = getters.getColIndexByPosi(userView.left);
		//非可视范围，不能进行冻结
		if (frozenRowIndex - userViewTopIndex < 0 ||
			userViewBottomIndex - frozenRowIndex < 0 ||
			frozenColIndex - userViewLeftIndex < 0 ||
			userViewRightIndex - frozenColIndex < 0) {
			return;
		}
		//左上角位置不能进行冻结
		if(frozenRowIndex === userViewTopIndex && 
			frozenColIndex === userViewLeftIndex){
			return;
		}

		if(frozenColIndex === userViewLeftIndex){
			dispatch(actionTypes.SHEET_FIRSTROWFROZEN, frozenRowIndex);
			return;
		}
		if(frozenRowIndex === userViewTopIndex){
			dispatch(actionTypes.SHEET_FIRSTCOLFROZEN, frozenColIndex);
			return;
		}


		let rowList = getters.rowList,
			colList = getters.colList,
			userViewCol = colList[userViewLeftIndex],
			userViewRow = rowList[userViewTopIndex],
			frozenCol = colList[frozenColIndex],
			frozenRow = rowList[frozenRowIndex];

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
		}, 
		{
			type: 'topRule',
			startRowIndex: userViewTopIndex,
			endRowIndex: frozenRowIndex - 1,
			startColIndex: frozenColIndex,
			userViewLeft : userViewCol.left,
			offsetTop: userViewRow.top,
			offsetLeft: frozenCol.left,
			height: frozenRow.top - userViewRow.top - 1
		}, {
			type: 'leftRule',
			startRowIndex: frozenRowIndex,
			startColIndex: userViewLeftIndex,
			endColIndex: frozenColIndex - 1,
			userViewTop : userViewRow.top,
			offsetLeft: userViewCol.left,
			offsetTop: frozenRow.top,
			width: frozenCol.left - userViewCol.left - 1
		}, {
			type: 'mainRule',
			startRowIndex: frozenRowIndex,
			startColIndex: frozenColIndex,
			userViewTop : userViewRow.top,
			userViewLeft : userViewCol.left,
			offsetLeft: frozenCol.left,
			offsetTop: frozenRow.top
		});

		commit(mutationTypes.UPDATE_FROZENSTATE,{
			isFrozen: true,
			rowFrozen: true,
			colFrozen: true,
			rules,
			currentSheet
		});
	}, 
	[actionTypes.SHEET_FIRSTCOLFROZEN]({commit, state, getters, rootState}, index) {
		let currentSheet = rootState.currentSheet,
			stateList = state.list,
			frozenState;
		
		for (let i = 0, len = stateList.length; i < len; i++) {
			if (stateList[i].alias === currentSheet) {
				frozenState = stateList[i];
				break;
			}
		}
		if(frozenState.isFrozen){
			return;
		}

		let frozenColIndex;

		let userView = rootState.userView,
			userViewLeftIndex = getters.getColIndexByPosi(userView.left);

		if(index === undefined){
			index = userViewLeftIndex + 1;
		}
		frozenColIndex = index;
		
		let rowList = getters.rowList,
			colList = getters.colList,
			userViewCol = colList[userViewLeftIndex],
			frozenCol = colList[frozenColIndex];

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
			offsetTop: 0
		});

		commit(mutationTypes.UPDATE_FROZENSTATE,{
			isFrozen: true,
			rowFrozen: false,
			colFrozen: true,
			rules,
			currentSheet
		});
	}, 
	[actionTypes.SHEET_FIRSTROWFROZEN]({commit, state, getters, rootState}, index) {


	}, 
	[actionTypes.SHEET_UNFROZEN]({commit, state, getters, rootState}, sheet) {
			commit(mutationTypes.UPDATE_FROZENSTATE,{
			isFrozen: false,
			rowFrozen: false,
			colFrozen: false,
			rules: [],
			currentSheet: rootState.currentSheet
		});
	}
};