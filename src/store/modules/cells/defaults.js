import cfg from '../../config';

/**
 * 单元格对象默认值
 */
export default {
	/**
	 * 单元格所占行列别名
	 * @type {Object}
	 */
	occupy: {
		x: [],
		y: []
	},
	physicsBox: {
		top: 0,
		left: 0,
		width: cfg.colWidth,
		height: cfg.rowHeight
	},
	content: {
		texts: '',
		displayTexts: ''
	},
	styleObject: {
		size: '11',
		family: 'SimSun',
		color: 'rgb(0, 0, 0)',
		weight: false,
		italic: false,
		alignRow: 'left',
		alignCol: 'middle',
		wordWrap: false,
		underline: false,
		background: 'transparent',
		borderTop: false;
   		borderRight: false;
    	borderBottom: false;
    	borderLeft: false;
		borderTopWidth: '1px';
		borderBottomWidth: '1px';
		borderRightWidth: '1px';
		borderLeftWidth: '1px';
	},
	decoration: {
		comment: null
	},
	state: {
		isDestroy: false,
		hidden: false,
		locked: true
	}
};