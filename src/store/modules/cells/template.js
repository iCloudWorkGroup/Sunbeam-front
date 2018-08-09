import cfg from '../../../config'

/**
 * 单元格对象默认值
 */
export default {
    alias: null,
    /**
     * 单元格所占行列别名
     * @type {Object}
     */
    occupy: {
        col: [],
        row: []
    },
    /**
     * 与显示内容相关的属性
     * @type {Object}
     */
    content: {
        texts: null,
        displayTexts: null,
        type: 'routine',
        express: 'G',
        size: 11,
        family: 'SimSun',
        color: 'rgb(0, 0, 0, 1)',
        weight: false,
        italic: false,
        alignRow: 'left',
        alignCol: 'middle',
        wordWrap: false,
        underline: 0,
        background: 'rgba(255, 255, 255, 1)'
    },
    border: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    },
    /**
     * 与容器相关属性
     * @type {Object}
     */
    physicsBox: {
        top: 0,
        left: 0,
        width: cfg.colWidth,
        height: cfg.rowHeight
    },
    /**
     * 对于单元格对象修饰的属性
     * @type {Object}
     */
    decoration: {
        comment: null,
        locked: true
    },
    /**
     * @type {Object}
     */
    status: {
        isDestroy: false,
        hidden: false
    }
}