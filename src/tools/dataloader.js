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

export function initSpreadsheet(fn, data) {
	let build = true;
	if (build === true) {
		buildNewSpreadsheet(fn);
		return;
	}
	restoreSpreadsheet(fn, data);
}


function buildNewSpreadsheet(fn) {
	let rows = [],
		cols = [],
		cells = [],
		colRecord = cache.colRecord,
		rowRecord = cache.rowRecord,
		sheet;

	sheet = {
		alias: 'sheet1',
		name: 'sheet1'
	};

	let rowHeight = cfg.rowHeight;
	for (let i = 0, len = cfg.initRowNum; i < len; i++) {
		rows.push(extend({}, rowTemplate, {
			alias: generator.rowAliasGenerator(),
			displayName: getRowDisplayName(i),
			top: i * (rowHeight + 1),
			sort: i
		}));
	}
	let colWidth = cfg.colWidth;
	for (let i = 0, len = cfg.initColNum; i < len; i++) {
		cols.push(extend({}, colTemplate, {
			alias: generator.colAliasGenerator(),
			displayName: getColDisplayName(i),
			left: i * (colWidth + 1),
			sort: i
		}));
	}
	colRecord.push(cols[0].alias, cols[cols.length - 1].alias);
	rowRecord.push(rows[0].alias, rows[rows.length - 1].alias);

	cache.regionRecord.set(
		colRecord[0] + '_' +
		colRecord[1] + '_' +
		rowRecord[0] + '_' +
		rowRecord[1], true);

	fn({
		rows,
		cols,
		cells,
		sheet,
		colRecord,
		rowRecord
	});
}

function restoreSpreadsheet(fn, data) {
	var cols = [],
		rows = [],
		cells = [],
		colRecord = cache.colRecord,
		rowRecord = cache.rowRecord,
		sheet;
	send({
		url: 'reload',
		data: JSON.stringify(data),
		success(data) {
			if (!data || !data.returndata) {
				return;
			}

			let sheetData;

			cache.localRowPosi = data.maxRowPixel;
			cache.localColPosi = data.maxColPixel;

			generator.rowAliasGenerator(parseInt(data.aliasRowCounter));
			generator.colAliasGenerator(parseInt(data.aliasColCounter));

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

				rows.forEach(function(row) {
					row.sort = row.index;
					row.displayName = getRowDisplayName(row.sort);
					row.alias = row.aliasY;
				});
				cols.forEach(function(col) {
					col.sort = col.index;
					col.displayName = getColDisplayName(col.sort);
					col.alias = col.aliasX;
				});
				colRecord.push(cols[0].alias, cols[cols.length - 1].alias);
				rowRecord.push(rows[0].alias, rows[rows.length - 1].alias);

				cache.regionRecord.set(
					colRecord[0] + '_' +
					colRecord[1] + '_' +
					rowRecord[0] + '_' +
					rowRecord[1], true);

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