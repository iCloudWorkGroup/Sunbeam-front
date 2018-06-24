import * as mutationTypes from './mutation-types'
import * as actionTypes from './action-types'

export default {
<<<<<<< HEAD
	[actionTypes.RESTORE]({ dispatch, commit }, { rows, cols, cells, sheet, frozen}) {
		dispatch(actionTypes.SHEET_INSERTSHEET, sheet);
		commit(mutationTypes.UPDATE_ACTIVESHEET, sheet.alias);
		dispatch(actionTypes.ROWS_ADDROWS, rows);
		dispatch(actionTypes.COLS_ADDCOLS, cols);
		dispatch(actionTypes.CELLS_RESTORECELL, cells);
		dispatch(actionTypes.SELECTS_INITSELECT);
		dispatch(actionTypes.SHEET_RESTOREFROZEN, frozen);
	}
};
=======
    [actionTypes.RESTORE]({ dispatch, commit }, { rows, cols, cells, sheet }) {
        dispatch(actionTypes.SHEET_INSERTSHEET, sheet)
        commit(mutationTypes.UPDATE_ACTIVESHEET, sheet.alias)
        dispatch(actionTypes.ROWS_ADDROWS, rows)
        dispatch(actionTypes.COLS_ADDCOLS, cols)
        dispatch(actionTypes.CELLS_RESTORECELL, cells)
        dispatch(actionTypes.SELECTS_INITSELECT)
    }
}
>>>>>>> master
