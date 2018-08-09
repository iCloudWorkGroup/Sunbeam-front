import cfg from '../../../config'
import {
    SELECT
} from '../../../tools/constant'
/**
 * 选中区对象默认值
 */
export default {
    alias: null,
    /**
     * 选中区域的类型：正常选择，数据源
     * @type {[type]}
     */
    type: SELECT,
    /**
     * 是否为整行、整列选中
     * @type {Boolean}
     */
    isWhole: false,
    /**
     * 记录选中的sort值，用于后台数据交互
     * @property {object} tempPosi
     */
    signalSort: {
        startCol: 0,
        startRow: 0,
        endCol: 0,
        endRow: 0
    },
    /**
     * 盒子模型，在渲染时直接使用该值，
     * 省去再次计算过程
     * @property {object} physicBox
     */
    physicsBox: {
        /**
         * 宽度
         * @property {number} width
         */
        width: cfg.colWidth,
        /**
         * 高度
         * @property {number} height
         */
        height: cfg.rowHeight,
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
     * 选中区域起点位置，也就是操作起点位置
     * @type {Object}
     */
    activePosi: {
        rowAlias: '0',
        colAlias: '0',
    },
    /**
     * 选中区位置信息，整个选中区域的信息
     * @property {object} wholePosi
     */
    wholePosi: {
        /**
         * 开始位置
         * @property {String} startColAlias
         */
        startColAlias: '0',
        /**
         * 开始位置
         * @property {String} startRowAlias
         */
        startRowAlias: '0',
        /**
         * 结束位置
         * @property {String} endColAlias
         */
        endColAlias: '0',
        /**
         * 结束位置
         * @property {String} endRowAlias
         */
        endRowAlias: '0'
    }
}