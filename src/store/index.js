import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import cols from './modules/cols/index';
import rows from './modules/rows/index';
import cells from './modules/cells/index';
import points2Info from './modules/points2info/index';

Vue.use(Vuex);

export default new Vuex.Store({
	actions,
	modules: {
		cols,
		rows,
		cells,
		points2Info
	}
});