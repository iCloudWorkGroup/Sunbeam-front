import cfg from '../config';
import cache from './cache';
import extend from '../util/extend';
import send from '../util/send';
import rowDefault from '../store/defaults/row';
import colDefault from '../store/defaults/col';
import cellDefault from '../store/defaults/cell';
import {
	rowAliasGenerator,
	colAliasGenerator
} from './generator';


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
		rowLen;

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
				rows = parseRow(sheetData.glY);
				cols = parseCol(sheetData.glX);
				cells = parseCell(sheetData.cells);
				callback({rows, cols, cells});
			}
		}
	});
}
export function parseCell(data) {
	let result = [],
		cellData;
	for (let i = 0, len = data.length; i < len; i++) {
		cellData = data[i];
		result.push(extend({}, cellDefault, {
			occupy: cellData.occupy,
			physicsBox: cellData.physicsBox,
			content: {
				texts: cellData.content.texts,
				displayTexts: cellData.content.displayTexts,
				alignRow: cellData.content.alignRow,
				alignCol: cellData.content.alignCol,
				wrap: cellData.wordWrap
			},
			font: {
				size: cellData.content.size,
				family: cellData.content.family,
				color: cellData.content.color,
				bd: cellData.content.bd,
				italic: cellData.content.italic
			},
			decoration: {
				underline: cellData.content.underline,
				bg: cellData.customProp.background,
				comment: cellData.customProp.comment
			},
			border: cellData.border,
			format: cellData.format
		}));
	}
	return result;
}
export function parseRow(data) {
	let result = [];
	for (let i = 0, len = data.length; i < len; i++) {
		result.push(extend({}, rowDefault, data[i]));
	}
	return result;
}
export function parseCol(data) {
	let result = [];
	for (let i = 0, len = data.length; i < len; i++) {
		result.push(extend({}, colDefault, data[i]));
	}
	return result;
}