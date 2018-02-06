import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import cols from './modules/cols/index';
import rows from './modules/rows/index';
// import cells from './modules/cols/index';

Vue.use(Vuex);

export default new Vuex.Store({
	actions,
	modules: {
		cols,
		rows
	}
});