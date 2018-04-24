import Vuex from 'vuex';
import Vue from 'vue';
import index from '../src/store/index';
import data from '../data.json';
import {
	RESTORE,
	ROWS_INSERTROWS,
	SELECTS_UPDATESELECT
} from '../src/store/action-types';
import {UPDATE_MOUSESTATE} from '../src/store/mutation-types';
import generator from '../src/tools/generator';

Vue.use(Vuex);

const store = new Vuex.Store(index);

describe('插入行对象测试',function(){
	beforeAll(function(){
		store.dispatch(RESTORE, data);
		generator.rowAliasGenerator(17);
		generator.colAliasGenerator(10);
	});


	it('行对象判断',function(){
		let rows = store.getters.rowList,
			len = rows.length;

		store.dispatch(ROWS_INSERTROWS, rows.length -1);
		store.dispatch(ROWS_INSERTROWS);
		expect(rows.length).toBe(len + 2);
		expect(rows[0].top).toBe(0);
		expect(rows[0].displayName).toBe('1');
		expect(rows[0].alias).toBe('19');
		expect(rows[1].top).toBe(20);
		expect(rows[1].displayName).toBe('2');

		let insertRow = rows[rows.length - 2];
		expect(insertRow.top).toBe(340);
		expect(insertRow.displayName).toBe('18');
		expect(insertRow.alias).toBe('18');
	});


	it('选中区判断',function(){
		let select = store.getters.selectList[0];
		expect(select.physicsBox.top).toBe(20);
		store.dispatch(SELECTS_UPDATESELECT, {
			colIndex: 0,
			rowIndex: 0
		});
		store.commit(UPDATE_MOUSESTATE, {
			state: 'DRAG'
		});
		store.dispatch(SELECTS_UPDATESELECT, {
			colIndex: 0,
			rowIndex: 3
		});
		store.dispatch(ROWS_INSERTROWS, 2);
		expect(select.physicsBox.top).toBe(0);
		expect(select.physicsBox.height).toBe(99);
	});
	it('单元格判断',function(){
		let cell1 = store.getters.cellList[0],
			cell2 = store.getters.cellList[1];

		expect(cell1.physicsBox.top).toBe(20);
		expect(cell1.physicsBox.height).toBe(59);
		expect(cell1.occupy.row).toEqual(['1', '20', '2']);

		expect(cell2.physicsBox.top).toBe(80);
		expect(cell2.physicsBox.height).toBe(19);
		
	});
	it('坐标信息判断',function(){
		expect(store.getters.getPointInfo('1','20','cellIndex')).toBe(0);
		expect(store.getters.getPointInfo('2','20','cellIndex')).toBe(0);
	});
});