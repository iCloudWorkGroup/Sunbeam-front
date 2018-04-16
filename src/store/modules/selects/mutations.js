import Vue from 'vue';
import * as types from '../../mutation-types';
import extend from '../../../util/extend';

export default{
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			list: [],
			state: ''
		});
	},
	[types.INSERT_SELECT](state, payload) {
		let selects = payload.selects,
			list = state[payload.currentSheet].list;
						
		for (let i = 0, len = selects.length; i < len; i++) {
			list.push(selects[i]);
		}
	},
	[types.UPDATE_SELECT](state, payload) {
		let region = state.activeSelect;
		
		extend(region, payload.select);
	},
	[types.SWITCH_ACTIVESELECT](state, payload){
		state.activeSelect = payload.select;
	},
	[types.BATCH_UPDATE_SELECT](state,{currentSheet, info}){
		info.forEach(function({select, propName, value}){
			propName = propName.split('.');
			if (propName.length > 1) {
				select[propName[0]][propName[1]] = value;
			} else {
				select[propName[0]] = value;
			}
		});
	}
};