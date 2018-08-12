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
        // 是否已经被删除
        // 单元格没有真正的删除、因为在Map关系表中
        // 所记录的信息是单元格的索引值，
        // 一旦真正删除单元格，会造成索引值的混乱，
        // 所以所有的删除单元格行为都是设置destory属性为true
        destroy: false,
        // 是否被隐藏
        // 隐藏有两种情况，
        // 1. 所在的行列被隐藏
        // 2. 不在用户的可视范围和预加载方位内
        // 只要属性为true，单元格就不显示
        hidden: false
    }
}