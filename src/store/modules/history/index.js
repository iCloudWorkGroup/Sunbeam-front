import actions from './actions';
import mutations from './mutations';
// import getters from './getters';

/**
 * 状态值
 * @type {Object}
 */
const state = {
	list: [],
	currentIndex: -1
};

export default {
	state,
	actions,
	// getters,
	mutations
};