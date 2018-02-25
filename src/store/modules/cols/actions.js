import * as actionTypes from '../../action-types';
import * as mutaionTypes from '../../mutation-types';
import extend from '../../../util/extend';
import template from './template';

export default {
	[actionTypes.COLS_ADDCOLS]({
		state,
		rootState,
		commit
	}, cols) {
		let tmp = [];
		if (!Array.isArray(cols)) {
			cols = [cols];
		}
		for (let i = 0, len = cols.length; i < len; i++) {
			tmp.push(extend({}, template, cols[i]));
		}
		commit(mutaionTypes.ADD_COL, {
			cols: tmp,
			currentSheet: rootState.currentSheet
		});
	}
}