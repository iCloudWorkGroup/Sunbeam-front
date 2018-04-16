import actions from './actions';
import mutations from './mutations';
import getters from './getters';

/**
 * 状态值
 * 结构为 state = {'sheetAlias' : {list [], state}}
 * list为select对象数组
 * @type {Object}
 */
const state = {
	/**
	 * 当前活动对象
	 * @type {Object}
	 */
	activeSelect: null 
};

export default {
	state,
	getters,
	actions,
	mutations
};
