/**
 * sheet对象默认值
 * 包括sheet对象的属性值和当前操作状态值
 */
export default {
    /**
     * 别名
     * @type {String}
     */
    alias: null,
    /**
     * sheet名
     * @type {String}
     */
    name: 'new sheet',
    /**
     * 用户当前可视范围的像素值
     */
    userView: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    /**
     * 活动状态
     * @type {Boolean}
     */
    active: true,
    /**
     * 冻结状态
     * 数组中的内容：
     *   {
     *       start: 'alias',
     *       over: 'alias'
     *   }
     */
    frozen: {
        col: [],
        row: [],
        // 存储冻结处的别名
        alias: {
            row: '5',
            col: '5'
        }
    }
}