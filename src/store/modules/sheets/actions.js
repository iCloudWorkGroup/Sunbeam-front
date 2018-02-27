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
	}	
};