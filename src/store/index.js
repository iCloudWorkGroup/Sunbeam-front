import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import cols from './modules/cols/index';
import rows from './modules/rows/index';
import cells from './modules/cells/index';
import selects from './modules/selects/index';
import sheets from './modules/sheets/index';
import pointsInfo from './modules/pointsinfo/index';
import input from './modules/input/index';

Vue.use(Vuex);

const state = {
	/**
	 * 当前选中sheet的alias
	 * @type {String}
	 */
	currentSheet: ''
};

export default new Vuex.Store({
	state,
	actions,
	mutations,
	modules: {
		cols,
		rows,
		cells,
		selects,
		sheets,
		pointsInfo,
		input
	}
});