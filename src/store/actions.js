import {initSpreadsheet} from '../tools/dataloader';
import * as mutaionTypes from './mutation-types';
import * as actionTypes from './action-types';

export default {
	restore({dispatch, commit}) {
		initSpreadsheet(({rows, cols, cells, initInfo}) => {
			// commit(mutaionTypes.ADD_ROW, rows);
			// commit(mutaionTypes.ADD_COL, cols);
			// dispatch(actionTypes.RESTORE_CELL, cells);
			// dispatch(actionTypes.RESTORE_SELECT);
		});
	}
};