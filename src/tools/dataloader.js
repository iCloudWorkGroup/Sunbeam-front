import cfg from '../config';
import cache from './cache';
import extend from '../util/extend';
import send from '../util/send';
import rowTemplate from '../store/modules/rows/template';
import colTemplate from '../store/modules/cols/template';
import generator from './generator';
import {
	getColDisplayName,
	getRowDisplayName
} from '../util/displayname';

export function initSpreadsheet(fn) {
	let build = 'false';

	if (build === 'true') {
		buildNewSpreadsheet(fn);
		return;
	}
	restoreSpreadsheet(fn);
}


function buildNewSpreadsheet(fn) {
	let rows = [],
		cols = [],
		cells = [],
		sheet;

	for (let i = 0, len = cfg.initRowNum; i < len; i++) {
		rows.push(extend({}, rowTemplate, {
			alias: generator.rowAliasGenerator(),
			displayName: getRowDisplayName(i)
		}));
	}
	for (let i = 0, len = cfg.initColNum; i < len; i++) {
		cols.push(extend({}, colTemplate, {
			alias: generator.colAliasGenerator(),
			displayName: getColDisplayName(i)
		}));
	}

	fn({
		rows,
		cols,
		cells,
		sheet
	});
}

function restoreSpreadsheet(fn) {
	var cols = [],
		rows = [],
		cells = [],
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

				generator.rowAliasGenerator(data.aliasRowCounter);
				generator.colAliasGenerator(data.aliasColCounter);
				generator.cellAliasGenerator('0');
				generator.selectAliasGenerator('0');

				fn({
					sheet,
					rows,
					cols,
					cells
				});
			}
		}
	});
}