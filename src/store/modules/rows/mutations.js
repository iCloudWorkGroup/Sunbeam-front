import Vue from 'vue';
import * as types from '../../mutation-types';
import {indexAttrBinary} from '../../../util/binary';
import extend from '../../../util/extend';
import template from './template';
import cellTemplate from '../cells/template';

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
		info.forEach(function({
			row,
			props
		}) {
			extend(row, props);
			let rowOprProp = row.oprProp;
			clearDefaultValue(rowOprProp, cellTemplate);

			function clearDefaultValue(object, template) {
				for (let name in object) {
					let currentProp = object[name];
					let defaultValue = template[name];
					if (typeof currentProp === 'object') {
						if (isEmptyObj(currentProp)) {
							delete object[name];
						}else{
							let result = clearDefaultValue(currentProp, defaultValue);
							if(result){
								delete object[name];
							}
						}
					} else if (currentProp === defaultValue) {
						delete object[name];
					}
				}
				return isEmptyObj(object);
			}
			function isEmptyObj(obj){
				for(name in obj){
					return false;
				}
				return true;
			}
		});
	},
	[types.DELETE_ROW](state, {currentSheet, index}){
		let list = state[currentSheet].list;
		list.splice(index, 1);
	}

};