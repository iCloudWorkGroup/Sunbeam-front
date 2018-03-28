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
			frozenState = state[currentSheet].frozenState,
			selects = rootState.selects[currentSheet];

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
		frozenColAlias = select.wholePosi.startRowAlias;
		frozenRowIndex = getters.getRowIndexByAlias(frozenRowAlias);
		frozenColIndex = getters.getColIndexByAlias(frozenColAlias);


		let userView = rootState.userView,
			userViewTopIndex = getters.getRowIndexByPosi(userView.top);
			userViewBottomIndex = getters.getRowIndexByPosi(userView.bottom);
			userViewRightIndex = getters.getColIndexByAlias(userView.right);
			userViewLeftIndex = getters.getColIndexByAlias(userView.left);
		//非可视范围，不能进行冻结
		if (frozenRowIndex - userViewTopIndex < 0 ||
			userViewBottomIndex - frozenRowIndex < 0 ||
			frozenColIndex - userViewLeftIndex < 0 ||
			userViewRightIndex - frozenColIndex < 0) 
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
			frozenRow = colList[frozenRowIndex];

		temp.push({
			type: 'cornerRule',
			startRowAlias: userViewRow.alias,
			endRowAlias: rowList[frozenRowIndex - 1].alias,
			startColAlias: userViewCol.alias,
			endColAlias: colList[frozenColIndex - 1].alias,
			offsetTop: userViewRow.top,
			offsetLeft: userViewCol.left,
			width: frozenCol.left - userViewCol.left
			height: frozenRow.top - userViewRow.top
		}, {
			type: 'topRule',
			startRowAlias: userViewRow.alias,
			endRowAlias: rowList[frozenRowIndex - 1].alias,
			startColAlias: frozenCol.alias,
			offsetTop: 0,
			offsetLeft: frozenCol.left,
			height: frozenRow.top - userViewRow.top
		}, {
			type: 'leftRule',
			startRowAlias: frozenRow.alias,
			startColAlias: userViewCol.alias,
			endColAlias: colList[frozenColIndex - 1].alias,
			offsetLeft: 0,
			offsetTop: frozenRow.top,
			width: frozenCol.left - userViewCol.left
		}, {
			type: 'mainRule',
			startRowAlias: frozenRow.alias,
			startColAlias: frozenCol.alias,
			offsetLeft: frozenCol.left,
			offsetTop: frozenRow.top
		});

		commit(mutationTypes.UPDATE_FROZENSTATE,{
			isFrozen: true,
			rowFrozen: true,
			colFrozen: true,
			rules: temp,
			currentSheet
		});
	}, 
	[actionTypes.SHEET_FIRSTCOLFROZEN]({commit, state, getters, rootState}, index) {


	}, 
	[actionTypes.SHEET_FIRSTROWFROZEN]({commit, state, getters, rootState}, index) {


	}, 
	[actionTypes.SHEET_UNFROZEN]({commit, state, getters, rootState}, sheet) {


	}
};