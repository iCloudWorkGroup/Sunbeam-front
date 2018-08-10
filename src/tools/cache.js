export default {
    // 数据表格ID
    AUTHENTIC_KEY: '',
    // 后台存储行列大小,最大行列数
    localRowPosi: 0,
    localColPosi: 0,

    // 校验规则列表
    validate: [],
    // 校验规则计数器
    validateCounter: 0,
    // 后台需要的请求步骤
    step: 0,
    /**
     * 已数据加载标记值
     */
    colRecord: [],
    rowRecord: [],
    regionRecord: new Map(),
    // 存储rootElement元素
    rootEl: '',
    // 工具栏element元素
    toolEl: '',
    // 剪切板缓存数据
    clipData: '',
    // 剪切板状态
    clipState: '',
    // 存储绑定的全局事件，方便进行销毁
    // 例如： 拖动事件，需要每次动作结束
    // 在mouseup时，进行销毁事件
    // 存储形式： {
    //      事件绑定的对象
    //      el:{
    //          事件名称
    //          eventName: [
    //              对应的函数
    //              handler
    //          ]
    //      }
    // }
    eventList: new Map()
}