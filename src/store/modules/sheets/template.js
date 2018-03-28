/**
 * sheet对象默认值
 * 包括sheet对象的属性值和当前操作状态值
 */
export default {
	/**
	 * 别名
	 * @type {String}
	 */
	alias: '',
	/**
	 * sheet名
	 * @type {String}
	 */
	name: 'new sheet',
	/**
	 * 活动状态
	 * @type {Boolean}
	 */
	active: true,
	/**
	 * 冻结状态
	 */
	frozenState: {
		isFrozen: false,
		rowFrozen: false,
		colFrozen: false,
		rules: []
	}
};