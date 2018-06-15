import cfg from '../config';
import cache from './cache';
import extend from '../util/extend';
import send from '../util/send';
import rowTemplate from '../store/modules/rows/template';
import colTemplate from '../store/modules/cols/template';
import generator from './generator';
import {getColDisplayName, getRowDisplayName} from '../util/displayname';

/**
 * 初始化/请求表格数据
 * @param  {Object}   viewBox 视图盒模型大小
 * @param  {Function} fn      数据处理函数
 * @return {[type]}           [description]
 */
export default function(viewBox, fn) {
	let build = true;
	if (build === true) {
		buildSBM(fn);
		return;
	}
	restoreSBM(viewBox, fn);
}


function buildSBM(fn, resolve) {
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
		sheet
	});
}

function restoreSBM(data, fn, resolve) {
	var cols = [],
		rows = [],
		cells = [],
		colRecord = cache.colRecord,
		rowRecord = cache.rowRecord,
		sheet;
		
	send({
		url: 'reload',
		async: false,
		isPublic: false,
		data: JSON.stringify(data),
		success(data) {
			let sheet;
			if (!data || !Array.isArray(data.sheets) || !(sheet = data.sheets[0])) {
				return;
			}

			cache.localRowPosi = sheet.maxRowPixel;
			cache.localColPosi = sheet.maxColPixel;

			generator.rowAliasGenerator(parseInt(sheet.maxRowAlias));
			generator.colAliasGenerator(parseInt(sheet.maxColAlias));
			generator.cellAliasGenerator(0);
			let sheetData = {
				alias: sheet.alias || 'sheet1',
				name: sheet.name
			};

			let rowData = sheet.gridLineRow;
			let colData = sheet.gridLineCol;
			let cellData = sheet.cells;
			let frozenData = sheet.frozen;

			for (let i = 0, len = rowData.length; i < len; i++) {
				let row = rowData[i];
				if (row.hidden && i > 0) {
					rowData[i - 1].bottomAjacentHide = true;
				}
				row.displayName = getRowDisplayName(row.sort);
			}
			for (let i = 0, len = colData.length; i < len; i++) {
				let col = colData[i];
				if (col.hidden && i > 0) {
					colData[i - 1].rightAjacentHide = true;
				}
				col.displayName = getColDisplayName(col.sort);
			}

			cellData.forEach(function(cell){
				cell.alias = generator.cellAliasGenerator();
			});
			if (frozenData) {
				frozenData.type = 'restore';
				frozenData.viewColAlias = sheet.viewColAlias;
				frozenData.viewRowAlias = sheet.viewRowAlias;
			}
			colRecord.push(colData[0].alias, colData[colData.length - 1].alias);
			rowRecord.push(rowData[0].alias, rowData[rowData.length - 1].alias);

			cache.regionRecord.set(
				colRecord[0] + '_' +
				colRecord[1] + '_' +
				rowRecord[0] + '_' +
				rowRecord[1], true);

			fn({
				sheet: sheetData,
				rows: rowData,
				cols: colData,
				cells: cellData,
				frozen: frozenData
			});
		}
	});
}