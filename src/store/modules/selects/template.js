import cfg from '../../../config'
import {
    SELECT
} from '../../../tools/constant'
/**
 * 选中区对象默认值
 */
export default {
    /**
     * 进行选中操作时，缓存操作信息
     * @property {object} tempPosi
     */
    tempPosi: {
        /**
         * 点击位置排序码
         * @property {number} initColSort
         */
        initColSort: 0,
        /**
         * 点击位置排序码
         * @property {number} initRowSort
         */
        initRowSort: 0,
        /**
         * 鼠标当前位置排序码
         * @property {number} mouseColSort
         */
        mouseColSort: 0,
        /**
         * 鼠标当前位置排序码
         * @property {number} mouseRowSort
         */
        mouseRowSort: 0
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
    },
    type: SELECT,
    alias: ''
}