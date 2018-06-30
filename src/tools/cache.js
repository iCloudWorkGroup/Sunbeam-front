const map = new Map()
export default {
    // 后台存储行列大小
    localRowPosi: 0,
    localColPosi: 0,

    // 校验规则列表
    validate: [],
    // 校验规则计数器
    validateCounter: 0,
    // 后台需要的请求步骤
    sendQueueStep: 0,
    /**
     * 已数据加载标记值
     */
    colRecord: [],
    rowRecord: [],
    regionRecord: map,
    // 存储rootElement元素
    rootEl: '',
    clipData: ''
}