import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import extend from '../../../util/extend';
import template from './template';

export default {
	[actionTypes.ROWS_ADDROWS]({state, rootState, commit}, rows) {
		let temp = [];
		if (!Array.isArray(rows)) {
			rows = [rows];
		}
		for (let i = 0, len = rows.length; i < len; i++) {
			temp.push(extend({}, template, rows[i]));
		}
		commit(mutaionTypes.ADD_ROW, {
			rows: temp,
			currentSheet: rootState.currentSheet
		});
	}
};