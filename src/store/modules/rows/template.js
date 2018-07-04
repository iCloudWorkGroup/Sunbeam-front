import cfg from '../../../config'

/**
 * 行对象默认值
 */
export default {
    sort: 0,
    alias: '',
    top: 0,
    height: cfg.rowHeight,
    displayName: '',
    active: false,
    /**
     * 下方为隐藏列（用于效果显示）
     * @type {Boolean}
     */
    bottomAjacentHide: false,
    hidden: false,
    /**
     * 正行操作属性
     * @type {Object}
     */
    props: {}
}