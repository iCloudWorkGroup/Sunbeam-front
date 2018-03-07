import Vue from 'vue';
import extend from '../../../util/extend';
import * as types from '../../mutation-types';
import template from './template';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, extend(template));
	},
	[types.UPDATE_EDIT](state, payload){
		let inputInfo = state[payload.currentSheet];
		extend(inputInfo, payload.inputInfo);
	}
}