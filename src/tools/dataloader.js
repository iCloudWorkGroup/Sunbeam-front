import cfg from '../config';
import cache from './cache';
import extend from '../util/extend';
import send from '../util/send';
import {rowAliasGenerator, colAliasGenerator} from './generator';


export function initSpreadsheet(callback) {
	let build = 'false';

	if (build === 'true') {
		buildNewSpreadsheet(callback);
		return;
	}
	restoreSpreadsheet(callback);
}


function buildNewSpreadsheet(callback) {
	let rows = [],
		cols = [],
		cells = [],
		sheet;

	for (let i = 0, len = cfg.initRowNum; i < len; i++) {
		rows.push(extend({}, rowDefault, {
			alias: rowAliasGenerator()
		}));
	}
	for (let i = 0, len = cfg.initColNum; i < len; i++) {
		cols.push(extend({}, colDefault, {
			alias: colAliasGenerator()
		}));
	}

	callback({
		rows,
		cols,
		cells,
		sheet
	});
}

function restoreSpreadsheet(callback) {
	var cols = [],
		rows = [],
		cells = [],
		colLen,
		rowLen,
		sheet;

	send({
		url: 'reload',
		success(data) {
			if (!data || !data.returndata) {
				return;
			}

			let sheetData;

			cache.localRowPosi = data.maxRowPixel;
			cache.localColPosi = data.maxColPixel;

			cache.aliasRowCounter = data.aliasRowCounter;
			cache.aliasColCounter = data.aliasColCounter;

			data = data.returndata;

			if (data.spreadSheet && data.spreadSheet[0] &&
				(sheetData = data.spreadSheet[0].sheet)) {
				sheet = {
					alias: sheetData.alias || 'sheet1',
					name: sheetData.name
				};
				rows = sheetData.glY;
				cols = sheetData.glX;
				cells = sheetData.cells;
				callback({sheet, rows, cols, cells});
			}
		}
	});
}
