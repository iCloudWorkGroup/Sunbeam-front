import Vue from 'vue';
import * as types from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';
import extend from '../../../util/extend';
import template from './template';

export default {
	[types.INSERT_SHEET](state, sheet) {
		Vue.set(state, sheet.alias, {
			list: [],
			map: new Map()
		});
	},
	[types.ADD_ROW](state, payload) {
		let rows = payload.rows,
			rowsState = state[payload.currentSheet],
			list = rowsState.list,
			map = rowsState.map;
		for (let i = 0, len = rows.length; i < len; i++) {
			let row = rows[i];
			list.push(row);
			map.set(row.alias, row);
		}
	},
	[types.INSERT_ROW](state, payload) {
		let rows = payload.rows,
			rowsState = state[payload.currentSheet],
			list = rowsState.list,
			map = rowsState.map;
		for (let i = 0, len = rows.length; i < len; i++) {
			let row = rows[i];
			let index = indexAttrBinary(row.sort, list, 'sort');
			list.splice(index, 0, row);
			map.set(row.alias, row);
		}
	},
	[types.CANCEL_ACTIVE_ROW](state, {startIndex, endIndex, currentSheet}){
		let list = state[currentSheet].list;

		for (let i = startIndex; i <= endIndex; i++) {
			list[i].active = false;
		}
	},
	[types.ACTIVE_ROW](state, {startIndex, endIndex= startIndex, currentSheet}){
		let list = state[currentSheet].list;
		for (let i = startIndex; i <= endIndex; i++) {
			list[i].active = true;
		}
	},
	[types.UPDATE_ROW](state, info){
		info.forEach(function({row, props}){
			extend(row, props);
		});
	},
	[types.UPDATE_ROW](state, info){
		info.forEach(function({row, props}){
			extend(row, props);
		});
		let rowOprProp = row.oprProp;
		let templateOprProp = template.oprProp;
		for(let name in templateOprProp){
			if(templateOprProp[name] === rowOprProp[name]){
				delete rowOprProp[name];
			}
		}
	},
	[types.DELETE_ROW](state, {currentSheet, index}){
		let list = state[currentSheet].list;
		list.splice(index, 1);
	}

};