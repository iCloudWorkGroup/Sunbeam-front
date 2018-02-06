import cfg from '../config';

export default {
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
		displayTexts: '',
		underline: false,
		alignRow: 'left',
		alignCol: 'middle',
		wrap: false,
		comment: null
	},
	font: {
		size: '11',
		family: 'SimSun',
		color: 'rgb(0, 0, 0)',
		bd: false,
		italic: false
	},
	decoration: {
		underline: false,
		bg: 'rgb(0, 0, 0)'
	},
	border: {
		top: false,
		right: false,
		bottom: false,
		left: false
	},
	format: {
		type: 'normal',
		isValid: true,
		decimal: null,
		thousands: null,
		dateFormat: null,
		currencySign: null,
		currencyValid: true
	},
	state: {
		isDestroy: false,
		hidden: false,
		locked: true
	},
	extends: {
		highlight: false
	}
};