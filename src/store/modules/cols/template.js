import cfg from '../../../config'
/**
 * 列对象默认值
 */
export default {
    sort: 0,
    alias: null,
    left: 0,
    width: cfg.colWidth,
    displayName: null,
    /**
     * 右为隐藏列（用于效果显示）
     * @type {Boolean}
     */
    rightAjacentHide: false,
    active: false,
    hidden: false,
    /**
     * 记录整列操作
     * @type {Object}
     */
    props: {}
}