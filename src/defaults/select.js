import cfg from '../config';

export default {
	/**
	 * 瞬间操作缓存对象，直接记录索引值
	 * @property {object} tempPosi
	 */
	tempPosi: {
		/**
		 * 点击位置整体索引
		 * @property {number} initColSort
		 */
		initColSort: 0,
		/**
		 * 点击位置整体索引
		 * @property {number} initRowSort
		 */
		initRowSort: 0,
		/**
		 * 鼠标当前位置整体索引
		 * @property {number} mouseColSort
		 */
		mouseColSort: 0,
		/**
		 * 鼠标当前位置整体索引
		 * @property {number} mouseRowSort
		 */
		mouseRowSort: 0
	},
	/**
	 * 盒子模型
	 * @property {object} physicBox
	 */
	physicsBox: {
		/**
		 * 宽度
		 * @property {number} width
		 */
		width: cfg.width,
		/**
		 * 高度
		 * @property {number} height
		 */
		height: cfg.height,
		/**
		 * 相对位置`top`值
		 * @property {number} top
		 */
		top: 0,
		/**
		 * 相对位置`left`值
		 * @property {number} left
		 */
		left: 0,
	},
	/**
	 * 待修改:缓存值使用排序码
	 * [wholePosi description]
	 * @property {object} wholePosi
	 */
	wholePosi: {
		/**
		 * 开始盒模型`col`别名
		 * @property {number} startX
		 */
		startColAlias: 0,
		/**
		 * 开始盒模型`row`别名
		 * @property {number} startY
		 */
		startRowAlias: 0,
		/**
		 * 结束盒模型`col`别名
		 * @property {number} endX
		 */
		endColAlias: 0,
		/**
		 * 结束盒模型`row`别名
		 * @property {number} endY
		 */
		endRowAlias: 0
	},
	selectType: 'selected'
};