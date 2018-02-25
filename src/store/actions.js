import {initSpreadsheet} from '../tools/dataloader';
import * as mutationTypes from './mutation-types';
import * as actionTypes from './action-types';

export default {
	[actionTypes.RESTORE]({state, dispatch, commit}) {
		return new Promise(resolve => {
			initSpreadsheet(({
				rows,
				cols,
				cells,
				sheet,
				initInfo
			}) => {
				dispatch(actionTypes.SHEET_INSERTSHEET, sheet);
				commit(mutationTypes.UPDATE_ACTIVESHEET, sheet.alias);
				dispatch(actionTypes.ROWS_ADDROWS, rows);
				dispatch(actionTypes.COLS_ADDCOLS, cols);
				dispatch(actionTypes.CELLS_RESTORECELL, cells);
				dispatch(actionTypes.SELECTS_INITSELECT);
				resolve();
			});
		});
	}
};