import Vuex from 'vuex';
import Vue from 'vue';
import index from '../src/store/index';
import data from '../data.json';
import {
	RESTORE,
	COLS_INSERTCOLS,
	SELECTS_UPDATESELECT
} from '../src/store/action-types';
import {
	UPDATE_MOUSESTATE
} from '../src/store/mutation-types';
import generator from '../src/tools/generator';

Vue.use(Vuex);

const store = new Vuex.Store(index);

describe('插入列对象测试', function() {
	beforeAll(function() {
		store.dispatch(RESTORE, data);
		generator.rowAliasGenerator(17);
		generator.colAliasGenerator(10);
	});

	it('列对象判断', function() {
		let cols = store.getters.colList,
			len = cols.length;

		store.dispatch(COLS_INSERTCOLS, cols.length - 1);
		store.dispatch(COLS_INSERTCOLS);
		expect(cols.length).toBe(len + 2);
		expect(cols[0].left).toBe(0);
		expect(cols[0].displayName).toBe('A');
		expect(cols[0].alias).toBe('12');
		expect(cols[1].left).toBe(72);
		expect(cols[1].displayName).toBe('B');

		let insertCol = cols[cols.length - 2];
		expect(insertCol.left).toBe(720);
		expect(insertCol.displayName).toBe('K');
		expect(insertCol.alias).toBe('11');
	});


	it('选中区判断', function() {
		let select = store.getters.selectList[0];
		expect(select.physicsBox.left).toBe(72);
		store.dispatch(SELECTS_UPDATESELECT, {
			colIndex: 0,
			rowIndex: 0
		});
		store.commit(UPDATE_MOUSESTATE, {
			state: 'DRAG'
		});
		store.dispatch(SELECTS_UPDATESELECT, {
			rowIndex: 0,
			colIndex: 3
		});
		store.dispatch(COLS_INSERTCOLS, 2);
		expect(select.physicsBox.left).toBe(72);
		expect(select.physicsBox.width).toBe(287);
	});
	it('单元格判断', function() {
		let cell1 = store.getters.cellList[0],
			cell2 = store.getters.cellList[1];

		expect(cell1.physicsBox.left).toBe(72);
		expect(cell1.physicsBox.height).toBe(39);
		expect(cell1.occupy.col).toEqual(['1', '13', '2']);

		expect(cell2.physicsBox.left).toBe(288);
		expect(cell2.physicsBox.height).toBe(19);

	});
	it('坐标信息判断', function() {
		expect(store.getters.getPointInfo('13', '1', 'cellIndex')).toBe(0);
		expect(store.getters.getPointInfo('13', '1', 'cellIndex')).toBe(0);
	});
});