export default {
    /**
     * 默认行高、列宽
     * @type {Number}
     */
    colWidth: 71,
    rowHeight: 19,
    /**
     * 初始化行、列数
     * @type {Number}
     */
    initRowNum: 100,
    initColNum: 26,

    /**
     * 最大行数、列数
     * @type {Number}
     */
    maxRowNum: 10000,
    maxColNum: 100,
    /**
     * 页面左侧距离
     * @property {int} outerLeft
     */
    cornerWidth: 37,
    /**
     * 页面顶部距离
     * @property {int} outerTop
     */
    cornerHeight: 20,
    /**
     * sheet信息栏高度
     * @type {Number}
     */
    sheetSider: 30,
    /**
     * 预加载区域宽度, 单位px
     * 这个数值应该设置成能被20整除的
     * 这样利于表格自动扩展
     * 在自动增加行处，作用很大
     */
    prestrainWidth: 1440,
    prestrainHeight: 1200,
    /**
     * 请求区域宽、高度, 单位px
     * 请求区域的数值应该大于等于预加载区两倍，
     * 以减少请求次数，减少渲染次数
     */
    scrollBufferWidth: 720,
    scrollBufferHeight: 600,
    /**
     * 工具栏宽度
     * @type {Number}
     */
    toolbarHeight: 130,
    /**
     * 批注栏宽/高
     * @type {Number}
     */
    commentWidth: 100,
    commentHeigth: 100,
    /**
     * 是否禁止自动输入
     */
    autoInput: false,
    url: {
        family: 'cell/font-family',
        size: 'cell/font-size',
        weight: 'cell/font-weight',
        italic: 'cell/font-italic',
        color: 'cell/font-color',
        underline: 'cell/font-underline',
        background: 'cell/bg',
        alignRow: 'cell/align-landscape',
        alignCol: 'cell/align-portrait',
        frozen: 'sheet/frozen',
        unfrozen: 'sheet/unfrozen',
        rowadjust: 'row/adjust',
        coladjust: 'col/adjust',
        border: 'cell/border',
        texts: 'cell/data-set',
        merge: 'cell/merge',
        split: 'cell/split',
        adjustrow: 'row/adjust',
        adjustcol: 'col/adjust',
        deleterow: 'row/reduce',
        deletecol: 'col/reduce',
        insertrow: 'row/plus',
        insertcol: 'col/plus',
        hiderow: 'row/hide',
        hidecol: 'col/hide',
        showrow: 'row/show',
        showcol: 'col/show',
        createLine: 'sheet/expand',
        format: 'cell/format',
        undo: 'sheet/undo',
        redo: 'sheet/redo',
        outerpaste: 'sheet/paste',
        cut: 'sheet/cut',
        copy: 'sheet/copy',
        area: 'sheet/area',
        clearqueue: 'sheet/clear_queue',
        wordWrap: 'cell/wordwrap',
        comment: 'cell/comment-plus',
        recomment: 'cell/comment-reduce',
        clean: 'cell/data-clean',
        lock: 'cell/lock',
        protect: 'sheet/protect'
    },
    operSendPropName: {
        'alignRow': 'align',
        'alignCol': 'align',
        'background': 'color',
        'texts': 'content'
    },
    historyRecordActions: {},
    historyUndo: {

    },
    /**
     * 请求地址根路径
     * @type {String}
     */
    rootPath: 'http://excel-inc.acmr.com.cn/'
    // rootPath: 'http://192.168.3.84:8080/sunbeam/'
}