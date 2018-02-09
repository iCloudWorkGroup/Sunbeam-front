import Vue from 'vue';
import Vuex from 'vuex';
import extend from '../util/extend';
import defaults from './modules/cells/defaults';
import actions from './actions';
import cols from './modules/cols/index';
import rows from './modules/rows/index';
import cells from './modules/cells/index';
import selects from './modules/selects/index';
import points2Info from './modules/points2info/index';

Vue.use(Vuex);

const state = {
	/**
	 * 当前选中sheet的alias
	 * @type {String}
	 */
	currentSheet: '',
	/**
	 * 当前选中区域状态(工具栏状态绑定使用)
	 * @type {Object}
	 */
	currentOprState: extend(defaults)
}

export default new Vuex.Store({
	state,
	actions,
	modules: {
		cols,
		rows,
		cells,
		selects,
		sheets,
		points2Info
	}
});