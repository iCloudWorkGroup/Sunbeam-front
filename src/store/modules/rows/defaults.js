import cfg from '../../../config';

/**
 * 行对象默认值
 */
export default {
	sort: 0,
	alias: '',
	top: 0,
	height: cfg.rowHeight,
	displayName: '',
	activeState: false,
	/**
	 * 上方为隐藏列（用于效果显示）
	 * @type {Boolean}
	 */
	isTopAjacentHide: false,
	/**
	 * 下方为隐藏列（用于效果显示）
	 * @type {Boolean}
	 */
	isBottomAjacentHide: false,
	hidden: false,
	/**
	 * 正行操作属性
	 * @type {Object}
	 */
	operProp: {}
};