import cfg from '../config';
import extend from '../util/extend';
// import cellDefault from '../defaults/cell';
import rowDefault from '../defaults/row';
import colDefault from '../defaults/col';
import selectDefault from '../defaults/select';
import {rowAliasGenerator, colAliasGenerator} from './generator';


export function initSpreadsheet(callback) {
	let build = 'true';

	if (build === 'true') {
		buildNewSpreadsheet(callback);
		return;
	}
}

function buildNewSpreadsheet(callback) {
	let rows = [],
		cols = [],
		cells = [],
		selects = [],
		sheet;
		
	for (let i = 0, len = cfg.initRowNum; i < len; i++) {
		rows.push(extend(rowDefault, {
			alias: rowAliasGenerator()
		}));
	}
	for (let i = 0, len = cfg.initColNum; i < len; i++) {
		cols.push(extend(colDefault, {
			alias: colAliasGenerator()
		}));
	}
	
	selects.push(extend(selectDefault));

	callback(rows, cols, cells, selects, sheet);
}

function parseData(callback) {

}