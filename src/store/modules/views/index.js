import mutations from './mutations'
const state = {
    // 用于管理事件的绑定和解除
    // 如： 选中的mousemove， body区域的mouseup是一对
    // 但是不能放到一个函数中处理，所以需要借助中间
    // 管理来进行绑定和解绑
    event: {
        list: []
    },
    // 已经加载区域的坐标信息
    // 用于动态加载数据
    coordinate: {
        col: [],
        row: [],
        map: new Map()
    },
    // 用于不同视图间的数据共享，不是简单的父子组件
    share: {
        // 在冻结状态下，用于同步，同一组件
        // 不同实例之间的数据交互
        scrollTop: 0,
        scrollLeft: 0
    }
}
export default {
    state,
    mutations
}