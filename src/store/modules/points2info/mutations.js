import extend from '../../../util/extend';
import infoDefault from '../../defaults/pointinfo';
import * as types from '../../mutation-types';

export default {
	[types.UPDATE_POINTINFO](state, {colAlias, rowAlias, type, value}) {
		let colInfo = state.col,
			rowInfo = state.row,
			tmp;

		if (colInfo[colAlias] && (tmp = colInfo[colAlias][rowAlias])) {
			tmp[type] = value;
			tmp = rowInfo[rowAlias][colAlias];
			tmp[type] = value;
		}else{
			if(!colInfo[colAlias]){
				colInfo[colAlias] = {};
			}
			if(!rowInfo[rowAlias]){
				rowInfo[rowAlias] = {};
			}
			tmp = colInfo[colAlias][rowAlias] = extend(infoDefault);
			tmp[type] = value; 
			tmp = rowInfo[rowAlias][colAlias] = extend(infoDefault);
			tmp[type] = value; 
		}
	}
}
