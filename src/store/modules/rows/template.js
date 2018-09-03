import cfg from '../../../config'

/**
 * 行对象默认值
 */
export default {
    sort: 0,
    alias: null,
    top: 0,
    height: cfg.rowHeight,
    displayName: null,
    // 是否被选中
    active: false,
    /**
     * 下方为隐藏列（用于效果显示）
     * @type {Boolean}
     */
    bottomAjacentHide: false,
    // 用户主动隐藏
    hidden: false,
    // 根据动态加载原则，设置否是隐藏
    visible: true,
    /**
     * 正行操作属性
     * @type {Object}
     */
    props: {}
}