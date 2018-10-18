import mutations from './mutations'
import actions from './actions'
import getters from './getters'

const state = {
    /**
     * sheet列表
     * @type {Array}
     */
    list: [],
    // 用于管理事件的绑定和解除
    // 如： 选中的mousemove， body区域的mouseup是一对
    // 但是不能放到一个函数中处理，所以需要借助中间
    // 管理来进行绑定和解绑
    events: [],
    // 已经被加过的所有点坐标
    // 用于动态加载数据
    loaded: {
        // 直接把左上角的别名写成 ‘1’， 用于数据查找，
        // 这里为了开发测试更方便，实际上应该是在reload里读取
        // 第一行，第一列的alias，存到这里
        // BUG： 在后续开发中进行修补
        cols: [],
        rows: [],
        colMap: new Map(),
        rowMap: new Map()
    },
    // 当前sheet滚动的距离
    scroll: {
        top: 0,
        left: 0
    },
    el: {
        offsetWidth: 0,
        offsetHeight: 0
    },
    // 当前表格的最大行、列的别名和像素
    max: {
        rowAlias: null,
        colAlias: null,
        rowPixel: 0,
        colPixel: 0
    },
    frozen: {
        col: [],
        row: [],
        // 存储冻结处的别名
        alias: {
            row: null,
            col: null
        }
    },
    prompt: {
        show: false,
        texts: ''
    }
}

export default {
    state,
    actions,
    mutations,
    getters
}