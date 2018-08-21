import cfg from '../../../config'
/**
 * 列对象默认值
 */
export default {
    sort: 0,
    alias: null,
    left: 0,
    width: cfg.colWidth,
    // 是否被选中
    active: false,
    displayName: null,
    /**
     * 右为隐藏列（用于效果显示）
     * @type {Boolean}
     */
    ajacentHide: false,
    // 用户主动隐藏
    hidden: false,
    // 根据动态加载原则，设置否是隐藏
    visible: true,
    /**
     * 记录整列操作
     * @type {Object}
     */
    props: {}
}